import { cn } from '@/lib/utils';

interface ConfidenceRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const CONFIDENCE_LABELS = [
  { value: 1, label: 'Not confident', emoji: '😰' },
  { value: 2, label: 'Somewhat unsure', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Confident', emoji: '🙂' },
  { value: 5, label: 'Very confident', emoji: '😎' },
];

export function ConfidenceRating({ value, onChange, disabled }: ConfidenceRatingProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        How confident do you feel about this material?
      </label>
      <div className="flex gap-2">
        {CONFIDENCE_LABELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            disabled={disabled}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
              'hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed',
              value === level.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            )}
            title={level.label}
          >
            <span className="text-xl">{level.emoji}</span>
            <span className="text-xs">{level.value}</span>
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs text-center text-muted-foreground">
          {CONFIDENCE_LABELS.find((l) => l.value === value)?.label}
        </p>
      )}
    </div>
  );
}
