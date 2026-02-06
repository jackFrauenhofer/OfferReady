import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { ModellingModule } from '@/hooks/useModelling';

interface ModellingModuleCardProps {
  module: ModellingModule;
}

export function ModellingModuleCard({ module }: ModellingModuleCardProps) {
  const navigate = useNavigate();
  const totalDuration = module.steps?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
  const durationMinutes = Math.ceil(totalDuration / 60);

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
      onClick={() => navigate(`/learning/modelling/${module.id}`)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
        {module.thumbnail_url ? (
          <img 
            src={module.thumbnail_url} 
            alt={module.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Play className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start Module
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium line-clamp-2">
          {module.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {module.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {module.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            {module.steps?.length || 0} steps
          </span>
          {durationMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {durationMinutes} min
            </span>
          )}
          {module.progress && module.progress.completed > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle2 className="h-3 w-3" />
              {module.progress.completed}/{module.progress.total}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {module.progress && module.progress.total > 0 && (
          <div className="space-y-1">
            <Progress value={module.progress.percentage} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">
              {module.progress.percentage}% complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
