-- Add weekly flashcards goal to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_flashcards_goal integer DEFAULT 20;