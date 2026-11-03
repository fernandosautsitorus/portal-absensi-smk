'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { formatTanggal } from '@/lib/utils';

export default function SiswaPage() {
  const { data: session } = useSession();
  const [siswa, setSiswa] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [formData, setFormData] = useState({
    nisn: '', nama: '', jenisKelamin: 'L', tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', kelasId: '', orangTuaId: ''
  });

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (searchTerm) query.append('search', searchTerm);
      if (selectedKelas) query.append('kelasId', selectedKelas);

      const res = await fetch(`/api/siswa?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSiswa(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch siswa:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchSiswa();
  }, [page, searchTerm, selectedKelas]);

  useEffect(() => {
    fetchKelas();
  }, []);

  const handleOpenModal = (s?: any) => {
    if (s) {
      setEditMode(true);
      setSelectedId(s.id);
      setFormData({
        nisn: s.nisn,
        nama: s.nama,
        jenisKelamin: s.jenisKelamin,
        tempatLahir: s.tempatLahir || '',
        tanggalLahir: s.tanggalLahir ? s.tanggalLahir.split('T')[0] : '',
        alamat: s.alamat || '',
        telepon: s.telepon || '',
        kelasId: s.kelasId,
        orangTuaId: s.orangTuaId || ''
      });
    } else {
      setEditMode(false);
      setFormData({
        nisn: '', nama: '', jenisKelamin: 'L', tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', kelasId: '', orangTuaId: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editMode ? `/api/siswa?id=${selectedId}` : '/api/siswa';
      const method = editMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchSiswa();
      } else {
        alert('Gagal menyimpan data siswa');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        const res = await fetch(`/api/siswa?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchSiswa();
        } else {
          alert('Gagal menghapus siswa');
        }
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Tambah Siswa
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-64">
          <Filter className="text-gray-400" size={18} />
          <select
            className="select-field"
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {kelas.map(k => (
              <option key={k.id} value={k.id}>{k.tingkat} {k.jurusan?.kode} {k.nama}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="p-4">No</th>
                <th className="p-4">NISN</th>
                <th className="p-4">Nama</th>
                <th className="p-4">L/P</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Jurusan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : siswa.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Tidak ada data siswa ditemukan</td></tr>
              ) : (
                siswa.map((s, idx) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{(page - 1) * 20 + idx + 1}</td>
                    <td className="p-4">{s.nisn}</td>
                    <td className="p-4 font-medium">{s.nama}</td>
                    <td className="p-4">
                      <span className={`badge ${s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="p-4">{s.kelas?.tingkat} {s.kelas?.nama}</td>
                    <td className="p-4">{s.kelas?.jurusan?.nama}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button className="text-gray-500 hover:text-blue-600 p-1"><Eye size={18} /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => handleOpenModal(s)} className="text-gray-500 hover:text-green-600 p-1"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(s.id)} className="text-gray-500 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-600">Halaman {page} dari {totalPages || 1}</span>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NISN</label>
                  <input type="text" required className="input-field" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input type="text" required className="input-field" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select className="select-field" value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kelas</label>
                  <select required className="select-field" value={formData.kelasId} onChange={e => setFormData({...formData, kelasId: e.target.value})}>
                    <option value="">Pilih Kelas...</option>
                    {kelas.map(k => (
                      <option key={k.id} value={k.id}>{k.tingkat} {k.jurusan?.kode} {k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input type="text" className="input-field" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input type="date" className="input-field" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <textarea className="input-field" rows={3} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telepon</label>
                  <input type="text" className="input-field" value={formData.telepon} onChange={e => setFormData({...formData, telepon: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
