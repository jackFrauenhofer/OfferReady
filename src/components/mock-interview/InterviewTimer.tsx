import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface InterviewTimerProps {
  durationMinutes: number;
  onTimeUp?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function InterviewTimer({ 
  durationMinutes, 
  onTimeUp, 
  isRunning = true,
  className 
}: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft < 60;
  const isCritical = timeLeft < 30;

  return (
    <div
      className={cn(
        'font-mono text-2xl font-bold tabular-nums',
        isLow && !isCritical && 'text-orange-500',
        isCritical && 'text-destructive animate-pulse',
        !isLow && !isCritical && 'text-foreground',
        className
      )}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

interface AnswerTimerProps {
  durationSeconds?: number;
  onTimeUp?: () => void;
  isRunning: boolean;
  onReset?: () => void;
}

export function AnswerTimer({ 
  durationSeconds = 120, 
  onTimeUp, 
  isRunning,
}: AnswerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  const reset = useCallback(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  // Expose reset function
  useEffect(() => {
    if (!isRunning) {
      reset();
    }
  }, [isRunning, reset]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / durationSeconds) * 100;
  const isLow = timeLeft < 30;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Answer Time</span>
        <span 
          className={cn(
            'font-mono font-semibold tabular-nums',
            isLow ? 'text-destructive' : 'text-foreground'
          )}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-1000 ease-linear rounded-full',
            isLow ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
