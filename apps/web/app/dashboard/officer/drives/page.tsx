'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Drive {
  id: string;
  title: string;
  stages: string[];
  startDate: string | null;
  endDate: string | null;
  status: string;
  company: { id: string; name: string };
  creator: { id: string; name: string };
}

const statusColors: Record<string, string> = {
  UPCOMING: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusOptions = Object.keys(statusColors);

export default function OfficerDrivesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', companyId: '', startDate: '', endDate: '', stages: 'APTITUDE, TECHNICAL, HR' });

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser || (currentUser.role !== 'OFFICER' && currentUser.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    Promise.all([
      api.get('/drives', auth.getToken() || undefined),
      api.get('/companies', auth.getToken() || undefined),
    ])
      .then(([d, c]) => {
        setDrives(d);
        setCompanies(c);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const createDrive = async () => {
    if (!form.title || !form.companyId) {
      setError('Title and company are required');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await api.post('/drives', {
        title: form.title,
        companyId: form.companyId,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        stages: form.stages.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
      }, auth.getToken() || undefined);
      setDrives([created, ...drives]);
      setForm({ title: '', companyId: '', startDate: '', endDate: '', stages: 'APTITUDE, TECHNICAL, HR' });
      setShowCreate(false);
    } catch (e: any) {
      setError(e.message || 'Failed to create drive');
    } finally {
      setCreating(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      const updated = await api.patch(`/drives/${id}/status`, { status }, auth.getToken() || undefined);
      setDrives(drives.map((d) => (d.id === id ? updated : d)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const removeDrive = async (id: string) => {
    try {
      await api.delete(`/drives/${id}`, auth.getToken() || undefined);
      setDrives(drives.filter((d) => d.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!user) return null;

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Drives</h1>
          <p className="mt-1 text-gray-500">Schedule and manage campus placement drives</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          {showCreate ? 'Cancel' : '+ New Drive'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showCreate && (
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Create Drive</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. TCS Campus Drive 2026" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
              <select className={inputCls} value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                <option value="">Select company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Stages (comma separated)</label>
              <input className={inputCls} value={form.stages} onChange={(e) => setForm({ ...form, stages: e.target.value })} />
            </div>
          </div>
          <button
            onClick={createDrive}
            disabled={creating}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Drive'}
          </button>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {drives.map((drive) => (
          <div key={drive.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{drive.title}</h3>
                <p className="text-sm text-gray-500">{drive.company?.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(drive.stages || []).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[drive.status] || 'bg-gray-100 text-gray-700'}`}>
                  {drive.status}
                </span>
                <select
                  value={drive.status}
                  onChange={(e) => changeStatus(drive.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => removeDrive(drive.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {drive.startDate ? `From ${new Date(drive.startDate).toLocaleDateString()}` : 'No start date set'}
              {drive.endDate ? ` to ${new Date(drive.endDate).toLocaleDateString()}` : ''}
              {' · '}Created by {drive.creator?.name}
            </p>
          </div>
        ))}
        {drives.length === 0 && !showCreate && (
          <p className="text-center text-gray-500 py-8">No drives yet — create your first one</p>
        )}
      </div>
    </div>
  );
}
