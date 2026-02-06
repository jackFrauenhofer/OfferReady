import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Layers, Target, TrendingUp, TrendingDown, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFlashcardDeck, useResetDeckProgress } from '@/hooks/useFlashcards';
import { DIFFICULTY_CONFIG, CONFIDENCE_CONFIG } from '@/lib/flashcard-types';
import { toast } from 'sonner';

export function FlashcardDeckPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data, isLoading } = useFlashcardDeck(deckId, user?.id);
  const resetProgress = useResetDeckProgress(user?.id);

  const handleReset = async () => {
    if (!deckId) return;
    try {
      await resetProgress.mutateAsync(deckId);
      toast.success('Progress reset successfully');
    } catch {
      toast.error('Failed to reset progress');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading deck...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Deck not found</p>
        <Button variant="link" onClick={() => navigate('/learning')}>
          Back to Learning
        </Button>
      </div>
    );
  }

  const { deck, flashcards } = data;

  // Calculate stats
  const totalCards = flashcards.length;
  const studiedCards = flashcards.filter(f => f.progress).length;
  const masteredCards = flashcards.filter(f => f.progress?.confidence && f.progress.confidence >= 4).length;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const now = new Date();
  const dueCards = flashcards.filter(f => {
    if (!f.progress) return true;
    if (!f.progress.next_review_at) return true;
    return new Date(f.progress.next_review_at) <= now;
  });

  // Group by difficulty
  const byDifficulty = flashcards.reduce((acc, card) => {
    acc[card.difficulty] = acc[card.difficulty] || [];
    acc[card.difficulty].push(card);
    return acc;
  }, {} as Record<string, typeof flashcards>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/learning">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{deck.category}</h1>
          <p className="text-muted-foreground capitalize">{deck.track} Track</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={resetProgress.isPending || studiedCards === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          <Button onClick={() => navigate(`/learning/flashcards/${deckId}/study`)} size="lg">
            <Play className="h-4 w-4 mr-2" />
            {dueCards.length > 0 ? `Study ${dueCards.length} Due` : 'Start Practice'}
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCards}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studiedCards}</p>
                <p className="text-sm text-muted-foreground">Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masteryPercentage}%</p>
                <p className="text-sm text-muted-foreground">Mastery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCards.length}</p>
                <p className="text-sm text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={masteryPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{masteredCards} mastered</span>
            <span>{totalCards - masteredCards} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Cards by difficulty */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cards by Difficulty</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(['core', 'common', 'advanced'] as const).map(difficulty => {
            const cards = byDifficulty[difficulty] || [];
            const config = DIFFICULTY_CONFIG[difficulty];
            const mastered = cards.filter(c => c.progress?.confidence && c.progress.confidence >= 4).length;
            const percentage = cards.length > 0 ? Math.round((mastered / cards.length) * 100) : 0;

            return (
              <Card key={difficulty}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={config.className}>{config.label}</Badge>
                    <span className="text-sm text-muted-foreground">{cards.length} cards</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">{percentage}% mastered</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {studiedCards > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Cards</h2>
          <div className="grid gap-2">
            {flashcards
              .filter(f => f.progress)
              .sort((a, b) => {
                const dateA = a.progress?.last_reviewed_at || '';
                const dateB = b.progress?.last_reviewed_at || '';
                return dateB.localeCompare(dateA);
              })
              .slice(0, 5)
              .map(card => {
                const confidence = card.progress?.confidence as 1 | 2 | 3 | 4 | 5 | undefined;
                const config = confidence ? CONFIDENCE_CONFIG[confidence] : null;

                return (
                  <Card key={card.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium line-clamp-1 flex-1">{card.question}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={DIFFICULTY_CONFIG[card.difficulty].className}>
                          {DIFFICULTY_CONFIG[card.difficulty].label}
                        </Badge>
                        {config && (
                          <span className={config.color}>{config.emoji}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
