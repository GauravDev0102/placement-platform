'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface StageDetail {
  id: string;
  stageName: string;
  stageOrder: number;
  status: string;
  feedback: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  recruiter: { name: string };
}

interface Resume {
  id: string;
  version: number;
  fileUrl: string;
  atsScore: number | null;
  uploadedAt: string;
}

interface Application {
  id: string;
  status: string;
  eligibilityStatus: string | null;
  eligibilityReason: string | null;
  appliedAt: string;
  currentStageName: string;
  student: { id: string; name: string; email: string; resumes: Resume[] };
  job: {
    title: string;
    package: string | null;
    company: { name: string };
  };
  stageDetails: StageDetail[];
  notes: Note[];
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [app, setApp] = useState<Application | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApp = () => {
    api.get(`/applications/${id}`, auth.getToken() || undefined)
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') { router.push('/login'); return; }
    fetchApp();
  }, [id, router]);

  const advanceStage = async () => {
    let scheduledAt: string | undefined;
    const when = prompt('Schedule the next round? Leave empty to skip.\nEnter date and time, e.g. 2026-11-01 14:30');
    if (when && when.trim()) {
      const d = new Date(when.trim());
      if (!isNaN(d.getTime())) {
        scheduledAt = d.toISOString();
      } else {
        alert('Could not parse that date — advancing without a schedule.');
      }
    }
    try {
      await api.patch(`/applications/${id}/advance`, { scheduledAt }, auth.getToken() || undefined);
      fetchApp();
    } catch (err: any) { alert(err.message); }
  };

  const reject = async () => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await api.patch(`/applications/${id}/reject`, { reason }, auth.getToken() || undefined);
      fetchApp();
    } catch (err: any) { alert(err.message); }
  };

  const addNote = async () => {
    if (!noteContent.trim() || !app) return;
    try {
      await api.post('/notes', {
        studentId: app.student.id,
        applicationId: id,
        content: noteContent,
      }, auth.getToken() || undefined);
      setNoteContent('');
      fetchApp();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!app) return <div className="p-8 text-gray-500">Application not found</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        &larr; Back to pipeline
      </button>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.student.name}</h1>
            <p className="text-gray-500">{app.student.email}</p>
            <p className="mt-1 text-sm text-gray-500">{app.job.title} at {app.job.company.name}</p>
            {app.job.package && <p className="mt-1 font-medium text-brand-600">{app.job.package}</p>}
          </div>
          <div className="flex items-center gap-2">
            {app.status !== 'REJECTED' && app.status !== 'JOINED' && app.status !== 'OFFER' && (
              <>
                <button onClick={advanceStage} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                  Advance Stage
                </button>
                <button onClick={reject} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-2">
          {app.eligibilityStatus && (
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
              app.eligibilityStatus === 'ELIGIBLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {app.eligibilityStatus}{app.eligibilityReason ? `: ${app.eligibilityReason}` : ''}
            </span>
          )}
          <span className="ml-2 inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {app.currentStageName || app.status}
          </span>
        </div>

        {app.student.resumes && app.student.resumes.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Resumes</p>
            {app.student.resumes.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Resume v{r.version}</span>
                  {r.atsScore && (
                    <span className={`text-xs font-medium ${r.atsScore >= 80 ? 'text-green-600' : r.atsScore >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                      ATS: {r.atsScore}
                    </span>
                  )}
                </div>
                <a href={`http://localhost:4000${r.fileUrl}`} target="_blank"
                  className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Stage Timeline</h2>
          <div className="space-y-4">
            {app.stageDetails.map((stage, i) => (
              <div key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${i === app.stageDetails.length - 1 ? 'bg-brand-500' : 'bg-gray-300'}`} />
                  {i < app.stageDetails.length - 1 && <div className="mt-1 h-full w-0.5 bg-gray-200" />}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">{stage.stageName.replace(/_/g, ' ')}</p>
                  {stage.feedback && <p className="text-sm text-gray-500 mt-1">{stage.feedback}</p>}
                  {stage.scheduledAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Scheduled: {new Date(stage.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Private Notes</h2>
          <div className="space-y-3 mb-4">
            {app.notes.map((note) => (
              <div key={note.id} className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-700">{note.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {note.recruiter.name} &middot; {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {app.notes.length === 0 && (
              <p className="text-sm text-gray-400">No notes yet</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a private note..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button onClick={addNote} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
