const debugInfo = {

import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*');

  const debugInfo = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'NOT_FOUND',
    errorMessage: error ? error.message : null,
    errorCode: error ? error.code : null,
    errorDetails: error ? error.details : null,
  };

  const jobList = jobs || [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-1 text-sm font-bold text-white">TP</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">TradePulse</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            VERIFIED TRADE JOBS
          </span>
        </div>
      </header>

      {/* Panel de Diagnóstico */}
      <section className="mx-auto max-w-5xl px-4 pt-6">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-xs font-mono text-amber-900">
          <p className="font-bold mb-1">DIAGNÓSTICO EN VIVO:</p>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-12 text-center text-white mt-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Direct Skilled Trade Jobs in the US
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Latest Openings</h2>
          <span className="text-sm text-slate-500">{jobList.length} jobs listed</span>
        </div>

        {jobList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
            No jobs found in the database.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobList.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase text-slate-700">
                      {job.trade_category}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{job.job_title}</h3>
                    <p className="text-sm text-slate-600">{job.company_name} - {job.state}</p>
                  </div>
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
