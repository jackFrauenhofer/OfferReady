// Flashcard Module Type Definitions

export type FlashcardTrack = 'technicals' | 'behaviorals';
export type FlashcardDifficulty = 'core' | 'common' | 'advanced';
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface FlashcardDeck {
  id: string;
  track: FlashcardTrack;
  category: string;
  description: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  common_mistakes: string | null;
  difficulty: FlashcardDifficulty;
  created_at: string;
}

export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  confidence: ConfidenceLevel | null;
  last_reviewed_at: string | null;
  times_seen: number;
  times_correct: number;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlashcardWithProgress extends Flashcard {
  progress?: UserFlashcardProgress;
}

export interface DeckWithStats extends FlashcardDeck {
  totalCards: number;
  studiedCards: number;
  masteryPercentage: number;
  dueToday: number;
  strongestTopics: string[];
  weakestTopics: string[];
}

export const DIFFICULTY_CONFIG: Record<FlashcardDifficulty, { label: string; className: string }> = {
  core: { label: 'Core', className: 'bg-primary/10 text-primary' },
  common: { label: 'Common', className: 'bg-accent text-accent-foreground' },
  advanced: { label: 'Advanced', className: 'bg-muted text-muted-foreground' },
};

export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; emoji: string; color: string }> = {
  1: { label: 'Again', emoji: '🔴', color: 'text-destructive' },
  2: { label: 'Hard', emoji: '🟠', color: 'text-orange-500' },
  3: { label: 'Good', emoji: '🟡', color: 'text-yellow-500' },
  4: { label: 'Easy', emoji: '🟢', color: 'text-green-500' },
  5: { label: 'Perfect', emoji: '⭐', color: 'text-primary' },
};
