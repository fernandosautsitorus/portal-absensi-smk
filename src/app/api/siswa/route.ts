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
    const kelasId = searchParams.get('kelasId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let whereClause: any = {
      aktif: true
    };

    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search } },
        { nisn: { contains: search } }
      ];
    }

    if (session.user.role === 'ORANGTUA') {
      whereClause.orangTuaId = session.user.id;
    }

    const [siswa, total] = await Promise.all([
      prisma.siswa.findMany({
        where: whereClause,
        include: {
          kelas: {
            include: {
              jurusan: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          nama: 'asc'
        }
      }),
      prisma.siswa.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: siswa,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in GET /api/siswa:', error);
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
    const { nisn, nama, jenisKelamin, tempatLahir, tanggalLahir, alamat, telepon, kelasId, orangTuaId } = body;

    const existingSiswa = await prisma.siswa.findUnique({ where: { nisn } });
    if (existingSiswa) {
      return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 400 });
    }

    const siswa = await prisma.siswa.create({
      data: {
        nisn,
        nama,
        jenisKelamin,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        alamat,
        telepon,
        kelasId,
        orangTuaId: orangTuaId || null
      }
    });

    return NextResponse.json({ data: siswa });
  } catch (error) {
    console.error('Error in POST /api/siswa:', error);
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
      return NextResponse.json({ error: 'ID Siswa diperlukan' }, { status: 400 });
    }

    const body = await request.json();
    const { nisn, nama, jenisKelamin, tempatLahir, tanggalLahir, alamat, telepon, kelasId, orangTuaId } = body;

    if (nisn) {
      const existing = await prisma.siswa.findFirst({
        where: { nisn, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: 'NISN sudah terdaftar pada siswa lain' }, { status: 400 });
      }
    }

    const siswa = await prisma.siswa.update({
      where: { id },
      data: {
        nisn,
        nama,
        jenisKelamin,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
        alamat,
        telepon,
        kelasId,
        orangTuaId: orangTuaId || null
      }
    });

    return NextResponse.json({ data: siswa });
  } catch (error) {
    console.error('Error in PUT /api/siswa:', error);
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
      return NextResponse.json({ error: 'ID Siswa diperlukan' }, { status: 400 });
    }

    await prisma.siswa.update({
      where: { id },
      data: { aktif: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/siswa:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
