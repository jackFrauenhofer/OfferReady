import { useMemo } from 'react';

interface MasteryCircleProps {
  studiedCards: number;
  totalCards: number;
}

export function MasteryCircle({ studiedCards, totalCards }: MasteryCircleProps) {
  const percentage = useMemo(() => {
    if (totalCards === 0) return 0;
    return Math.round((studiedCards / totalCards) * 100);
  }, [studiedCards, totalCards]);

  const isComplete = percentage === 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ease-out ${
              isComplete ? 'text-green-500' : 'text-primary'
            }`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${isComplete ? 'text-green-500' : 'text-foreground'}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-2">
        {studiedCards} / {totalCards} cards mastered
      </span>
      {isComplete && (
        <span className="text-sm font-medium text-green-500 mt-1">
          All cards mastered! 🎉
        </span>
      )}
    </div>
  );
}
