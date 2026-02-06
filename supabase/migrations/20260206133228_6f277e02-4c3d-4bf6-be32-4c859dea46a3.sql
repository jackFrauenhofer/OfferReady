-- Create track type enum for flashcards
CREATE TYPE flashcard_track AS ENUM ('technicals', 'behaviorals');

-- Create flashcard decks table
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track flashcard_track NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track, category)
);

-- Enable RLS on flashcard_decks
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

-- Anyone can view flashcard decks (public content)
CREATE POLICY "Anyone can view flashcard decks"
  ON public.flashcard_decks
  FOR SELECT
  USING (true);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  common_mistakes TEXT,
  difficulty TEXT NOT NULL DEFAULT 'core' CHECK (difficulty IN ('core', 'common', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deck_id, question)
);

-- Enable RLS on flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Anyone can view flashcards (public content)
CREATE POLICY "Anyone can view flashcards"
  ON public.flashcards
  FOR SELECT
  USING (true);

-- Create user flashcard progress table
CREATE TABLE public.user_flashcard_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  times_seen INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);

-- Enable RLS on user_flashcard_progress
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own flashcard progress"
  ON public.user_flashcard_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own progress
CREATE POLICY "Users can create their own flashcard progress"
  ON public.user_flashcard_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own flashcard progress"
  ON public.user_flashcard_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own flashcard progress"
  ON public.user_flashcard_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_flashcard_progress_updated_at
  BEFORE UPDATE ON public.user_flashcard_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();