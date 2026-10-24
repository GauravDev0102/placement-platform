'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Resume {
  id: string;
  version: number;
  fileUrl: string;
  parsedData: any;
  atsScore: number | null;
  atsFeedback: any;
  uploadedAt: string;
}

export default function ResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = async () => {
    try {
      const data = await api.get('/resume/my', auth.getToken() || undefined);
      setResumes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'STUDENT') { router.push('/login'); return; }
    fetchResumes();
  }, [router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = auth.getToken();
      const res = await fetch(`${API_BASE}/api/resume/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }

      fetchResumes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Resume</h1>
      <p className="mt-1 text-gray-500">Upload and manage your resumes</p>

      <div className="mt-8">
        {resumes.length === 0 && (
          <div className="rounded-xl border-2 border-dashed bg-gray-50 p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-2xl text-brand-500">+</span>
            </div>
            <h3 className="font-semibold text-gray-900">No resume uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your resume to start applying to companies</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="mt-4 rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Select PDF & Upload'}
            </button>
          </div>
        )}

        {resumes.length > 0 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="mb-6 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload New Version'}
            </button>

            <div className="space-y-4">
              {resumes.map((resume) => (
                <div key={resume.id} className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Resume v{resume.version}</h3>
                      <p className="text-xs text-gray-400">
                        Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                      {resume.parsedData?.fileName && (
                        <p className="text-xs text-gray-400 mt-0.5">{resume.parsedData.fileName}</p>
                      )}
                    </div>
                    {resume.atsScore && (
                      <div className="text-right">
                        <span className={`text-lg font-bold ${resume.atsScore >= 80 ? 'text-green-600' : resume.atsScore >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                          {resume.atsScore}/100
                        </span>
                        <p className="text-xs text-gray-400">ATS Score</p>
                      </div>
                    )}
                  </div>
                  {resume.atsFeedback?.suggestions && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Suggestions:</p>
                      {resume.atsFeedback.suggestions.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-gray-500">✓ {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
