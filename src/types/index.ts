export interface UserSession {
  id: string;
  username: string;
  nama: string;
  role: string;
  email?: string | null;
}

export interface SiswaWithKelas {
  id: string;
  nisn: string;
  nama: string;
  jenisKelamin: string;
  foto: string | null;
  kelasId: string;
  kelas: {
    id: string;
    nama: string;
    jurusan: {
      kode: string;
      nama: string;
    };
  };
}

export interface AbsensiRecord {
  id?: string;
  siswaId: string;
  tanggal: string;
  status: string;
  catatan?: string | null;
}

export interface AbsensiInput {
  siswaId: string;
  status: string;
  catatan?: string;
}

export interface KelasWithDetail {
  id: string;
  nama: string;
  tingkat: number;
  tahunAjaran: string;
  jurusan: {
    id: string;
    kode: string;
    nama: string;
  };
  waliKelas: {
    id: string;
    nama: string;
  } | null;
  _count: {
    siswa: number;
  };
}

export interface RekapSiswa {
  siswa: {
    id: string;
    nisn: string;
    nama: string;
  };
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  total: number;
  persentaseHadir: number;
}

export interface DashboardStats {
  totalSiswa: number;
  totalKelas: number;
  hadirHariIni: number;
  tidakHadirHariIni: number;
  persentaseHadir: number;
  belumAbsen: number;
}

export interface NotifikasiItem {
  id: string;
  tipe: string;
  judul: string;
  pesan: string;
  dibaca: boolean;
  createdAt: string;
}
