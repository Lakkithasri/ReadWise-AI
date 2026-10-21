import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';
import { LearningComparisonData, Reading } from '../types';

export const LearningComparisonView: React.FC = () => {
  const [data, setData] = useState<LearningComparisonData | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states for logging an experiment session
  const [newReadingId, setNewReadingId] = useState<number | null>(null);
  const [newMethod, setNewMethod] = useState<'normal' | 'ai_assisted'>('ai_assisted');
  const [newDuration, setNewDuration] = useState(30);
  const [newInitialScore, setNewInitialScore] = useState(85);
  const [newConfidence, setNewConfidence] = useState(4);
  const [newObservations, setNewObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [comp, rList] = await Promise.all([
        api.getLearningComparison(),
        api.getReadings()
      ]);
      setData(comp);
      setReadings(rList);
      if (rList.length > 0) {
        setNewReadingId(rList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReadingId) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - newDuration * 60000);

      await api.logExperimentSession({
        reading_id: newReadingId,
        method: newMethod,
        start_time: startTime.toISOString(),
        completion_time: now.toISOString(),
        duration_minutes: Number(newDuration),
        initial_score: Number(newInitialScore),
        confidence_rating: Number(newConfidence),
        observations: newObservations
      });

      setShowLogModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log experiment session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Calculating empirical experiment statistics...</p>
      </div>
    );
  }

  const { summary, session_points, methodology_disclaimer } = data;

  const durationData = [
    { name: 'Normal Reading', duration: summary.avg_normal_duration, fill: '#64748b' },
    { name: 'AI-Assisted', duration: summary.avg_ai_duration, fill: '#D96C00' }
  ];

  const scoreData = [
    {
      metric: 'Initial Recall',
      Normal: summary.avg_normal_initial_score,
      'AI-Assisted': summary.avg_ai_initial_score
    },
    {
      metric: '7-Day Retention',
      Normal: summary.avg_normal_7d_score,
      'AI-Assisted': summary.avg_ai_7d_score
    }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Empirical Learning Analytics
          </div>
          <h2 className="text-xl md:text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            AI-Assisted vs. Normal Reading Experiment
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-1">
            Compare comprehension, study duration, initial recall, and 7-day retention across both study paradigms. All metrics dynamically derived from stored SQLite session logs.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Experiment Session</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Reading Duration</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summary.avg_ai_duration}m <span className="text-xs font-medium text-slate-400">AI</span> vs {summary.avg_normal_duration}m <span className="text-xs font-medium text-slate-400">Normal</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.avg_normal_duration > summary.avg_ai_duration
              ? `${Math.round(((summary.avg_normal_duration - summary.avg_ai_duration) / summary.avg_normal_duration) * 100)}% faster with AI summaries`
              : 'Comparable reading durations'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Initial Score</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summary.avg_ai_initial_score}% <span className="text-xs font-medium text-slate-400">AI</span> vs {summary.avg_normal_initial_score}% <span className="text-xs font-medium text-slate-400">Normal</span>
          </div>
          <p className="text-[11px] text-slate-500">Immediate post-reading test</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg 7-Day Recall</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summary.avg_ai_7d_score ? `${summary.avg_ai_7d_score}%` : 'Pending'} <span className="text-xs font-medium text-slate-400">AI</span> vs {summary.avg_normal_7d_score ? `${summary.avg_normal_7d_score}%` : 'N/A'} <span className="text-xs font-medium text-slate-400">Normal</span>
          </div>
          <p className="text-[11px] text-slate-500">Tested 7 days post-study</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Logged Sessions</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {summary.total_sessions}
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.ai_count} AI-assisted • {summary.normal_count} Normal
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recall & Retention Comparison */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Initial Score vs. 7-Day Retention
          </h3>
          <p className="text-xs text-slate-400">
            Comparing memory decay between unassisted reading and AI-scaffolded study
          </p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="Normal" fill="#64748b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="AI-Assisted" fill="#D96C00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reading Duration Comparison */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Average Study Duration (Minutes)
          </h3>
          <p className="text-xs text-slate-400">
            Time required to complete reading and synthesize core takeaways
          </p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="m" />
                <Tooltip
                  formatter={(val: any) => [`${val} minutes`, 'Duration']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="duration" radius={[8, 8, 0, 0]} barSize={54} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Experiment Logs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Individual Experiment Session Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Reading</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Initial Score</th>
                <th className="py-3 px-4">7-Day Score</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {session_points.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      s.method === 'AI-Assisted'
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {s.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">{s.duration} min</td>
                  <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">{s.initial_score}%</td>
                  <td className="py-3 px-4 font-bold">
                    {s.seven_day_score !== null && s.seven_day_score !== undefined ? `${s.seven_day_score}%` : 'Pending'}
                  </td>
                  <td className="py-3 px-4">{s.confidence}/5</td>
                  <td className="py-3 px-4 italic text-slate-500 max-w-xs truncate">
                    {s.title} observation
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Methodology Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold">Scientific Methodology Notice</h5>
          <p className="mt-0.5 leading-relaxed">{methodology_disclaimer}</p>
        </div>
      </div>

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log Experiment Reading Session
            </h3>

            <form onSubmit={handleLogSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Reading
                </label>
                <select
                  value={newReadingId || ''}
                  onChange={(e) => setNewReadingId(Number(e.target.value))}
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
                  Reading Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMethod('ai_assisted')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      newMethod === 'ai_assisted'
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    AI-Assisted
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMethod('normal')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      newMethod === 'normal'
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Normal (Unassisted)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Initial Recall Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newInitialScore}
                    onChange={(e) => setNewInitialScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Confidence Rating (1 to 5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-right text-[11px] text-slate-400">{newConfidence} of 5</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Personal Qualitative Observations
                </label>
                <textarea
                  rows={3}
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  placeholder="Record subjective impressions regarding focus, cognitive effort, and retention..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50"
                >
                  Save Experiment Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
