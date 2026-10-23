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
  ChevronRight,
  X,
  Sparkles,
  Heart
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
  badgeType?: 'butter' | 'pink' | 'coral';
  tag?: string;
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
    { id: 'dashboard', label: 'Study Journey', icon: LayoutDashboard, tag: 'Map' },
    { id: 'library', label: 'Reading Library', icon: BookOpen, badge: readingsCount > 0 ? readingsCount : undefined, badgeType: 'butter' },
    { id: 'summaries', label: 'AI Summaries', icon: FileText },
    { id: 'cards', label: 'Idea Cards & Quiz', icon: Lightbulb },
    { id: 'recall', label: 'Recall Arena', icon: Clock, badge: dueTestsCount > 0 ? `${dueTestsCount} Due` : undefined, badgeType: 'pink' },
    { id: 'experiments', label: 'Learning Analytics', icon: BarChart3 },
    { id: 'verification', label: 'Verification Lab', icon: ShieldCheck },
    { id: 'prompts', label: 'Prompt Lab', icon: Terminal },
    { id: 'reflections', label: 'Reflection Journal', icon: BookMarked },
    { id: 'tools_ethics', label: 'Tools & Ethics', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-peachy-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container - 3D Cartoony Peachy Blossom Theme */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-peachy-50/95 dark:bg-navy-950/95 backdrop-blur-md text-slate-700 dark:text-rose-100 border-r-2 border-peachy-200/80 dark:border-rose-950/80 flex flex-col transition-all duration-200 ease-in-out shadow-sm ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b-2 border-peachy-200/70 dark:border-rose-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-peachy-500 via-blossom-500 to-peachy-400 flex items-center justify-center text-white shadow-3d-sm p-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/40">
              <GlowingBookLogo className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" glow={false} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-800 dark:text-rose-50 tracking-tight flex items-center gap-1.5">
                ReadWise <span className="text-blossom-600 dark:text-blossom-400 font-black text-xs uppercase px-2 py-0.5 rounded-full bg-blossom-100 dark:bg-blossom-950/80 border border-blossom-300 dark:border-blossom-800/80 shadow-xs">🌸 AI</span>
              </h1>
              <p className="text-[11px] font-semibold text-peachy-600 dark:text-blossom-300 flex items-center gap-1">
                <span>Peachy Journey</span>
                <Sparkles className="w-3 h-3 text-butter-400" />
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-peachy-500 hover:text-peachy-700 p-1.5 rounded-xl bg-white dark:bg-navy-900 border border-peachy-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links - 3D Cartoony Tactile Tabs */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2">
          <div className="px-3 pb-1 text-[11px] font-extrabold tracking-wider text-peachy-600 dark:text-blossom-400 uppercase flex items-center gap-1.5">
            <Heart className="w-3 h-3 fill-peachy-400 text-peachy-400" />
            <span>Journey Quests</span>
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
                className={`tab-3d w-full ${isActive ? 'tab-3d-active' : 'tab-3d-inactive'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-xl transition-transform ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-peachy-100/60 dark:bg-navy-800/80 text-peachy-600 dark:text-blossom-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs transition-transform ${
                      item.badgeType === 'pink'
                        ? 'bg-blossom-500 text-white shadow-3d-pink animate-pulse'
                        : item.badgeType === 'butter'
                        ? 'bg-butter-300 text-amber-900 shadow-3d-butter'
                        : 'bg-white/25 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && (
                    <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  )
                )}
              </button>
            );
          })}
        </nav>

        {/* 3D Cartoony Gamified Level Profile Card */}
        <div className="p-3.5 m-3 rounded-3xl bg-white/90 dark:bg-navy-900/90 border-2 border-peachy-200 dark:border-rose-950/80 shadow-clay-card flex items-center justify-between text-xs transition-all">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-butter-200 via-peachy-300 to-blossom-400 flex items-center justify-center text-rose-900 font-black text-sm shadow-sm border-2 border-white">
              🌸
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-rose-100 flex items-center gap-1">
                <span>Scholar Level 12</span>
                <span className="text-[10px] font-black text-blossom-500">★</span>
              </p>
              <div className="w-24 bg-peachy-100 dark:bg-navy-800 rounded-full h-1.5 mt-1 overflow-hidden border border-peachy-200">
                <div className="bg-gradient-to-r from-peachy-500 to-blossom-500 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-black text-peachy-600 dark:text-blossom-300 bg-peachy-100 dark:bg-navy-800 px-2 py-0.5 rounded-full">
            78% XP
          </span>
        </div>
      </aside>
    </>
  );
};
