import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTanggalShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    HADIR: 'bg-green-100 text-green-800',
    SAKIT: 'bg-yellow-100 text-yellow-800',
    IZIN: 'bg-blue-100 text-blue-800',
    ALPA: 'bg-red-100 text-red-800',
    TERLAMBAT: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    HADIR: 'Hadir',
    SAKIT: 'Sakit',
    IZIN: 'Izin',
    ALPA: 'Alpa',
    TERLAMBAT: 'Terlambat',
  };
  return labels[status] || status;
}

export function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    HADIR: 'H',
    SAKIT: 'S',
    IZIN: 'I',
    ALPA: 'A',
    TERLAMBAT: 'T',
  };
  return badges[status] || '?';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
