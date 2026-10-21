import React, { useEffect, useState } from 'react';
import {
  BookMarked,
  Sparkles,
  Plus,
  Calendar,
  BookOpen,
  CheckCircle2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { Reflection, Reading } from '../types';

export const ReflectionJournalView: React.FC = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states
  const [readingId, setReadingId] = useState<number | null>(null);
  const [didAiHelp, setDidAiHelp] = useState('');
  const [rememberWithoutNotes, setRememberWithoutNotes] = useState('');
  const [deepThinkingVsDependence, setDeepThinkingVsDependence] = useState('');
  const [misunderstoodConcepts, setMisunderstoodConcepts] = useState('');
  const [futureChanges, setFutureChanges] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [refList, rList] = await Promise.all([
        api.getReflections(),
        api.getReadings()
      ]);
      setReflections(refList);
      setReadings(rList);
      if (rList.length > 0) {
        setReadingId(rList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchSuggestions = async () => {
    if (!readingId) return;
    setIsLoadingSuggestions(true);
    try {
      const res = await api.getReflectionSuggestions(readingId);
      setAiSuggestions(res.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleCreateReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createReflection({
        reading_id: readingId,
        date: new Date().toISOString().split('T')[0],
        did_ai_help: didAiHelp,
        remember_without_notes: rememberWithoutNotes,
        deep_thinking_vs_dependence: deepThinkingVsDependence,
        misunderstood_concepts: misunderstoodConcepts,
        future_changes: futureChanges,
        general_notes: generalNotes,
        ai_suggestions: aiSuggestions.join(' | ')
      });
      setShowNewModal(false);
      setDidAiHelp('');
      setRememberWithoutNotes('');
      setDeepThinkingVsDependence('');
      setMisunderstoodConcepts('');
      setFutureChanges('');
      setGeneralNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save reflection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading reflection journal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Metacognitive Learning Science
          </div>
          <h2 className="text-xl md:text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            Metacognitive Reflection Journal
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-1">
            Active metacognition prevents cognitive offloading and summary overdependence. Review how AI assistance influenced your comprehension, memory traces, and intellectual independence.
          </p>
        </div>

        <button
          onClick={() => {
            setShowNewModal(true);
            handleFetchSuggestions();
          }}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Reflections Timeline */}
      <div className="space-y-6">
        {reflections.length > 0 ? (
          reflections.map((ref) => {
            const linkedReading = readings.find((r) => r.id === ref.reading_id);

            return (
              <div
                key={ref.id}
                className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-5 hover:border-brand-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{ref.date}</span>
                    {linkedReading && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold truncate max-w-md">
                          Linked Reading: {linkedReading.title}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    Metacognitive Audit
                  </span>
                </div>

                {/* 5 Core Metacognitive Questions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      1. Did AI help me understand the reading?
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {ref.did_ai_help || 'Not documented.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      2. Did I remember concepts without notes?
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {ref.remember_without_notes || 'Not documented.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      3. Deep thinking vs. Summary dependence?
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {ref.deep_thinking_vs_dependence || 'Not documented.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      4. Which concepts did I misunderstand?
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {ref.misunderstood_concepts || 'Not documented.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 space-y-1 text-xs">
                  <span className="font-bold text-brand-700 dark:text-brand-300 uppercase text-[10px]">
                    5. What will I change in my next reading session?
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
                    {ref.future_changes || 'Not documented.'}
                  </p>
                </div>

                {ref.general_notes && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Additional notes: {ref.general_notes}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 text-xs">
            No reflection entries recorded yet. Click 'New Journal Entry' to write your first reflection.
          </div>
        )}
      </div>

      {/* New Reflection Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Metacognitive Reflection Entry
            </h3>

            {/* AI Prompts Suggestions Bar */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs space-y-2">
                <span className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5 uppercase text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" /> Metacognitive Questions to Consider:
                </span>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                  {aiSuggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleCreateReflection} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Linked Reading
                </label>
                <select
                  value={readingId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setReadingId(id);
                  }}
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
                  1. Did AI help me understand the reading? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={didAiHelp}
                  onChange={(e) => setDidAiHelp(e.target.value)}
                  placeholder="Did summaries clarify difficult concepts or reduce initial barrier to entry?..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  2. Did I remember the concepts without notes? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={rememberWithoutNotes}
                  onChange={(e) => setRememberWithoutNotes(e.target.value)}
                  placeholder="Evaluate your retention during the active recall test..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  3. Did AI make me think more deeply or depend on summaries? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deepThinkingVsDependence}
                  onChange={(e) => setDeepThinkingVsDependence(e.target.value)}
                  placeholder="Reflect on whether you skimmed or truly analyzed the core arguments..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  4. Which concepts did I misunderstand? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={misunderstoodConcepts}
                  onChange={(e) => setMisunderstoodConcepts(e.target.value)}
                  placeholder="Identify subtle flaws, false assumptions, or missed technical details..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  5. What will I change in my next reading session? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={futureChanges}
                  onChange={(e) => setFutureChanges(e.target.value)}
                  placeholder="Adjustments to reading environment, note-taking rhythm, or testing interval..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
