import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  HardDrive,
  Cpu,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { api } from '../api/client';
import { SystemStatus } from '../types';

interface SettingsViewProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRefreshGlobalState: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  toggleDarkMode,
  onRefreshGlobalState
}) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [keySuccessMessage, setKeySuccessMessage] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const s = await api.getSystemStatus();
      setStatus(s);
      setSelectedModel(s.gemini_model || 'gemini-3.8-flash');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsUpdatingKey(true);
    setKeySuccessMessage('');
    try {
      const res = await api.updateApiKey(apiKeyInput.trim(), selectedModel);
      setKeySuccessMessage(res.message);
      setApiKeyInput('');
      await loadStatus();
      onRefreshGlobalState();
    } catch (err: any) {
      alert(err.message || 'Failed to update API key.');
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const handleSeedDatabase = async (force: boolean) => {
    if (force && !window.confirm('Resetting will replace all existing readings with the default 5 academic papers and study sets. Continue?')) {
      return;
    }
    setIsSeeding(true);
    setSeedMessage('');
    try {
      const res = await api.seedDatabase(force);
      setSeedMessage(res.message);
      await loadStatus();
      onRefreshGlobalState();
    } catch (err: any) {
      alert(err.message || 'Seeding failed.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading || !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Checking system status...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Banner - Crisp Elevated 3D Claymorphic Card */}
      <div className="clay-card p-6 md:p-8 border-2 border-peachy-200/90 dark:border-rose-950/80 shadow-clay-card space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2 text-slate-800 dark:text-rose-50 tracking-tight">
          <SettingsIcon className="w-7 h-7 text-peachy-600 dark:text-blossom-400" />
          <span>System & AI Configuration ⚙️</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 font-medium">
          Manage your Google Gemini API credentials, default inference model, and persistent SQLite database state.
        </p>
      </div>

      {/* API Key Configuration Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Google Gemini API Configuration
            </h3>
          </div>
          {status.has_gemini_key ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Key Configured ({status.masked_key})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> No API Key Set
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          ReadWise AI uses the official <code>google-genai</code> Python SDK. Get your free key at{' '}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 dark:text-brand-400 font-semibold underline"
          >
            Google AI Studio
          </a>
          . Keys entered here are saved to your local <code>backend/.env</code> and never transmitted to client browsers.
        </p>

        {keySuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{keySuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={status.has_gemini_key ? 'Enter new key to update...' : 'AIzaSy...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gemini Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Fast)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingKey || !apiKeyInput.trim()}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {isUpdatingKey ? 'Saving Key...' : 'Update Gemini API Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Database Seeding & Reset Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-navy-800">
          <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Academic Demo Dataset Management
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The database currently contains <strong>{status.readings_count} academic readings</strong>. You can re-seed the default 5 foundational papers (*Attention Is All You Need*, *Spaced Repetition*, *Critical Reading & Epistemic Vigilance*, *AI Ethics in Academia*, *Deep Work*) along with full 3-level summaries, flashcards, and scheduled 7-day recall tests for demonstration purposes.
        </p>

        {seedMessage && (
          <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{seedMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleSeedDatabase(false)}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>Seed If Empty</span>
          </button>

          <button
            onClick={() => handleSeedDatabase(true)}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>Reset & Force Re-seed Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Interface Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Interface Theme Preference
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between crisp light mode and eye-friendly dark navy theme
          </p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Switch to Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Switch to Dark Theme</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
