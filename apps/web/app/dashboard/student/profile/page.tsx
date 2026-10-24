'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Other'];

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    phone: '',
    linkedIn: '',
    github: '',
    cgpa: '',
    branch: '',
    graduationYear: '',
    backlogs: '0',
    bio: '',
  });

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== 'STUDENT') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    api.get(`/users/${currentUser.id}`, auth.getToken() || undefined)
      .then((u: any) => {
        const p = u.profile || {};
        setForm({
          phone: p.phone || '',
          linkedIn: p.linkedIn || '',
          github: p.github || '',
          cgpa: p.cgpa != null ? String(p.cgpa) : '',
          branch: p.branch || '',
          graduationYear: p.graduationYear ? String(p.graduationYear) : '',
          backlogs: String(p.backlogs ?? 0),
          bio: p.bio || '',
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data: Record<string, any> = {};
      if (form.phone) data.phone = form.phone;
      if (form.linkedIn) data.linkedIn = form.linkedIn;
      if (form.github) data.github = form.github;
      if (form.bio) data.bio = form.bio;
      data.backlogs = parseInt(form.backlogs) || 0;
      if (form.cgpa) {
        const cgpa = parseFloat(form.cgpa);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) throw new Error('CGPA must be between 0 and 10');
        data.cgpa = cgpa;
      } else {
        data.cgpa = null;
      }
      if (form.branch) data.branch = form.branch;
      if (form.graduationYear) data.graduationYear = parseInt(form.graduationYear) || null;
      else data.graduationYear = null;

      await api.patch('/users/profile', data, auth.getToken() || undefined);

      // refresh cached user so job pages see the latest profile
      const refreshed = await api.get(`/users/${user.id}`, auth.getToken() || undefined);
      localStorage.setItem('user', JSON.stringify({ ...user, profile: refreshed.profile }));

      setMessage('Profile saved successfully');
    } catch (e: any) {
      setError(e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-500">Keep your academic details up to date — placement eligibility checks use this</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Back to dashboard</Link>
      </div>

      {message && (
        <div className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Personal Details</h2>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input className={inputCls} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
              <input className={inputCls} value={form.linkedIn} onChange={(e) => update('linkedIn', e.target.value)} placeholder="linkedin.com/in/username" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GitHub URL</label>
              <input className={inputCls} value={form.github} onChange={(e) => update('github', e.target.value)} placeholder="github.com/username" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Academic Details</h2>
          <div className="mt-3 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CGPA <span className="text-red-400">*</span></label>
              <input type="number" step="0.01" min="0" max="10" className={inputCls} value={form.cgpa} onChange={(e) => update('cgpa', e.target.value)} placeholder="0.00 - 10.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
              <select className={inputCls} value={form.branch} onChange={(e) => update('branch', e.target.value)}>
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
              <input type="number" className={inputCls} value={form.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} placeholder="2027" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Backlogs</label>
              <input type="number" min="0" className={inputCls} value={form.backlogs} onChange={(e) => update('backlogs', e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Bio</h2>
          <textarea
            className={`${inputCls} mt-3`}
            rows={4}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="A short summary about you — skills, interests, achievements..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <span className="text-xs text-gray-400">Required for job eligibility checks</span>
        </div>
      </div>
    </div>
  );
}
