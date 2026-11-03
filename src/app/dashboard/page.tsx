'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { formatTanggal, getStatusBadge } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { 
  Users, CheckCircle, XCircle, Percent, ArrowRight,
  BookOpen, Building
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      // Simulate data fetch delay
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const role = session?.user?.role;
  const nama = session?.user?.name || 'Pengguna';
  const today = new Date();

  // ---------------------------------------------------------
  // MOCK DATA FOR CHARTS AND STATS
  // ---------------------------------------------------------
  const trenKehadiranData = [
    { name: 'Sen', Hadir: 450, Alpa: 12, Izin: 25, Sakit: 13 },
    { name: 'Sel', Hadir: 460, Alpa: 5, Izin: 20, Sakit: 15 },
    { name: 'Rab', Hadir: 440, Alpa: 18, Izin: 30, Sakit: 12 },
    { name: 'Kam', Hadir: 470, Alpa: 3, Izin: 15, Sakit: 12 },
    { name: 'Jum', Hadir: 465, Alpa: 8, Izin: 10, Sakit: 17 },
  ];

  const distribusiStatusData = [
    { name: 'Hadir', value: 465, color: STATUS_COLORS.HADIR },
    { name: 'Sakit', value: 17, color: STATUS_COLORS.SAKIT },
    { name: 'Izin', value: 10, color: STATUS_COLORS.IZIN },
    { name: 'Alpa', value: 8, color: STATUS_COLORS.ALPA },
  ];

  const kehadiranJurusanData = [
    { name: 'RPL', Kehadiran: 96 },
    { name: 'TKJ', Kehadiran: 94 },
    { name: 'MM', Kehadiran: 92 },
    { name: 'AK', Kehadiran: 97 },
    { name: 'AP', Kehadiran: 95 },
  ];

  const kelasStats = { total: 36, hadir: 34, tidakHadir: 2, persen: 94.4 };
  const sekolahStats = { totalSiswa: 500, totalKelas: 15, persenHadir: 93, alpa: 8 };

  const recentAttendance = [
    { id: 1, nama: 'Budi Santoso', status: 'HADIR', tanggal: '2023-10-25' },
    { id: 2, nama: 'Siti Aminah', status: 'SAKIT', tanggal: '2023-10-25' },
    { id: 3, nama: 'Agus Pratama', status: 'HADIR', tanggal: '2023-10-25' },
    { id: 4, nama: 'Dewi Lestari', status: 'IZIN', tanggal: '2023-10-25' },
    { id: 5, nama: 'Eko Wibowo', status: 'ALPA', tanggal: '2023-10-25' },
  ];

  // ---------------------------------------------------------
  // RENDER BASED ON ROLE
  // ---------------------------------------------------------

  if (role === 'GURU') {
    return (
      <div className="space-y-6">
        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Selamat datang, {nama}</h2>
            <p className="text-gray-500 mt-1">{formatTanggal(today.toISOString())}</p>
          </div>
          <Link href="/dashboard/absensi" className="btn-primary flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Input Absensi Hari Ini
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Siswa di Kelas" value={kelasStats.total.toString()} icon={Users} color="text-blue-600" bgColor="bg-blue-100" />
          <StatCard title="Hadir Hari Ini" value={kelasStats.hadir.toString()} icon={CheckCircle} color="text-green-600" bgColor="bg-green-100" />
          <StatCard title="Tidak Hadir" value={kelasStats.tidakHadir.toString()} icon={XCircle} color="text-red-600" bgColor="bg-red-100" />
          <StatCard title="Persentase" value={`${kelasStats.persen}%`} icon={Percent} color="text-primary-600" bgColor="bg-primary-100" />
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Absensi Terkini Kelas Anda</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTanggal(row.tanggal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge" dangerouslySetInnerHTML={{ __html: getStatusBadgeText(row.status) }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'KEPSEK' || role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Ringkasan Sekolah</h2>
          <p className="text-gray-500 mt-1">Data absensi hari ini: {formatTanggal(today.toISOString())}</p>
          
          {role === 'ADMIN' && (
            <div className="mt-4 flex space-x-3">
              <Link href="/dashboard/siswa" className="text-sm text-primary-600 hover:underline">Kelola Siswa</Link>
              <Link href="/dashboard/kelas" className="text-sm text-primary-600 hover:underline">Kelola Kelas</Link>
              <Link href="/dashboard/akun" className="text-sm text-primary-600 hover:underline">Manajemen Akun</Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Siswa" value={sekolahStats.totalSiswa.toString()} icon={Users} color="text-blue-600" bgColor="bg-blue-100" />
          <StatCard title="Total Kelas" value={sekolahStats.totalKelas.toString()} icon={Building} color="text-purple-600" bgColor="bg-purple-100" />
          <StatCard title="Kehadiran Hari Ini" value={`${sekolahStats.persenHadir}%`} icon={CheckCircle} color="text-green-600" bgColor="bg-green-100" />
          <StatCard title="Alpa Hari Ini" value={sekolahStats.alpa.toString()} icon={XCircle} color="text-red-600" bgColor="bg-red-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Kehadiran Mingguan</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trenKehadiranData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Hadir" stroke={STATUS_COLORS.HADIR} strokeWidth={2} />
                <Line type="monotone" dataKey="Alpa" stroke={STATUS_COLORS.ALPA} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status Hari Ini</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribusiStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribusiStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6 h-96">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Persentase Kehadiran per Jurusan</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kehadiranJurusanData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="Kehadiran" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (role === 'ORANGTUA') {
    return (
      <div className="space-y-6">
        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Budi Santoso</h2>
              <p className="text-gray-500 mt-1">Kelas X RPL 1 | NISN: 1234567890</p>
            </div>
            <div className="mt-4 md:mt-0 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Status Hari Ini</p>
              <div dangerouslySetInnerHTML={{ __html: getStatusBadgeText('HADIR') }} className="text-lg" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Total Hadir Bulan Ini" value="18" icon={CheckCircle} color="text-green-600" bgColor="bg-green-100" />
          <StatCard title="Total Tidak Hadir Bulan Ini" value="2" icon={XCircle} color="text-red-600" bgColor="bg-red-100" />
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Rekap Kehadiran Bulan Ini</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
            ))}
            {/* Mock Calendar Grid */}
            {Array.from({ length: 30 }).map((_, i) => {
              let status = 'HADIR';
              if (i === 12) status = 'SAKIT';
              if (i === 18) status = 'ALPA';
              if (i === 5 || i === 6 || i === 12 || i === 13 || i === 19 || i === 20 || i === 26 || i === 27) status = 'LIBUR';
              
              let bgColor = 'bg-green-100 text-green-800';
              if (status === 'SAKIT') bgColor = 'bg-yellow-100 text-yellow-800';
              if (status === 'ALPA') bgColor = 'bg-red-100 text-red-800';
              if (status === 'LIBUR') bgColor = 'bg-gray-100 text-gray-400';

              return (
                <div key={i} className={`h-16 flex flex-col items-center justify-center rounded border border-white ${bgColor}`}>
                  <span className="font-bold">{i + 1}</span>
                  {status !== 'LIBUR' && <span className="text-[10px] mt-1">{status}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl">Memuat profil pengguna...</h2>
    </div>
  );
}

// Helper components & functions
function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
      <div className={`p-4 rounded-full ${bgColor} ${color} mr-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function getStatusBadgeText(status: string) {
  const map: Record<string, string> = {
    'HADIR': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hadir</span>',
    'SAKIT': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Sakit</span>',
    'IZIN': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Izin</span>',
    'ALPA': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Alpa</span>',
    'TERLAMBAT': '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Terlambat</span>',
  };
  return map[status] || '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>';
}
