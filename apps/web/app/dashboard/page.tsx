'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) { router.push('/login'); return; }
    setUser(currentUser);

    if (currentUser.role === 'STUDENT') {
      api.get('/applications/dashboard', auth.getToken() || undefined)
        .then(setStats)
        .catch(() => {});
    } else {
      api.get('/analytics/overview', auth.getToken() || undefined)
        .then(setOverview)
        .catch(() => {});
    }

    api.get('/notifications/unread-count', auth.getToken() || undefined)
      .then((d: any) => setUnreadCount(typeof d === 'number' ? d : 0))
      .catch(() => {});
  }, [router]);

  if (!user) return null;

  const navLinks: Record<string, { label: string; href: string }[]> = {
    STUDENT: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Resume', href: '/dashboard/student/resume' },
      { label: 'My Profile', href: '/dashboard/student/profile' },
      { label: 'Companies', href: '/dashboard/student/companies' },
      { label: 'Applications', href: '/dashboard/student/applications' },
    ],
    RECRUITER: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Activity', href: '/dashboard/activity' },
      { label: 'Calendar', href: '/dashboard/calendar' },
      { label: 'Analytics', href: '/dashboard/analytics' },
      { label: 'Companies', href: '/dashboard/recruiter/companies' },
      { label: 'Jobs', href: '/dashboard/recruiter/jobs' },
      { label: 'Candidates', href: '/dashboard/recruiter/candidates' },
      { label: 'Compare', href: '/dashboard/recruiter/compare' },
    ],
    OFFICER: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Activity', href: '/dashboard/activity' },
      { label: 'Calendar', href: '/dashboard/calendar' },
      { label: 'Analytics', href: '/dashboard/analytics' },
      { label: 'Drives', href: '/dashboard/officer/drives' },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Activity', href: '/dashboard/activity' },
      { label: 'Calendar', href: '/dashboard/calendar' },
      { label: 'Analytics', href: '/dashboard/analytics' },
      { label: 'Drives', href: '/dashboard/officer/drives' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Logs', href: '/admin/logs' },
    ],
  };

  const links = navLinks[user.role as keyof typeof navLinks] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-500" />
            <span className="text-xl font-bold">PlacementHub</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard/notifications')} className="relative text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={() => { auth.clearSession(); router.push('/login'); }} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="mt-1 text-gray-500 capitalize">Role: {user.role.toLowerCase()}</p>

          {user.role === 'STUDENT' ? (
            <div className="mt-8 grid grid-cols-4 gap-6">
              {stats ? (
                <>
                  <StatCard label="Applications" value={stats.total} color="bg-blue-500" />
                  <StatCard label="Selected" value={stats.selected} color="bg-green-500" />
                  <StatCard label="In Progress" value={stats.inProgress} color="bg-amber-500" />
                  <StatCard label="Rejected" value={stats.rejected} color="bg-red-500" />
                </>
              ) : (
                <>
                  <StatCard label="Applications" value="-" color="bg-blue-500" />
                  <StatCard label="Selected" value="-" color="bg-green-500" />
                  <StatCard label="In Progress" value="-" color="bg-amber-500" />
                  <StatCard label="Rejected" value="-" color="bg-red-500" />
                </>
              )}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-4 gap-6">
              {overview ? (
                <>
                  <StatCard label="Students" value={overview.totalUsers} color="bg-blue-500" />
                  <StatCard label="Companies" value={overview.totalCompanies} color="bg-purple-500" />
                  <StatCard label="Jobs" value={overview.totalJobs} color="bg-amber-500" />
                  <StatCard label="Applications" value={overview.totalApplications} color="bg-green-500" />
                </>
              ) : (
                <>
                  <StatCard label="Students" value="-" color="bg-blue-500" />
                  <StatCard label="Companies" value="-" color="bg-purple-500" />
                  <StatCard label="Jobs" value="-" color="bg-amber-500" />
                  <StatCard label="Applications" value="-" color="bg-green-500" />
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
