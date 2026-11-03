import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const kelasId = searchParams.get('kelasId');

    if (!tanggal) {
      return NextResponse.json({ error: 'Tanggal is required' }, { status: 400 });
    }

    let filterSiswa: any = {};
    if (session.user.role === 'GURU') {
      // Find kelas where guru is wali kelas
      const waliKelas = await prisma.kelas.findFirst({
        where: { waliKelasId: session.user.id }
      });
      if (waliKelas) {
        filterSiswa.kelasId = waliKelas.id;
      }
    } else if (session.user.role === 'ORANGTUA') {
      filterSiswa.orangTuaId = session.user.id;
    }

    if (kelasId) {
      filterSiswa.kelasId = kelasId;
    }

    if (kelasId || session.user.role === 'ORANGTUA' || (session.user.role === 'GURU' && filterSiswa.kelasId)) {
      const absensi = await prisma.absensi.findMany({
        where: {
          tanggal: new Date(tanggal),
          siswa: filterSiswa
        },
        include: {
          siswa: {
            select: { nama: true, nisn: true, kelas: true }
          }
        }
      });
      return NextResponse.json(absensi);
    } else {
      // Summary stats
      const absensi = await prisma.absensi.groupBy({
        by: ['status'],
        where: {
          tanggal: new Date(tanggal)
        },
        _count: {
          id: true
        }
      });
      return NextResponse.json(absensi);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tanggal, kelasId, absensi } = body;

    if (!tanggal || !kelasId || !absensi || !Array.isArray(absensi)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const date = new Date(tanggal);

    let count = 0;
    for (const record of absensi) {
      if (!['HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT'].includes(record.status)) {
        continue;
      }

      await prisma.absensi.upsert({
        where: {
          siswaId_tanggal: {
            siswaId: record.siswaId,
            tanggal: date
          }
        },
        update: {
          status: record.status,
          catatan: record.catatan || '',
          dikunci: true
        },
        create: {
          siswaId: record.siswaId,
          tanggal: date,
          status: record.status,
          catatan: record.catatan || '',
          dikunci: true
        }
      });

      if (record.status === 'ALPA') {
        // Check for ALPA streak (3+ consecutive days)
        const pastDays = await prisma.absensi.findMany({
          where: {
            siswaId: record.siswaId,
            tanggal: { lte: date },
            status: 'ALPA'
          },
          orderBy: { tanggal: 'desc' },
          take: 3
        });

        if (pastDays.length >= 2) { // the current day + 2 past = 3
           const siswaInfo = await prisma.siswa.findUnique({
             where: { id: record.siswaId },
             include: { orangTua: true, kelas: { include: { waliKelas: true } } }
           });
           
           if (siswaInfo && siswaInfo.orangTuaId) {
             await prisma.notifikasi.create({
                data: {
                  userId: siswaInfo.orangTuaId,
                  tipe: 'PERINGATAN',
                  judul: 'Peringatan Ketidakhadiran (Alpa)',
                  pesan: `Anak Anda, ${siswaInfo.nama}, telah alpa selama 3 hari berturut-turut atau lebih.`,
                  dibaca: false
                }
             });
           }
           if (siswaInfo && siswaInfo.kelas && siswaInfo.kelas.waliKelasId) {
             await prisma.notifikasi.create({
                data: {
                  userId: siswaInfo.kelas.waliKelasId,
                  tipe: 'PERINGATAN',
                  judul: 'Peringatan Ketidakhadiran (Alpa) Siswa',
                  pesan: `Siswa ${siswaInfo.nama} telah alpa selama 3 hari berturut-turut atau lebih.`,
                  dibaca: false
                }
             });
           }
        }
      }

      count++;
    }

    return NextResponse.json({ message: 'Success', count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
