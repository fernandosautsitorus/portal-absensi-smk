'use client';

import React, { useState, useEffect } from 'react';
import { Download, Printer, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { formatTanggal } from '@/lib/utils';

export default function LaporanPage() {
  const [kelas, setKelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kelasId: '',
    mulai: new Date().toISOString().split('T')[0],
    selesai: new Date().toISOString().split('T')[0],
    format: 'excel'
  });
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await fetch('/api/kelas');
        if (res.ok) {
          const data = await res.json();
          setKelas(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch kelas:', error);
      }
    };
    fetchKelas();
  }, []);

  useEffect(() => {
    if (formData.kelasId && formData.mulai && formData.selesai) {
      const fetchPreview = async () => {
        try {
          const res = await fetch(`/api/rekap?kelasId=${formData.kelasId}&mulai=${formData.mulai}&selesai=${formData.selesai}`);
          if (res.ok) {
            const data = await res.json();
            setPreviewData(data);
          }
        } catch (error) {
          console.error('Failed to fetch preview:', error);
        }
      };
      fetchPreview();
    }
  }, [formData.kelasId, formData.mulai, formData.selesai]);

  const handleDownload = async () => {
    if (!formData.kelasId) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }
    
    setLoading(true);
    try {
      const query = new URLSearchParams({
        kelasId: formData.kelasId,
        mulai: formData.mulai,
        selesai: formData.selesai,
        format: formData.format
      });

      window.open(`/api/laporan?${query.toString()}`, '_blank');
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Gagal mengunduh laporan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!previewData || previewData.data.length === 0) {
      alert('Tidak ada data untuk dicetak');
      return;
    }
    window.print();
  };

  const selectedKelasData = kelas.find(k => k.id === formData.kelasId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Unduh & Cetak Laporan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Form Settings */}
        <div className="card p-6 lg:col-span-1 space-y-5 h-fit">
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Kelas</label>
            <select 
              className="select-field" 
              value={formData.kelasId} 
              onChange={e => setFormData({...formData, kelasId: e.target.value})}
            >
              <option value="">-- Pilih Kelas --</option>
              {kelas.map(k => (
                <option key={k.id} value={k.id}>{k.tingkat} {k.jurusan?.kode} {k.nama}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mulai Tanggal</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.mulai} 
                onChange={e => setFormData({...formData, mulai: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.selesai} 
                onChange={e => setFormData({...formData, selesai: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Format Unduhan</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
                <input 
                  type="radio" 
                  name="format" 
                  value="excel" 
                  checked={formData.format === 'excel'} 
                  onChange={e => setFormData({...formData, format: e.target.value})}
                  className="text-blue-600"
                />
                <FileSpreadsheet size={18} className="text-green-600" />
                <span className="text-sm font-medium">Excel (.xlsx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
                <input 
                  type="radio" 
                  name="format" 
                  value="pdf" 
                  checked={formData.format === 'pdf'} 
                  onChange={e => setFormData({...formData, format: e.target.value})}
                  className="text-blue-600"
                />
                <FileText size={18} className="text-red-600" />
                <span className="text-sm font-medium">PDF</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex flex-col gap-3">
            <button 
              onClick={handleDownload} 
              disabled={!formData.kelasId || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download size={18} /> {loading ? 'Memproses...' : 'Unduh Laporan'}
            </button>
            <button 
              onClick={handlePrint}
              disabled={!formData.kelasId || !previewData}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer size={18} /> Cetak Langsung
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={18} /> Pratinjau Rekap Kehadiran
            </h2>
          </div>
          
          <div className="p-4 overflow-x-auto">
            {!formData.kelasId ? (
              <div className="text-center py-12 text-gray-500">
                Silakan pilih kelas terlebih dahulu untuk melihat pratinjau data.
              </div>
            ) : !previewData ? (
              <div className="text-center py-12 text-gray-500">
                Memuat pratinjau...
              </div>
            ) : previewData.data.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Tidak ada data absensi pada periode ini.
              </div>
            ) : (
              <table className="w-full text-left text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">NISN</th>
                    <th className="p-2 border">Nama Siswa</th>
                    <th className="p-2 border text-center" title="Hadir">H</th>
                    <th className="p-2 border text-center" title="Sakit">S</th>
                    <th className="p-2 border text-center" title="Izin">I</th>
                    <th className="p-2 border text-center" title="Alpa">A</th>
                    <th className="p-2 border text-center" title="Terlambat">T</th>
                    <th className="p-2 border text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.map((siswa: any, idx: number) => {
                    const total = siswa.rekap.HADIR + siswa.rekap.SAKIT + siswa.rekap.IZIN + siswa.rekap.ALPA + siswa.rekap.TERLAMBAT;
                    const persentase = total > 0 ? Math.round((siswa.rekap.HADIR / total) * 100) : 0;
                    return (
                      <tr key={siswa.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{siswa.nisn}</td>
                        <td className="p-2 border font-medium">{siswa.nama}</td>
                        <td className="p-2 border text-center text-green-600 font-medium">{siswa.rekap.HADIR}</td>
                        <td className="p-2 border text-center text-blue-600">{siswa.rekap.SAKIT}</td>
                        <td className="p-2 border text-center text-yellow-600">{siswa.rekap.IZIN}</td>
                        <td className="p-2 border text-center text-red-600">{siswa.rekap.ALPA}</td>
                        <td className="p-2 border text-center text-orange-600">{siswa.rekap.TERLAMBAT}</td>
                        <td className="p-2 border text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${persentase >= 80 ? 'bg-green-100 text-green-800' : persentase >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {persentase}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Print-only View */}
      <div className="hidden print:block font-serif w-full text-black">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">PORTAL ABSENSI SMK</h1>
          <p className="text-sm mt-1">Jl. Pendidikan No. 123, Kota Pelajar, Provinsi Ilmu 12345</p>
          <p className="text-sm">Telp: (021) 1234567 | Email: info@smkbisa.sch.id</p>
        </div>

        <h2 className="text-xl font-bold text-center mb-6 uppercase underline">LAPORAN REKAPITULASI KEHADIRAN SISWA</h2>

        <div className="flex justify-between mb-4 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr><td className="py-1 pr-4 font-semibold">Kelas</td><td>: {selectedKelasData ? `${selectedKelasData.tingkat} ${selectedKelasData.jurusan?.kode} ${selectedKelasData.nama}` : '-'}</td></tr>
                <tr><td className="py-1 pr-4 font-semibold">Jurusan</td><td>: {selectedKelasData?.jurusan?.nama || '-'}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr><td className="py-1 pr-4 font-semibold">Tahun Ajaran</td><td>: {selectedKelasData?.tahunAjaran || '-'}</td></tr>
                <tr><td className="py-1 pr-4 font-semibold">Periode</td><td>: {formatTanggal(formData.mulai)} s.d {formatTanggal(formData.selesai)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {previewData && previewData.data.length > 0 && (
          <table className="w-full border-collapse border border-black text-sm mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 w-10 text-center">No</th>
                <th className="border border-black p-2 w-24">NISN</th>
                <th className="border border-black p-2">Nama Siswa</th>
                <th className="border border-black p-2 w-10 text-center">L/P</th>
                <th className="border border-black p-2 w-12 text-center">Hadir</th>
                <th className="border border-black p-2 w-12 text-center">Sakit</th>
                <th className="border border-black p-2 w-12 text-center">Izin</th>
                <th className="border border-black p-2 w-12 text-center">Alpa</th>
                <th className="border border-black p-2 w-16 text-center">Terlambat</th>
              </tr>
            </thead>
            <tbody>
              {previewData.data.map((siswa: any, idx: number) => (
                <tr key={siswa.id}>
                  <td className="border border-black p-2 text-center">{idx + 1}</td>
                  <td className="border border-black p-2">{siswa.nisn}</td>
                  <td className="border border-black p-2">{siswa.nama}</td>
                  <td className="border border-black p-2 text-center">{siswa.jenisKelamin}</td>
                  <td className="border border-black p-2 text-center">{siswa.rekap.HADIR}</td>
                  <td className="border border-black p-2 text-center">{siswa.rekap.SAKIT}</td>
                  <td className="border border-black p-2 text-center">{siswa.rekap.IZIN}</td>
                  <td className="border border-black p-2 text-center">{siswa.rekap.ALPA}</td>
                  <td className="border border-black p-2 text-center">{siswa.rekap.TERLAMBAT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end mt-16 pt-8 pr-12">
          <div className="text-center">
            <p className="mb-20">Kota Pelajar, {formatTanggal(new Date().toISOString())}</p>
            <p className="font-bold border-b border-black pb-1 inline-block min-w-[200px]">
              {selectedKelasData?.waliKelas?.nama || '_____________________'}
            </p>
            <p className="mt-1">Wali Kelas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
