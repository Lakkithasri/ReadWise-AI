import React, { useEffect, useState } from 'react';
import {
  Terminal,
  Plus,
  Play,
  RotateCw,
  Star,
  Copy,
  GitBranch,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../api/client';
import { PromptTemplate, PromptTestRun, Reading } from '../types';

export const PromptLibraryView: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [testRuns, setTestRuns] = useState<PromptTestRun[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [selectedReadingId, setSelectedReadingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // New prompt modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('summary');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newSystemInstruction, setNewSystemInstruction] = useState('');

  // Add version modal
  const [showAddVerModal, setShowAddVerModal] = useState(false);
  const [verTemplate, setVerTemplate] = useState('');
  const [verSystemInstruction, setVerSystemInstruction] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [promptList, runList, readingList] = await Promise.all([
        api.getPrompts(),
        api.getPromptRuns(),
        api.getReadings()
      ]);
      setPrompts(promptList);
      setTestRuns(runList);
      setReadings(readingList);
      if (promptList.length > 0) {
        setSelectedPrompt(promptList[0]);
      }
      if (readingList.length > 0) {
        setSelectedReadingId(readingList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTemplate.trim()) return;

    try {
      const created = await api.createPrompt({
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        initial_template_text: newTemplate.trim(),
        system_instruction: newSystemInstruction.trim()
      });
      setPrompts([created, ...prompts]);
      setSelectedPrompt(created);
      setShowNewModal(false);
      setNewTitle('');
      setNewTemplate('');
      setNewDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to create prompt.');
    }
  };

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt || !verTemplate.trim()) return;

    try {
      await api.addPromptVersion(selectedPrompt.id, {
        template_text: verTemplate.trim(),
        system_instruction: verSystemInstruction.trim()
      });
      setShowAddVerModal(false);
      setVerTemplate('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add prompt version.');
    }
  };

  const handleRunVersion = async (versionId: number) => {
    if (!selectedReadingId) {
      alert('Please select a reading to execute the prompt against.');
      return;
    }
    setIsRunning(true);
    try {
      const run = await api.runPromptVersion(versionId, selectedReadingId);
      setTestRuns([run, ...testRuns]);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to execute prompt with Gemini.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRateRun = async (runId: number, metric: string, value: number) => {
    const run = testRuns.find((r) => r.id === runId);
    if (!run) return;

    const payload = {
      clarity_rating: metric === 'clarity' ? value : run.clarity_rating,
      accuracy_rating: metric === 'accuracy' ? value : run.accuracy_rating,
      completeness_rating: metric === 'completeness' ? value : run.completeness_rating,
      usefulness_rating: metric === 'usefulness' ? value : run.usefulness_rating,
      notes: run.notes || ''
    };

    try {
      const updated = await api.ratePromptRun(runId, payload);
      setTestRuns(testRuns.map((r) => (r.id === runId ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Prompt Engineering Lab...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner - Adaptive Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-900 dark:via-brand-950 dark:to-navy-900 border border-brand-200/70 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-800 dark:text-brand-300 bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/80 text-[11px] font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Prompt Engineering Laboratory
          </div>
          <h2 className="text-xl md:text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            Prompt Library & Version Comparison
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-1">
            Create, version, and execute tailored prompt templates against academic papers. Rate model outputs on <strong>Clarity</strong>, <strong>Accuracy</strong>, <strong>Completeness</strong>, and <strong>Usefulness</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Prompt Template</span>
        </button>
      </div>

      {/* Main Grid: Prompt Templates on Left, Version Inspector & Run Runner on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Prompt Templates ({prompts.length})
            </h4>
          </div>

          <div className="space-y-3">
            {prompts.map((p) => {
              const isSelected = selectedPrompt?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrompt(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300">
                      {p.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {p.versions?.length || 1} Version{(p.versions?.length || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </h4>
                  {p.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Versions & Execution */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPrompt ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedPrompt.title}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedPrompt.description}</p>
                </div>
                <button
                  onClick={() => {
                    const latest = selectedPrompt.versions[selectedPrompt.versions.length - 1];
                    setVerTemplate(latest ? latest.template_text : '');
                    setVerSystemInstruction(latest ? latest.system_instruction : '');
                    setShowAddVerModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Create New Version</span>
                </button>
              </div>

              {/* Execution Target Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Test Reading:
                  </span>
                  <select
                    value={selectedReadingId || ''}
                    onChange={(e) => setSelectedReadingId(Number(e.target.value))}
                    className="w-full sm:w-80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white font-medium"
                  >
                    {readings.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-slate-400">Uses <code>{'{{text}}'}</code> variable</span>
              </div>

              {/* Version History List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Version Variations
                </h4>

                <div className="space-y-4">
                  {selectedPrompt.versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] uppercase">
                            v{ver.version_number}
                          </span>
                          <span className="text-xs text-slate-400">
                            Created {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRunVersion(ver.id)}
                          disabled={isRunning}
                          className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>{isRunning ? 'Running...' : 'Run This Version'}</span>
                        </button>
                      </div>

                      {ver.system_instruction && (
                        <div className="text-[11px] text-slate-500 font-mono bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200 dark:border-navy-800">
                          <strong>System:</strong> {ver.system_instruction}
                        </div>
                      )}

                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-navy-900 p-3 rounded-xl border border-slate-200 dark:border-navy-800 whitespace-pre-wrap">
                        {ver.template_text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 text-xs">
              Select a prompt template to inspect versions and run tests.
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Test Runs Comparison Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Prompt Test Runs & 4-Point Evaluation Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compare actual generated responses across versions and evaluate quality metrics
            </p>
          </div>
        </div>

        {testRuns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testRuns.map((run) => (
              <div
                key={run.id}
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {run.prompt_title} (v{run.version_number})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800">
                      Score: {run.average_rating}/5
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Reading: {run.reading_title}
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                    {run.output_text}
                  </div>
                </div>

                {/* Rating Matrix */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-navy-800 space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Clarity:</span>
                      <select
                        value={run.clarity_rating}
                        onChange={(e) => handleRateRun(run.id, 'clarity', Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                      >
                        {[1, 2, 3, 4, 5].map((v) => (
                          <option key={v} value={v}>
                            {v} ★
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Accuracy:</span>
                      <select
                        value={run.accuracy_rating}
                        onChange={(e) => handleRateRun(run.id, 'accuracy', Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                      >
                        {[1, 2, 3, 4, 5].map((v) => (
                          <option key={v} value={v}>
                            {v} ★
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Completeness:</span>
                      <select
                        value={run.completeness_rating}
                        onChange={(e) => handleRateRun(run.id, 'completeness', Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                      >
                        {[1, 2, 3, 4, 5].map((v) => (
                          <option key={v} value={v}>
                            {v} ★
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Usefulness:</span>
                      <select
                        value={run.usefulness_rating}
                        onChange={(e) => handleRateRun(run.id, 'usefulness', Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                      >
                        {[1, 2, 3, 4, 5].map((v) => (
                          <option key={v} value={v}>
                            {v} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No test runs executed yet. Select a version above and click 'Run This Version'.
          </div>
        )}
      </div>

      {/* New Prompt Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Reusable Prompt Template
            </h3>

            <form onSubmit={handleCreatePrompt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Socratic Question Generator"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                >
                  <option value="summary">Summary</option>
                  <option value="flashcards">Flashcards</option>
                  <option value="questions">Questions</option>
                  <option value="verification">Verification</option>
                  <option value="recall">Recall Quiz</option>
                  <option value="custom">Custom Analysis</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief explanation of what this prompt accomplishes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  System Instruction (Optional)
                </label>
                <input
                  type="text"
                  value={newSystemInstruction}
                  onChange={(e) => setNewSystemInstruction(e.target.value)}
                  placeholder="e.g. You are a senior research scientist."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Prompt Template (Use <code>{'{{text}}'}</code> for reading content)
                </label>
                <textarea
                  required
                  rows={4}
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Analyze this text:&#10;{{text}}&#10;&#10;Extract 3 counter-arguments..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                >
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Version Modal */}
      {showAddVerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Version for "{selectedPrompt?.title}"
            </h3>

            <form onSubmit={handleAddVersion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  System Instruction
                </label>
                <input
                  type="text"
                  value={verSystemInstruction}
                  onChange={(e) => setVerSystemInstruction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Template Text
                </label>
                <textarea
                  required
                  rows={6}
                  value={verTemplate}
                  onChange={(e) => setVerTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold"
                >
                  Save Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
