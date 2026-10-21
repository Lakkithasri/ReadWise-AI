import React, { useEffect, useState } from 'react';
import {
  Layers,
  Shield,
  FileText,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Terminal,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import { AIToolLog } from '../types';

export const AIToolsAndEthicsView: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [manifesto, setManifesto] = useState<any>(null);
  const [logs, setLogs] = useState<AIToolLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // New Log form states
  const [toolName, setToolName] = useState('Google Gemini');
  const [taskPerformed, setTaskPerformed] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [inputData, setInputData] = useState('');
  const [outputReceived, setOutputReceived] = useState('');
  const [corrections, setCorrections] = useState('');
  const [strengths, setStrengths] = useState('');
  const [limitations, setLimitations] = useState('');
  const [privacyNotes, setPrivacyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [toolList, ethics, logList] = await Promise.all([
        api.getTools(),
        api.getEthicsGuidelines(),
        api.getToolLogs()
      ]);
      setTools(toolList);
      setManifesto(ethics);
      setLogs(logList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPerformed.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createToolLog({
        tool_name: toolName,
        task_performed: taskPerformed.trim(),
        prompt_used: promptUsed.trim(),
        input_data: inputData.trim(),
        output_received: outputReceived.trim(),
        corrections: corrections.trim(),
        strengths_observed: strengths.trim(),
        limitations_observed: limitations.trim(),
        privacy_notes: privacyNotes.trim()
      });
      setShowLogModal(false);
      setTaskPerformed('');
      setPromptUsed('');
      setOutputReceived('');
      setCorrections('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create workflow log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading AI Tools & Ethics guidelines...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Top Banner - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Responsible AI in Academia
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Free-Tier AI Tools & Academic Ethics Framework
        </h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Architectural documentation of 4 student productivity tools (distinguishing real backend API integrations from external workflows), an immutable academic integrity manifesto, and a persistent external tool workflow log.
        </p>
      </div>

      {/* Section 1: The 4 Free-Tier Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Documented AI Tools Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear demarcation between programmatic REST API calls and manual desktop workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 hover:border-brand-400 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-navy-800">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {tool.name}
                    </h4>
                    <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
                      {tool.integration_type}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300">
                    Free Tier
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  <strong>Purpose:</strong> {tool.purpose}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">
                    Tasks Actually Performed in Academic Workflow:
                  </span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 text-[11px]">
                    {tool.tasks_performed.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    <strong>Strengths:</strong> {tool.strengths}
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                    <strong>Limitations:</strong> {tool.limitations}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-navy-950/80 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Privacy Protocol:</strong> {tool.privacy_considerations}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Ethics & Responsible AI Pillars with Comprehensive Definitions */}
      {manifesto && (
        <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {manifesto.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive formal definitions and compliance rules for Privacy, Copyright, Honest Disclosure, Tool Limitations, Cognitive Integrity, and Verification.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manifesto.pillars.map((pillar: any, index: number) => (
              <div
                key={pillar.id || index}
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-3.5 text-xs flex flex-col justify-between hover:border-brand-400/80 transition-all shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900">
                      {pillar.category || `Pillar ${index + 1}`}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mandatory
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {pillar.title}
                  </h4>

                  {pillar.definition && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/5 text-slate-800 dark:text-slate-200">
                      <strong className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                        Academic Definition:
                      </strong>
                      <p className="text-[11px] leading-relaxed italic">
                        "{pillar.definition}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <strong className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      System Implementation:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans text-[11px]">
                      {pillar.explanation || pillar.content}
                    </p>
                  </div>
                </div>

                {pillar.key_rules && pillar.key_rules.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-navy-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Core Compliance Rules:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {pillar.key_rules.map((rule: string, rIdx: number) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-brand-500 font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: External Tool Workflow Log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              External AI Tool Workflow Log
            </h3>
            <p className="text-xs text-slate-400">
              Audit trail recording prompts, inputs, outputs, and factual corrections from manual tool interactions
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record External Tool Task</span>
          </button>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] uppercase">
                    {log.tool_name}
                  </span>
                  <span>{log.task_performed}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>

              {log.prompt_used && (
                <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 font-mono text-[11px]">
                  <strong>Prompt:</strong> {log.prompt_used}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {log.output_received && (
                  <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <strong className="block text-slate-500 mb-1">Output / Evidence:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {log.output_received}
                    </p>
                  </div>
                )}
                {log.corrections && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                    <strong className="block text-emerald-800 dark:text-emerald-300 mb-1">Factual Corrections Applied:</strong>
                    <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed font-sans">
                      {log.corrections}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record External AI Tool Workflow Entry
            </h3>

            <form onSubmit={handleCreateLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Tool Used
                </label>
                <select
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                >
                  <option value="ChatGPT">ChatGPT (OpenAI)</option>
                  <option value="Google Gemini">Google Gemini (Google AI Studio)</option>
                  <option value="Google NotebookLM">Google NotebookLM (Google Labs)</option>
                  <option value="Notion/Obsidian">Notion / Obsidian</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Task Performed *
                </label>
                <input
                  type="text"
                  required
                  value={taskPerformed}
                  onChange={(e) => setTaskPerformed(e.target.value)}
                  placeholder="e.g. Socratic cross-examination of theorem"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Prompt Used
                </label>
                <textarea
                  rows={2}
                  value={promptUsed}
                  onChange={(e) => setPromptUsed(e.target.value)}
                  placeholder="Exact prompt text submitted..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Output Received
                </label>
                <textarea
                  rows={2}
                  value={outputReceived}
                  onChange={(e) => setOutputReceived(e.target.value)}
                  placeholder="Summary of response or evidence generated..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Factual Corrections / Human Refinements
                </label>
                <textarea
                  rows={2}
                  value={corrections}
                  onChange={(e) => setCorrections(e.target.value)}
                  placeholder="Any inaccuracies caught or refinements made..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
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
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
