'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CreateJobPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pkg, setPkg] = useState('');
  const [minCGPA, setMinCGPA] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');
  const [branches, setBranches] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/companies', auth.getToken() || undefined)
      .then(setCompanies)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) { alert('Select a company'); return; }
    setLoading(true);
    try {
      await api.post(`/jobs/company/${companyId}`, {
        title,
        description,
        package: pkg || undefined,
        minCGPA: minCGPA ? parseFloat(minCGPA) : undefined,
        maxBacklogs: maxBacklogs ? parseInt(maxBacklogs) : undefined,
        allowedBranches: branches ? branches.split(',').map((b: string) => b.trim()) : undefined,
        status: 'DRAFT',
      }, auth.getToken() || undefined);
      router.push('/dashboard/recruiter/jobs');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">&larr; Back</button>
      <h1 className="text-2xl font-bold text-gray-900">Create Job</h1>
      <p className="mt-1 text-gray-500">Post a new job opening</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company *</label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            <option value="">Select company</option>
            {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Package (e.g. 28 LPA)</label>
            <input type="text" value={pkg} onChange={(e) => setPkg(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min CGPA</label>
            <input type="number" step="0.1" value={minCGPA} onChange={(e) => setMinCGPA(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Backlogs</label>
            <input type="number" value={maxBacklogs} onChange={(e) => setMaxBacklogs(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Allowed Branches</label>
            <input type="text" value={branches} onChange={(e) => setBranches(e.target.value)} placeholder="CSE, ECE, EE"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
}
