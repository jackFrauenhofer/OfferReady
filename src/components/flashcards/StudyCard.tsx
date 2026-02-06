import { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FlashcardWithProgress } from '@/lib/flashcard-types';

interface StudyCardProps {
  card: FlashcardWithProgress;
  onAnswer: (correct: boolean) => void;
  isSubmitting: boolean;
}

export function StudyCard({ card, onAnswer, isSubmitting }: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    onAnswer(correct);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6">
      {/* Flip Card Container */}
      <div 
        className="relative min-h-[400px] cursor-pointer"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-500"
          )}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front - Question */}
          <div
            className="absolute inset-0 rounded-xl border border-border bg-card shadow-sm flex items-center justify-center p-8 min-h-[400px]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h2 className="text-xl font-semibold text-foreground text-center leading-relaxed">
              {card.question}
            </h2>
          </div>

          {/* Back - Answer */}
          <div
            className="absolute inset-0 rounded-xl border border-border bg-card shadow-sm p-8 min-h-[400px] overflow-y-auto"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex flex-col justify-center min-h-full space-y-6">
              <p className="text-lg text-foreground text-center leading-relaxed whitespace-pre-wrap">
                {card.answer}
              </p>

              {/* Common Mistakes */}
              {card.common_mistakes && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400 mb-2">
                        Common Mistakes
                      </h4>
                      <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                        {card.common_mistakes.split(' | ').map((mistake, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-400">•</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tap hint */}
      <p className="text-center text-sm text-muted-foreground">
        {isFlipped ? 'Tap to see question' : 'Tap to reveal answer'}
      </p>

      {/* Answer buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleAnswer(false);
          }}
          disabled={isSubmitting}
          className="h-14 w-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleAnswer(true);
          }}
          disabled={isSubmitting}
          className="h-14 w-14 rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
        >
          <Check className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}