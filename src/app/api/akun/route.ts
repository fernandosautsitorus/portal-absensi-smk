import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    if (session.user.role !== 'ADMIN' && session.user.role !== 'KEPSEK' && role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereClause: any = {
      aktif: true
    };

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search } },
        { username: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        telepon: true,
        role: true,
        aktif: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        nama: 'asc'
      }
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error in GET /api/akun:', error);
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
    const { username, password, nama, email, telepon, role } = body;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nama,
        email,
        telepon,
        role
      },
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        role: true,
        aktif: true
      }
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error in POST /api/akun:', error);
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
      return NextResponse.json({ error: 'ID User diperlukan' }, { status: 400 });
    }

    const body = await request.json();
    const { username, password, nama, email, telepon, role, aktif } = body;

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: 'Username sudah digunakan user lain' }, { status: 400 });
      }
    }

    let updateData: any = {
      username,
      nama,
      email,
      telepon,
      role,
      aktif: aktif !== undefined ? aktif : undefined
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        role: true,
        aktif: true
      }
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error in PUT /api/akun:', error);
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
      return NextResponse.json({ error: 'ID User diperlukan' }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { aktif: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/akun:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
