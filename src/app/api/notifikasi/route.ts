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

    const whereClause: any = {};
    if (session.user.role !== 'ADMIN') {
      whereClause.userId = session.user.id;
    }

    const notifikasi = await prisma.notifikasi.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(notifikasi);
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
    const { judul, pesan, tipe, userId } = body;

    if (!judul || !pesan || !tipe || !userId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const notifikasi = await prisma.notifikasi.create({
      data: {
        judul,
        pesan,
        tipe,
        userId,
        dibaca: false
      }
    });

    return NextResponse.json(notifikasi, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (body.markAllRead) {
      await prisma.notifikasi.updateMany({
        where: { userId: session.user.id, dibaca: false },
        data: { dibaca: true }
      });
      return NextResponse.json({ message: 'All marked as read' });
    } else if (body.id) {
      const notifikasi = await prisma.notifikasi.update({
        where: { id: body.id },
        data: { dibaca: true }
      });
      return NextResponse.json(notifikasi);
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
