-- Create table for modelling prep modules (each model tutorial)
CREATE TABLE public.modelling_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for steps within each module
CREATE TABLE public.modelling_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.modelling_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  duration_seconds integer,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for user progress on modelling steps
CREATE TABLE public.user_modelling_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  step_id uuid NOT NULL REFERENCES public.modelling_steps(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Enable RLS on all tables
ALTER TABLE public.modelling_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelling_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modelling_progress ENABLE ROW LEVEL SECURITY;

-- Policies for modelling_modules (public read, admin write later)
CREATE POLICY "Anyone can view modelling modules"
ON public.modelling_modules
FOR SELECT
USING (true);

-- Policies for modelling_steps (public read)
CREATE POLICY "Anyone can view modelling steps"
ON public.modelling_steps
FOR SELECT
USING (true);

-- Policies for user_modelling_progress (user-specific CRUD)
CREATE POLICY "Users can view their own modelling progress"
ON public.user_modelling_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own modelling progress"
ON public.user_modelling_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modelling progress"
ON public.user_modelling_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modelling progress"
ON public.user_modelling_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_modelling_steps_module_id ON public.modelling_steps(module_id);
CREATE INDEX idx_user_modelling_progress_user_id ON public.user_modelling_progress(user_id);
CREATE INDEX idx_user_modelling_progress_step_id ON public.user_modelling_progress(step_id);

-- Add trigger for updated_at
CREATE TRIGGER update_modelling_modules_updated_at
BEFORE UPDATE ON public.modelling_modules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_modelling_progress_updated_at
BEFORE UPDATE ON public.user_modelling_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();