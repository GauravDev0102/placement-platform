'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'ADMIN') { router.push('/login'); return; }

    api.get('/events/all', auth.getToken() || undefined)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <p className="mt-1 text-gray-500">All platform activity</p>

      <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="px-4 py-3 font-medium text-gray-600">User</th>
              <th className="px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name || 'Unknown'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                <td className="px-4 py-3 text-gray-600">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
