'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(null);
  const [appStats, setAppStats] = useState<any>(null);
  const [jobStats, setJobStats] = useState<any>(null);
  const [companyStats, setCompanyStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }

    const token = auth.getToken() || undefined;
    Promise.all([
      api.get('/analytics/overview', token),
      api.get('/analytics/applications', token),
      api.get('/analytics/jobs', token),
      api.get('/analytics/companies', token),
      api.get('/analytics/timeline?days=30', token),
    ]).then(([o, a, j, c, t]) => {
      setOverview(o);
      setAppStats(a);
      setJobStats(j);
      setCompanyStats(c);
      setTimeline(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-gray-500">Platform-wide statistics and trends</p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <StatCard label="Total Users" value={overview?.totalUsers || 0} />
        <StatCard label="Companies" value={overview?.totalCompanies || 0} />
        <StatCard label="Jobs" value={overview?.totalJobs || 0} />
        <StatCard label="Applications" value={overview?.totalApplications || 0} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Application Stages</h2>
          <div className="mt-4 space-y-3">
            {appStats?.stages?.map((s: any) => (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.stage || 'No stage'}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.count / appStats.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Job Status</h2>
          <div className="mt-4 space-y-3">
            {jobStats?.byStatus?.map((s: any) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.status}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>Verified: <span className="font-medium text-green-600">{companyStats?.verified || 0}</span></p>
            <p>Unverified: <span className="font-medium text-red-600">{companyStats?.unverified || 0}</span></p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Applications (30 days)</h2>
          <div className="mt-4 space-y-1 text-sm">
            {timeline.slice(-14).map((t: any) => (
              <div key={t.date} className="flex items-center gap-2">
                <span className="w-24 text-gray-500">{t.date.slice(5)}</span>
                <div className="h-4 rounded bg-brand-200" style={{ width: `${Math.min(t.count * 10, 200)}px` }} />
                <span className="text-gray-700">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
