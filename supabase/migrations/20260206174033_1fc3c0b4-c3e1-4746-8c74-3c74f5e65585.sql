-- Add weekly interactions goal to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_interactions_goal integer DEFAULT 10;