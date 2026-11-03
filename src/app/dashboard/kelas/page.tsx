'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function KelasPage() {
  const { data: session } = useSession();
  const [kelas, setKelas] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [guruList, setGuruList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const defaultTahunAjaran = `${currentYear}/${nextYear}`;

  const [formData, setFormData] = useState({
    nama: '', tingkat: '10', jurusanId: '', waliKelasId: '', tahunAjaran: defaultTahunAjaran
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKelas, resJurusan, resGuru] = await Promise.all([
        fetch('/api/kelas'),
        fetch('/api/kelas?jurusan=true'),
        fetch('/api/akun?role=GURU')
      ]);

      if (resKelas.ok) {
        const data = await resKelas.json();
        setKelas(data.data);
      }
      if (resJurusan.ok) {
        const data = await resJurusan.json();
        setJurusan(data.data);
      }
      if (resGuru.ok) {
        const data = await resGuru.json();
        setGuruList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (k?: any) => {
    if (k) {
      setEditMode(true);
      setSelectedId(k.id);
      setFormData({
        nama: k.nama,
        tingkat: k.tingkat.toString(),
        jurusanId: k.jurusanId,
        waliKelasId: k.waliKelasId || '',
        tahunAjaran: k.tahunAjaran
      });
    } else {
      setEditMode(false);
      setFormData({
        nama: '', tingkat: '10', jurusanId: '', waliKelasId: '', tahunAjaran: defaultTahunAjaran
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editMode ? `/api/kelas?id=${selectedId}` : '/api/kelas';
      const method = editMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini? (Hanya bisa jika tidak ada siswa)')) {
      try {
        const res = await fetch(`/api/kelas?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
        } else {
          const error = await res.json();
          alert(error.error || 'Gagal menghapus kelas');
        }
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  const getTingkatColor = (tingkat: number) => {
    if (tingkat === 10) return 'border-blue-500 bg-blue-50';
    if (tingkat === 11) return 'border-green-500 bg-green-50';
    if (tingkat === 12) return 'border-purple-500 bg-purple-50';
    return 'border-gray-500 bg-gray-50';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Kelas & Jurusan</h1>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Tambah Kelas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-lg mb-4 border-b pb-2">Daftar Jurusan</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Memuat...</p>
            ) : (
              <ul className="space-y-2">
                {jurusan.map(j => (
                  <li key={j.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{j.kode}</div>
                      <div className="text-xs text-gray-500">{j.nama}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center p-8 text-gray-500">Memuat data kelas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {kelas.map(k => (
                <div key={k.id} className={`card p-5 border-t-4 hover:shadow-md transition-shadow relative group ${getTingkatColor(k.tingkat)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{k.tingkat} {k.jurusan?.kode} {k.nama}</h3>
                    <span className="badge bg-white shadow-sm">{k.tahunAjaran}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{k.jurusan?.nama}</p>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs">W</span>
                      <span className="truncate">{k.waliKelas?.nama || 'Belum diatur'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span>{k._count?.siswa || 0} Siswa Aktif</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => handleOpenModal(k)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-green-600"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(k.id)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-red-600" disabled={(k._count?.siswa || 0) > 0} title={(k._count?.siswa || 0) > 0 ? "Tidak bisa hapus kelas yang memiliki siswa" : "Hapus"}><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Kelas' : 'Tambah Kelas'}</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tingkat</label>
                <select required className="select-field" value={formData.tingkat} onChange={e => setFormData({...formData, tingkat: e.target.value})}>
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Jurusan</label>
                <select required className="select-field" value={formData.jurusanId} onChange={e => setFormData({...formData, jurusanId: e.target.value})}>
                  <option value="">Pilih Jurusan...</option>
                  {jurusan.map(j => (
                    <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nama Sub-Kelas (Contoh: 1, 2, A, B)</label>
                <input type="text" required className="input-field" placeholder="1" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Wali Kelas (Opsional)</label>
                <select className="select-field" value={formData.waliKelasId} onChange={e => setFormData({...formData, waliKelasId: e.target.value})}>
                  <option value="">Pilih Wali Kelas...</option>
                  {guruList.map(g => (
                    <option key={g.id} value={g.id}>{g.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tahun Ajaran</label>
                <input type="text" required className="input-field" value={formData.tahunAjaran} onChange={e => setFormData({...formData, tahunAjaran: e.target.value})} />
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
