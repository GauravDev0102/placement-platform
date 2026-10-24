import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-500" />
            <span className="text-xl font-bold">PlacementHub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">
              Placement Management,<br />
              <span className="text-brand-500">Automated.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              From resume parsing to interview scheduling. One platform for students,
              recruiters, and placement officers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600"
              >
                Start Free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-3 gap-8">
            {[
              {
                title: 'For Students',
                items: ['Auto profile from resume', 'Track applications', 'AI career advice'],
              },
              {
                title: 'For Recruiters',
                items: ['Candidate pipeline', 'Advanced filters', 'Private notes & tags'],
              },
              {
                title: 'For Officers',
                items: ['Placement analytics', 'Activity feed', 'Bulk notifications'],
              },
            ].map((col) => (
              <div key={col.title} className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">{col.title}</h3>
                <ul className="mt-4 space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
