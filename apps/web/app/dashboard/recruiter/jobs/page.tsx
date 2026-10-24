'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  package: string | null;
  status: string;
  createdAt: string;
  company: { name: string };
  _count: { applications: number };
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-600',
  ARCHIVED: 'bg-amber-100 text-amber-600',
};

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.get('/jobs', auth.getToken() || undefined);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') { router.push('/login'); return; }
    fetchJobs();
  }, [router, fetchJobs]);

  const changeStatus = async (jobId: string, status: string) => {
    setChanging(jobId);
    try {
      await api.patch(`/jobs/${jobId}/status`, { status }, auth.getToken() || undefined);
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setChanging(null);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="mt-1 text-gray-500">Manage your job listings</p>
        </div>
        <button onClick={() => router.push('/dashboard/recruiter/jobs/create')}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          + New Job
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.company?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{job._count.applications} applications</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[job.status] || ''}`}>
                  {job.status}
                </span>
              </div>
            </div>
            {job.package && <p className="mt-2 text-sm font-medium text-brand-600">{job.package}</p>}
            <div className="mt-3 flex gap-2">
              {job.status === 'DRAFT' && (
                <button onClick={() => changeStatus(job.id, 'PUBLISHED')} disabled={changing === job.id}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                  {changing === job.id ? '...' : 'Publish'}
                </button>
              )}
              {job.status === 'PUBLISHED' && (
                <button onClick={() => changeStatus(job.id, 'CLOSED')} disabled={changing === job.id}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {changing === job.id ? '...' : 'Close'}
                </button>
              )}
              {job.status === 'CLOSED' && (
                <>
                  <button onClick={() => changeStatus(job.id, 'PUBLISHED')} disabled={changing === job.id}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    {changing === job.id ? '...' : 'Reopen'}
                  </button>
                  <button onClick={() => changeStatus(job.id, 'ARCHIVED')} disabled={changing === job.id}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                    {changing === job.id ? '...' : 'Archive'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-center text-gray-500 py-8">No jobs posted yet</p>}
      </div>
    </div>
  );
}
