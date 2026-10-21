import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Lightbulb,
  Clock,
  BarChart3,
  ShieldCheck,
  Terminal,
  BookMarked,
  Layers,
  Settings,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { GlowingBookLogo } from './GlowingBookLogo';

export type NavItem =
  | 'dashboard'
  | 'library'
  | 'workspace'
  | 'summaries'
  | 'cards'
  | 'recall'
  | 'experiments'
  | 'verification'
  | 'prompts'
  | 'reflections'
  | 'tools_ethics'
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  dueTestsCount: number;
  readingsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

interface NavItemConfig {
  id: NavItem;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  dueTestsCount,
  readingsCount,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Reading Library', icon: BookOpen, badge: readingsCount > 0 ? readingsCount : undefined },
    { id: 'summaries', label: 'AI Summaries', icon: FileText },
    { id: 'cards', label: 'Idea Cards & Flashcards', icon: Lightbulb },
    { id: 'recall', label: 'Recall Tests', icon: Clock, badge: dueTestsCount > 0 ? `${dueTestsCount} Due` : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'experiments', label: 'Learning Comparison', icon: BarChart3 },
    { id: 'verification', label: 'Verification Lab', icon: ShieldCheck },
    { id: 'prompts', label: 'Prompt Library', icon: Terminal },
    { id: 'reflections', label: 'Reflection Journal', icon: BookMarked },
    { id: 'tools_ethics', label: 'AI Tools & Ethics', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-all duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-navy-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 p-1.5 transition-transform hover:scale-105">
              <GlowingBookLogo className="w-full h-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" glow={false} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                ReadWise <span className="text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-500/30">AI</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Research & Knowledge Platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as NavItem);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 dark:bg-navy-800 text-brand-600 dark:text-brand-300 border border-slate-200 dark:border-brand-500/30')
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Professional Workspace & Account Footer */}
        <div className="p-3.5 m-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              RW
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Research Workspace</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Pro Edition • Cloud Synced
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

