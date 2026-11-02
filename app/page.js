import { supabase } from '../lib/supabase';

export const revalidate = 60;

export default async function Home() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-black px-2.5 py-1 rounded text-lg tracking-wider">TP</span>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">TradePulse</span>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Trade Jobs
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 text-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Direct Skilled Trade Jobs in the US
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            No generic office jobs. Instant hourly rates, state license requirements, and company equipment perks.
          </p>
        </div>
      </section>

      {/* Job Listings Feed */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-700">Latest Openings</h2>
          <span className="text-sm text-slate-500">{jobs?.length || 0} jobs listed</span>
        </div>

        <div className="space-y-4">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-500 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {job.trade_category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {job.city}, {job.state} {job.zip_code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                    {job.job_title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-3 font-medium">{job.company_name}</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {job.license_required && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                        Lic: {job.license_required}
                      </span>
                    )}
                    {job.has_company_vehicle && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        🚐 Van Included
                      </span>
                    )}
                    {job.tools_provided && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        🔧 Tools Provided
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-xl font-black text-slate-900">
                      ${job.pay_rate_min} - ${job.pay_rate_max}
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{job.pay_type} pay</span>
                  </div>

                  <a 
                    href={job.source_apply_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg text-center transition-colors shadow-sm"
                  >
                    Apply Direct
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-10">No jobs found in the database.</p>
          )}
        </div>
      </section>
    </main>
  );
}
