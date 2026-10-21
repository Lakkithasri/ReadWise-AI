export interface Reading {
  id: number;
  title: string;
  author: string;
  source_url?: string | null;
  topic: string;
  reading_date: string;
  status: 'unread' | 'reading' | 'completed';
  completion_date?: string | null;
  content: string;
  word_count: number;
  char_count: number;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: number;
  reading_id: number;
  quick_summary: string;
  standard_summary: string;
  detailed_summary: string;
  is_ai_generated: boolean;
  model_name: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalNote {
  id: number;
  reading_id: number;
  user_notes: string;
  key_concepts: string[];
  updated_at: string;
}

export interface IdeaCard {
  id: number;
  reading_id: number;
  title: string;
  explanation: string;
  is_favorite: boolean;
  card_type: string;
  created_at: string;
}

export interface Flashcard {
  id: number;
  reading_id: number;
  question: string;
  answer: string;
  confidence_rating: number; // 1-5
  review_count: number;
  last_reviewed_at?: string | null;
  created_at: string;
}

export interface DiscussionQuestion {
  id: number;
  reading_id: number;
  question: string;
  question_type: 'discussion' | 'application';
  user_answer: string;
  created_at: string;
}

export interface RecallTestItem {
  id: number;
  question: string;
  reference_answer: string;
  user_response?: string | null;
  score?: number | null;
  feedback?: string | null;
  correct_concepts?: string[] | null;
  missing_concepts?: string[] | null;
}

export interface RecallTest {
  id: number;
  reading_id: number;
  title: string;
  test_type: 'initial' | 'seven_day';
  scheduled_for: string;
  completed_at?: string | null;
  status: 'pending' | 'completed';
  overall_score?: number | null;
  created_at: string;
  items: RecallTestItem[];
  reading?: {
    id: number;
    title: string;
    author: string;
    topic: string;
  };
}

export interface ExperimentSession {
  id: number;
  reading_id: number;
  method: 'normal' | 'ai_assisted';
  start_time: string;
  completion_time: string;
  duration_minutes: number;
  initial_score: number;
  seven_day_score?: number | null;
  confidence_rating: number;
  observations: string;
  created_at: string;
}

export interface LearningComparisonData {
  summary: {
    total_sessions: number;
    normal_count: number;
    ai_count: number;
    avg_normal_duration: number;
    avg_ai_duration: number;
    avg_normal_initial_score: number;
    avg_ai_initial_score: number;
    avg_normal_7d_score: number;
    avg_ai_7d_score: number;
  };
  session_points: Array<{
    id: number;
    title: string;
    method: 'Normal' | 'AI-Assisted';
    initial_score: number;
    seven_day_score?: number | null;
    duration: number;
    confidence: number;
    retention_change?: number | null;
  }>;
  methodology_disclaimer: string;
}

export interface VerificationRecord {
  id: number;
  reading_id: number;
  claim_text: string;
  source_excerpt: string;
  external_url?: string | null;
  status: 'supported' | 'unsupported' | 'contradicted' | 'outdated' | 'unverified';
  correction: string;
  notes: string;
  verified_at: string;
  reading_title?: string;
}

export interface PromptVersion {
  id: number;
  prompt_id: number;
  version_number: number;
  template_text: string;
  system_instruction: string;
  created_at: string;
}

export interface PromptTemplate {
  id: number;
  title: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
  versions: PromptVersion[];
}

export interface PromptTestRun {
  id: number;
  version_id: number;
  version_number: number;
  prompt_title: string;
  prompt_text: string;
  system_instruction: string;
  reading_id: number;
  reading_title: string;
  output_text: string;
  clarity_rating: number;
  accuracy_rating: number;
  completeness_rating: number;
  usefulness_rating: number;
  average_rating: number;
  notes?: string | null;
  created_at: string;
}

export interface Reflection {
  id: number;
  reading_id?: number | null;
  date: string;
  did_ai_help: string;
  remember_without_notes: string;
  deep_thinking_vs_dependence: string;
  misunderstood_concepts: string;
  future_changes: string;
  general_notes: string;
  ai_suggestions?: string | null;
  created_at: string;
}

export interface AIToolLog {
  id: number;
  tool_name: string;
  task_performed: string;
  prompt_used: string;
  input_data: string;
  output_received: string;
  corrections: string;
  strengths_observed: string;
  limitations_observed: string;
  privacy_notes: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_readings: number;
  completed_readings: number;
  saved_summaries: number;
  flashcards_reviewed: number;
  total_flashcards: number;
  recall_tests_due: number;
  average_recall_score: number;
  verification_issues_pending: number;
  recent_activity: Array<{
    type: string;
    title: string;
    timestamp: string;
    badge: string;
  }>;
  experiment_metrics: {
    normal_avg: number;
    ai_avg: number;
    total_experiments: number;
  };
}

export interface SystemStatus {
  status: string;
  has_gemini_key: boolean;
  masked_key: string;
  gemini_model: string;
  environment: string;
  database_connected: boolean;
  readings_count: number;
}
