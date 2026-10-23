import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCw,
  Award,
  Calendar,
  BookOpen,
  ArrowRight,
  Eye,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { RecallTest, Reading } from '../types';

interface RecallTestsViewProps {
  initialReadingId?: number;
}

export const RecallTestsView: React.FC<RecallTestsViewProps> = ({ initialReadingId }) => {
  const [tests, setTests] = useState<RecallTest[]>([]);
  const [activeTest, setActiveTest] = useState<RecallTest | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<number | null>(initialReadingId || null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [testList, readingList] = await Promise.all([
        api.getRecallTests(),
        api.getReadings()
      ]);
      setTests(testList);
      setReadings(readingList);
      if (initialReadingId) {
        const found = testList.find((t) => t.reading_id === initialReadingId && t.status === 'pending');
        if (found) {
          handleSelectTest(found.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTest = async (testId: number) => {
    try {
      const test = await api.getTestDetails(testId);
      setActiveTest(test);
      setSubmissionResult(null);
      const initialAns: Record<number, string> = {};
      test.items.forEach((it) => {
        initialAns[it.id] = it.user_response || '';
      });
      setAnswers(initialAns);
    } catch (err) {
      alert('Failed to load test details.');
    }
  };

  const handleGenerateNewQuiz = async () => {
    if (!selectedReadingId) return;
    try {
      const newTest = await api.generateRecallQuiz(selectedReadingId, 'initial');
      setTests([newTest, ...tests]);
      handleSelectTest(newTest.id);
    } catch (err: any) {
      alert(err.message || 'Failed to generate test.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest) return;

    setIsSubmitting(true);
    try {
      const payloadAnswers = Object.entries(answers).map(([id, response]) => ({
        item_id: Number(id),
        user_response: response
      }));

      const res = await api.submitTest(activeTest.id, payloadAnswers);
      setSubmissionResult(res);
      // Reload full test details to display scores & concepts
      const refreshed = await api.getTestDetails(activeTest.id);
      setActiveTest(refreshed);
      // Refresh list
      const refreshedList = await api.getRecallTests();
      setTests(refreshedList);
    } catch (err: any) {
      alert(err.message || 'Failed to submit test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner - Crisp Elevated 3D Claymorphic Card */}
      <div className="clay-card p-6 md:p-8 border-2 border-peachy-200/90 dark:border-rose-950/80 shadow-clay-card space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blossom-100 dark:bg-navy-800 border-2 border-blossom-300 dark:border-rose-900 text-blossom-700 dark:text-blossom-300 text-xs font-black uppercase tracking-wider shadow-xs">
          <Clock className="w-4 h-4 text-blossom-600 dark:text-blossom-400" /> Active Retrieval & Spaced Repetition 🌸
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-50 tracking-tight">Seven-Day Recall Testing System</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 max-w-3xl font-medium leading-relaxed">
          Test your comprehension without consulting study notes. Answer open-ended questions in your own words, receive source-grounded grading with conceptual rubric feedback, and automatically schedule follow-up retention exams 7 days later.
        </p>
      </div>

      {/* Main Grid: Test List on Left, Active Exam / Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Catalog & Creation */}
        <div className="lg:col-span-4 space-y-4">
          {/* Create Test Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Generate New Recall Exam
            </h4>
            <select
              value={selectedReadingId || ''}
              onChange={(e) => setSelectedReadingId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Select a reading to test...</option>
              {readings.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateNewQuiz}
              disabled={!selectedReadingId}
              className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Generate Quiz Questions</span>
            </button>
          </div>

          {/* Test List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Tests ({tests.length})
              </h4>
              <span className="text-[11px] text-slate-400">Chronological</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {tests.map((t) => {
                const isSelected = activeTest?.id === t.id;
                const isPending = t.status === 'pending';
                const isOverdue = isPending && new Date(t.scheduled_for) <= new Date();

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTest(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.test_type === 'seven_day'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'
                      }`}>
                        {t.test_type.replace('_', ' ')}
                      </span>
                      {isPending ? (
                        <span className={`text-[11px] font-bold ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
                          {isOverdue ? 'Due Now' : 'Scheduled'}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {t.overall_score}%
                        </span>
                      )}
                    </div>

                    <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                      {t.title}
                    </h5>

                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.scheduled_for).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Exam Runner / Report */}
        <div className="lg:col-span-8">
          {activeTest ? (
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
              {/* Exam Header */}
              <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-navy-950/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {activeTest.test_type.replace('_', ' ')} recall examination
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Scheduled for: {new Date(activeTest.scheduled_for).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {activeTest.title}
                  </h3>
                </div>

                {activeTest.status === 'completed' && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Final Grade</div>
                      <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                        {activeTest.overall_score}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notice Banner when Pending */}
              {activeTest.status === 'pending' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>
                    Study notes are intentionally hidden during recall testing. Explain concepts in your own words based on your recollection.
                  </span>
                </div>
              )}

              {/* Exam Questions & Answers */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {activeTest.items.map((item, index) => {
                  const isGraded = activeTest.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50/80 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Question {index + 1}
                        </span>
                        {isGraded && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            (item.score || 0) >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : (item.score || 0) >= 60
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            Score: {item.score}%
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {item.question}
                      </h4>

                      {/* Response Input */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Your Explanation (in your own words)
                        </label>
                        {isGraded ? (
                          <div className="p-3 rounded-xl bg-white dark:bg-navy-900 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-800 font-sans leading-relaxed">
                            {item.user_response || 'No answer recorded.'}
                          </div>
                        ) : (
                          <textarea
                            required
                            rows={4}
                            value={answers[item.id] || ''}
                            onChange={(e) =>
                              setAnswers({ ...answers, [item.id]: e.target.value })
                            }
                            placeholder="Type your explanation here without looking at notes..."
                            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                          />
                        )}
                      </div>

                      {/* Graded Details (shown after submission) */}
                      {isGraded && (
                        <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-navy-800 text-xs">
                          {/* Reference Criteria */}
                          <div>
                            <span className="font-bold text-slate-500 uppercase text-[10px]">
                              Ground-Truth Reference Criteria:
                            </span>
                            <p className="mt-1 p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 font-serif italic">
                              "{item.reference_answer}"
                            </p>
                          </div>

                          {/* Examiner Feedback */}
                          {item.feedback && (
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              <strong>Examiner Feedback:</strong> {item.feedback}
                            </p>
                          )}

                          {/* Correct & Missing Concepts Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {item.correct_concepts && item.correct_concepts.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1 mb-1">
                                  <CheckCircle2 className="w-3 h-3" /> Correct Concepts Captured:
                                </span>
                                <ul className="list-disc list-inside text-[11px] text-emerald-700 dark:text-emerald-300 space-y-0.5">
                                  {item.correct_concepts.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.missing_concepts && item.missing_concepts.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80">
                                <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase flex items-center gap-1 mb-1">
                                  <AlertCircle className="w-3 h-3" /> Missing Concepts to Review:
                                </span>
                                <ul className="list-disc list-inside text-[11px] text-rose-700 dark:text-rose-300 space-y-0.5">
                                  {item.missing_concepts.map((m, i) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit Controls (for pending tests) */}
                {activeTest.status === 'pending' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Submitting will grade answers using Gemini AI / source rubrics and automatically schedule a 7-day follow-up.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/30 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Grading with Source Criteria...</span>
                        </>
                      ) : (
                        <span>Submit Exam for Grading</span>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 space-y-3">
              <Clock className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">
                Select or Generate a Recall Exam
              </h4>
              <p className="text-xs max-w-sm mx-auto">
                Choose an existing scheduled test from the left panel or generate questions for an academic reading to begin your active recall session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
