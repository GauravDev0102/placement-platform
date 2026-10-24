'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CandidatesPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');

  const [filters, setFilters] = useState({
    skills: '',
    branch: '',
    cgpaMin: '',
    cgpaMax: '',
    backlogsMax: '',
    batch: '',
  });

  const fetchResults = async (filterOverrides?: any) => {
    setLoading(true);
    const f = filterOverrides || filters;
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v as string); });
    try {
      const data = await api.get(`/students/search?${params}`, auth.getToken() || undefined);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') { router.push('/login'); return; }
    api.get('/saved-searches', auth.getToken() || undefined)
      .then(setSavedSearches)
      .catch(() => {});
  }, [router]);

  const applySavedSearch = (s: any) => {
    setFilters(s.filters);
    fetchResults(s.filters);
  };

  const saveCurrentSearch = async () => {
    if (!saveName.trim()) return;
    try {
      await api.post('/saved-searches', { name: saveName, filters }, auth.getToken() || undefined);
      setSaveName('');
      const updated = await api.get('/saved-searches', auth.getToken() || undefined);
      setSavedSearches(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
      <p className="mt-1 text-gray-500">Filter and find students</p>

      {savedSearches.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {savedSearches.map((s: any) => (
            <button key={s.id} onClick={() => applySavedSearch(s)}
              className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Skills</label>
            <input type="text" value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
              placeholder="React, Node, Python" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Branch</label>
            <input type="text" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              placeholder="CSE" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Batch (Year)</label>
            <input type="text" value={filters.batch} onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              placeholder="2027" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Min CGPA</label>
            <input type="number" step="0.1" value={filters.cgpaMin} onChange={(e) => setFilters({ ...filters, cgpaMin: e.target.value })}
              placeholder="8.0" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Max CGPA</label>
            <input type="number" step="0.1" value={filters.cgpaMax} onChange={(e) => setFilters({ ...filters, cgpaMax: e.target.value })}
              placeholder="10.0" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Max Backlogs</label>
            <input type="number" value={filters.backlogsMax} onChange={(e) => setFilters({ ...filters, backlogsMax: e.target.value })}
              placeholder="0" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => fetchResults()} disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
          <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
            placeholder="Save this search as..." className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-48" />
          <button onClick={saveCurrentSearch} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Save
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {students.map((s: any) => (
          <div key={s.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.email}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {s.profile?.cgpa && <span className="text-gray-600">CGPA: {s.profile.cgpa}</span>}
                {s.profile?.branch && <span className="text-gray-600">{s.profile.branch}</span>}
                {s.resumes?.[0]?.atsScore && <span className="text-gray-600">ATS: {s.resumes[0].atsScore}</span>}
              </div>
            </div>
            {s.userSkills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.userSkills.map((us: any) => (
                  <span key={us.skill.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{us.skill.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {students.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-8">No students match your filters</p>
        )}
      </div>
    </div>
  );
}
