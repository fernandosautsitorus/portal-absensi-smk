'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { AlertTriangle, Download } from 'lucide-react';

export default function RekapPage() {
  const currentDate = new Date();
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [bulan, setBulan] = useState((currentDate.getMonth() + 1).toString());
  const [tahun, setTahun] = useState(currentDate.getFullYear().toString());
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const BULAN_OPTIONS = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
    { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const TAHUN_OPTIONS = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString());

  useEffect(() => {
    fetch('/api/kelas').then(res => res.json()).then(data => setKelasList(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (kelasId && bulan && tahun) {
      fetchRekap();
    }
  }, [kelasId, bulan, tahun]);

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rekap?kelasId=${kelasId}&bulan=${bulan}&tahun=${tahun}`);
      const data = await res.json();
      setRekapData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totals = rekapData.reduce((acc, curr) => {
    acc.HADIR += curr.HADIR;
    acc.SAKIT += curr.SAKIT;
    acc.IZIN += curr.IZIN;
    acc.ALPA += curr.ALPA;
    acc.TERLAMBAT += curr.TERLAMBAT;
    return acc;
  }, { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0, TERLAMBAT: 0 });

  const chartData = [
    { name: 'Hadir', value: totals.HADIR, color: '#22c55e' },
    { name: 'Sakit', value: totals.SAKIT, color: '#eab308' },
    { name: 'Izin', value: totals.IZIN, color: '#3b82f6' },
    { name: 'Alpa', value: totals.ALPA, color: '#ef4444' },
    { name: 'Terlambat', value: totals.TERLAMBAT, color: '#f97316' }
  ].filter(item => item.value > 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rekapitulasi Absensi</h1>
        <div className="flex gap-2">
          <a href={`/api/laporan?format=excel&kelasId=${kelasId}&bulan=${bulan}&tahun=${tahun}`} className={cn("btn-secondary flex items-center gap-2", (!kelasId || rekapData.length === 0) && "opacity-50 pointer-events-none")}>
            <Download className="w-4 h-4" /> Unduh Excel
          </a>
          <a href={`/api/laporan?format=pdf&kelasId=${kelasId}&bulan=${bulan}&tahun=${tahun}`} className={cn("btn-primary flex items-center gap-2", (!kelasId || rekapData.length === 0) && "opacity-50 pointer-events-none")}>
            <Download className="w-4 h-4" /> Unduh PDF
          </a>
        </div>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select className="select-field w-48" value={kelasId} onChange={e => setKelasId(e.target.value)}>
            <option value="">Pilih Kelas</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
          <select className="select-field w-32" value={bulan} onChange={e => setBulan(e.target.value)}>
            {BULAN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select className="select-field w-32" value={tahun} onChange={e => setTahun(e.target.value)}>
            {TAHUN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {!kelasId ? (
         <div className="card text-center py-10 text-gray-500">Silakan pilih kelas untuk melihat rekapitulasi.</div>
      ) : loading ? (
        <div className="card text-center py-10 text-gray-500">Memuat data rekapitulasi...</div>
      ) : rekapData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">NISN</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-3 py-3 text-center">H</th>
                    <th className="px-3 py-3 text-center">S</th>
                    <th className="px-3 py-3 text-center">I</th>
                    <th className="px-3 py-3 text-center">A</th>
                    <th className="px-3 py-3 text-center">T</th>
                    <th className="px-4 py-3 text-center">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapData.map((row, idx) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.nisn}</td>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {row.nama}
                        {row.ALPA >= 3 && <span title="Alpa berlebihan"><AlertTriangle className="w-4 h-4 text-red-500" /></span>}
                      </td>
                      <td className="px-3 py-3 text-center">{row.HADIR}</td>
                      <td className="px-3 py-3 text-center">{row.SAKIT}</td>
                      <td className="px-3 py-3 text-center">{row.IZIN}</td>
                      <td className="px-3 py-3 text-center text-red-600 font-semibold">{row.ALPA}</td>
                      <td className="px-3 py-3 text-center">{row.TERLAMBAT}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          row.persentaseHadir >= 90 ? "bg-green-100 text-green-800" :
                          row.persentaseHadir >= 75 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {row.persentaseHadir}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-200">
                    <td colSpan={3} className="px-4 py-3 text-right">TOTAL KELAS</td>
                    <td className="px-3 py-3 text-center text-green-600">{totals.HADIR}</td>
                    <td className="px-3 py-3 text-center text-yellow-600">{totals.SAKIT}</td>
                    <td className="px-3 py-3 text-center text-blue-600">{totals.IZIN}</td>
                    <td className="px-3 py-3 text-center text-red-600">{totals.ALPA}</td>
                    <td className="px-3 py-3 text-center text-orange-600">{totals.TERLAMBAT}</td>
                    <td className="px-4 py-3 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-center mb-4">Distribusi Kehadiran</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10 text-gray-500">Tidak ada data untuk periode ini.</div>
      )}
    </div>
  );
}
