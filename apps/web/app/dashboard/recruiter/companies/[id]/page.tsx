'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }
    api.get(`/companies/${id}`, auth.getToken() || undefined)
      .then(setCompany)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!company) return <div className="p-8 text-gray-500">Company not found</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">&larr; Back</button>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-100 text-2xl font-bold text-brand-600">
          {company.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <span className={`text-sm font-medium ${company.verified ? 'text-green-600' : 'text-amber-600'}`}>
            {company.verified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {company.description && <p className="mt-4 text-gray-600">{company.description}</p>}

      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-4">Jobs ({company.jobs?.length || 0})</h2>
        <div className="space-y-3">
          {company.jobs?.map((job: any) => (
            <div key={job.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <span className="text-xs text-gray-500">{job._count?.applications || 0} applications</span>
              </div>
              {job.package && <p className="text-sm text-brand-600 mt-1">{job.package}</p>}
            </div>
          ))}
          {(!company.jobs || company.jobs.length === 0) && (
            <p className="text-sm text-gray-400">No jobs posted yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
