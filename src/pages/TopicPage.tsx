import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LessonCard } from '@/components/learning/LessonCard';
import { useAuth } from '@/hooks/useAuth';
import { useLearningTopic } from '@/hooks/useLearning';
import { DIFFICULTY_CONFIG } from '@/lib/learning-types';

export function TopicPage() {
  const { track, topic: topicSlug } = useParams<{ track: string; topic: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useLearningTopic(track, topicSlug, user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading topic...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Topic not found</p>
        <Button variant="outline" onClick={() => navigate('/learning')}>
          Back to Learning
        </Button>
      </div>
    );
  }

  const { topic } = data;
  const difficultyConfig = DIFFICULTY_CONFIG[topic.difficulty];
  const totalMinutes = topic.lessons.reduce((sum, l) => sum + l.estimated_minutes, 0);

  const handleStartLearning = () => {
    // Find first incomplete lesson
    const incompleteLessons = topic.lessons.filter(
      (l) => !l.progress || l.progress.status !== 'complete'
    );
    if (incompleteLessons.length > 0) {
      navigate(`/learning/${track}/${topicSlug}/${incompleteLessons[0].slug}`);
    } else if (topic.lessons.length > 0) {
      navigate(`/learning/${track}/${topicSlug}/${topic.lessons[0].slug}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/learning" className="hover:text-foreground transition-colors">
          Learning
        </Link>
        <span>/</span>
        <Link to="/learning" className="hover:text-foreground transition-colors capitalize">
          {track}
        </Link>
        <span>/</span>
        <span className="text-foreground">{topic.title}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/learning')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
              <Badge variant="secondary" className={difficultyConfig.className}>
                {difficultyConfig.label}
              </Badge>
            </div>
            {topic.description && (
              <p className="text-muted-foreground">{topic.description}</p>
            )}
          </div>

          <Button onClick={handleStartLearning}>
            {topic.progress?.completed === topic.progress?.total 
              ? 'Review Lessons' 
              : 'Start Learning'}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {topic.lessons.length} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {totalMinutes} min total
          </span>
        </div>

        {/* Progress */}
        {topic.progress && (
          <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Your Progress</span>
              <span className="text-muted-foreground">
                {topic.progress.completed} of {topic.progress.total} complete
              </span>
            </div>
            <Progress value={topic.progress.percentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Lessons</h2>
        <div className="space-y-2">
          {topic.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              trackSlug={track!}
              topicSlug={topicSlug!}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
