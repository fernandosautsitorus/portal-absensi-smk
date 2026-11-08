import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jurusan = await prisma.jurusan.findMany({
      include: {
        _count: {
          select: { kelas: true }
        }
      },
      orderBy: { kode: 'asc' }
    });

    return NextResponse.json({ data: jurusan });
  } catch (error) {
    console.error('Error in GET /api/jurusan:', error);
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
    const { kode, nama } = body;

    if (!kode || !nama) {
      return NextResponse.json({ error: 'Kode dan Nama Jurusan wajib diisi' }, { status: 400 });
    }

    // Check unique kode
    const existing = await prisma.jurusan.findUnique({
      where: { kode: kode.trim().toUpperCase() }
    });

    if (existing) {
      return NextResponse.json({ error: `Jurusan dengan kode ${kode} sudah terdaftar` }, { status: 400 });
    }

    const jurusan = await prisma.jurusan.create({
      data: {
        kode: kode.trim().toUpperCase(),
        nama: nama.trim()
      }
    });

    return NextResponse.json({ data: jurusan });
  } catch (error) {
    console.error('Error in POST /api/jurusan:', error);
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
      return NextResponse.json({ error: 'ID Jurusan diperlukan' }, { status: 400 });
    }

    const body = await request.json();
    const { kode, nama } = body;

    if (!kode || !nama) {
      return NextResponse.json({ error: 'Kode dan Nama Jurusan wajib diisi' }, { status: 400 });
    }

    // Check duplicate code on other records
    const duplicate = await prisma.jurusan.findFirst({
      where: {
        kode: kode.trim().toUpperCase(),
        NOT: { id }
      }
    });

    if (duplicate) {
      return NextResponse.json({ error: `Kode jurusan ${kode} sudah digunakan oleh jurusan lain` }, { status: 400 });
    }

    const jurusan = await prisma.jurusan.update({
      where: { id },
      data: {
        kode: kode.trim().toUpperCase(),
        nama: nama.trim()
      }
    });

    return NextResponse.json({ data: jurusan });
  } catch (error) {
    console.error('Error in PUT /api/jurusan:', error);
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
      return NextResponse.json({ error: 'ID Jurusan diperlukan' }, { status: 400 });
    }

    const kelasCount = await prisma.kelas.count({
      where: { jurusanId: id }
    });

    if (kelasCount > 0) {
      return NextResponse.json({
        error: `Tidak dapat menghapus jurusan ini karena masih memiliki ${kelasCount} kelas terdaftar. Hapus atau pindahkan kelas terlebih dahulu.`
      }, { status: 400 });
    }

    await prisma.jurusan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/jurusan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
