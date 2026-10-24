'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function StudentCompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [company, setCompany] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const hasResume = resumes.length > 0;

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'STUDENT') { router.push('/login'); return; }
    Promise.all([
      api.get(`/companies/${id}`, auth.getToken() || undefined),
      api.get('/resume/my', auth.getToken() || undefined),
    ]).then(([companyData, resumeData]) => {
      setCompany(companyData);
      setResumes(resumeData);
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  const apply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await api.post('/applications', { jobId }, auth.getToken() || undefined);
      alert('Application submitted!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApplying(null);
    }
  };

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
          {company.verified && <span className="text-sm text-green-600">Verified</span>}
        </div>
      </div>
      {company.description && <p className="mt-4 text-gray-600">{company.description}</p>}

      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-4">Open Positions ({company.jobs?.length || 0})</h2>
        <div className="space-y-4">
          {company.jobs?.map((job: any) => (
            <div key={job.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  {job.package && <p className="text-sm font-medium text-brand-600 mt-1">{job.package}</p>}
                </div>
                  <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">CGPA: {job.minCGPA ?? '-'}+</span>
                  {hasResume ? (
                    <button onClick={() => apply(job.id)} disabled={applying === job.id}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                      {applying === job.id ? 'Applying...' : 'Apply'}
                    </button>
                  ) : (
                    <button onClick={() => router.push('/dashboard/student/resume')}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
                      Upload Resume First
                    </button>
                  )}
                </div>
              </div>
              {job.description && <p className="mt-2 text-sm text-gray-600">{job.description}</p>}
              {job.jobSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.jobSkills.map((js: any) => (
                    <span key={js.skill.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{js.skill.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(!company.jobs || company.jobs.length === 0) && (
            <p className="text-sm text-gray-400">No open positions right now</p>
          )}
        </div>
      </div>
    </div>
  );
}
