'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn, formatTanggal, getStatusColor, getStatusBadge, getInitials } from '@/lib/utils';

export default function AbsensiPage() {
  const { data: session } = useSession();
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [absensiData, setAbsensiData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetch('/api/kelas')
      .then(res => res.json())
      .then(data => setKelasList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedKelas && tanggal) {
      fetchSiswaAndAbsensi(selectedKelas, tanggal);
    }
  }, [selectedKelas, tanggal]);

  const fetchSiswaAndAbsensi = async (kelasId: string, date: string) => {
    setLoading(true);
    setLocked(false);
    try {
      const siswaRes = await fetch(`/api/siswa?kelasId=${kelasId}`);
      const siswaData = await siswaRes.json();
      setSiswaList(Array.isArray(siswaData) ? siswaData : []);

      const absenRes = await fetch(`/api/absensi?tanggal=${date}&kelasId=${kelasId}`);
      const absenData = await absenRes.json();
      
      const newAbsensiData: Record<string, any> = {};
      let isLocked = false;
      if (Array.isArray(absenData)) {
        absenData.forEach(item => {
          newAbsensiData[item.siswaId] = {
            status: item.status,
            catatan: item.catatan || ''
          };
          if (item.dikunci) isLocked = true;
        });
      }
      setAbsensiData(newAbsensiData);
      setLocked(isLocked);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStatusChange = (siswaId: string, status: string) => {
    if (locked) return;
    setAbsensiData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status }
    }));
  };

  const handleCatatanChange = (siswaId: string, catatan: string) => {
    if (locked) return;
    setAbsensiData(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], catatan }
    }));
  };

  const setSemuaHadir = () => {
    if (locked) return;
    const newAbsensiData = { ...absensiData };
    siswaList.forEach(siswa => {
      newAbsensiData[siswa.id] = { status: 'HADIR', catatan: newAbsensiData[siswa.id]?.catatan || '' };
    });
    setAbsensiData(newAbsensiData);
  };

  const handleSubmit = async () => {
    if (locked) return;
    if (!confirm('Apakah Anda yakin ingin menyimpan absensi ini?')) return;
    
    setLoading(true);
    const payload = siswaList.map(siswa => ({
      siswaId: siswa.id,
      status: absensiData[siswa.id]?.status || 'HADIR',
      catatan: absensiData[siswa.id]?.catatan || ''
    }));

    try {
      const res = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal, kelasId: selectedKelas, absensi: payload })
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage('Absensi berhasil disimpan!');
        setLocked(true);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
    setLoading(false);
  };

  const getSummary = () => {
    const summary = { H: 0, S: 0, I: 0, A: 0, T: 0 };
    siswaList.forEach(siswa => {
      const status = absensiData[siswa.id]?.status;
      if (status === 'HADIR') summary.H++;
      if (status === 'SAKIT') summary.S++;
      if (status === 'IZIN') summary.I++;
      if (status === 'ALPA') summary.A++;
      if (status === 'TERLAMBAT') summary.T++;
    });
    return summary;
  };

  const summary = getSummary();
  const statusOptions = [
    { value: 'HADIR', label: 'H' },
    { value: 'SAKIT', label: 'S' },
    { value: 'IZIN', label: 'I' },
    { value: 'ALPA', label: 'A' },
    { value: 'TERLAMBAT', label: 'T' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Input Absensi Harian</h1>
      
      {toastMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {toastMessage}
        </div>
      )}

      <div className="card p-4 mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input 
            type="date" 
            className="input-field"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select 
            className="select-field"
            value={selectedKelas}
            onChange={e => setSelectedKelas(e.target.value)}
          >
            <option value="">Pilih Kelas</option>
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      ) : selectedKelas && siswaList.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-lg">Daftar Siswa</h2>
            <button 
              onClick={setSemuaHadir}
              disabled={locked}
              className={cn("btn-secondary text-sm", locked && "opacity-50 cursor-not-allowed")}
            >
              Semua Hadir
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">NISN</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-1/4">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, idx) => {
                  const currentStatus = absensiData[siswa.id]?.status;
                  return (
                    <tr key={siswa.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {getInitials(siswa.nama)}
                        </div>
                        <span className="font-medium text-gray-900">{siswa.nama}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{siswa.nisn}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {statusOptions.map(opt => {
                            const isSelected = currentStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                disabled={locked}
                                onClick={() => handleStatusChange(siswa.id, opt.value)}
                                className={cn(
                                  "w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors",
                                  isSelected ? getStatusColor(opt.value) : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                                  locked && "cursor-not-allowed opacity-80"
                                )}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="input-field text-sm py-1"
                          placeholder="Catatan..."
                          value={absensiData[siswa.id]?.catatan || ''}
                          onChange={e => handleCatatanChange(siswa.id, e.target.value)}
                          disabled={locked}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Hadir: {summary.H}</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Sakit: {summary.S}</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Izin: {summary.I}</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Alpa: {summary.A}</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Terlambat: {summary.T}</span>
            </div>
            {!locked ? (
              <button onClick={handleSubmit} className="btn-primary">
                Simpan & Kirim Absen
              </button>
            ) : (
              <span className="badge bg-green-100 text-green-800 border-green-200">
                Data Terkunci (Telah Disimpan)
              </span>
            )}
          </div>
        </div>
      ) : selectedKelas ? (
        <div className="text-center py-10 text-gray-500 card">Belum ada data siswa di kelas ini.</div>
      ) : (
        <div className="text-center py-10 text-gray-500 card">Silakan pilih kelas terlebih dahulu.</div>
      )}
    </div>
  );
}
