-- Create enum for mock interview track
CREATE TYPE public.mock_interview_track AS ENUM ('technicals', 'behaviorals');

-- Create enum for mock interview difficulty
CREATE TYPE public.mock_interview_difficulty AS ENUM ('core', 'common', 'advanced');

-- Create mock_interview_sessions table
CREATE TABLE public.mock_interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track mock_interview_track NOT NULL,
  category TEXT NOT NULL,
  difficulty mock_interview_difficulty NOT NULL DEFAULT 'core',
  session_length_minutes INTEGER NOT NULL DEFAULT 15,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mock_interview_questions table
CREATE TABLE public.mock_interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.mock_interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mock_interview_answers table
CREATE TABLE public.mock_interview_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.mock_interview_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.mock_interview_questions(id) ON DELETE CASCADE,
  recording_url TEXT,
  transcript TEXT,
  score_overall INTEGER,
  score_breakdown_json JSONB,
  feedback TEXT,
  suggested_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies for mock_interview_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.mock_interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.mock_interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.mock_interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.mock_interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for mock_interview_questions (based on session ownership)
CREATE POLICY "Users can view questions from their sessions"
  ON public.mock_interview_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can create questions for their sessions"
  ON public.mock_interview_questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can update questions from their sessions"
  ON public.mock_interview_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions from their sessions"
  ON public.mock_interview_questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

-- RLS policies for mock_interview_answers (based on session ownership)
CREATE POLICY "Users can view answers from their sessions"
  ON public.mock_interview_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can create answers for their sessions"
  ON public.mock_interview_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can update answers from their sessions"
  ON public.mock_interview_answers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete answers from their sessions"
  ON public.mock_interview_answers FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.mock_interview_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));