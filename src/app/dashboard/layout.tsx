'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Simple title generator based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    const pathParts = pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out lg:pl-64">
          <Topbar 
            title={getPageTitle()} 
            onMenuToggle={() => setIsSidebarOpen(true)} 
          />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
