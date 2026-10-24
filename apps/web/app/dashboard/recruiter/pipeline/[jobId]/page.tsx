'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

const STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'border-gray-300' },
  { key: 'RESUME_SHORTLISTED', label: 'Shortlisted', color: 'border-blue-400' },
  { key: 'CODING_ROUND', label: 'Coding', color: 'border-amber-400' },
  { key: 'TECHNICAL_INTERVIEW', label: 'Technical', color: 'border-purple-400' },
  { key: 'HR_INTERVIEW', label: 'HR', color: 'border-indigo-400' },
  { key: 'OFFER', label: 'Offer', color: 'border-green-400' },
  { key: 'JOINED', label: 'Joined', color: 'border-emerald-400' },
];

export default function PipelinePage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [pipeline, setPipeline] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') {
      router.push('/login');
      return;
    }

    api.get(`/applications/pipeline/${jobId}`, auth.getToken() || undefined)
      .then(setPipeline)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId, router]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = pipeline[stage.key] || [];
          return (
            <div key={stage.key} className="min-w-[260px] flex-shrink-0">
              <div className={`mb-3 rounded-t-lg border-t-4 ${stage.color} bg-white p-3 shadow-sm`}>
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <p className="text-sm text-gray-500">{cards.length} candidates</p>
              </div>
              <div className="space-y-3">
                {cards.map((app: any) => (
                  <div
                    key={app.id}
                    className="rounded-lg border bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/dashboard/recruiter/applications/${app.id}`)}
                  >
                    <p className="font-medium text-gray-900">{app.student?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{app.student?.email}</p>
                    {app.student?.profile?.cgpa && (
                      <p className="mt-2 text-xs text-gray-500">CGPA: {app.student.profile.cgpa}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-center text-sm text-gray-400">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
