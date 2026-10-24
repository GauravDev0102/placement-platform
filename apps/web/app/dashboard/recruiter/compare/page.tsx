'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function ComparePage() {
  const router = useRouter();
  const [studentIds, setStudentIds] = useState<string[]>(['', '', '']);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.getUser();
    if (!user || user.role !== 'RECRUITER') { router.push('/login'); return; }
    api.get('/users?role=STUDENT', auth.getToken() || undefined)
      .then(setAllStudents)
      .catch(() => {});
  }, [router]);

  const compare = async () => {
    const ids = studentIds.filter(Boolean);
    if (ids.length < 2) { alert('Select at least 2 students'); return; }
    setLoading(true);
    try {
      const data = await api.post('/students/compare', { studentIds: ids }, auth.getToken() || undefined);
      setStudents(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Compare Students</h1>
      <p className="mt-1 text-gray-500">Select students to compare side by side</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {studentIds.map((id, i) => (
          <select key={i} value={id} onChange={(e) => {
            const newIds = [...studentIds];
            newIds[i] = e.target.value;
            setStudentIds(newIds);
          }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Select student {i + 1}</option>
            {allStudents.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} - {s.profile?.branch || 'N/A'}</option>
            ))}
          </select>
        ))}
      </div>

      <button onClick={compare} disabled={loading}
        className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
        {loading ? 'Loading...' : 'Compare'}
      </button>

      {students.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse rounded-xl border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-600">Field</th>
                {students.map((s: any) => (
                  <th key={s.id} className="border px-4 py-3 text-left text-sm font-medium text-gray-900">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Email', get: (s: any) => s.email },
                { label: 'Branch', get: (s: any) => s.profile?.branch || '-' },
                { label: 'CGPA', get: (s: any) => s.profile?.cgpa || '-' },
                { label: 'Backlogs', get: (s: any) => s.profile?.backlogs ?? '-' },
                { label: 'Graduation Year', get: (s: any) => s.profile?.graduationYear || '-' },
                { label: 'ATS Score', get: (s: any) => s.resumes?.[0]?.atsScore || '-' },
                { label: 'Skills', get: (s: any) => s.userSkills?.map((us: any) => us.skill.name).join(', ') || '-' },
                { label: 'Projects', get: (s: any) => s.projects?.map((p: any) => p.title).join(', ') || '-' },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="border px-4 py-3 text-sm font-medium text-gray-600">{row.label}</td>
                  {students.map((s: any) => (
                    <td key={s.id} className="border px-4 py-3 text-sm text-gray-900">{row.get(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
