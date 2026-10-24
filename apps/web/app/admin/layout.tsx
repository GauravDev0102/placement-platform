'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = auth.getUser();
    if (!u || u.role !== 'ADMIN') { router.push('/login'); return; }
    setUser(u);
    const socket = connectSocket(u.id);
    return () => { socket.off('activity'); disconnectSocket(); };
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-500" />
            <span className="text-xl font-bold">PlacementHub Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard/activity')} className="text-sm text-gray-500 hover:text-gray-700">Activity</button>
            <button onClick={() => router.push('/dashboard/notifications')} className="text-sm text-gray-500 hover:text-gray-700">Notifications</button>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">Dashboard</button>
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={() => { auth.clearSession(); router.push('/login'); }} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            <button onClick={() => router.push('/admin/users')} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100">Users</button>
            <button onClick={() => router.push('/admin/logs')} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100">Audit Logs</button>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
