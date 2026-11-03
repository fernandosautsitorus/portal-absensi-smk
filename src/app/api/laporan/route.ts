import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'GURU', 'KEPSEK'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const mulai = searchParams.get('mulai');
    const selesai = searchParams.get('selesai');
    const formatReq = searchParams.get('format') || 'excel';

    if (!kelasId || !mulai || !selesai) {
      return NextResponse.json({ error: 'Parameter kelasId, mulai, dan selesai diperlukan' }, { status: 400 });
    }

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: { waliKelas: true, jurusan: true }
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    const siswa = await prisma.siswa.findMany({
      where: { kelasId: kelasId, aktif: true },
      include: {
        absensi: {
          where: {
            tanggal: {
              gte: new Date(mulai),
              lte: new Date(selesai)
            }
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    // Generate date range
    const startDate = new Date(mulai);
    const endDate = new Date(selesai);
    const dateRange: string[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      dateRange.push(format(current, 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    }

    if (formatReq === 'excel') {
      const workbook = XLSX.utils.book_new();
      
      // Header data
      const wsData: any[][] = [
        ['LAPORAN KEHADIRAN SISWA'],
        ['SMK BISA'],
        [`Kelas: ${kelas.tingkat} ${kelas.jurusan.kode} ${kelas.nama}`],
        [`Periode: ${format(new Date(mulai), 'dd MMMM yyyy', { locale: localeId })} - ${format(new Date(selesai), 'dd MMMM yyyy', { locale: localeId })}`],
        []
      ];

      // Table Headers
      const headers = ['No', 'NISN', 'Nama Siswa', ...dateRange.map(d => format(new Date(d), 'dd/MM')), 'H', 'S', 'I', 'A', 'T'];
      wsData.push(headers);

      // Table Data
      siswa.forEach((s, index) => {
        const row = [index + 1, s.nisn, s.nama];
        let counts = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0, TERLAMBAT: 0 };
        
        dateRange.forEach(dateStr => {
          const absensi = s.absensi.find(a => format(new Date(a.tanggal), 'yyyy-MM-dd') === dateStr);
          const status = absensi ? absensi.status : '-';
          if (absensi) {
            counts[absensi.status as keyof typeof counts]++;
          }
          row.push(status === 'HADIR' ? 'H' : status === 'SAKIT' ? 'S' : status === 'IZIN' ? 'I' : status === 'ALPA' ? 'A' : status === 'TERLAMBAT' ? 'T' : '-');
        });

        row.push(counts.HADIR, counts.SAKIT, counts.IZIN, counts.ALPA, counts.TERLAMBAT);
        wsData.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Rekap Kehadiran');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Absensi_${kelas.nama}.xlsx"`
        }
      });
    } else if (formatReq === 'pdf') {
      const doc = new jsPDF('landscape');
      
      // Title
      doc.setFontSize(16);
      doc.text('LAPORAN KEHADIRAN SISWA SMK BISA', 14, 15);
      doc.setFontSize(11);
      doc.text(`Kelas: ${kelas.tingkat} ${kelas.jurusan.kode} ${kelas.nama}`, 14, 23);
      doc.text(`Periode: ${format(new Date(mulai), 'dd MMMM yyyy', { locale: localeId })} - ${format(new Date(selesai), 'dd MMMM yyyy', { locale: localeId })}`, 14, 29);

      // AutoTable
      const headers = ['No', 'NISN', 'Nama Siswa', ...dateRange.map(d => format(new Date(d), 'dd/MM')), 'H', 'S', 'I', 'A', 'T'];
      const body = siswa.map((s, index) => {
        const row: any[] = [index + 1, s.nisn, s.nama];
        let counts = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0, TERLAMBAT: 0 };
        
        dateRange.forEach(dateStr => {
          const absensi = s.absensi.find(a => format(new Date(a.tanggal), 'yyyy-MM-dd') === dateStr);
          const status = absensi ? absensi.status : '-';
          if (absensi) {
            counts[absensi.status as keyof typeof counts]++;
          }
          row.push(status === 'HADIR' ? 'H' : status === 'SAKIT' ? 'S' : status === 'IZIN' ? 'I' : status === 'ALPA' ? 'A' : status === 'TERLAMBAT' ? 'T' : '-');
        });

        row.push(counts.HADIR, counts.SAKIT, counts.IZIN, counts.ALPA, counts.TERLAMBAT);
        return row;
      });

      autoTable(doc, {
        startY: 35,
        head: [headers],
        body: body,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Footer Signatures
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      if (finalY + 40 < doc.internal.pageSize.getHeight()) {
         doc.text('Mengetahui,', 40, finalY + 20);
         doc.text('Kepala Sekolah', 40, finalY + 25);
         doc.text('_______________________', 40, finalY + 45);

         doc.text('Wali Kelas', 200, finalY + 25);
         doc.text(kelas.waliKelas?.nama || '_______________________', 200, finalY + 45);
      }

      const buffer = Buffer.from(doc.output('arraybuffer'));
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Laporan_Absensi_${kelas.nama}.pdf"`
        }
      });
    }

    return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/laporan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
