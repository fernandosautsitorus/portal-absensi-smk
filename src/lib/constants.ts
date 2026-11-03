export const STATUS_ABSENSI = ['HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT'] as const;
export type StatusAbsensi = (typeof STATUS_ABSENSI)[number];

export const ROLES = ['ADMIN', 'GURU', 'KEPSEK', 'ORANGTUA'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  GURU: 'Wali Kelas / Guru',
  KEPSEK: 'Kepala Sekolah',
  ORANGTUA: 'Orang Tua',
};

export const TINGKAT_OPTIONS = [
  { value: 10, label: 'Kelas X' },
  { value: 11, label: 'Kelas XI' },
  { value: 12, label: 'Kelas XII' },
];

export const STATUS_COLORS: Record<string, string> = {
  HADIR: '#22c55e',
  SAKIT: '#eab308',
  IZIN: '#3b82f6',
  ALPA: '#ef4444',
  TERLAMBAT: '#f97316',
};

export const APP_NAME = 'Portal Absensi SMK';
export const TAHUN_AJARAN = '2026/2027';
