'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setJobs(data);
          if (data.length > 0) {
            setSelectedJob(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  // Dynamic filter lists
  const tradeCategories = useMemo(() => {
    const categories = new Set(jobs.map((j) => j.trade_category).filter(Boolean));
    return ['ALL', ...Array.from(categories)];
  }, [jobs]);

  const statesList = useMemo(() => {
    const states = new Set(jobs.map((j) => j.state).filter(Boolean));
    return ['ALL', ...Array.from(states)];
  }, [jobs]);

  // Client-side filtering & sorting
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesTrade = selectedTrade === 'ALL' || job.trade_category === selectedTrade;
        const matchesState = selectedState === 'ALL' || job.state === selectedState;
        const matchesSearch =
          searchQuery === '' ||
          job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.city?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTrade && matchesState && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'rate') {
          return (b.hourly_rate_max || 0) - (a.hourly_rate_max || 0);
        }
        return 0;
      });
  }, [jobs, selectedTrade, selectedState, searchQuery, sortBy]);

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-800">
      {/* Top Navigation */}
      <header className="border-b bg-white px-6 py-3 flex-shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-1 text-sm font-bold text-white">TP</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">TradePulse</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            VERIFIED TRADE JOBS
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="border-b bg-white px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by title, company, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />

          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Trades</option>
            {tradeCategories.filter((t) => t !== 'ALL').map((trade) => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All States</option>
            {statesList.filter((s) => s !== 'ALL').map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Most Recent</option>
            <option value="rate">Highest Hourly Rate</option>
          </select>
        </div>
      </section>

      {/* Split-View Container */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden p-4 gap-4">
        {/* Left Column: Job Cards List */}
        <div className="w-full md:w-5/12 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs available`}
          </div>

          {filteredJobs.length === 0 && !loading && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No openings match your search criteria.
            </div>
          )}

          {filteredJobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`cursor-pointer rounded-lg border p-4 transition shadow-sm ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {job.trade_category || 'Trade'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-semibold text-slate-900 leading-snug">
                  {job.job_title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{job.company_name}</p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {job.city ? `${job.city}, ` : ''}{job.state}
                  </span>
                  {job.hourly_rate_min && job.hourly_rate_max && (
                    <span className="font-bold text-slate-800">
                      ${job.hourly_rate_min} - ${job.hourly_rate_max}/hr
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Job Details */}
        <div className="hidden md:flex md:w-7/12 flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {selectedJob ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="border-b p-6 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase">
                      {selectedJob.trade_category}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-2">
                      {selectedJob.job_title}
                    </h2>
                    <p className="text-sm font-medium text-slate-600 mt-1">
                      {selectedJob.company_name} — {selectedJob.city ? `${selectedJob.city}, ` : ''}{selectedJob.state}
                    </p>
                  </div>
                  {selectedJob.hourly_rate_min && selectedJob.hourly_rate_max && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        ${selectedJob.hourly_rate_min} - ${selectedJob.hourly_rate_max}
                      </div>
                      <span className="text-xs text-slate-500">per hour</span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="mt-5">
                  <a
                    href={selectedJob.original_url || selectedJob.apply_url || `mailto:${selectedJob.contact_email || 'apply@tradepulse.work'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                  >
                    Apply on Original Site ↗
                  </a>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                    Job Description
                  </h4>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.description || 'No detailed description provided for this opening.'}
                  </div>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Requirements & Licenses
                    </h4>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedJob.requirements}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              Select a job listing on the left to view details.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
