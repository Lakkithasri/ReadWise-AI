import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  User,
  ArrowRight,
  FileText,
  CheckCircle2,
  BookMarked
} from 'lucide-react';
import { api } from '../api/client';
import { Reading } from '../types';

interface ReadingLibraryProps {
  onOpenWorkspace: (readingId: number) => void;
  onOpenNewReadingModal: () => void;
}

export const ReadingLibrary: React.FC<ReadingLibraryProps> = ({
  onOpenWorkspace,
  onOpenNewReadingModal
}) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReadings();
  }, [search, selectedTopic, selectedStatus]);

  const loadReadings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReadings(selectedTopic, selectedStatus, search);
      setReadings(data);
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}" and all its study materials?`)) {
      return;
    }
    try {
      await api.deleteReading(id);
      setReadings(readings.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete reading.');
    }
  };

  const topics = [
    'all',
    'Artificial Intelligence',
    'Cognitive Science',
    'Education & Epistemology',
    'Ethics & Policy',
    'Productivity & Psychology'
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Academic Reading Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {readings.length} document{readings.length === 1 ? '' : 's'} cataloged in persistent SQLite database
          </p>
        </div>

        <button
          onClick={onOpenNewReadingModal}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reading</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, authors, concepts..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Topic:</span>
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Disciplines' : t}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="reading">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Readings Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Loading library...</p>
        </div>
      ) : readings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white">No readings found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or add an academic chapter/paper to begin studying.
          </p>
          <button
            onClick={onOpenNewReadingModal}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            Add Your First Reading
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {readings.map((reading) => {
            const statusColors = {
              unread: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
              reading: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
              completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            };

            return (
              <div
                key={reading.id}
                onClick={() => onOpenWorkspace(reading.id)}
                className="group relative p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {reading.topic}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusColors[reading.status]}`}>
                      {reading.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {reading.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{reading.author}</span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed font-serif">
                    {reading.content.slice(0, 160)}...
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {reading.word_count.toLocaleString()} words
                    </span>
                    <span>•</span>
                    <span>{reading.reading_date || 'Undated'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {reading.source_url && (
                      <a
                        href={reading.source_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-slate-400 hover:text-brand-600"
                        title="View Original Source Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(reading.id, reading.title, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Reading"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-brand-600 dark:text-brand-400 font-bold group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
