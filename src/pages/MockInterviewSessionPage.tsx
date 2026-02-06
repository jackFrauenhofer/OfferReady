import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InterviewTimer } from '@/components/mock-interview/InterviewTimer';
import { AIInterviewerPanel } from '@/components/mock-interview/AIInterviewerPanel';
import { AnswerRecorder } from '@/components/mock-interview/AnswerRecorder';
import { PlaceholderScorecard } from '@/components/mock-interview/Scorecard';
import { useMockInterviewSession } from '@/hooks/useMockInterview';
import { useMockInterview } from '@/hooks/useMockInterview';
import { FALLBACK_QUESTIONS, type AnswerState, type ScoreBreakdown } from '@/lib/mock-interview-types';

export function MockInterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, questions, isLoading, addQuestion, addAnswer } = useMockInterviewSession(sessionId);
  const { endSession } = useMockInterview();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Get current question from DB or generate new one
  const currentQuestion = questions[currentQuestionIndex];

  // Generate first question when session loads
  useEffect(() => {
    if (session && questions.length === 0 && !addQuestion.isPending) {
      const categoryQuestions = FALLBACK_QUESTIONS[session.category] || [];
      const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)] 
        || 'Tell me about yourself.';
      
      addQuestion.mutate({ questionText: randomQuestion, orderIndex: 0 });
    }
  }, [session, questions.length, addQuestion]);

  const handleAnswerComplete = useCallback(() => {
    // Generate placeholder scores
    const placeholderBreakdown: ScoreBreakdown = {
      structure: Math.floor(Math.random() * 4) + 6,
      clarity: Math.floor(Math.random() * 4) + 6,
      specificity: Math.floor(Math.random() * 4) + 5,
      confidence: Math.floor(Math.random() * 4) + 6,
      conciseness: Math.floor(Math.random() * 4) + 6,
    };
    
    const overallScore = Math.round(
      Object.values(placeholderBreakdown).reduce((a, b) => a + b, 0) / 5 * 10
    );

    if (currentQuestion) {
      addAnswer.mutate({
        questionId: currentQuestion.id,
        scoreOverall: overallScore,
        scoreBreakdown: placeholderBreakdown,
        feedback: 'Good job structuring your answer. Consider being more specific with quantitative examples to strengthen your response.',
        suggestedAnswer: 'This is a placeholder for an AI-generated improved answer that would be provided once the AI scoring is implemented.',
      });
    }

    setAnswerState('scored');
  }, [currentQuestion, addAnswer]);

  const handleNextQuestion = useCallback(() => {
    if (!session) return;

    // Generate next question
    const categoryQuestions = FALLBACK_QUESTIONS[session.category] || [];
    const usedQuestions = questions.map(q => q.question_text);
    const availableQuestions = categoryQuestions.filter(q => !usedQuestions.includes(q));
    
    const nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      || categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)]
      || 'Tell me about a challenging situation you faced.';

    addQuestion.mutate({ 
      questionText: nextQuestion, 
      orderIndex: questions.length 
    });

    setCurrentQuestionIndex(prev => prev + 1);
    setAnswerState('idle');
  }, [session, questions, addQuestion]);

  const handleTimeUp = useCallback(() => {
    setIsSessionActive(false);
    handleEndSession();
  }, []);

  const handleEndSession = useCallback(async () => {
    if (sessionId) {
      await endSession.mutateAsync(sessionId);
      navigate(`/mock-interview/session/${sessionId}/summary`);
    }
  }, [sessionId, endSession, navigate]);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-6">
          <InterviewTimer 
            durationMinutes={session.session_length_minutes} 
            onTimeUp={handleTimeUp}
            isRunning={isSessionActive}
          />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Q{currentQuestionIndex + 1}</span>
            {' '}• {session.category}
          </div>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setShowEndConfirm(true)}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          End Session
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Interviewer */}
        <div className="space-y-6">
          {currentQuestion ? (
            <AIInterviewerPanel 
              question={currentQuestion.question_text}
              questionNumber={currentQuestionIndex + 1}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading question...</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Your Answer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              {answerState !== 'scored' ? (
                <AnswerRecorder
                  onComplete={handleAnswerComplete}
                  answerState={answerState}
                  onStateChange={setAnswerState}
                />
              ) : (
                <PlaceholderScorecard onNextQuestion={handleNextQuestion} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* End Session Confirmation */}
      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this mock interview session? 
              You've answered {questions.length} question{questions.length !== 1 ? 's' : ''} so far.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Session</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndSession}>
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
