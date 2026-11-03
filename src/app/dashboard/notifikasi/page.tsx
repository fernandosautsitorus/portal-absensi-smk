'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, AlertTriangle, ClipboardCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifikasi');
      const data = await res.json();
      setNotifikasi(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifikasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifikasi(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifikasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      setNotifikasi(prev => prev.map(n => ({ ...n, dibaca: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (tipe: string) => {
    switch (tipe) {
      case 'PERINGATAN': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'ABSENSI': return <ClipboardCheck className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredNotifikasi = notifikasi.filter(n => filter === 'Semua' || (filter === 'Belum Dibaca' && !n.dibaca));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('Semua')}
              className={cn("px-4 py-2 text-sm rounded-md transition-colors", filter === 'Semua' ? 'bg-white shadow font-medium text-gray-900' : 'text-gray-600 hover:text-gray-900')}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('Belum Dibaca')}
              className={cn("px-4 py-2 text-sm rounded-md transition-colors", filter === 'Belum Dibaca' ? 'bg-white shadow font-medium text-gray-900' : 'text-gray-600 hover:text-gray-900')}
            >
              Belum Dibaca
            </button>
          </div>
          {notifikasi.some(n => !n.dibaca) && (
            <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat notifikasi...</div>
        ) : filteredNotifikasi.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifikasi.map(item => (
              <div 
                key={item.id} 
                className={cn("p-4 transition-colors hover:bg-gray-50 cursor-pointer", !item.dibaca ? "bg-blue-50/30" : "")}
                onClick={() => !item.dibaca && handleMarkRead(item.id)}
              >
                <div className="flex gap-4">
                  <div className={cn("p-2 rounded-full h-fit flex-shrink-0", !item.dibaca ? "bg-white shadow-sm" : "bg-gray-50")}>
                    {getIcon(item.tipe)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={cn("text-base", !item.dibaca ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
                        {item.judul}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(item.createdAt || new Date()), { addSuffix: true, locale: id })}
                        </span>
                        {!item.dibaca && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                      </div>
                    </div>
                    <p className={cn("text-sm", !item.dibaca ? "text-gray-700" : "text-gray-500")}>
                      {item.pesan}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada notifikasi</h3>
            <p className="text-gray-500 text-sm">Anda telah membaca semua pemberitahuan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
