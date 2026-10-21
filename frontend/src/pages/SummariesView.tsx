import React, { useEffect, useState } from 'react';
import { FileText, Sparkles, Edit3, Save, RotateCw, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Reading, Summary } from '../types';

interface SummariesViewProps {
  onOpenWorkspace: (readingId: number) => void;
}

export const SummariesView: React.FC<SummariesViewProps> = ({ onOpenWorkspace }) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTier, setActiveTier] = useState<'all' | 'quick' | 'standard' | 'detailed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    if (selectedReadingId) {
      loadSummary(selectedReadingId);
    }
  }, [selectedReadingId]);

  const loadReadings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReadings();
      setReadings(data);
      if (data.length > 0) {
        setSelectedReadingId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async (readingId: number) => {
    try {
      const s = await api.getSummary(readingId);
      setSummary(s);
    } catch {
      setSummary(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedReadingId) return;
    setIsGenerating(true);
    try {
      const s = await api.generateSummary(selectedReadingId, true);
      setSummary(s);
    } catch (err: any) {
      alert(err.message || 'Failed to generate summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReading = readings.find((r) => r.id === selectedReadingId);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Description Card - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Multi-Tier Conceptual Distillation
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Three-Level Academic Summaries</h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Compare <strong>Quick</strong> (approx. 50 words for rapid thesis scanning), <strong>Standard</strong> (approx. 150 words for balanced rationale and findings), and <strong>Detailed</strong> (approx. 300 words for technical concepts and qualifications). Powered by Gemini 3.8 Flash.
        </p>
      </div>

      {/* Reading Selector & Tier Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Select Reading:
          </label>
          <select
            value={selectedReadingId || ''}
            onChange={(e) => setSelectedReadingId(Number(e.target.value))}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {readings.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.topic})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex items-center justify-end gap-2">
          {selectedReadingId && (
            <button
              onClick={() => onOpenWorkspace(selectedReadingId)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center gap-1.5"
            >
              <span>Open in Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{summary ? 'Regenerate' : 'Generate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Three Tiers Layout */}
      {summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Quick Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-400 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Tier 1 • Quick Summary
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {summary.quick_summary.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Core Thesis & Conclusion (~50w)
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                {summary.quick_summary}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-navy-800 pt-3">
              Best for rapid triage, citation skimming, and abstract scanning.
            </div>
          </div>

          {/* 2. Standard Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border-2 border-brand-500/30 dark:border-brand-500/40 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-500 transition-colors relative">
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Recommended
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Tier 2 • Standard Summary
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {summary.standard_summary.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Balanced Methodology & Findings (~150w)
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                {summary.standard_summary}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-navy-800 pt-3">
              Balanced overview covering problem statement, empirical approach, and significance.
            </div>
          </div>

          {/* 3. Detailed Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-400 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Tier 3 • Detailed Summary
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {summary.detailed_summary.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                In-Depth Concepts & Caveats (~300w)
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap">
                {summary.detailed_summary}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-navy-800 pt-3">
              Comprehensive deep-dive explaining technical terminology in simple terms with nuances preserved.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 dark:text-white">
            No summaries found for this reading
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click 'Generate with AI' to trigger the official Gemini 3.8 Flash SDK and synthesize all three summary levels.
          </p>
        </div>
      )}
    </div>
  );
};
