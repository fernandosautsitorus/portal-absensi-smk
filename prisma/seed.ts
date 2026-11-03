import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  // Clean existing data
  await prisma.notifikasi.deleteMany();
  await prisma.absensi.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.jurusan.deleteMany();
  await prisma.user.deleteMany();

  // Create Jurusan
  const jurusanData = [
    { kode: 'TKJ', nama: 'Teknik Komputer dan Jaringan' },
    { kode: 'RPL', nama: 'Rekayasa Perangkat Lunak' },
    { kode: 'AKL', nama: 'Akuntansi dan Keuangan Lembaga' },
    { kode: 'TKR', nama: 'Teknik Kendaraan Ringan' },
  ];

  const jurusans: Record<string, any> = {};
  for (const j of jurusanData) {
    jurusans[j.kode] = await prisma.jurusan.create({ data: j });
  }
  console.log('✅ Jurusan created');

  // Create Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedGuru = await bcrypt.hash('guru123', 10);
  const hashedKepsek = await bcrypt.hash('kepsek123', 10);
  const hashedOrtu = await bcrypt.hash('ortu123', 10);

  const admin = await prisma.user.create({
    data: { username: 'admin', password: hashedPassword, nama: 'Administrator', role: 'ADMIN', email: 'admin@smk.sch.id' },
  });

  const guruNames = [
    { username: 'guru.budi', nama: 'Budi Santoso, S.Pd.', email: 'budi@smk.sch.id' },
    { username: 'guru.sari', nama: 'Sari Dewi, S.Kom.', email: 'sari@smk.sch.id' },
    { username: 'guru.andi', nama: 'Andi Pratama, S.T.', email: 'andi@smk.sch.id' },
    { username: 'guru.rina', nama: 'Rina Wulandari, S.Pd.', email: 'rina@smk.sch.id' },
    { username: 'guru.dwi', nama: 'Dwi Cahyono, S.Pd.', email: 'dwi@smk.sch.id' },
    { username: 'guru.mega', nama: 'Mega Puspita, S.Kom.', email: 'mega@smk.sch.id' },
    { username: 'guru.hendra', nama: 'Hendra Wijaya, S.T.', email: 'hendra@smk.sch.id' },
    { username: 'guru.lina', nama: 'Lina Marlina, S.Pd.', email: 'lina@smk.sch.id' },
  ];

  const gurus: any[] = [];
  for (const g of guruNames) {
    const guru = await prisma.user.create({
      data: { ...g, password: hashedGuru, role: 'GURU' },
    });
    gurus.push(guru);
  }

  const kepsek = await prisma.user.create({
    data: { username: 'kepsek', password: hashedKepsek, nama: 'Dr. Hasan Basri, M.Pd.', role: 'KEPSEK', email: 'kepsek@smk.sch.id' },
  });

  console.log('✅ Users created');

  // Create Kelas (8 kelas, 2 per jurusan for X and XI)
  const kelasData = [
    { nama: 'X-TKJ-1', tingkat: 10, jurusanId: jurusans['TKJ'].id, waliKelasId: gurus[0].id },
    { nama: 'X-RPL-1', tingkat: 10, jurusanId: jurusans['RPL'].id, waliKelasId: gurus[1].id },
    { nama: 'X-AKL-1', tingkat: 10, jurusanId: jurusans['AKL'].id, waliKelasId: gurus[2].id },
    { nama: 'X-TKR-1', tingkat: 10, jurusanId: jurusans['TKR'].id, waliKelasId: gurus[3].id },
    { nama: 'XI-TKJ-1', tingkat: 11, jurusanId: jurusans['TKJ'].id, waliKelasId: gurus[4].id },
    { nama: 'XI-RPL-1', tingkat: 11, jurusanId: jurusans['RPL'].id, waliKelasId: gurus[5].id },
    { nama: 'XI-AKL-1', tingkat: 11, jurusanId: jurusans['AKL'].id, waliKelasId: gurus[6].id },
    { nama: 'XI-TKR-1', tingkat: 11, jurusanId: jurusans['TKR'].id, waliKelasId: gurus[7].id },
  ];

  const kelasRecords: any[] = [];
  for (const k of kelasData) {
    const kelas = await prisma.kelas.create({ data: k });
    kelasRecords.push(kelas);
  }
  console.log('✅ Kelas created');

  // Create Siswa (15 per kelas = 120 siswa)
  const namaDepanL = ['Ahmad', 'Budi', 'Cahyo', 'Dimas', 'Eko', 'Fajar', 'Galih', 'Hadi', 'Irfan', 'Joko', 'Kurniawan', 'Lutfi', 'Muhamad', 'Naufal', 'Oscar'];
  const namaDepanP = ['Ayu', 'Bella', 'Citra', 'Devi', 'Eka', 'Fitri', 'Gita', 'Hana', 'Indah', 'Julia', 'Kartika', 'Lestari', 'Maya', 'Nisa', 'Oktavia'];
  const namaBelakang = ['Pratama', 'Wijaya', 'Sari', 'Putra', 'Dewi', 'Kusuma', 'Hidayat', 'Rahman', 'Nugraha', 'Saputra', 'Permana', 'Utami', 'Laksana', 'Firmansyah', 'Wibowo'];
  const kota = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta', 'Malang', 'Solo', 'Bekasi', 'Tangerang', 'Depok'];

  const ortuAccounts: any[] = [];
  let siswaCounter = 0;

  for (const kelas of kelasRecords) {
    for (let i = 0; i < 15; i++) {
      siswaCounter++;
      const isLaki = i < 8;
      const namaDepan = isLaki ? namaDepanL[i] : namaDepanP[i - 8];
      const belakang = namaBelakang[(siswaCounter + i) % namaBelakang.length];
      const namaSiswa = `${namaDepan} ${belakang}`;
      const nisn = `00${String(siswaCounter).padStart(8, '0')}`;

      // Create parent account for first 3 students of first kelas only (for demo)
      let orangTuaId: string | undefined;
      if (kelas.nama === 'X-TKJ-1' && i < 3) {
        const ortu = await prisma.user.create({
          data: {
            username: `ortu.${namaDepan.toLowerCase()}`,
            password: hashedOrtu,
            nama: `Bp/Ibu ${belakang}`,
            role: 'ORANGTUA',
            email: `ortu.${namaDepan.toLowerCase()}@email.com`,
            telepon: `0812${String(siswaCounter).padStart(8, '0')}`,
          },
        });
        ortuAccounts.push(ortu);
        orangTuaId = ortu.id;
      }

      await prisma.siswa.create({
        data: {
          nisn,
          nama: namaSiswa,
          jenisKelamin: isLaki ? 'L' : 'P',
          tempatLahir: kota[i % kota.length],
          tanggalLahir: new Date(2009 + (i % 3), i % 12, (i * 3 + 1) % 28 + 1),
          alamat: `Jl. ${namaBelakang[i]} No. ${siswaCounter}, ${kota[i % kota.length]}`,
          telepon: `0813${String(siswaCounter).padStart(8, '0')}`,
          kelasId: kelas.id,
          orangTuaId,
        },
      });
    }
  }
  console.log(`✅ ${siswaCounter * 1} Siswa created`);
  console.log(`✅ ${ortuAccounts.length} Orang Tua accounts created`);

  // Create sample Absensi data for the past 14 days
  const today = new Date();
  const siswaAll = await prisma.siswa.findMany();
  const statusOptions = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT'];

  let absensiCount = 0;
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const tanggal = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    for (const siswa of siswaAll) {
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      let catatan: string | null = null;
      if (randomStatus === 'SAKIT') catatan = 'Demam';
      if (randomStatus === 'IZIN') catatan = 'Urusan keluarga';
      if (randomStatus === 'ALPA') catatan = null;
      if (randomStatus === 'TERLAMBAT') catatan = 'Terlambat 15 menit';

      await prisma.absensi.create({
        data: {
          siswaId: siswa.id,
          tanggal,
          status: randomStatus,
          catatan,
          dikunci: true,
        },
      });
      absensiCount++;
    }
  }
  console.log(`✅ ${absensiCount} Absensi records created`);

  // Create sample notifications
  const notifData = [
    { userId: gurus[0].id, tipe: 'PERINGATAN', judul: 'Peringatan Alpa Berturut-turut', pesan: 'Siswa Ahmad Pratama (X-TKJ-1) tidak hadir 3 hari berturut-turut.' },
    { userId: kepsek.id, tipe: 'UMUM', judul: 'Laporan Kehadiran Mingguan', pesan: 'Tingkat kehadiran minggu ini: 92.5%. Terdapat 8 siswa dengan tingkat kehadiran di bawah 80%.' },
    { tipe: 'ABSENSI', judul: 'Absensi Belum Diisi', pesan: 'Kelas XI-RPL-1 belum mengisi absensi hari ini.' },
  ];

  for (const n of notifData) {
    await prisma.notifikasi.create({ data: n });
  }
  console.log('✅ Notifikasi created');

  console.log('\n🎉 Seeding selesai!');
  console.log('\n📋 Akun Demo:');
  console.log('  Admin     : admin / admin123');
  console.log('  Guru      : guru.budi / guru123');
  console.log('  Kepsek    : kepsek / kepsek123');
  console.log('  Orang Tua : ortu.ahmad / ortu123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
