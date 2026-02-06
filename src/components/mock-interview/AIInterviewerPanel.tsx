import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface AIInterviewerPanelProps {
  question: string;
  questionNumber: number;
}

export function AIInterviewerPanel({ question, questionNumber }: AIInterviewerPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    // Placeholder: simulate audio playback
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">Q{questionNumber}</span>
            AI Interviewer
          </CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            AI voice playback (coming soon)
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg leading-relaxed">{question}</p>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <VolumeX className="h-4 w-4" />
              Playing...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Play Question Audio
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
