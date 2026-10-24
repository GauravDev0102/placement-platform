'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Application {
  id: string;
  status: string;
  eligibilityStatus: string | null;
  appliedAt: string;
  currentStageName: string;
  job: {
    title: string;
    package: string | null;
    company: { name: string };
  };
}

const statusColors: Record<string, string> = {
  APPLIED: 'bg-gray-100 text-gray-700',
  RESUME_SHORTLISTED: 'bg-blue-100 text-blue-700',
  CODING_ROUND: 'bg-amber-100 text-amber-700',
  TECHNICAL_INTERVIEW: 'bg-purple-100 text-purple-700',
  HR_INTERVIEW: 'bg-indigo-100 text-indigo-700',
  OFFER: 'bg-green-100 text-green-700',
  JOINED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'STUDENT') {
      router.push('/login');
      return;
    }

    api.get(`/applications?studentId=${user.id}`, auth.getToken() || undefined)
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <p className="mt-1 text-gray-500">Track your job applications</p>

      <div className="mt-8 space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                <p className="text-sm text-gray-500">{app.job.company.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {app.eligibilityStatus && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${app.eligibilityStatus === 'ELIGIBLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {app.eligibilityStatus}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                  {app.currentStageName || app.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            {app.job.package && (
              <p className="mt-2 text-sm font-medium text-brand-600">{app.job.package}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
          </div>
        ))}
        {applications.length === 0 && (
          <p className="text-center text-gray-500 py-8">No applications yet</p>
        )}
      </div>
    </div>
  );
}
