import React, { useState } from 'react';
import { X, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react';
import { Flashcard } from '../types';
import { api } from '../api/client';

interface FlashcardStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  readingTitle: string;
  onFlashcardUpdated?: (updated: Flashcard) => void;
}

export const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  readingTitle,
  onFlashcardUpdated
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  if (!isOpen || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  const handleRate = async (rating: number) => {
    setIsSubmitting(true);
    try {
      const updated = await api.reviewFlashcard(currentCard.id, rating);
      if (onFlashcardUpdated) {
        onFlashcardUpdated(updated);
      }

      setIsFlipped(false);
      if (currentIndex + 1 < flashcards.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionCompleted(true);
      }
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-800 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Flashcard Study Mode
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
              {readingTitle}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-navy-950 h-1.5">
          <div
            className="bg-brand-600 h-1.5 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>

        {/* Card Body */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[340px]">
          {sessionCompleted ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Study Session Complete!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You reviewed all {flashcards.length} flashcards in this set. Your confidence ratings are saved to SQLite.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300"
                >
                  Review Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-md shadow-brand-600/30"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-lg cursor-pointer select-none perspective-1000 py-2"
            >
              <div
                className={`relative w-full h-[270px] transform-style-3d card-flipper-transition ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Face: Question */}
                <div className="absolute inset-0 w-full h-full backface-hidden p-7 md:p-8 rounded-3xl bg-white dark:bg-navy-950/90 border border-slate-200 dark:border-navy-700 shadow-xl flex flex-col justify-between hover:border-brand-400 transition-colors">
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                        Question / Concept
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Card #{currentIndex + 1}
                      </span>
                    </div>
                    <p className="mt-4 text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {currentCard.question}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-navy-800">
                    <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium">
                      <RotateCw className="w-3.5 h-3.5" /> Click anywhere to flip
                    </span>
                    <span>Confidence: {currentCard.confidence_rating}/5</span>
                  </div>
                </div>

                {/* Back Face: Answer */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-7 md:p-8 rounded-3xl bg-gradient-to-br from-brand-50/90 via-amber-50/70 to-orange-50/80 dark:from-navy-950 dark:via-brand-950/60 dark:to-navy-900 border border-brand-300 dark:border-brand-700/80 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Verified Answer / Solution
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Solution
                      </span>
                    </div>
                    <p className="mt-4 text-sm md:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed overflow-y-auto max-h-[140px]">
                      {currentCard.answer}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-brand-200/60 dark:border-navy-800">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Rate your recall below
                    </span>
                    <span className="text-slate-500 text-[11px]">Click to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confidence Rating Controls (visible when flipped and not completed) */}
        {!sessionCompleted && (
          <div className="p-5 border-t border-slate-100 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/40">
            {isFlipped ? (
              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  How well did you know this answer?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: '1 - Again', color: 'hover:bg-rose-500 hover:text-white' },
                    { val: 2, label: '2 - Hard', color: 'hover:bg-amber-500 hover:text-white' },
                    { val: 3, label: '3 - Good', color: 'hover:bg-brand-500 hover:text-white' },
                    { val: 4, label: '4 - Easy', color: 'hover:bg-emerald-500 hover:text-white' },
                    { val: 5, label: '5 - Mastered', color: 'hover:bg-violet-500 hover:text-white' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(btn.val);
                      }}
                      disabled={isSubmitting}
                      className={`px-2 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 transition-colors shadow-sm ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30"
                >
                  Reveal Answer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentIndex + 1 < flashcards.length) {
                      setCurrentIndex(currentIndex + 1);
                      setIsFlipped(false);
                    } else {
                      setSessionCompleted(true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
                >
                  Skip <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
