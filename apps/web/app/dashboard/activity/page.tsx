'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface Activity {
  id: string;
  action: string;
  description: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  user: { name: string; role: string };
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }

    api.get('/events', auth.getToken() || undefined)
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = connectSocket(user.id);
    socket.on('activity', (activity: Activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 100));
    });

    return () => { socket.off('activity'); disconnectSocket(); };
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
      <p className="mt-1 text-gray-500">Real-time activities across the platform</p>

      <div className="mt-8 space-y-2">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No activity yet</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border bg-white p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                {a.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{a.user.name}</span> {a.description}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString()} &middot; {a.entityType}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
