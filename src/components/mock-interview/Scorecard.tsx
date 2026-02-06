import { CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { ScoreBreakdown } from '@/lib/mock-interview-types';

interface ScorecardProps {
  overallScore: number;
  breakdown: ScoreBreakdown;
  feedback: string;
  suggestedAnswer: string;
  onNextQuestion: () => void;
}

const SCORE_LABELS: Record<keyof ScoreBreakdown, string> = {
  structure: 'Structure',
  clarity: 'Clarity',
  specificity: 'Specificity',
  confidence: 'Confidence',
  conciseness: 'Conciseness',
};

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-destructive';
}

function getOverallScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-destructive';
}

export function Scorecard({ 
  overallScore, 
  breakdown, 
  feedback, 
  suggestedAnswer,
  onNextQuestion 
}: ScorecardProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={getOverallScoreColor(overallScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 42}`,
                    strokeDashoffset: `${2 * Math.PI * 42 * (1 - overallScore / 100)}`,
                    stroke: 'currentColor',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{overallScore}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {Object.entries(breakdown).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {SCORE_LABELS[key as keyof ScoreBreakdown]}
                    </span>
                    <span className={`font-medium ${getScoreColor(value)}`}>
                      {value}/10
                    </span>
                  </div>
                  <Progress value={value * 10} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
        </CardContent>
      </Card>

      {/* Suggested Answer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Suggested Improved Answer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {suggestedAnswer}
          </p>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onNextQuestion} size="lg">
          Next Question
        </Button>
      </div>
    </div>
  );
}

// Placeholder scorecard with fake data
export function PlaceholderScorecard({ onNextQuestion }: { onNextQuestion: () => void }) {
  const placeholderData = {
    overallScore: 72,
    breakdown: {
      structure: 8,
      clarity: 7,
      specificity: 6,
      confidence: 8,
      conciseness: 7,
    },
    feedback: "Good job structuring your answer with the STAR method. You clearly outlined the situation and your actions. To improve, try to be more specific about the quantitative impact of your actions - numbers and metrics make your examples more compelling. Also, consider being more concise in the setup to leave more time for the resolution.",
    suggestedAnswer: "In my role as [Position] at [Company], I led a cross-functional team of 5 to redesign our customer onboarding process.\n\nThe challenge: Customer churn within the first 30 days was 25%, significantly above our target of 15%.\n\nMy approach:\n1. Analyzed user behavior data to identify drop-off points\n2. Implemented a 3-phase onboarding sequence with personalized touchpoints\n3. Created automated check-ins at days 7, 14, and 21\n\nThe result: First-month churn decreased to 12%, saving approximately $500K annually in customer acquisition costs. The framework was later adopted across all product lines.",
  };

  return (
    <Scorecard
      {...placeholderData}
      onNextQuestion={onNextQuestion}
    />
  );
}
