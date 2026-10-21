import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { NewReadingModal } from './components/NewReadingModal';
import { Dashboard } from './pages/Dashboard';
import { ReadingLibrary } from './pages/ReadingLibrary';
import { ReadingWorkspace } from './pages/ReadingWorkspace';
import { SummariesView } from './pages/SummariesView';
import { IdeaCardsView } from './pages/IdeaCardsView';
import { RecallTestsView } from './pages/RecallTestsView';
import { LearningComparisonView } from './pages/LearningComparisonView';
import { VerificationLabView } from './pages/VerificationLabView';
import { PromptLibraryView } from './pages/PromptLibraryView';
import { ReflectionJournalView } from './pages/ReflectionJournalView';
import { AIToolsAndEthicsView } from './pages/AIToolsAndEthicsView';
import { SettingsView } from './pages/SettingsView';
import { FloatingAIChat } from './components/FloatingAIChat';
import { api } from './api/client';
import { Reading } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [workspaceReadingId, setWorkspaceReadingId] = useState<number | null>(null);
  const [dueTestsCount, setDueTestsCount] = useState(0);
  const [readingsCount, setReadingsCount] = useState(0);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewReadingModalOpen, setIsNewReadingModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Initialize theme from system or preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('readwise_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    refreshGlobalState();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('readwise_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('readwise_theme', 'light');
      }
      return next;
    });
  };

  const refreshGlobalState = async () => {
    try {
      const [dueRes, statusRes] = await Promise.all([
        api.getDueTests(),
        api.getSystemStatus()
      ]);
      setDueTestsCount(dueRes.count || 0);
      setHasGeminiKey(statusRes.has_gemini_key);
      setReadingsCount(statusRes.readings_count || 0);
    } catch (err) {
      console.error('Failed to refresh global state:', err);
    }
  };

  const handleOpenWorkspace = (readingId: number) => {
    setWorkspaceReadingId(readingId);
    setActiveTab('workspace');
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await api.seedDatabase(true);
      await refreshGlobalState();
      alert('Demo academic dataset (5 papers + full study materials) seeded successfully!');
    } catch (err: any) {
      alert(err.message || 'Seeding failed.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReadingCreated = (newReading: Reading) => {
    refreshGlobalState();
    handleOpenWorkspace(newReading.id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'workspace') {
            setWorkspaceReadingId(null);
          }
        }}
        dueTestsCount={dueTestsCount}
        readingsCount={readingsCount}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          currentTab={activeTab}
          dueTestsCount={dueTestsCount}
          hasGeminiKey={hasGeminiKey}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab, readingId) => {
                if (tab === 'workspace' && readingId) {
                  handleOpenWorkspace(readingId);
                } else {
                  setActiveTab(tab);
                }
              }}
              onOpenNewReading={() => setIsNewReadingModalOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <ReadingLibrary
              onOpenWorkspace={handleOpenWorkspace}
              onOpenNewReadingModal={() => setIsNewReadingModalOpen(true)}
            />
          )}

          {activeTab === 'workspace' && (
            workspaceReadingId ? (
              <ReadingWorkspace
                readingId={workspaceReadingId}
                onBack={() => setActiveTab('library')}
                onTakeRecallTest={(rid) => {
                  setActiveTab('recall');
                }}
              />
            ) : (
              <ReadingLibrary
                onOpenWorkspace={handleOpenWorkspace}
                onOpenNewReadingModal={() => setIsNewReadingModalOpen(true)}
              />
            )
          )}

          {activeTab === 'summaries' && (
            <SummariesView onOpenWorkspace={handleOpenWorkspace} />
          )}

          {activeTab === 'cards' && (
            <IdeaCardsView />
          )}

          {activeTab === 'recall' && (
            <RecallTestsView initialReadingId={workspaceReadingId || undefined} />
          )}

          {activeTab === 'experiments' && (
            <LearningComparisonView />
          )}

          {activeTab === 'verification' && (
            <VerificationLabView />
          )}

          {activeTab === 'prompts' && (
            <PromptLibraryView />
          )}

          {activeTab === 'reflections' && (
            <ReflectionJournalView />
          )}

          {activeTab === 'tools_ethics' && (
            <AIToolsAndEthicsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onRefreshGlobalState={refreshGlobalState}
            />
          )}
        </main>
      </div>

      {/* New Reading Modal */}
      <NewReadingModal
        isOpen={isNewReadingModalOpen}
        onClose={() => setIsNewReadingModalOpen(false)}
        onSuccess={handleReadingCreated}
      />

      {/* Floating AI Study Chatbot in Bottom Right Corner */}
      <FloatingAIChat
        activeReadingId={workspaceReadingId}
        activeReadingTitle={workspaceReadingId ? `Reading #${workspaceReadingId}` : null}
      />
    </div>
  );
}

export default App;
