import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { VerificationRecord, Reading } from '../types';

export const VerificationLabView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Claim Form
  const [claimReadingId, setClaimReadingId] = useState<number | null>(null);
  const [claimText, setClaimText] = useState('');
  const [sourceExcerpt, setSourceExcerpt] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [status, setStatus] = useState<'supported' | 'unsupported' | 'contradicted' | 'outdated' | 'unverified'>('unverified');
  const [correction, setCorrection] = useState('');
  const [notes, setNotes] = useState('');
  const [autoAuditWithGemini, setAutoAuditWithGemini] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rep, rList] = await Promise.all([
        api.getVerificationReport(),
        api.getReadings()
      ]);
      setReport(rep);
      setReadings(rList);
      if (rList.length > 0) {
        setClaimReadingId(rList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReadingId || !claimText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createVerification(
        {
          reading_id: claimReadingId,
          claim_text: claimText.trim(),
          source_excerpt: sourceExcerpt.trim(),
          external_url: externalUrl.trim() || undefined,
          status,
          correction: correction.trim(),
          notes: notes.trim()
        },
        autoAuditWithGemini
      );
      setShowAddModal(false);
      setClaimText('');
      setSourceExcerpt('');
      setCorrection('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to audit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this verification record?')) return;
    try {
      await api.deleteVerification(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete verification record.');
    }
  };

  if (isLoading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Verification Lab audit records...</p>
      </div>
    );
  }

  const { counts, total_claims_audited, records, flagged_issues_count } = report;

  const filteredRecords = selectedStatus === 'all'
    ? records
    : records.filter((r: any) => r.status === selectedStatus);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Epistemic Vigilance & Fact Checking
          </div>
          <h2 className="text-xl md:text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            AI Claim Verification Lab
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-1">
            Audit AI-generated summaries against primary source literature. Categorize statements into <strong>supported</strong>, <strong>unsupported</strong>, <strong>contradicted</strong>, or <strong>outdated</strong>, and document factual corrections.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Audit New Claim</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Audited</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {total_claims_audited}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Supported</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {counts.supported}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-900/60 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">Contradicted</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {counts.contradicted}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-amber-200 dark:border-amber-900/60 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Unsupported</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {counts.unsupported}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Unresolved Claims</span>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
            {counts.unverified + counts.outdated}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'supported', 'contradicted', 'unsupported', 'outdated', 'unverified'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              selectedStatus === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((r: any) => {
            const badgeClasses: any = {
              supported: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
              contradicted: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
              unsupported: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
              outdated: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
              unverified: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
            };

            return (
              <div
                key={r.id}
                className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3 hover:border-brand-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500">Reading:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{r.reading_title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${badgeClasses[r.status] || badgeClasses.unverified}`}>
                      {r.status}
                    </span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete verification record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                    Claim: "{r.claim}"
                  </h4>
                </div>

                {r.source_excerpt && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-100 dark:border-navy-800 text-xs font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>Primary Source Excerpt:</strong> "{r.source_excerpt}"
                  </div>
                )}

                {r.correction && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <strong>Factual Correction:</strong> {r.correction}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <span>Audited on {new Date(r.verified_at).toLocaleDateString()}</span>
                  {r.external_url && (
                    <a
                      href={r.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>External Evidence</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 text-xs">
            No verification records matching "{selectedStatus}".
          </div>
        )}
      </div>

      {/* Add Claim Audit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Audit Claim Against Academic Source
            </h3>

            <form onSubmit={handleCreateVerification} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Reading
                </label>
                <select
                  value={claimReadingId || ''}
                  onChange={(e) => setClaimReadingId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100"
                >
                  {readings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Statement or Claim to Verify *
                </label>
                <textarea
                  required
                  rows={2}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Paste statement from summary or personal note to audit..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900">
                <input
                  type="checkbox"
                  id="auto-audit"
                  checked={autoAuditWithGemini}
                  onChange={(e) => setAutoAuditWithGemini(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="auto-audit" className="cursor-pointer font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Audit against text using Gemini AI fact-checker
                </label>
              </div>

              {!autoAuditWithGemini && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Verification Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100"
                    >
                      <option value="supported">Supported by source</option>
                      <option value="contradicted">Contradicted by source</option>
                      <option value="unsupported">Unsupported / Not mentioned</option>
                      <option value="outdated">Outdated information</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Source Excerpt / Quote
                    </label>
                    <textarea
                      rows={2}
                      value={sourceExcerpt}
                      onChange={(e) => setSourceExcerpt(e.target.value)}
                      placeholder="Quote the exact sentence from the source..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Correction (if contradicted or unsupported)
                    </label>
                    <input
                      type="text"
                      value={correction}
                      onChange={(e) => setCorrection(e.target.value)}
                      placeholder="State the accurate factual reality..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  External Reference URL (Optional)
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Auditing...' : 'Save Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
