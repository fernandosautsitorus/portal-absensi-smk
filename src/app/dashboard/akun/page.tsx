'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Shield, User, GraduationCap, Users } from 'lucide-react';

export default function AkunPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '', username: '', password: '', email: '', telepon: '', role: 'GURU', aktif: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter ? `/api/akun?role=${roleFilter}` : '/api/akun';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [roleFilter, session]);

  const handleOpenModal = (u?: any) => {
    if (u) {
      setEditMode(true);
      setSelectedId(u.id);
      setFormData({
        nama: u.nama,
        username: u.username,
        password: '', // Leave blank for edit
        email: u.email || '',
        telepon: u.telepon || '',
        role: u.role,
        aktif: u.aktif
      });
    } else {
      setEditMode(false);
      setFormData({
        nama: '', username: '', password: '', email: '', telepon: '', role: 'GURU', aktif: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMode && !formData.password) {
      alert('Password wajib diisi untuk akun baru');
      return;
    }

    try {
      const url = editMode ? `/api/akun?id=${selectedId}` : '/api/akun';
      const method = editMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menyimpan akun');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menonaktifkan/menghapus akun ini?')) {
      try {
        const res = await fetch(`/api/akun?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchUsers();
        } else {
          const error = await res.json();
          alert(error.error || 'Gagal menghapus akun');
        }
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-center text-red-500 font-medium">Akses Ditolak. Halaman ini hanya untuk Admin.</div>;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="badge bg-purple-100 text-purple-800 border border-purple-200"><Shield size={12} className="inline mr-1" /> Admin</span>;
      case 'GURU': return <span className="badge bg-blue-100 text-blue-800 border border-blue-200"><User size={12} className="inline mr-1" /> Guru</span>;
      case 'KEPSEK': return <span className="badge bg-green-100 text-green-800 border border-green-200"><GraduationCap size={12} className="inline mr-1" /> Kepsek</span>;
      case 'ORANGTUA': return <span className="badge bg-orange-100 text-orange-800 border border-orange-200"><Users size={12} className="inline mr-1" /> Orang Tua</span>;
      default: return <span className="badge bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Akun</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Akun
        </button>
      </div>

      <div className="card">
        <div className="border-b p-2 flex overflow-x-auto">
          <button className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md ${roleFilter === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setRoleFilter('')}>Semua</button>
          <button className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md ${roleFilter === 'ADMIN' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setRoleFilter('ADMIN')}>Admin</button>
          <button className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md ${roleFilter === 'GURU' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setRoleFilter('GURU')}>Guru</button>
          <button className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md ${roleFilter === 'KEPSEK' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setRoleFilter('KEPSEK')}>Kepala Sekolah</button>
          <button className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md ${roleFilter === 'ORANGTUA' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setRoleFilter('ORANGTUA')}>Orang Tua</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="p-4">Nama</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email / Telepon</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Tidak ada akun ditemukan</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`border-b hover:bg-gray-50 ${!u.aktif ? 'opacity-60' : ''}`}>
                    <td className="p-4 font-medium">{u.nama}</td>
                    <td className="p-4">{u.username}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{u.email || '-'}</div>
                      <div>{u.telepon || '-'}</div>
                    </td>
                    <td className="p-4">{getRoleBadge(u.role)}</td>
                    <td className="p-4 text-center">
                      <span className={`badge ${u.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(u)} className="text-gray-500 hover:text-blue-600 p-1"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} disabled={u.id === session?.user?.id} className="text-gray-500 hover:text-red-600 p-1 disabled:opacity-30 disabled:hover:text-gray-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Akun' : 'Tambah Akun'}</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input type="text" required className="input-field" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" required className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editMode && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin diubah)</span>}
                </label>
                <input type="password" required={!editMode} className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="select-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="GURU">Guru</option>
                  <option value="ADMIN">Admin</option>
                  <option value="KEPSEK">Kepala Sekolah</option>
                  <option value="ORANGTUA">Orang Tua</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telepon</label>
                  <input type="text" className="input-field" value={formData.telepon} onChange={e => setFormData({...formData, telepon: e.target.value})} />
                </div>
              </div>

              {editMode && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="aktif" checked={formData.aktif} onChange={e => setFormData({...formData, aktif: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="aktif" className="text-sm font-medium text-gray-700">Akun Aktif</label>
                </div>
              )}

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
