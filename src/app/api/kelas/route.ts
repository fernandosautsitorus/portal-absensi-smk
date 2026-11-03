import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const withJurusan = searchParams.get('withJurusan');
    const jurusanOnly = searchParams.get('jurusan');
    const jurusanId = searchParams.get('jurusanId');

    if (jurusanOnly === 'true') {
      const jurusan = await prisma.jurusan.findMany({
        orderBy: { nama: 'asc' }
      });
      return NextResponse.json({ data: jurusan });
    }

    let whereClause: any = {};
    if (jurusanId) {
      whereClause.jurusanId = jurusanId;
    }

    const kelas = await prisma.kelas.findMany({
      where: whereClause,
      include: {
        jurusan: true,
        waliKelas: {
          select: {
            id: true,
            nama: true,
          }
        },
        _count: {
          select: { siswa: { where: { aktif: true } } }
        }
      },
      orderBy: [
        { tingkat: 'asc' },
        { nama: 'asc' }
      ]
    });

    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error('Error in GET /api/kelas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, tingkat, jurusanId, waliKelasId, tahunAjaran } = body;

    const kelas = await prisma.kelas.create({
      data: {
        nama,
        tingkat: parseInt(tingkat),
        jurusanId,
        waliKelasId: waliKelasId || null,
        tahunAjaran
      }
    });

    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error('Error in POST /api/kelas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Kelas diperlukan' }, { status: 400 });
    }

    const body = await request.json();
    const { nama, tingkat, jurusanId, waliKelasId, tahunAjaran } = body;

    const kelas = await prisma.kelas.update({
      where: { id },
      data: {
        nama,
        tingkat: tingkat ? parseInt(tingkat) : undefined,
        jurusanId,
        waliKelasId: waliKelasId || null,
        tahunAjaran
      }
    });

    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error('Error in PUT /api/kelas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Kelas diperlukan' }, { status: 400 });
    }

    const siswaCount = await prisma.siswa.count({
      where: { kelasId: id, aktif: true }
    });

    if (siswaCount > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kelas yang masih memiliki siswa aktif' }, { status: 400 });
    }

    await prisma.kelas.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/kelas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
