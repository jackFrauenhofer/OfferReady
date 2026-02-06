import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DrillPrompt {
  question: string;
  answer: string;
}

interface QuickDrillProps {
  content: string;
}

export function QuickDrill({ content }: QuickDrillProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const prompts = useMemo(() => {
    return extractDrillPrompts(content);
  }, [content]);

  if (prompts.length === 0) return null;

  const currentPrompt = prompts[currentIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  const handleReset = () => {
    setShowAnswer(false);
    setCurrentIndex(0);
  };

  return (
    <Card className="mt-8 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            🎯 Quick Drill
            <span className="text-sm font-normal text-muted-foreground">
              ({currentIndex + 1} of {prompts.length})
            </span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[120px]">
          <div className="mb-4">
            <p className="font-medium text-foreground">{currentPrompt.question}</p>
          </div>

          {showAnswer ? (
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentPrompt.answer}
              </p>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAnswer(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Reveal Answer
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {prompts.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function extractDrillPrompts(content: string): DrillPrompt[] {
  const prompts: DrillPrompt[] = [];
  
  // Find the Mini Drill section
  const drillMatch = content.match(/## Mini Drill[\s\S]*?(?=## |$)/i);
  if (!drillMatch) return prompts;

  const drillContent = drillMatch[0];
  
  // Extract numbered prompts with answers
  // Format: 1. **Question?** Answer text
  const promptRegex = /\d+\.\s*\*\*(.*?)\*\*\s*([\s\S]*?)(?=\d+\.\s*\*\*|$)/g;
  let match;

  while ((match = promptRegex.exec(drillContent)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().replace(/^[-–]\s*/, '');
    if (question && answer) {
      prompts.push({ question, answer });
    }
  }

  // Fallback: simple numbered list
  if (prompts.length === 0) {
    const simpleRegex = /\d+\.\s*(.*?)(?=\d+\.|$)/gs;
    while ((match = simpleRegex.exec(drillContent)) !== null) {
      const text = match[1].trim();
      if (text) {
        prompts.push({ 
          question: text.split('\n')[0], 
          answer: 'Think through your answer, then check with your study materials.' 
        });
      }
    }
  }

  return prompts;
}
