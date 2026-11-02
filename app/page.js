'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*');

        if (error) {
          setFetchError(error.message);
        } else {
          setJobs(data || []);
        }
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

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

      <section className="bg-slate-900 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Direct Skilled Trade Jobs in the US
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            No generic office jobs. Instant hourly rates, state license requirements, and company equipment perks.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Latest Openings</h2>
          <span className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${jobs.length} jobs listed`}
          </span>
        </div>

        {fetchError && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error conectando con Supabase:</strong> {fetchError}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500">Cargando empleos...</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
            No jobs found in the database.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
                        {job.trade_category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {job.city ? `${job.city}, ` : ''}{job.state}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{job.job_title}</h3>
                    <p className="text-sm text-slate-600">{job.company_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {job.hourly_rate_min && job.hourly_rate_max && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">
                          ${job.hourly_rate_min} - ${job.hourly_rate_max}
                        </span>
                        <span className="text-xs text-slate-500 block">/ hour</span>
                      </div>
                    )}
                    <a
                      href={`mailto:${job.contact_email || 'apply@tradepulse.work'}?subject=Application for ${encodeURIComponent(job.job_title)}`}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
