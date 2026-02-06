import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { LearningTopicWithLessons } from '@/lib/learning-types';
import { DIFFICULTY_CONFIG } from '@/lib/learning-types';

interface TopicCardProps {
  topic: LearningTopicWithLessons;
  trackSlug: string;
}

export function TopicCard({ topic, trackSlug }: TopicCardProps) {
  const navigate = useNavigate();
  const difficultyConfig = DIFFICULTY_CONFIG[topic.difficulty];
  const totalMinutes = topic.lessons.reduce((sum, l) => sum + l.estimated_minutes, 0);

  const handleClick = () => {
    navigate(`/learning/${trackSlug}/${topic.slug}`);
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Find first incomplete lesson
    const incompleteLessons = topic.lessons.filter(
      (l) => !('progress' in l) || (l as any).progress?.status !== 'complete'
    );
    if (incompleteLessons.length > 0) {
      navigate(`/learning/${trackSlug}/${topic.slug}/${incompleteLessons[0].slug}`);
    } else if (topic.lessons.length > 0) {
      navigate(`/learning/${trackSlug}/${topic.slug}/${topic.lessons[0].slug}`);
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-border"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-foreground truncate">{topic.title}</h3>
              <Badge variant="secondary" className={difficultyConfig.className}>
                {difficultyConfig.label}
              </Badge>
            </div>
            
            {topic.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {topic.lessons.length} lesson{topic.lessons.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {totalMinutes} min
              </span>
            </div>

            {topic.progress && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {topic.progress.completed}/{topic.progress.total}
                  </span>
                </div>
                <Progress value={topic.progress.percentage} className="h-1.5" />
              </div>
            )}
          </div>

          <Button 
            size="sm" 
            variant="ghost" 
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
