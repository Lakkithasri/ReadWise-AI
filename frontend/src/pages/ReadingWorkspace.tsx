import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Edit3,
  Save,
  RotateCw,
  CheckCircle2,
  FileText,
  Lightbulb,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  BookMarked,
  Tag,
  Play,
  Plus
} from 'lucide-react';
import { api } from '../api/client';
import { FlashcardStudyModal } from '../components/FlashcardStudyModal';

interface ReadingWorkspaceProps {
  readingId: number;
  onBack: () => void;
  onTakeRecallTest: (readingId: number) => void;
}

export const ReadingWorkspace: React.FC<ReadingWorkspaceProps> = ({
  readingId,
  onBack,
  onTakeRecallTest
}) => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summaries' | 'notes' | 'cards' | 'questions' | 'verification'>('summaries');
  const [summaryLevel, setSummaryLevel] = useState<'quick' | 'standard' | 'detailed'>('standard');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  
  // Note editing states
  const [userNotes, setUserNotes] = useState('');
  const [keyConceptsText, setKeyConceptsText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Summary editing states
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedQuick, setEditedQuick] = useState('');
  const [editedStandard, setEditedStandard] = useState('');
  const [editedDetailed, setEditedDetailed] = useState('');

  // Flashcard study modal
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  // Verification claim input
  const [newClaim, setNewClaim] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  useEffect(() => {
    loadWorkspace();
  }, [readingId]);

  const loadWorkspace = async () => {
    setIsLoading(true);
    try {
      const ws = await api.getReadingWorkspace(readingId);
      setData(ws);
      setUserNotes(ws.notes?.user_notes || '');
      setKeyConceptsText((ws.notes?.key_concepts || []).join(', '));
      if (ws.summary) {
        setEditedQuick(ws.summary.quick_summary || '');
        setEditedStandard(ws.summary.standard_summary || '');
        setEditedDetailed(ws.summary.detailed_summary || '');
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummaries = async (regenerate = false) => {
    setIsGeneratingSummary(true);
    try {
      const summary = await api.generateSummary(readingId, regenerate);
      setData((prev: any) => ({ ...prev, summary }));
      setEditedQuick(summary.quick_summary);
      setEditedStandard(summary.standard_summary);
      setEditedDetailed(summary.detailed_summary);
    } catch (err: any) {
      alert(err.message || 'Failed to generate summaries with Gemini.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSaveSummaryEdits = async () => {
    try {
      const updated = await api.updateSummary(readingId, {
        quick_summary: editedQuick,
        standard_summary: editedStandard,
        detailed_summary: editedDetailed
      });
      setData((prev: any) => ({ ...prev, summary: updated }));
      setIsEditingSummary(false);
    } catch (err: any) {
      alert('Failed to save summary edits.');
    }
  };

  const handleGenerateStudyCards = async () => {
    setIsGeneratingCards(true);
    try {
      await api.generateCards(readingId);
      await loadWorkspace();
    } catch (err: any) {
      alert(err.message || 'Failed to generate study cards with Gemini.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const concepts = keyConceptsText
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      const updated = await api.updateNotes(readingId, userNotes, concepts);
      setData((prev: any) => ({ ...prev, notes: updated }));
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddVerificationClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.trim()) return;
    setIsSubmittingClaim(true);
    try {
      const rec = await api.createVerification(
        {
          reading_id: readingId,
          claim_text: newClaim.trim(),
          status: 'unverified'
        },
        true // trigger auto-check with Gemini if available
      );
      setData((prev: any) => ({
        ...prev,
        verifications: [rec, ...(prev.verifications || [])]
      }));
      setNewClaim('');
    } catch (err: any) {
      alert('Failed to add claim.');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleToggleFavoriteCard = async (cardId: number) => {
    try {
      const res = await api.toggleFavoriteCard(cardId);
      setData((prev: any) => ({
        ...prev,
        idea_cards: prev.idea_cards.map((c: any) =>
          c.id === cardId ? { ...c, is_favorite: res.is_favorite } : c
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading dual-pane workspace...</p>
      </div>
    );
  }

  const { reading, summary, notes, idea_cards, flashcards, questions, verifications } = data;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Top Navigation & Workspace Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                {reading.topic}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{reading.word_count.toLocaleString()} words</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
              {reading.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onTakeRecallTest(reading.id)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Conduct Recall Test</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Original Source Reading */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-170px)]">
          <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <BookMarked className="w-4 h-4 text-brand-500" />
              <span>Original Source Text</span>
            </div>
            {reading.source_url && (
              <a
                href={reading.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>External Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-serif text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed selection:bg-brand-100 dark:selection:bg-brand-900">
            <h2 className="font-sans font-bold text-xl text-slate-900 dark:text-white">
              {reading.title}
            </h2>
            <p className="font-sans text-xs text-slate-400 italic">By {reading.author}</p>
            <hr className="border-slate-100 dark:border-navy-800 my-3" />
            <div className="whitespace-pre-wrap font-serif">
              {reading.content}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Study Material & AI Companion */}
        <div className="lg:col-span-6 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-170px)]">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 px-3 pt-2 overflow-x-auto">
            {[
              { id: 'summaries', label: '3-Level Summaries', icon: FileText },
              { id: 'notes', label: 'Personal Notes', icon: Edit3 },
              { id: 'cards', label: `Idea Cards & Flashcards (${flashcards?.length || 0})`, icon: Lightbulb },
              { id: 'questions', label: `Questions (${questions?.length || 0})`, icon: HelpCircle },
              { id: 'verification', label: `Verification (${verifications?.length || 0})`, icon: ShieldCheck }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. Summaries Tab */}
            {activeTab === 'summaries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Summary Level Switcher */}
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-navy-950 text-xs font-medium">
                    {(['quick', 'standard', 'detailed'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSummaryLevel(lvl)}
                        className={`px-3 py-1 rounded-lg capitalize transition-all ${
                          summaryLevel === lvl
                            ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-white font-bold shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        {lvl} ({lvl === 'quick' ? '~50w' : lvl === 'standard' ? '~150w' : '~300w'})
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {summary && !isEditingSummary && (
                      <button
                        onClick={() => setIsEditingSummary(true)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-500 hover:text-brand-600 text-xs font-medium flex items-center gap-1"
                        title="Edit and customize summary"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerateSummaries(!!summary)}
                      disabled={isGeneratingSummary}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                      <span>{summary ? 'Regenerate' : 'Generate with Gemini'}</span>
                    </button>
                  </div>
                </div>

                {/* Summary View Body */}
                {summary ? (
                  isEditingSummary ? (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Editing {summaryLevel} summary
                      </label>
                      <textarea
                        rows={10}
                        value={
                          summaryLevel === 'quick'
                            ? editedQuick
                            : summaryLevel === 'standard'
                            ? editedStandard
                            : editedDetailed
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (summaryLevel === 'quick') setEditedQuick(val);
                          else if (summaryLevel === 'standard') setEditedStandard(val);
                          else setEditedDetailed(val);
                        }}
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingSummary(false)}
                          className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSummaryEdits}
                          className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-200/50 dark:border-navy-800 pb-2.5">
                        <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> AI-Assisted ({summary.model_name})
                        </span>
                        <span>
                          {summaryLevel === 'quick'
                            ? `${summary.quick_summary.split(/\s+/).filter(Boolean).length} words`
                            : summaryLevel === 'standard'
                            ? `${summary.standard_summary.split(/\s+/).filter(Boolean).length} words`
                            : `${summary.detailed_summary.split(/\s+/).filter(Boolean).length} words`}
                        </span>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-sans">
                        {summaryLevel === 'quick' && summary.quick_summary}
                        {summaryLevel === 'standard' && summary.standard_summary}
                        {summaryLevel === 'detailed' && summary.detailed_summary}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-navy-800 p-6 space-y-3">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No summaries generated yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click 'Generate with Gemini' to generate Quick (~50w), Standard (~150w), and Detailed (~300w) summaries simultaneously.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Personal Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Your personal notes are completely independent of AI-generated summaries and persist locally.
                  </p>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : notesSavedSuccess ? 'Saved!' : 'Save Notes'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Concepts (comma-separated tags)
                  </label>
                  <input
                    type="text"
                    value={keyConceptsText}
                    onChange={(e) => setKeyConceptsText(e.target.value)}
                    placeholder="e.g. Self-Attention, Positional Encoding, Scaling Factor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Personal Annotations & Synthesis
                  </label>
                  <textarea
                    rows={12}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Document your own synthesis, personal thoughts, connections to other subjects, and critical reflections in your own words..."
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-sm leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* 3. Idea Cards & Flashcards Tab */}
            {activeTab === 'cards' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Study Flashcards ({flashcards?.length || 0})
                    </h4>
                    <p className="text-xs text-slate-400">
                      Active recall flashcards testing core principles
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {flashcards && flashcards.length > 0 && (
                      <button
                        onClick={() => setIsStudyModalOpen(true)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Launch Study Mode</span>
                      </button>
                    )}
                    <button
                      onClick={handleGenerateStudyCards}
                      disabled={isGeneratingCards}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isGeneratingCards ? 'animate-spin' : ''}`} />
                      <span>{flashcards?.length ? 'Regenerate Set' : 'Generate Cards'}</span>
                    </button>
                  </div>
                </div>

                {/* Key Ideas List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Ideas ({idea_cards?.length || 0})
                  </h5>
                  {idea_cards && idea_cards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {idea_cards.map((card: any) => (
                        <div
                          key={card.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {card.title}
                            </span>
                            <button
                              onClick={() => handleToggleFavoriteCard(card.id)}
                              className={`text-xs p-1 ${
                                card.is_favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                              }`}
                            >
                              ★
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {card.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No key idea cards generated yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* 4. Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Analytical & Application Questions
                  </h4>
                  <p className="text-xs text-slate-400">
                    {questions?.length || 0} discussion & problem scenarios
                  </p>
                </div>

                {questions && questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((q: any, idx: number) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            q.question_type === 'application'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                          }`}>
                            {q.question_type}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Q{idx + 1}. {q.question}
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          defaultValue={q.user_answer}
                          onBlur={(e) => api.answerQuestion(q.id, e.target.value)}
                          placeholder="Type your analytical thoughts or response here..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Generate study cards to unlock discussion and application questions.
                  </div>
                )}
              </div>
            )}

            {/* 5. Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Source-Grounded Verification
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cross-examine claims from summaries against the original text to prevent AI hallucinations.
                  </p>
                </div>

                <form onSubmit={handleAddVerificationClaim} className="flex gap-2">
                  <input
                    type="text"
                    value={newClaim}
                    onChange={(e) => setNewClaim(e.target.value)}
                    placeholder="Enter a statement or claim to verify against the source text..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingClaim}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Audit Claim</span>
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  {verifications && verifications.length > 0 ? (
                    verifications.map((v: any) => {
                      const badgeMap: any = {
                        supported: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                        contradicted: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                        unsupported: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                        unverified: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      };
                      return (
                        <div
                          key={v.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              "{v.claim_text}"
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${badgeMap[v.status] || badgeMap.unverified}`}>
                              {v.status}
                            </span>
                          </div>

                          {v.source_excerpt && (
                            <p className="p-2.5 rounded-lg bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-serif italic border border-slate-100 dark:border-navy-800">
                              Excerpt: "{v.source_excerpt}"
                            </p>
                          )}

                          {v.correction && (
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Correction: {v.correction}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic">No claims audited for this reading yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Flashcard Study Modal */}
      {flashcards && flashcards.length > 0 && (
        <FlashcardStudyModal
          isOpen={isStudyModalOpen}
          onClose={() => setIsStudyModalOpen(false)}
          flashcards={flashcards}
          readingTitle={reading.title}
          onFlashcardUpdated={(updated) => {
            setData((prev: any) => ({
              ...prev,
              flashcards: prev.flashcards.map((f: any) => (f.id === updated.id ? updated : f))
            }));
          }}
        />
      )}
    </div>
  );
};
