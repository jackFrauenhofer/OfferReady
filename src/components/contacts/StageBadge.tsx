import { cn } from '@/lib/utils';
import { STAGE_CONFIG, type ContactStage } from '@/lib/types';

interface StageBadgeProps {
  stage: ContactStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage];
  
  return (
    <span className={cn('stage-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
