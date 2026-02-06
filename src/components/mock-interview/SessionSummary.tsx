import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { 
  MockInterviewSession, 
  MockInterviewQuestion, 
  MockInterviewAnswer 
} from '@/lib/mock-interview-types';

interface SessionSummaryProps {
  session: MockInterviewSession;
  questions: MockInterviewQuestion[];
  answers: MockInterviewAnswer[];
}

export function SessionSummary({ session, questions, answers }: SessionSummaryProps) {
  const answersByQuestionId = new Map(answers.map(a => [a.question_id, a]));
  
  const totalQuestions = questions.length;
  const scoredAnswers = answers.filter(a => a.score_overall !== null);
  const averageScore = scoredAnswers.length > 0
    ? Math.round(scoredAnswers.reduce((sum, a) => sum + (a.score_overall ?? 0), 0) / scoredAnswers.length)
    : null;

  const formatTrack = (track: string) => {
    return track.charAt(0).toUpperCase() + track.slice(1);
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/mock-interview">
        <Button variant="ghost" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Mock Interview
        </Button>
      </Link>

      {/* Session Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Track</p>
              <p className="font-medium">{formatTrack(session.track)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{session.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="font-medium">{formatDifficulty(session.difficulty)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Session Length</p>
              <p className="font-medium">{session.session_length_minutes} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions Attempted</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {averageScore !== null ? averageScore : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{session.session_length_minutes}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-24 text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => {
                  const answer = answersByQuestionId.get(question.id);
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {question.question_text}
                      </TableCell>
                      <TableCell className="text-center">
                        {answer?.score_overall !== null && answer?.score_overall !== undefined ? (
                          <span className={`font-medium ${
                            answer.score_overall >= 80 ? 'text-green-600' :
                            answer.score_overall >= 60 ? 'text-yellow-600' :
                            'text-destructive'
                          }`}>
                            {answer.score_overall}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No questions were answered in this session.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-center">
        <Link to="/mock-interview">
          <Button>Start New Session</Button>
        </Link>
      </div>
    </div>
  );
}
