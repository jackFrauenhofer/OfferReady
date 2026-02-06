import { cn } from '@/lib/utils';

interface RelationshipStrengthProps {
  strength: number;
  size?: 'sm' | 'md';
}

export function RelationshipStrength({ strength, size = 'sm' }: RelationshipStrengthProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  
  return (
    <div className="flex items-center gap-0.5" title={`Relationship strength: ${strength}/5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={cn(
            dotSize,
            'rounded-full transition-colors',
            level <= strength
              ? 'bg-primary'
              : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}
