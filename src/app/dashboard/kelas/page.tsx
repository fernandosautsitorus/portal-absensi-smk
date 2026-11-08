'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Users, School } from 'lucide-react';

export default function KelasPage() {
  const { data: session } = useSession();
  const [kelas, setKelas] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [guruList, setGuruList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Kelas
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  // Modal Jurusan
  const [showJurusanModal, setShowJurusanModal] = useState(false);
  const [jurusanEditMode, setJurusanEditMode] = useState(false);
  const [selectedJurusanId, setSelectedJurusanId] = useState('');
  const [jurusanForm, setJurusanForm] = useState({ kode: '', nama: '' });
  
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
        fetch('/api/jurusan'),
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

  // --- Handlers Kelas ---
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
        nama: '', tingkat: '10', jurusanId: jurusan[0]?.id || '', waliKelasId: '', tahunAjaran: defaultTahunAjaran
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
        alert(error.error || 'Gagal menyimpan data kelas');
      }
    } catch (error) {
      console.error('Error saving kelas:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini? (Hanya bisa jika tidak ada siswa aktif)')) {
      try {
        const res = await fetch(`/api/kelas?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
        } else {
          const error = await res.json();
          alert(error.error || 'Gagal menghapus kelas');
        }
      } catch (error) {
        console.error('Error deleting kelas:', error);
      }
    }
  };

  // --- Handlers Jurusan ---
  const handleOpenJurusanModal = (j?: any) => {
    if (j) {
      setJurusanEditMode(true);
      setSelectedJurusanId(j.id);
      setJurusanForm({ kode: j.kode, nama: j.nama });
    } else {
      setJurusanEditMode(false);
      setSelectedJurusanId('');
      setJurusanForm({ kode: '', nama: '' });
    }
    setShowJurusanModal(true);
  };

  const handleSaveJurusan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = jurusanEditMode ? `/api/jurusan?id=${selectedJurusanId}` : '/api/jurusan';
      const method = jurusanEditMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jurusanForm)
      });

      if (res.ok) {
        setShowJurusanModal(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menyimpan data jurusan');
      }
    } catch (error) {
      console.error('Error saving jurusan:', error);
    }
  };

  const handleDeleteJurusan = async (id: string, kode: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jurusan "${kode}"? (Hanya bisa jika belum memiliki kelas terdaftar)`)) {
      try {
        const res = await fetch(`/api/jurusan?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchData();
        } else {
          const error = await res.json();
          alert(error.error || 'Gagal menghapus jurusan');
        }
      } catch (error) {
        console.error('Error deleting jurusan:', error);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Kelas & Jurusan</h1>
          <p className="text-sm text-gray-500">Kelola pemetaan jurusan, kelas rombel, dan penugasan wali kelas</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => handleOpenJurusanModal()} className="btn-secondary flex items-center gap-2">
              <Plus size={18} /> Tambah Jurusan
            </button>
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Tambah Kelas
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kolom Kiri: Daftar Jurusan */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <School size={18} className="text-primary-600" />
                <h2 className="font-semibold text-lg text-gray-800">Daftar Jurusan</h2>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenJurusanModal()}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium px-2 py-1 rounded flex items-center gap-1 transition"
                  title="Tambah Jurusan Baru"
                >
                  <Plus size={14} /> Baru
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-gray-500 text-sm">Memuat jurusan...</p>
            ) : jurusan.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Belum ada jurusan terdaftar.</p>
            ) : (
              <ul className="space-y-2">
                {jurusan.map(j => (
                  <li
                    key={j.id}
                    className="flex justify-between items-center p-2.5 hover:bg-gray-50 border border-gray-100 rounded-lg group relative transition"
                  >
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-1.5">
                        <span>{j.kode}</span>
                        {j._count?.kelas !== undefined && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                            {j._count.kelas} kelas
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">{j.nama}</div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenJurusanModal(j)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-white rounded shadow-sm border border-gray-200 transition"
                          title="Edit Jurusan"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteJurusan(j.id, j.kode)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded shadow-sm border border-gray-200 transition"
                          title="Hapus Jurusan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Daftar Kelas */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center p-8 text-gray-500">Memuat data kelas...</div>
          ) : kelas.length === 0 ? (
            <div className="card p-12 text-center text-gray-500">
              Belum ada kelas terdaftar. Silakan tambah jurusan dan kelas terlebih dahulu.
            </div>
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
                      <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold">W</span>
                      <span className="truncate">{k.waliKelas?.nama || 'Belum diatur'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span>{k._count?.siswa || 0} Siswa Aktif</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => handleOpenModal(k)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-green-600" title="Edit Kelas">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(k.id)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-red-600" disabled={(k._count?.siswa || 0) > 0} title={(k._count?.siswa || 0) > 0 ? "Tidak bisa hapus kelas yang memiliki siswa" : "Hapus Kelas"}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Kelas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
              
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

      {/* Modal Jurusan (Tambah / Edit) */}
      {showJurusanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSaveJurusan} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{jurusanEditMode ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kode Jurusan (Singkatan)</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: TKJ, RPL, AKL, DKV"
                  className="input-field uppercase"
                  value={jurusanForm.kode}
                  onChange={e => setJurusanForm({...jurusanForm, kode: e.target.value.toUpperCase()})}
                />
                <p className="text-xs text-gray-400 mt-1">Gunakan huruf kapital (contoh: TKJ, RPL, TKR)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap Jurusan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Teknik Komputer dan Jaringan"
                  className="input-field"
                  value={jurusanForm.nama}
                  onChange={e => setJurusanForm({...jurusanForm, nama: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowJurusanModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Simpan Jurusan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
