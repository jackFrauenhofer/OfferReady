import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonWithProgress } from '@/lib/learning-types';

interface LessonCardProps {
  lesson: LessonWithProgress;
  trackSlug: string;
  topicSlug: string;
  index: number;
}

export function LessonCard({ lesson, trackSlug, topicSlug, index }: LessonCardProps) {
  const navigate = useNavigate();
  const status = lesson.progress?.status || 'not_started';

  const handleClick = () => {
    navigate(`/learning/${trackSlug}/${topicSlug}/${lesson.slug}`);
  };

  const StatusIcon = status === 'complete' 
    ? CheckCircle2 
    : status === 'in_progress' 
    ? PlayCircle 
    : Circle;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-200',
        'hover:bg-muted/50 hover:border-border',
        status === 'complete' && 'bg-primary/5 border-primary/20',
        status === 'in_progress' && 'bg-accent/50 border-accent',
        status === 'not_started' && 'border-border/50'
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
        status === 'complete' && 'bg-primary/10 text-primary',
        status === 'in_progress' && 'bg-accent text-accent-foreground',
        status === 'not_started' && 'bg-muted text-muted-foreground'
      )}>
        <StatusIcon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Lesson {index + 1}
          </span>
          {lesson.progress?.confidence && (
            <span className="text-xs text-muted-foreground">
              • Confidence: {lesson.progress.confidence}/5
            </span>
          )}
        </div>
        <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3.5 w-3.5" />
        {lesson.estimated_minutes} min
      </div>
    </button>
  );
}
