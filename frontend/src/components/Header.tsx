import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Music,
  Compass
} from 'lucide-react';
import { NavItem } from './Sidebar';

interface HeaderProps {
  currentTab: NavItem;
  dueTestsCount: number;
  hasGeminiKey: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  openMobileMenu: () => void;
  onNavigate: (tab: NavItem) => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  dueTestsCount,
  hasGeminiKey,
  isDarkMode,
  toggleDarkMode,
  openMobileMenu,
  onNavigate,
  onSeedData,
  isSeeding
}) => {
  const titles: Record<NavItem, { title: string; subtitle: string; icon: string }> = {
    dashboard: { title: 'Study Island Journey', subtitle: 'Explore academic waypoints, quests, and learning paths', icon: '🏝️' },
    library: { title: 'Reading Archives', subtitle: 'Explore original research papers and books', icon: '📚' },
    workspace: { title: 'Dual-Pane Sanctum', subtitle: 'Immersive reading, text highlights, and note taking', icon: '✍️' },
    summaries: { title: '3-Tier AI Summaries', subtitle: 'Quick (50w), Standard (150w), and Detailed (300w) distillations', icon: '✨' },
    cards: { title: 'Idea Cards & Flashcards', subtitle: 'Interactive 3D-flip conceptual review decks', icon: '💡' },
    recall: { title: 'Active Recall Arena', subtitle: 'Spaced repetition challenges and forgetting curve tests', icon: '⏳' },
    experiments: { title: 'Empirical Observatory', subtitle: 'Real-time SQLite analytics: Normal vs. AI-Assisted retention', icon: '📊' },
    verification: { title: 'Vigilance Outpost', subtitle: 'Epistemic claim auditor and hallucination verification', icon: '🛡️' },
    prompts: { title: 'Prompt Laboratory', subtitle: 'Design, version, and evaluate academic prompt templates', icon: '🧪' },
    reflections: { title: 'Metacognitive Journal', subtitle: 'Evaluate personal memory reliance and critical thinking', icon: '📖' },
    tools_ethics: { title: 'Tools & Ethics', subtitle: 'Responsible AI manifesto, limits, and academic integrity', icon: '⚖️' },
    settings: { title: 'Journey Settings', subtitle: 'Configure Gemini API keys, active model, and database state', icon: '⚙️' }
  };

  const currentInfo = titles[currentTab] || { title: 'ReadWise Journey', subtitle: 'Academic Exploration', icon: '🌸' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b-2 border-peachy-200/70 dark:border-rose-950/70 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={openMobileMenu}
          className="lg:hidden p-2 rounded-2xl text-peachy-700 dark:text-rose-200 bg-peachy-100 dark:bg-navy-900 border border-peachy-200"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl select-none" role="img" aria-label="Tab Icon">{currentInfo.icon}</span>
          <div>
            <h2 className="text-base lg:text-lg font-black text-slate-800 dark:text-rose-100 leading-tight flex items-center gap-1.5">
              <span>{currentInfo.title}</span>
            </h2>
            <p className="hidden md:block text-[11px] font-medium text-peachy-700/80 dark:text-blossom-300">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Global 3D Cartoony Action Pills */}
      <div className="flex items-center space-x-2.5">
        {/* Gemini AI Status Badge */}
        {hasGeminiKey ? (
          <div
            onClick={() => onNavigate('settings')}
            className="cursor-pointer hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black shadow-xs hover:scale-105 transition-transform"
            title="Gemini 3.8 Flash SDK Active"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Connected</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-butter-200 border-2 border-butter-400 text-amber-950 text-xs font-black shadow-3d-butter active:translate-y-0.5 animate-pulse"
            title="Configure Gemini API Key"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Add API Key</span>
          </button>
        )}

        {/* Due Recall Tests Alert */}
        {dueTestsCount > 0 && (
          <button
            onClick={() => onNavigate('recall')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blossom-500 text-white text-xs font-black shadow-3d-pink hover:bg-blossom-400 active:translate-y-0.5 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{dueTestsCount} Quest{dueTestsCount > 1 ? 's' : ''} Due</span>
          </button>
        )}

        {/* Map Shortcut Pill */}
        {currentTab !== 'dashboard' && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-peachy-100 hover:bg-peachy-200 text-peachy-800 dark:bg-navy-900 dark:text-rose-200 text-xs font-black border-2 border-peachy-300 dark:border-rose-900 shadow-xs transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-peachy-600" />
            <span>World Map</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-2xl bg-white dark:bg-navy-900 text-slate-700 dark:text-rose-200 border-2 border-peachy-200 dark:border-rose-950 shadow-xs hover:bg-peachy-50 transition-all hover:scale-105 active:scale-95"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-butter-400" /> : <Moon className="w-4 h-4 text-peachy-600" />}
        </button>
      </div>
    </header>
  );
};
