import {
  Reading, Summary, PersonalNote, IdeaCard, Flashcard, DiscussionQuestion,
  RecallTest, LearningComparisonData, VerificationRecord, PromptTemplate,
  PromptVersion, PromptTestRun, Reflection, AIToolLog, AnalyticsSummary, SystemStatus
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Non-json response
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Readings
  getReadings: (topic?: string, status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (topic && topic !== 'all') params.append('topic', topic);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Reading[]>(`/readings${qs}`);
  },
  getReading: (id: number) => request<Reading>(`/readings/${id}`),
  createReading: (data: Partial<Reading>) =>
    request<Reading>('/readings', { method: 'POST', body: JSON.stringify(data) }),
  uploadReading: (formData: FormData) =>
    request<Reading>('/readings/upload', { method: 'POST', body: formData }),
  updateReading: (id: number, data: Partial<Reading>) =>
    request<Reading>(`/readings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReading: (id: number) =>
    request<{ status: string; message: string }>(`/readings/${id}`, { method: 'DELETE' }),
  getReadingWorkspace: (id: number) => request<any>(`/readings/${id}/workspace`),

  // Summaries
  getSummary: (readingId: number) => request<Summary>(`/summaries/${readingId}`),
  generateSummary: (readingId: number, regenerate = false) =>
    request<Summary>('/summaries/generate', {
      method: 'POST',
      body: JSON.stringify({ reading_id: readingId, regenerate })
    }),
  updateSummary: (readingId: number, data: Partial<Summary>) =>
    request<Summary>(`/summaries/${readingId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Cards & Study
  generateCards: (readingId: number) =>
    request<{ status: string; ideas_count: number; flashcards_count: number; questions_count: number }>(
      '/cards/generate',
      { method: 'POST', body: JSON.stringify({ reading_id: readingId }) }
    ),
  getIdeaCards: (readingId: number) => request<IdeaCard[]>(`/cards/ideas/${readingId}`),
  toggleFavoriteCard: (id: number) => request<{ id: number; is_favorite: boolean }>(`/cards/ideas/${id}/favorite`, { method: 'PUT' }),
  deleteIdeaCard: (id: number) => request<{ status: string }>(`/cards/ideas/${id}`, { method: 'DELETE' }),

  getFlashcards: (readingId: number) => request<Flashcard[]>(`/cards/flashcards/${readingId}`),
  reviewFlashcard: (id: number, confidenceRating: number) =>
    request<Flashcard>(`/cards/flashcards/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ confidence_rating: confidenceRating })
    }),
  deleteFlashcard: (id: number) => request<{ status: string }>(`/cards/flashcards/${id}`, { method: 'DELETE' }),

  getQuestions: (readingId: number) => request<DiscussionQuestion[]>(`/cards/questions/${readingId}`),
  answerQuestion: (id: number, answer: string) =>
    request<DiscussionQuestion>(`/cards/questions/${id}/answer`, {
      method: 'PUT',
      body: JSON.stringify({ user_answer: answer })
    }),

  getNotes: (readingId: number) => request<PersonalNote>(`/cards/notes/${readingId}`),
  updateNotes: (readingId: number, notes: string, keyConcepts: string[]) =>
    request<PersonalNote>(`/cards/notes/${readingId}`, {
      method: 'PUT',
      body: JSON.stringify({ user_notes: notes, key_concepts: keyConcepts })
    }),

  // Recall Tests
  getRecallTests: (readingId?: number, status?: string) => {
    const params = new URLSearchParams();
    if (readingId) params.append('reading_id', String(readingId));
    if (status && status !== 'all') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<RecallTest[]>(`/recall/tests${qs}`);
  },
  getDueTests: () => request<{ count: number; due_tests: any[] }>('/recall/due'),
  generateRecallQuiz: (readingId: number, testType = 'initial') =>
    request<RecallTest>('/recall/generate', {
      method: 'POST',
      body: JSON.stringify({ reading_id: readingId, test_type: testType })
    }),
  getTestDetails: (id: number) => request<RecallTest>(`/recall/tests/${id}`),
  submitTest: (id: number, answers: Array<{ item_id: number; user_response: string }>) =>
    request<{ status: string; overall_score: number; scheduled_7_day_test: any }>(`/recall/tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    }),

  // Experiments
  getExperimentSessions: () => request<any[]>('/experiments'),
  logExperimentSession: (data: any) =>
    request<any>('/experiments', { method: 'POST', body: JSON.stringify(data) }),
  getLearningComparison: () => request<LearningComparisonData>('/experiments/comparison'),

  // Verifications
  getVerifications: (status?: string, readingId?: number) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (readingId) params.append('reading_id', String(readingId));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<VerificationRecord[]>(`/verifications${qs}`);
  },
  createVerification: (data: any, autoCheck = false) =>
    request<VerificationRecord>(`/verifications?auto_check=${autoCheck}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateVerification: (id: number, data: any) =>
    request<VerificationRecord>(`/verifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVerification: (id: number) =>
    request<{ status: string }>(`/verifications/${id}`, { method: 'DELETE' }),
  getVerificationReport: () => request<any>('/verifications/report'),

  // Prompts
  getPrompts: () => request<PromptTemplate[]>('/prompts'),
  createPrompt: (data: any) =>
    request<PromptTemplate>('/prompts', { method: 'POST', body: JSON.stringify(data) }),
  addPromptVersion: (promptId: number, data: any) =>
    request<PromptVersion>(`/prompts/${promptId}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  runPromptVersion: (versionId: number, readingId: number, customInput?: string) =>
    request<PromptTestRun>(`/prompts/versions/${versionId}/run`, {
      method: 'POST',
      body: JSON.stringify({ reading_id: readingId, custom_input: customInput })
    }),
  ratePromptRun: (runId: number, ratings: any) =>
    request<PromptTestRun>(`/prompts/runs/${runId}/rate`, {
      method: 'POST',
      body: JSON.stringify(ratings)
    }),
  getPromptRuns: (readingId?: number) => {
    const qs = readingId ? `?reading_id=${readingId}` : '';
    return request<PromptTestRun[]>(`/prompts/runs${qs}`);
  },

  // Reflections
  getReflections: (readingId?: number) => {
    const qs = readingId ? `?reading_id=${readingId}` : '';
    return request<Reflection[]>(`/reflections${qs}`);
  },
  createReflection: (data: any) =>
    request<Reflection>('/reflections', { method: 'POST', body: JSON.stringify(data) }),
  getReflectionSuggestions: (readingId: number) =>
    request<{ suggestions: string[] }>(`/reflections/suggestions?reading_id=${readingId}`, { method: 'POST' }),

  // Tools & Ethics
  getTools: () => request<any[]>('/tools-ethics/tools'),
  getEthicsGuidelines: () => request<any>('/tools-ethics/guidelines'),
  getToolLogs: () => request<AIToolLog[]>('/tools-ethics/logs'),
  createToolLog: (data: any) =>
    request<AIToolLog>('/tools-ethics/logs', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getDashboardAnalytics: () => request<AnalyticsSummary>('/analytics/dashboard'),

  // Settings
  getSystemStatus: () => request<SystemStatus>('/settings/status'),
  updateApiKey: (apiKey: string, model: string) =>
    request<{ status: string; message: string }>('/settings/key', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey, model })
    }),
  seedDatabase: (force = false) =>
    request<{ status: string; message: string }>(`/settings/seed?force=${force}`, { method: 'POST' }),

  // Chat AI
  sendChatMessage: (data: { message: string; history?: { role: string; text: string }[]; reading_id?: number | null }) =>
    request<{ response: string; model: string; reading_title?: string }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
