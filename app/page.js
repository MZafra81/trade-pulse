'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de postulación nativa
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('2-4 years');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [searchCategory, searchCity]);

  async function fetchJobs() {
    setLoading(true);
    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

    if (searchCategory) {
      query = query.eq('trade_category', searchCategory);
    }
    if (searchCity) {
      query = query.ilike('city', `%${searchCity}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
      if (data && data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
      }
    }
    setLoading(false);
  }

  async function handleApply(e) {
    e.preventDefault();
    if (!selectedJob) return;

    setSubmitting(true);
    setSuccessMsg(false);

    const { error } = await supabase.from('applications').insert([
      {
        job_id: selectedJob.id,
        full_name: fullName,
        phone: phone,
        experience_years: experienceYears,
        message: message,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error('Error submitting application:', error);
      alert('Hubo un error al enviar tu postulación. Inténtalo de nuevo.');
    } else {
      setSuccessMsg(true);
      setFullName('');
      setPhone('');
      setMessage('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wide">TP</span>
          <h1 className="text-xl font-bold tracking-tight text-white">TradePulse <span className="text-blue-500 text-xs uppercase px-2 py-0.5 bg-blue-500/10 rounded ml-1 border border-blue-500/20">Direct Hire</span></h1>
        </div>
        <p className="text-sm text-slate-400 hidden sm:block">Plataforma de empleos calificados en EE. UU.</p>
      </header>

      {/* Main Container estilo Computrabajo / Dos Columnas */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: Filtros y Listado (5 columnas) */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          
          {/* Filtros de búsqueda */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Filtrar Vacantes</h2>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las Especialidades</option>
                <option value="HVAC">HVAC</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Welding">Welding</option>
                <option value="Carpentry">Carpentry</option>
              </select>

              <input
                type="text"
                placeholder="Ciudad (ej. Dallas)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Listado de empleos */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Cargando vacantes...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm bg-slate-950 rounded-xl border border-slate-800">No se encontraron ofertas activas.</div>
            ) : (
              jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setSuccessMsg(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-800/80 border-blue-500 shadow-lg shadow-blue-500/5'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                        {job.trade_category}
                      </span>
                      <span className="text-xs font-medium text-emerald-400">
                        ${job.hourly_rate_min} - ${job.hourly_rate_max}/hr
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-base mb-1 line-clamp-1">{job.job_title}</h3>
                    <p className="text-xs text-slate-400 mb-2">{job.company_name}</p>
                    <div className="flex items-center text-xs text-slate-500 space-x-2">
                      <span>📍 {job.city}, {job.state}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Detalle del Puesto y Formulario Nativo (7 columnas) */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col h-[calc(100vh-100px)] sticky top-6 overflow-y-auto">
          {selectedJob ? (
            <div className="flex flex-col h-full space-y-6">
              
              {/* Cabecera del detalle */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 inline-block mb-2">
                      {selectedJob.trade_category}
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedJob.job_title}</h2>
                    <p className="text-sm font-medium text-slate-300 mt-1">{selectedJob.company_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400">${selectedJob.hourly_rate_min} - ${selectedJob.hourly_rate_max}</span>
                    <p className="text-xs text-slate-500">Pago por hora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
                  <span>📍 Ubicación: <strong className="text-slate-200">{selectedJob.city}, {selectedJob.state}</strong></span>
                  <span>✉️ Contacto directo: <strong className="text-slate-200">{selectedJob.contact_email || 'rh@tradepulse.work'}</strong></span>
                </div>
              </div>

              {/* Cuerpo del puesto */}
              <div className="space-y-4 text-sm text-slate-300 flex-1 overflow-y-auto pr-2">
                <div>
                  <h4 className="font-semibold text-white mb-1.5 uppercase tracking-wide text-xs text-blue-400">Descripción del Puesto</h4>
                  <p className="whitespace-pre-line leading-relaxed text-slate-300">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-semibold text-white mb-1.5 uppercase tracking-wide text-xs text-blue-400">Requisitos y Licencias</h4>
                    <p className="whitespace-pre-line leading-relaxed text-slate-300 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">{selectedJob.requirements}</p>
                  </div>
                )}

                {/* Formulario de Postulación Nativa */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 mt-6">
                  <h3 className="text-base font-bold text-white mb-1">Postulación Directa (Quick Apply)</h3>
                  <p className="text-xs text-slate-400 mb-4">Envía tus datos directamente al equipo de contratación de {selectedJob.company_name}.</p>

                  {successMsg ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-center text-sm font-medium">
                      ¡Postulación enviada con éxito! La empresa se pondrá en contacto contigo pronto.
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Carlos Mendoza"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono / WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Ej. +1 (555) 019-2834"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Experiencia en el Oficio</label>
                          <select
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="1-2 years">1 a 2 años</option>
                            <option value="2-4 years">2 a 4 años</option>
                            <option value="4+ years">Más de 4 años</option>
                            <option value="10+ years">Maestro / 10+ años</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Nota corta (Opcional)</label>
                          <input
                            type="text"
                            placeholder="Ej. Tengo licencia activa y herramientas"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-md shadow-blue-600/20 disabled:opacity-50"
                      >
                        {submitting ? 'Enviando postulación...' : 'Enviar Postulación Directa 🚀'}
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Selecciona una oferta en la lista izquierda para ver el detalle y postularte.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
