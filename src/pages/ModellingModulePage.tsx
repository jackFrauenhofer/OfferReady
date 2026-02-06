import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useModellingModule, useMarkStepComplete } from '@/hooks/useModelling';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ModellingModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: module, isLoading } = useModellingModule(moduleId, user?.id);
  const markComplete = useMarkStepComplete(user?.id);

  const handleToggleComplete = async (stepId: string, currentCompleted: boolean) => {
    try {
      await markComplete.mutateAsync({ stepId, completed: !currentCompleted });
      toast.success(!currentCompleted ? 'Step marked complete!' : 'Step marked incomplete');
    } catch {
      toast.error('Failed to update progress');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading module...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Module not found</p>
        <Button variant="link" onClick={() => navigate('/learning')}>
          Back to Learning
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/learning')}
          className="mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
          {module.description && (
            <p className="text-muted-foreground mt-1">{module.description}</p>
          )}
        </div>
      </div>

      {/* Progress overview */}
      {module.progress && module.progress.total > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {module.progress.completed} of {module.progress.total} steps completed
              </span>
            </div>
            <Progress value={module.progress.percentage} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Steps list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Steps</h2>
        
        {!module.steps || module.steps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No steps have been added to this module yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for video tutorials!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {module.steps.map((step, index) => {
              const durationMinutes = step.duration_seconds 
                ? Math.ceil(step.duration_seconds / 60) 
                : null;

              return (
                <Card 
                  key={step.id}
                  className={cn(
                    'transition-colors',
                    step.completed && 'bg-muted/50'
                  )}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-0.5">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleToggleComplete(step.id, step.completed || false)}
                          className="h-5 w-5"
                        />
                      </div>

                      {/* Step number */}
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        step.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'font-medium',
                          step.completed && 'text-muted-foreground line-through'
                        )}>
                          {step.title}
                        </h3>
                        {step.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {durationMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {durationMinutes} min
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video button */}
                      {step.video_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(step.video_url!, '_blank');
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
