// Learning Module Type Definitions

export type LessonStatus = 'not_started' | 'in_progress' | 'complete';
export type TopicDifficulty = 'core' | 'common' | 'advanced';

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface LearningTopic {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  difficulty: TopicDifficulty;
  created_at: string;
}

export interface LearningLesson {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  content: string;
  order_index: number;
  estimated_minutes: number;
  created_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonStatus;
  confidence: number | null;
  last_viewed_at: string | null;
  updated_at: string;
  created_at: string;
}

// Extended types with relations
export interface LearningTopicWithLessons extends LearningTopic {
  lessons: LessonWithProgress[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface LearningTrackWithTopics extends LearningTrack {
  topics: LearningTopicWithLessons[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface LessonWithProgress extends LearningLesson {
  progress?: UserLessonProgress;
  topic?: LearningTopic;
}

export const DIFFICULTY_CONFIG: Record<TopicDifficulty, { label: string; className: string }> = {
  core: { label: 'Core', className: 'bg-primary/10 text-primary' },
  common: { label: 'Common', className: 'bg-accent text-accent-foreground' },
  advanced: { label: 'Advanced', className: 'bg-muted text-muted-foreground' },
};
