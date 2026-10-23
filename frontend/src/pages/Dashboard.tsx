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
  Play,
  Heart,
  Compass,
  Award,
  Music,
  MapPin,
  ExternalLink,
  Flame,
  Volume2
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-14 h-14 border-4 border-peachy-400 border-t-peachy-600 rounded-full animate-spin" />
        <p className="text-sm font-black text-peachy-700 dark:text-blossom-300">
          Entering your Study Journey World... 🌸
        </p>
      </div>
    );
  }

  const chartData = [
    { name: 'Normal Reading', score: stats?.experiment_metrics.normal_avg || 0, color: '#F89D88' },
    { name: 'AI-Assisted', score: stats?.experiment_metrics.ai_avg || 0, color: '#F77D65' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Hero Walkthrough Header Section (Matching Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Greeting, Vision & 3D Action Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blossom-100 dark:bg-navy-900 border-2 border-blossom-300 dark:border-rose-950 text-blossom-700 dark:text-blossom-300 text-xs font-black shadow-xs">
            <span>HEY, SCHOLAR!</span>
            <Heart className="w-3.5 h-3.5 fill-blossom-500 text-blossom-500 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 dark:text-rose-50 leading-[1.15] tracking-tight">
            I explore & synthesize <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-peachy-500 via-blossom-500 to-peachy-600">
              knowledge that inspires.
            </span>
            <span className="text-blossom-500 ml-1">💕</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 max-w-xl font-medium leading-relaxed">
            Welcome to your gamified intellectual world! Progress along island waypoints, conquer spaced retrieval quests, and synthesize complex research papers with AI assistance.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('world-journey-map');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-3d btn-3d-coral px-6 py-3 text-xs sm:text-sm font-black shadow-3d-md flex items-center gap-2"
            >
              <span>Explore My World</span>
              <Sparkles className="w-4 h-4 text-butter-200" />
            </button>

            <button
              onClick={onOpenNewReading}
              className="btn-3d btn-3d-white px-5 py-3 text-xs sm:text-sm font-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-peachy-600 dark:text-blossom-400" />
              <span>Add New Reading</span>
            </button>
          </div>
        </div>

        {/* Right Column: Daily XP & Badges Card */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Daily XP & Badges */}
          <div className="clay-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌸</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-rose-100">Scholar Journey</h4>
                  <p className="text-[10px] text-peachy-600 dark:text-blossom-300 font-bold">Building mental models one paper at a time.</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-peachy-100 dark:bg-navy-800 text-peachy-700 dark:text-blossom-300 border border-peachy-200">
                ACTIVE
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-rose-200 mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-peachy-500 fill-peachy-500" />
                  <span>DAILY XP</span>
                </span>
                <span className="text-peachy-600 font-extrabold">340 / 500 XP</span>
              </div>
              <div className="w-full bg-peachy-100 dark:bg-navy-800 rounded-full h-2.5 overflow-hidden border border-peachy-200/80">
                <div className="bg-gradient-to-r from-peachy-500 via-blossom-500 to-butter-300 h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-rose-300/60 tracking-wider">
                EARNED BADGES
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                {[
                  { icon: '⭐', label: 'Scholar', color: 'bg-butter-100 border-butter-300 text-amber-900' },
                  { icon: '🏆', label: 'Top 5%', color: 'bg-peachy-100 border-peachy-300 text-peachy-900' },
                  { icon: '🧠', label: 'Memory', color: 'bg-blossom-100 border-blossom-300 text-blossom-900' },
                  { icon: '💎', label: 'Auditor', color: 'bg-emerald-100 border-emerald-300 text-emerald-900' }
                ].map((b, i) => (
                  <div
                    key={i}
                    title={b.label}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm border-2 shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-transform ${b.color}`}
                  >
                    {b.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 3D WORLD MAP WALKTHROUGH JOURNEY (Matching Image 2 Centerpiece) */}
      <div id="world-journey-map" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-peachy-500" />
            <h3 className="text-lg font-black text-slate-800 dark:text-rose-100">
              Interactive Island Walkthrough
            </h3>
          </div>
          <span className="text-xs font-bold text-peachy-600 dark:text-blossom-300 bg-peachy-100 dark:bg-navy-900 px-3 py-1 rounded-full border border-peachy-200">
            5 Learning Waypoints
          </span>
        </div>

        {/* World Map Diorama Canvas */}
        <div className="relative rounded-3xl overflow-hidden border-4 border-peachy-200/90 dark:border-rose-950/80 shadow-2xl min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] bg-gradient-to-b from-sky-200 via-peachy-100 to-peachy-200">
          {/* Background 3D Archipelago Artwork */}
          <img
            src="/images/peachy_blossom_archipelago.jpg"
            alt="3D Peachy Fantasy Floating Archipelago Map"
            className="absolute inset-0 w-full h-full object-cover object-center filter saturate-105"
          />

          {/* Soft Peachy Atmospheric Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-peachy-950/40 via-transparent to-peachy-100/20 pointer-events-none" />

          {/* Left Wooden Signpost (Matching Image 2) */}
          <div className="absolute top-6 left-6 hidden sm:flex flex-col gap-2 z-20">
            <div className="bg-[#6F3D27] text-amber-100 font-extrabold text-[11px] px-4 py-1.5 rounded-r-xl rounded-l-md shadow-md border-2 border-[#542B1A] flex items-center justify-between gap-3 transform -rotate-1 hover:rotate-0 transition-transform">
              <span>Read</span>
              <span>📖</span>
            </div>
            <div className="bg-[#6F3D27] text-amber-100 font-extrabold text-[11px] px-4 py-1.5 rounded-r-xl rounded-l-md shadow-md border-2 border-[#542B1A] flex items-center justify-between gap-3 transform rotate-1 hover:rotate-0 transition-transform">
              <span>Summarize</span>
              <span>✨</span>
            </div>
            <div className="bg-[#6F3D27] text-amber-100 font-extrabold text-[11px] px-4 py-1.5 rounded-r-xl rounded-l-md shadow-md border-2 border-[#542B1A] flex items-center justify-between gap-3 transform -rotate-1 hover:rotate-0 transition-transform">
              <span>Recall</span>
              <span>🧠</span>
            </div>
            <div className="bg-[#6F3D27] text-amber-100 font-extrabold text-[11px] px-4 py-1.5 rounded-r-xl rounded-l-md shadow-md border-2 border-[#542B1A] flex items-center justify-between gap-3 transform rotate-1 hover:rotate-0 transition-transform">
              <span>Audit</span>
              <span>🛡️</span>
            </div>
            <div className="bg-[#6F3D27] text-amber-100 font-extrabold text-[11px] px-4 py-1.5 rounded-r-xl rounded-l-md shadow-md border-2 border-[#542B1A] flex items-center justify-between gap-3 transform -rotate-1 hover:rotate-0 transition-transform">
              <span>Master</span>
              <span>🌸</span>
            </div>
          </div>

          {/* 5 Interactive 3D Waypoint Island Cards Overlaid on Map */}
          {/* Waypoint 01: Reading Archives */}
          <div
            onClick={() => onNavigate('library')}
            className="absolute top-[8%] left-[28%] sm:left-[32%] z-20 cursor-pointer group"
          >
            <div className="flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-peachy-300 dark:border-rose-800 shadow-3d-sm group-hover:scale-105 group-hover:shadow-3d-md transition-all">
              <span className="w-6 h-6 rounded-full bg-peachy-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                01
              </span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                  <span>Reading Archives</span>
                  <BookOpen className="w-3 h-3 text-peachy-500" />
                </p>
                <p className="text-[10px] text-peachy-700 font-semibold">{stats?.total_readings || 5} Academic Papers</p>
              </div>
            </div>
          </div>

          {/* Waypoint 02: Synthesis Sanctum */}
          <div
            onClick={() => onNavigate('summaries')}
            className="absolute top-[28%] right-[18%] sm:right-[26%] z-20 cursor-pointer group"
          >
            <div className="flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-blossom-300 dark:border-rose-800 shadow-3d-pink group-hover:scale-105 group-hover:shadow-3d-md transition-all">
              <span className="w-6 h-6 rounded-full bg-blossom-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                02
              </span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                  <span>Synthesis Sanctum</span>
                  <FileText className="w-3 h-3 text-blossom-500" />
                </p>
                <p className="text-[10px] text-blossom-700 font-semibold">3-Tier AI Summaries</p>
              </div>
            </div>
          </div>

          {/* Waypoint 03: Memory Towers */}
          <div
            onClick={() => onNavigate('cards')}
            className="absolute top-[48%] right-[6%] sm:right-[10%] z-20 cursor-pointer group"
          >
            <div className="flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-butter-400 dark:border-amber-800 shadow-3d-butter group-hover:scale-105 group-hover:shadow-3d-md transition-all">
              <span className="w-6 h-6 rounded-full bg-butter-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                03
              </span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                  <span>Memory Towers</span>
                  <Play className="w-3 h-3 text-amber-600" />
                </p>
                <p className="text-[10px] text-amber-800 font-semibold">3D Flip Flashcards</p>
              </div>
            </div>
          </div>

          {/* Waypoint 04: Recall Arena */}
          <div
            onClick={() => onNavigate('recall')}
            className="absolute bottom-[22%] right-[28%] sm:right-[34%] z-20 cursor-pointer group"
          >
            <div className="flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-rose-300 dark:border-rose-800 shadow-3d-pink group-hover:scale-105 group-hover:shadow-3d-md transition-all animate-bounce">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                04
              </span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                  <span>Recall Arena</span>
                  <Clock className="w-3 h-3 text-rose-500" />
                </p>
                <p className="text-[10px] text-rose-600 font-black">
                  {stats?.recall_tests_due ? `${stats.recall_tests_due} Due Today! ⚡` : 'On Schedule'}
                </p>
              </div>
            </div>
          </div>

          {/* Waypoint 05: Vigilance Outpost */}
          <div
            onClick={() => onNavigate('verification')}
            className="absolute bottom-[10%] left-[24%] sm:left-[36%] z-20 cursor-pointer group"
          >
            <div className="flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 shadow-3d-sm group-hover:scale-105 group-hover:shadow-3d-md transition-all">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                05
              </span>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                  <span>Vigilance Outpost</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">AI Claim Auditing</p>
              </div>
            </div>
          </div>

          {/* Bottom Right: Mini Radar Widget (Matching Image 2) */}
          <div className="absolute bottom-5 right-5 z-20 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md p-3 rounded-2xl border-2 border-peachy-200 dark:border-rose-950 shadow-clay-card hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peachy-100 dark:bg-navy-800 border border-peachy-300 flex items-center justify-center text-peachy-600">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">WORLD MAP</p>
              <p className="text-xs font-black text-peachy-700 dark:text-rose-200">The Scholar Archipelago</p>
            </div>
          </div>

          {/* Bottom Center: Scroll Hint Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-4 py-1 rounded-full border border-white/20 shadow-md">
            Click any island station (01–05) to begin quest 🌟
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Current Quest + Sticky Note + Focus Music (Matching Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Current Quest Card */}
        <div className="md:col-span-5 clay-card p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-peachy-600 bg-peachy-100 px-3 py-1 rounded-full border border-peachy-200">
              CURRENT QUEST 🌸
            </span>
            <span className="text-xs font-black text-blossom-600">Level 12 Scholar</span>
          </div>

          <div>
            <h4 className="text-base font-black text-slate-800 dark:text-rose-100">
              {stats?.recall_tests_due && stats.recall_tests_due > 0
                ? `${stats.recall_tests_due} Active Recall Quests Due!`
                : 'All Spaced Repetition Quests Complete!'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-rose-200/80 leading-relaxed mt-1">
              {stats?.recall_tests_due && stats.recall_tests_due > 0
                ? 'Testing your memory without reading notes triggers synaptic consolidation and permanently strengthens retrieval pathways.'
                : 'Great job! Your memory pathways are reinforced. You can start a new reading or review existing flashcards.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-rose-300">
              <span>Memory Retention EXP</span>
              <span className="font-black text-peachy-600">85% Complete</span>
            </div>
            <div className="w-full bg-peachy-100 dark:bg-navy-800 h-3 rounded-full overflow-hidden border border-peachy-200">
              <div className="bg-gradient-to-r from-peachy-500 via-blossom-500 to-butter-300 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <button
            onClick={() => onNavigate('recall')}
            className="w-full btn-3d btn-3d-pink py-3 text-xs font-black flex items-center justify-center gap-2 shadow-3d-pink"
          >
            <span>Take Recall Quest Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Middle Column (4 cols): Pastel Sticky Note (Note to Self) */}
        <div className="md:col-span-4 post-it-note flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-butter-300 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                NOTE TO SELF 💕
              </span>
              <span className="text-xs">📌</span>
            </div>
            <p className="text-sm font-black text-amber-950 leading-relaxed font-sans pt-1">
              "Progress, not perfection. Spaced recall beats passive re-reading every single time!"
            </p>
          </div>
          <p className="text-[11px] font-bold text-amber-800/80 italic pt-3 border-t border-butter-300/60 flex items-center justify-between">
            <span>— Cognitive Science Rule</span>
            <span>🌸</span>
          </p>
        </div>

        {/* Right Column (3 cols): Focus Lo-Fi Music / Vibe Card */}
        <div className="md:col-span-3 clay-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-peachy-600 bg-peachy-100 px-2.5 py-0.5 rounded-full border border-peachy-200">
                CURRENT VIBE
              </span>
              <Music className={`w-4 h-4 text-peachy-500 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-rose-100 mt-2">Focus Mode</h4>
            <p className="text-[11px] text-slate-500 dark:text-rose-300 font-medium">Soft Beats • 60 BPM Alpha</p>
          </div>

          <div className="p-3 rounded-2xl bg-peachy-50 dark:bg-navy-800/80 border border-peachy-200 flex items-center justify-between">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 rounded-full bg-peachy-500 text-white flex items-center justify-center shadow-3d-sm hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlayingAudio ? '⏸' : '▶'}
            </button>
            <div className="flex gap-1 items-end h-6">
              {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-peachy-400 ${isPlayingAudio ? 'animate-pulse' : 'opacity-40'}`}
                  style={{ height: `${isPlayingAudio ? h : 30}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Empirical Analytics + Top 4 Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention Mini-Chart (7 cols) */}
        <div className="lg:col-span-7 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-rose-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-peachy-500" />
                <span>Normal vs. AI-Assisted Reading Retention</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Live SQLite calculation across {stats?.experiment_metrics.total_experiments || 0} recorded study sessions
              </p>
            </div>
            <button
              onClick={() => onNavigate('experiments')}
              className="text-xs font-black text-peachy-600 dark:text-blossom-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#FAC0AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#FAC0AF" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Average Initial Score']}
                  contentStyle={{
                    backgroundColor: '#FFF8F5',
                    border: '2px solid #FDD8CC',
                    borderRadius: '16px',
                    color: '#6E2216',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 16px rgba(247, 125, 101, 0.2)'
                  }}
                />
                <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={52}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 Quick Stat Summary Tiles (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Tile 1: Readings */}
          <div
            onClick={() => onNavigate('library')}
            className="clay-card clay-card-hover p-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">LIBRARY</span>
              <div className="w-7 h-7 rounded-xl bg-peachy-100 flex items-center justify-center text-peachy-600 text-sm">
                📚
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-800 dark:text-rose-100">
                {stats?.total_readings || 0}
              </div>
              <p className="text-[10px] font-bold text-peachy-600 mt-0.5">
                {stats?.completed_readings || 0} completed
              </p>
            </div>
          </div>

          {/* Tile 2: Summaries */}
          <div
            onClick={() => onNavigate('summaries')}
            className="clay-card clay-card-hover p-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">SUMMARIES</span>
              <div className="w-7 h-7 rounded-xl bg-blossom-100 flex items-center justify-center text-blossom-600 text-sm">
                ✨
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-800 dark:text-rose-100">
                {stats?.saved_summaries || 0}
              </div>
              <p className="text-[10px] font-bold text-blossom-600 mt-0.5">
                3 tiers active
              </p>
            </div>
          </div>

          {/* Tile 3: Recall Score */}
          <div
            onClick={() => onNavigate('recall')}
            className="clay-card clay-card-hover p-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">ACCURACY</span>
              <div className="w-7 h-7 rounded-xl bg-butter-200 flex items-center justify-center text-amber-900 text-sm">
                🎯
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-800 dark:text-rose-100">
                {stats?.average_recall_score ? `${stats.average_recall_score}%` : 'N/A'}
              </div>
              <p className="text-[10px] font-bold text-amber-700 mt-0.5">
                Avg retention
              </p>
            </div>
          </div>

          {/* Tile 4: Vigilance Claims */}
          <div
            onClick={() => onNavigate('verification')}
            className="clay-card clay-card-hover p-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">AUDIT LAB</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm">
                🛡️
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-800 dark:text-rose-100">
                {stats?.verification_issues_pending || 0}
              </div>
              <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                Claims to verify
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
