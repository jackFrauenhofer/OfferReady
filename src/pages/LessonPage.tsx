import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LessonContent } from '@/components/learning/LessonContent';
import { QuickDrill } from '@/components/learning/QuickDrill';
import { ConfidenceRating } from '@/components/learning/ConfidenceRating';
import { useAuth } from '@/hooks/useAuth';
import { useLearningLesson, useUpdateLessonProgress } from '@/hooks/useLearning';
import { toast } from 'sonner';

export function LessonPage() {
  const { track, topic, lesson: lessonSlug } = useParams<{ 
    track: string; 
    topic: string; 
    lesson: string 
  }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useLearningLesson(track, topic, lessonSlug, user?.id);
  const updateProgress = useUpdateLessonProgress(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading lesson...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Lesson not found</p>
        <Button variant="outline" onClick={() => navigate('/learning')}>
          Back to Learning
        </Button>
      </div>
    );
  }

  const { lesson, prevLesson, nextLesson, currentIndex, totalLessons } = data;
  const isComplete = lesson.progress?.status === 'complete';

  const handleMarkComplete = async () => {
    if (!user) {
      toast.error('Please sign in to track progress');
      return;
    }

    try {
      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        status: isComplete ? 'in_progress' : 'complete',
      });
      toast.success(isComplete ? 'Marked as in progress' : 'Lesson completed!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleConfidenceChange = async (confidence: number) => {
    if (!user) {
      toast.error('Please sign in to track progress');
      return;
    }

    try {
      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        confidence,
      });
      toast.success('Confidence saved');
    } catch (error) {
      toast.error('Failed to save confidence');
    }
  };

  const handlePrev = () => {
    if (prevLesson) {
      navigate(`/learning/${track}/${topic}/${prevLesson.slug}`);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/learning/${track}/${topic}/${nextLesson.slug}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
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
        <Link 
          to={`/learning/${track}/${topic}`} 
          className="hover:text-foreground transition-colors"
        >
          {data.topic.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/learning/${track}/${topic}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {data.topic.title}
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Lesson {currentIndex} of {totalLessons}
            </p>
            <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lesson.estimated_minutes} min
            </span>
            <Button
              variant={isComplete ? 'outline' : 'default'}
              onClick={handleMarkComplete}
              disabled={updateProgress.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isComplete ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <LessonContent content={lesson.content} />
          <QuickDrill content={lesson.content} />
        </CardContent>
      </Card>

      {/* Confidence Rating */}
      {user && (
        <Card>
          <CardContent className="p-6">
            <ConfidenceRating
              value={lesson.progress?.confidence ?? null}
              onChange={handleConfidenceChange}
              disabled={updateProgress.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={!prevLesson}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {prevLesson ? prevLesson.title : 'No previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!nextLesson}
        >
          {nextLesson ? nextLesson.title : 'Complete!'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
