import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../api/client';
import { AnalyticsSummary, SystemStatus } from '../types';
import { NavItem } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (tab: NavItem, readingId?: number) => void;
  onOpenNewReading: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewReading
}) => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, statusData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getSystemStatus()
      ]);
      setStats(analyticsData);
      setSystemStatus(statusData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading academic study metrics...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Normal Reading', score: stats?.experiment_metrics.normal_avg || 0, color: '#64748b' },
    { name: 'AI-Assisted', score: stats?.experiment_metrics.ai_avg || 0, color: '#D96C00' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Due Recall Tests Alert Banner */}
      {stats && stats.recall_tests_due > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-300 dark:border-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                {stats.recall_tests_due} Active Recall Test{stats.recall_tests_due > 1 ? 's' : ''} Due Today!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Spaced repetition interval is active. Testing without notes strengthens neural retrieval pathways.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('recall')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Take Due Test Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Readings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reading Library
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_readings || 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{stats?.completed_readings || 0} completed readings</span>
            </p>
          </div>
        </div>

        {/* 3-Level Summaries */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Summaries
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.saved_summaries || 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              3 tiers (Quick, Standard, Detailed)
            </p>
          </div>
        </div>

        {/* Flashcards & Spaced Review */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Flashcards
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_flashcards || 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats?.flashcards_reviewed || 0} reviewed with confidence ratings
            </p>
          </div>
        </div>

        {/* Recall Average Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Average Recall Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.average_recall_score ? `${stats.average_recall_score}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across initial & 7-day recall exams
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Learning Comparison Preview + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Mini-Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Normal vs. AI-Assisted Reading Retention</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live SQLite calculation across {stats?.experiment_metrics.total_experiments || 0} recorded study sessions
              </p>
            </div>
            <button
              onClick={() => onNavigate('experiments')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Average Initial Score']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-navy-800 pt-3">
            Note: Data derived from stored experiment records. AI scaffolding provides faster initial synthesis, while spaced retrieval is essential for long-term retention in both methods.
          </p>
        </div>

        {/* Quick Study Actions & Verification Issues */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Quick Study Actions
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={onOpenNewReading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Add New Reading</h5>
                    <p className="text-[11px] text-slate-500">Paste text or upload PDF</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </button>

              <button
                onClick={() => onNavigate('cards')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Play className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Study Flashcards</h5>
                    <p className="text-[11px] text-slate-500">3D flip mode with confidence rating</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('verification')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Verification Lab</h5>
                    <p className="text-[11px] text-slate-500">
                      {stats?.verification_issues_pending || 0} claims awaiting audit
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Engine Status Card */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Gemini Engine:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {systemStatus?.gemini_model || 'gemini-3.8-flash'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Database Engine:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">SQLite (Local ACID)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">API Connection:</span>
              <span className={`font-semibold ${systemStatus?.has_gemini_key ? 'text-emerald-500' : 'text-amber-500'}`}>
                {systemStatus?.has_gemini_key ? 'Live Gemini Key Configured' : 'Offline / Pre-seeded Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Academic Activity Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Recent Study Activity
        </h3>

        {stats?.recent_activity && stats.recent_activity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-navy-800">
            {stats.recent_activity.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                    {item.badge}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

