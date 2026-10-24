'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function RecruiterCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') {
      router.push('/login');
      return;
    }

    api.get('/companies', auth.getToken() || undefined)
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Companies</h1>
          <p className="mt-1 text-gray-500">Manage your company profiles</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/recruiter/companies/create')}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + New Company
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {companies.map((company) => (
          <div key={company.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-lg font-bold text-brand-600">
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                <span className={`text-xs font-medium ${company.verified ? 'text-green-600' : 'text-amber-600'}`}>
                  {company.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{company._count?.jobs || 0} jobs posted</p>
            <button
              onClick={() => router.push(`/dashboard/recruiter/companies/${company.id}`)}
              className="mt-4 w-full rounded-lg border py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage
            </button>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">You haven't created any companies yet</p>
            <button
              onClick={() => router.push('/dashboard/recruiter/companies/create')}
              className="mt-4 text-brand-500 font-medium text-sm hover:text-brand-600"
            >
              Create your first company
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
