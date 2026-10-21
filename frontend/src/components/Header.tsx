import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Key,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle
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
  const titles: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: { title: 'Study Dashboard', subtitle: 'Real-time overview of learning metrics, retention, and due tests' },
    library: { title: 'Reading Library', subtitle: 'Manage academic papers, book chapters, and extracted documents' },
    workspace: { title: 'Study Workspace', subtitle: 'Dual-pane reading and note-taking environment' },
    summaries: { title: '3-Level AI Summaries', subtitle: 'Quick (50w), Standard (150w), and Detailed (300w) summaries' },
    cards: { title: 'Idea Cards & Flashcards', subtitle: 'Conceptual key ideas, interactive flashcards, and analytical questions' },
    recall: { title: '7-Day Recall Testing', subtitle: 'Source-grounded active recall exams and spaced repetition schedules' },
    experiments: { title: 'Learning Comparison Experiment', subtitle: 'Empirical comparison of Normal vs. AI-Assisted reading retention' },
    verification: { title: 'AI Claim Verification Lab', subtitle: 'Audit generated statements against original text to detect hallucinations' },
    prompts: { title: 'Prompt Engineering Laboratory', subtitle: 'Version, execute, compare, and rate custom academic prompt templates' },
    reflections: { title: 'Metacognitive Reflection Journal', subtitle: 'Structured evaluations of AI assistance and independent memory' },
    tools_ethics: { title: 'AI Tools & Ethics', subtitle: 'In-depth review of 4 free-tier study tools and academic integrity manifesto' },
    settings: { title: 'System Settings', subtitle: 'Configure Gemini API keys, active model, and database state' }
  };

  const currentInfo = titles[currentTab] || { title: 'ReadWise AI', subtitle: 'Academic Study System' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={openMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {currentInfo.title}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Global Action Badges */}
      <div className="flex items-center space-x-2.5">
        {/* Gemini API Key Status Badge */}
        {hasGeminiKey ? (
          <div
            onClick={() => onNavigate('settings')}
            className="cursor-pointer hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:opacity-90 transition-opacity"
            title="Gemini 3.8 Flash SDK Active"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Gemini AI Connected</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors animate-pulse"
            title="Click to configure Gemini API Key"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Add API Key</span>
          </button>
        )}

        {/* Due Recall Tests Alert */}
        {dueTestsCount > 0 && (
          <button
            onClick={() => onNavigate('recall')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{dueTestsCount} Test{dueTestsCount > 1 ? 's' : ''} Due</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

