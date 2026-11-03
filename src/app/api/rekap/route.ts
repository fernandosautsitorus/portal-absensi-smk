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
    const kelasId = searchParams.get('kelasId');
    const siswaId = searchParams.get('siswaId');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');
    const jurusanId = searchParams.get('jurusanId');

    if (!bulan || !tahun) {
      return NextResponse.json({ error: 'Bulan and Tahun are required' }, { status: 400 });
    }

    const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
    const endDate = new Date(parseInt(tahun), parseInt(bulan), 0);

    if (siswaId || session.user.role === 'ORANGTUA') {
      const targetSiswaId = session.user.role === 'ORANGTUA' ? session.user.id : siswaId; // Needs properly matching if parent has multiple kids but simplify for now
      
      const whereClause: any = {
        tanggal: { gte: startDate, lte: endDate }
      };
      if (targetSiswaId) {
        whereClause.siswaId = targetSiswaId;
      }
      if (session.user.role === 'ORANGTUA') {
         // Assuming session user id is orangtua id, filter by related siswa
         const children = await prisma.siswa.findMany({ where: { orangTuaId: session.user.id } });
         whereClause.siswaId = { in: children.map(c => c.id) };
      }

      const absensi = await prisma.absensi.findMany({
        where: whereClause,
        include: {
          siswa: { select: { nama: true, nisn: true } }
        },
        orderBy: { tanggal: 'asc' }
      });
      return NextResponse.json(absensi);
    } 
    
    if (kelasId) {
      // Aggregated per student in class
      const siswa = await prisma.siswa.findMany({
        where: { kelasId },
        select: { id: true, nisn: true, nama: true }
      });

      const records = await prisma.absensi.groupBy({
        by: ['siswaId', 'status'],
        where: {
          siswaId: { in: siswa.map(s => s.id) },
          tanggal: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      });

      const rekap = siswa.map(s => {
        const stats = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0, TERLAMBAT: 0, total: 0 };
        records.forEach(r => {
          if (r.siswaId === s.id) {
            stats[r.status as keyof typeof stats] = r._count.id;
            stats.total += r._count.id;
          }
        });
        const persentaseHadir = stats.total > 0 ? Math.round(((stats.HADIR + stats.TERLAMBAT) / stats.total) * 100) : 0;
        return {
          id: s.id,
          nisn: s.nisn,
          nama: s.nama,
          ...stats,
          persentaseHadir
        };
      });

      return NextResponse.json(rekap);
    }
    
    // Default or Jurusan filter: Aggregate by class
    let whereClass: any = {};
    if (jurusanId) {
      whereClass.jurusanId = jurusanId;
    }
    
    // Very basic overall stats
    const stats = await prisma.absensi.groupBy({
      by: ['status'],
      where: {
        tanggal: { gte: startDate, lte: endDate },
        siswa: { kelas: whereClass }
      },
      _count: { id: true }
    });
    
    return NextResponse.json(stats);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
