import React, { useEffect, useState } from 'react';
import { Lightbulb, Sparkles, Star, Play, BookOpen, RotateCw } from 'lucide-react';
import { api } from '../api/client';
import { Reading, IdeaCard, Flashcard } from '../types';
import { FlashcardStudyModal } from '../components/FlashcardStudyModal';

export const IdeaCardsView: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<number | null>(null);
  const [ideaCards, setIdeaCards] = useState<IdeaCard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    if (selectedReadingId) {
      loadCards(selectedReadingId);
    }
  }, [selectedReadingId]);

  const loadReadings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReadings();
      setReadings(data);
      if (data.length > 0) {
        setSelectedReadingId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCards = async (readingId: number) => {
    try {
      const [ideas, fcs] = await Promise.all([
        api.getIdeaCards(readingId),
        api.getFlashcards(readingId)
      ]);
      setIdeaCards(ideas);
      setFlashcards(fcs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await api.toggleFavoriteCard(id);
      setIdeaCards(
        ideaCards.map((c) => (c.id === id ? { ...c, is_favorite: res.is_favorite } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const selectedReading = readings.find((r) => r.id === selectedReadingId);
  const displayedIdeas = filterFavorites
    ? ideaCards.filter((c) => c.is_favorite)
    : ideaCards;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header - Crisp Elevated 3D Claymorphic Card */}
      <div className="clay-card p-6 md:p-8 border-2 border-peachy-200/90 dark:border-rose-950/80 shadow-clay-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blossom-100 dark:bg-navy-800 border-2 border-blossom-300 dark:border-rose-900 text-blossom-700 dark:text-blossom-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <Lightbulb className="w-3.5 h-3.5 text-blossom-600 dark:text-blossom-400" /> Active Recall Memory Deck 💡
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-rose-50 tracking-tight">
            Key Ideas & Spaced Flashcards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 font-medium">
            Conceptual flashcard study mode with 1-5 confidence rating scales saved to SQLite
          </p>
        </div>

        {flashcards.length > 0 && (
          <button
            onClick={() => setIsStudyModalOpen(true)}
            className="btn-3d btn-3d-butter px-6 py-3 text-xs sm:text-sm font-black shadow-3d-md flex items-center gap-2 transition-all flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-amber-700 text-amber-700" />
            <span>Launch Study Mode ({flashcards.length} Cards)</span>
          </button>
        )}
      </div>

      {/* Selector and Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Select Reading:
          </label>
          <select
            value={selectedReadingId || ''}
            onChange={(e) => setSelectedReadingId(Number(e.target.value))}
            className="w-full md:w-96 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            {readings.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.topic})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              filterFavorites
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-white' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Key-Idea Cards ({displayedIdeas.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click star to favorite
          </span>
        </div>

        {displayedIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedIdeas.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {card.card_type}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(card.id)}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-800 ${
                        card.is_favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${card.is_favorite ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {card.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Source-grounded</span>
                  <span className="capitalize">{new Date(card.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 text-xs">
            No idea cards found for this selection.
          </div>
        )}
      </div>

      {/* Flashcard Study Modal */}
      {selectedReading && flashcards.length > 0 && (
        <FlashcardStudyModal
          isOpen={isStudyModalOpen}
          onClose={() => setIsStudyModalOpen(false)}
          flashcards={flashcards}
          readingTitle={selectedReading.title}
          onFlashcardUpdated={(updated) => {
            setFlashcards(flashcards.map((f) => (f.id === updated.id ? updated : f)));
          }}
        />
      )}
    </div>
  );
};
