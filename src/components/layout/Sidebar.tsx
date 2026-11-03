'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, LayoutDashboard, Bell, ClipboardCheck, 
  BarChart3, Users, School, UserCog, FileDown, LogOut, Menu, X
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const role = session?.user?.role;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GURU', 'KEPSEK', 'ORANGTUA'] },
    { name: 'Notifikasi', path: '/dashboard/notifikasi', icon: Bell, roles: ['ADMIN', 'GURU', 'KEPSEK', 'ORANGTUA'] },
    { name: 'Absensi Harian', path: '/dashboard/absensi', icon: ClipboardCheck, roles: ['ADMIN', 'GURU'] },
    { name: 'Rekap Kehadiran', path: '/dashboard/rekap', icon: BarChart3, roles: ['ADMIN', 'GURU'] },
    { name: 'Data Siswa', path: '/dashboard/siswa', icon: Users, roles: ['ADMIN', 'GURU'] },
    { name: 'Data Kelas', path: '/dashboard/kelas', icon: School, roles: ['ADMIN', 'GURU'] },
    { name: 'Laporan', path: '/dashboard/laporan', icon: FileDown, roles: ['ADMIN', 'GURU', 'KEPSEK'] },
    { name: 'Manajemen Akun', path: '/dashboard/akun', icon: UserCog, roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => role && item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-primary-400" />
            <span className="font-bold text-lg">Portal Absensi SMK</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary-600/20 text-white border-l-4 border-primary-400" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent"
                  )}
                  onClick={() => onClose()}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-400" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {getInitials(session?.user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
