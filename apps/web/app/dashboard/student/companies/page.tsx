'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  verified: boolean;
  _count: { jobs: number };
}

export default function StudentCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'STUDENT') {
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
      <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
      <p className="mt-1 text-gray-500">Browse companies and check your eligibility</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div key={company.id} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-lg font-bold text-brand-600">
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                {company.verified && (
                  <span className="text-xs text-green-600">Verified</span>
                )}
              </div>
            </div>
            {company.description && (
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{company.description}</p>
            )}
            <p className="mt-4 text-sm text-gray-500">{company._count.jobs} open positions</p>
            <button
              onClick={() => router.push(`/dashboard/student/companies/${company.id}`)}
              className="mt-4 w-full rounded-lg border py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Jobs
            </button>
          </div>
        ))}
        {companies.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-8">No companies registered yet</p>
        )}
      </div>
    </div>
  );
}
