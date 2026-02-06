import { useParams } from 'react-router-dom';
import { SessionSummary } from '@/components/mock-interview/SessionSummary';
import { useMockInterviewSession } from '@/hooks/useMockInterview';

export function MockInterviewSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, questions, answers, isLoading } = useMockInterviewSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading summary...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Session not found.</div>
      </div>
    );
  }

  return (
    <SessionSummary 
      session={session} 
      questions={questions} 
      answers={answers} 
    />
  );
}
