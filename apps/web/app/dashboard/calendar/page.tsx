'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  type: 'interview' | 'stage';
  meetLink?: string | null;
  interviewer?: string | null;
  status?: string;
  applicationId: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }

    api.get('/calendar', auth.getToken() || undefined)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const grouped: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    const key = ev.start ? new Date(ev.start).toLocaleDateString() : 'No date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
      <p className="mt-1 text-gray-500">Upcoming interviews and stage events</p>

      <div className="mt-8 space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-400 py-8 text-center">No upcoming events</p>
        ) : (
          Object.entries(grouped).map(([date, evts]) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">{date}</h3>
              <div className="space-y-2">
                {evts.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm cursor-pointer hover:border-brand-300"
                    onClick={() => router.push(`/dashboard/recruiter/applications/${ev.applicationId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${ev.type === 'interview' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-500">
                          {ev.start ? new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                          {ev.type === 'interview' && ` \u2022 ${ev.interviewer || 'No interviewer'}`}
                        </p>
                      </div>
                    </div>
                    {ev.meetLink && (
                      <a href={ev.meetLink} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                        onClick={(e) => e.stopPropagation()}>
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
