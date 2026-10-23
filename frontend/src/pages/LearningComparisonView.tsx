import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
  Plus,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../api/client';
import { LearningComparisonData, Reading } from '../types';

export const LearningComparisonView: React.FC = () => {
  const [data, setData] = useState<LearningComparisonData | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state for logging a session
  const [selectedReadingId, setSelectedReadingId] = useState<number | ''>('');
  const [method, setMethod] = useState<'Normal' | 'AI-Assisted'>('AI-Assisted');
  const [duration, setDuration] = useState(30);
  const [initialScore, setInitialScore] = useState(85);
  const [sevenDayScore, setSevenDayScore] = useState<number | ''>('');
  const [confidence, setConfidence] = useState(4);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    setIsLoading(true);
    try {
      const [compData, readList] = await Promise.all([
        api.getLearningComparison(),
        api.getReadings()
      ]);
      setData(compData);
      setReadings(readList);
      if (readList.length > 0) {
        setSelectedReadingId(readList[0].id);
      }
    } catch (err) {
      console.error('Failed to load comparison data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReadingId) return;
    setIsSubmitting(true);
    try {
      await api.logExperimentSession({
        reading_id: Number(selectedReadingId),
        method,
        duration: Number(duration),
        initial_score: Number(initialScore),
        seven_day_score: sevenDayScore !== '' ? Number(sevenDayScore) : null,
        confidence: Number(confidence),
        observations
      });
      setShowLogModal(false);
      await loadComparisonData();
    } catch (err: any) {
      alert(err.message || 'Failed to log session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-peachy-300 border-t-peachy-500 rounded-full animate-spin" />
        <p className="text-sm font-black text-peachy-700 dark:text-blossom-300">
          Calculating empirical experiment analytics... 🌸
        </p>
      </div>
    );
  }

  const { summary, session_points, methodology_disclaimer } = data;

  // Exact Peachy Blossom Swatch Colors for Charts
  // Normal Reading: Soft Blossom Petal Pink (#FACADA)
  // AI-Assisted: Vibrant Peachy Blossom Coral (#F77D65)
  const durationData = [
    { name: 'Normal Reading', duration: summary.avg_normal_duration, fill: '#FACADA', stroke: '#EE7FA3' },
    { name: 'AI-Assisted', duration: summary.avg_ai_duration, fill: '#F77D65', stroke: '#C74934' }
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
      {/* 1. Top Banner - Crisp Elevated 3D Claymorphic Card (Does NOT merge with background) */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-2 border-peachy-200/90 dark:border-rose-950/80 shadow-clay-card relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blossom-100 dark:bg-navy-800 border-2 border-blossom-300 dark:border-rose-900 text-blossom-700 dark:text-blossom-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <BarChart3 className="w-4 h-4 text-blossom-600 dark:text-blossom-400" />
            <span>Empirical Learning Analytics 🌸</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-50 tracking-tight">
            AI-Assisted vs. Normal Reading Experiment
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 max-w-2xl font-medium leading-relaxed">
            Compare comprehension, study duration, initial recall, and 7-day retention across both study paradigms. All metrics dynamically derived from stored SQLite session logs.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="btn-3d btn-3d-coral px-6 py-3 text-xs sm:text-sm font-black shadow-3d-md flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-butter-200" />
          <span>Log Experiment Session</span>
        </button>
      </div>

      {/* 2. Summary KPI Cards - 3D Claymorphic Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Tile 1: Avg Duration */}
        <div className="clay-card p-5 space-y-2 border-2 border-peachy-200/80 shadow-clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-peachy-600 dark:text-blossom-300">
            AVG READING DURATION
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-100">
              {summary.avg_ai_duration}m <span className="text-xs font-bold text-peachy-600">AI</span> vs {summary.avg_normal_duration}m <span className="text-xs font-bold text-slate-400">Normal</span>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.avg_normal_duration > summary.avg_ai_duration
                ? `⚡ ${Math.round(((summary.avg_normal_duration - summary.avg_ai_duration) / summary.avg_normal_duration) * 100)}% faster with AI summaries`
                : 'Comparable reading durations'}
            </p>
          </div>
        </div>

        {/* Tile 2: Initial Score */}
        <div className="clay-card p-5 space-y-2 border-2 border-peachy-200/80 shadow-clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-peachy-600 dark:text-blossom-300">
            AVG INITIAL SCORE
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-100">
              {summary.avg_ai_initial_score}% <span className="text-xs font-bold text-peachy-600">AI</span> vs {summary.avg_normal_initial_score}% <span className="text-xs font-bold text-slate-400">Normal</span>
            </div>
            <p className="text-[11px] font-bold text-peachy-600 mt-1">Immediate post-reading test</p>
          </div>
        </div>

        {/* Tile 3: 7-Day Recall */}
        <div className="clay-card p-5 space-y-2 border-2 border-peachy-200/80 shadow-clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-peachy-600 dark:text-blossom-300">
            AVG 7-DAY RECALL
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-100">
              {summary.avg_ai_7d_score ? `${summary.avg_ai_7d_score}%` : 'Pending'} <span className="text-xs font-bold text-peachy-600">AI</span> vs {summary.avg_normal_7d_score ? `${summary.avg_normal_7d_score}%` : 'N/A'} <span className="text-xs font-bold text-slate-400">Normal</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Tested 7 days post-study</p>
          </div>
        </div>

        {/* Tile 4: Logged Sessions */}
        <div className="clay-card p-5 space-y-2 border-2 border-peachy-200/80 shadow-clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-peachy-600 dark:text-blossom-300">
            LOGGED SESSIONS
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-100">
              {summary.total_sessions}
            </div>
            <p className="text-[11px] font-bold text-blossom-600 mt-1">
              {summary.ai_count} AI-assisted • {summary.normal_count} Normal
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Charts Row - Peachy Blossom Colors (No Slate Grey / No Muddy Orange!) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recall & Retention Comparison */}
        <div className="clay-card p-6 space-y-4 border-2 border-peachy-200/80 shadow-clay-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-800 dark:text-rose-100">
                Initial Score vs. 7-Day Retention
              </h3>
              <p className="text-xs text-slate-500 dark:text-rose-300 font-medium">
                Comparing memory decay between unassisted reading and AI-scaffolded study
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAC0AF" opacity={0.25} />
                <XAxis dataKey="metric" stroke="#FAC0AF" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#FAC0AF" fontSize={11} fontWeight="bold" domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F5',
                    border: '2px solid #FDD8CC',
                    borderRadius: '16px',
                    color: '#6E2216',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(247, 125, 101, 0.2)'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="Normal"
                  fill="#FACADA"
                  stroke="#EE7FA3"
                  strokeWidth={1.5}
                  radius={[8, 8, 0, 0]}
                  name="Normal Reading (Petal Pink)"
                />
                <Bar
                  dataKey="AI-Assisted"
                  fill="#F77D65"
                  stroke="#C74934"
                  strokeWidth={1.5}
                  radius={[8, 8, 0, 0]}
                  name="AI-Assisted (Peachy Blossom Coral)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reading Duration Comparison */}
        <div className="clay-card p-6 space-y-4 border-2 border-peachy-200/80 shadow-clay-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-800 dark:text-rose-100">
                Average Study Duration (Minutes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-rose-300 font-medium">
                Time required to complete reading and synthesize core takeaways
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAC0AF" opacity={0.25} />
                <XAxis dataKey="name" stroke="#FAC0AF" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#FAC0AF" fontSize={11} fontWeight="bold" unit="m" />
                <Tooltip
                  formatter={(val: any) => [`${val} minutes`, 'Duration']}
                  contentStyle={{
                    backgroundColor: '#FFF8F5',
                    border: '2px solid #FDD8CC',
                    borderRadius: '16px',
                    color: '#6E2216',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(247, 125, 101, 0.2)'
                  }}
                />
                <Bar dataKey="duration" radius={[10, 10, 0, 0]} barSize={54}>
                  {durationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.stroke} strokeWidth={1.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Detailed Experiment Logs Table */}
      <div className="clay-card p-6 space-y-4 border-2 border-peachy-200/80 shadow-clay-card">
        <h3 className="font-black text-base text-slate-800 dark:text-rose-100">
          Individual Experiment Session Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-peachy-100/70 dark:bg-navy-800/80 text-peachy-800 dark:text-blossom-300 font-black uppercase tracking-wider rounded-xl">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Paper Title</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Initial Score</th>
                <th className="py-3 px-4">7-Day Score</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 rounded-r-xl">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peachy-100 dark:divide-rose-950 text-slate-700 dark:text-rose-200">
              {session_points.map((s) => (
                <tr key={s.id} className="hover:bg-peachy-50/70 dark:hover:bg-navy-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-rose-100">{s.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-black uppercase text-[10px] shadow-xs ${
                      s.method === 'AI-Assisted'
                        ? 'bg-peachy-100 text-peachy-700 border border-peachy-300 dark:bg-peachy-950 dark:text-peachy-300'
                        : 'bg-blossom-100 text-blossom-700 border border-blossom-300 dark:bg-blossom-950 dark:text-blossom-300'
                    }`}>
                      {s.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">{s.duration} min</td>
                  <td className="py-3 px-4 font-black text-peachy-600">{s.initial_score}%</td>
                  <td className="py-3 px-4 font-black text-blossom-600">
                    {s.seven_day_score !== null && s.seven_day_score !== undefined ? `${s.seven_day_score}%` : 'Pending'}
                  </td>
                  <td className="py-3 px-4 font-bold">{s.confidence}/5</td>
                  <td className="py-3 px-4 italic text-slate-500 max-w-xs truncate">
                    {(s as any).observations || 'Empirical reading trial completed.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Scientific Methodology Notice */}
      <div className="p-4 rounded-2xl bg-butter-100 dark:bg-navy-900 border-2 border-butter-300 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-700" />
        <div>
          <h5 className="font-black text-amber-900 dark:text-amber-100">Scientific Methodology Notice</h5>
          <p className="mt-0.5 leading-relaxed font-medium">{methodology_disclaimer}</p>
        </div>
      </div>

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-peachy-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="clay-card p-6 max-w-lg w-full border-3 border-peachy-300 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-peachy-100 dark:border-rose-950">
              <h3 className="text-base font-black text-slate-800 dark:text-rose-100 flex items-center gap-1.5">
                <span>Log Experiment Reading Session</span>
                <span>🌸</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                  Select Paper / Reading
                </label>
                <select
                  value={selectedReadingId}
                  onChange={(e) => setSelectedReadingId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-bold focus:outline-none focus:border-peachy-500"
                >
                  {readings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.topic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                    Study Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-bold focus:outline-none focus:border-peachy-500"
                  >
                    <option value="AI-Assisted">AI-Assisted (Summaries + Cards)</option>
                    <option value="Normal">Normal Reading (No AI)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-bold focus:outline-none focus:border-peachy-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                    Initial Recall Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={initialScore}
                    onChange={(e) => setInitialScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-bold focus:outline-none focus:border-peachy-500"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                    7-Day Retention Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Optional (if tested)"
                    value={sevenDayScore}
                    onChange={(e) => setSevenDayScore(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-bold focus:outline-none focus:border-peachy-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                  Metacognitive Confidence (1–5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-peachy-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                  <span>1 - Very Low</span>
                  <span className="text-peachy-600 font-black">{confidence} / 5</span>
                  <span>5 - Complete Mastery</span>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-rose-200 mb-1">
                  Observations / Qualitative Notes
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Notes on cognitive load, reading friction, or retention differences..."
                  className="w-full px-3.5 py-2 rounded-2xl border-2 border-peachy-200 dark:border-navy-700 bg-peachy-50 dark:bg-navy-950 text-slate-800 dark:text-rose-100 font-medium focus:outline-none focus:border-peachy-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn-3d btn-3d-white px-4 py-2.5 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-3d btn-3d-coral px-5 py-2.5 text-xs font-black shadow-3d-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Session Log 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
