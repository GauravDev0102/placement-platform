'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  sentAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const data = await api.get('/notifications', auth.getToken() || undefined);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }
    fetch();
  }, [router]);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all', {}, auth.getToken() || undefined);
    fetch();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Mark all as read
        </button>
      </div>

      <div className="mt-8 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`rounded-xl border p-4 ${n.read ? 'bg-white' : 'bg-brand-50 border-brand-200'}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{n.title}</p>
              {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
            </div>
            {n.message && <p className="mt-1 text-sm text-gray-600">{n.message}</p>}
            <p className="mt-1 text-xs text-gray-400">{new Date(n.sentAt).toLocaleString()}</p>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-gray-400 py-8">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
