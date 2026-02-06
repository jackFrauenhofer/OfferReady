-- =============================================
-- STREETREADY DATABASE MIGRATION SCRIPT
-- Run this in your new Supabase project's SQL Editor
-- =============================================

-- =============================================
-- 1. ENUMS
-- =============================================

CREATE TYPE public.call_event_status AS ENUM ('scheduled', 'completed', 'canceled');
CREATE TYPE public.connection_type AS ENUM ('cold', 'alumni', 'friend', 'referral');
CREATE TYPE public.contact_stage AS ENUM (
  'researching', 'messaged', 'scheduled', 'call_done', 
  'strong_connection', 'referral_requested', 'interview', 'offer'
);
CREATE TYPE public.flashcard_track AS ENUM ('technicals', 'behaviorals');
CREATE TYPE public.interaction_type AS ENUM ('email', 'call', 'coffee_chat');
CREATE TYPE public.lesson_status AS ENUM ('not_started', 'in_progress', 'complete');
CREATE TYPE public.mock_interview_difficulty AS ENUM ('core', 'common', 'advanced');
CREATE TYPE public.mock_interview_track AS ENUM ('technicals', 'behaviorals');
CREATE TYPE public.topic_difficulty AS ENUM ('core', 'common', 'advanced');

-- =============================================
-- 2. FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

-- =============================================
-- 3. TABLES
-- =============================================

-- Profiles
CREATE TABLE public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    email text,
    school text,
    graduation_year integer,
    recruiting_goal text DEFAULT 'Investment Banking',
    weekly_interactions_goal integer DEFAULT 10,
    weekly_flashcards_goal integer DEFAULT 20,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Contacts
CREATE TABLE public.contacts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    firm text,
    position text,
    group_name text,
    email text,
    phone text,
    connection_type public.connection_type DEFAULT 'cold',
    stage public.contact_stage DEFAULT 'researching',
    relationship_strength integer DEFAULT 1,
    notes_summary text,
    last_contacted_at timestamp with time zone,
    next_followup_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Call Events
CREATE TABLE public.call_events (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    status public.call_event_status NOT NULL DEFAULT 'scheduled',
    location text,
    notes text,
    external_event_id text,
    external_provider text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Interactions
CREATE TABLE public.interactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    type public.interaction_type NOT NULL,
    date timestamp with time zone NOT NULL DEFAULT now(),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
    call_event_id uuid REFERENCES public.call_events(id) ON DELETE SET NULL,
    title text NOT NULL,
    due_date date,
    completed boolean DEFAULT false,
    task_type text DEFAULT 'manual',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Learning Tracks
CREATE TABLE public.learning_tracks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Learning Topics
CREATE TABLE public.learning_topics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id uuid NOT NULL REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    difficulty public.topic_difficulty NOT NULL DEFAULT 'core',
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Learning Lessons
CREATE TABLE public.learning_lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id uuid NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    estimated_minutes integer NOT NULL DEFAULT 5,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Lesson Progress
CREATE TABLE public.user_lesson_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    status public.lesson_status NOT NULL DEFAULT 'not_started',
    confidence integer,
    last_viewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Flashcard Decks
CREATE TABLE public.flashcard_decks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    track public.flashcard_track NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Flashcards
CREATE TABLE public.flashcards (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id uuid NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    question text NOT NULL,
    answer text NOT NULL,
    difficulty text NOT NULL DEFAULT 'core',
    common_mistakes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Flashcard Progress
CREATE TABLE public.user_flashcard_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    times_seen integer NOT NULL DEFAULT 0,
    times_correct integer NOT NULL DEFAULT 0,
    confidence integer,
    last_reviewed_at timestamp with time zone,
    next_review_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, flashcard_id)
);

-- Mock Interview Sessions
CREATE TABLE public.mock_interview_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    track public.mock_interview_track NOT NULL,
    category text NOT NULL,
    difficulty public.mock_interview_difficulty NOT NULL DEFAULT 'core',
    session_length_minutes integer NOT NULL DEFAULT 15,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    ended_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Mock Interview Questions
CREATE TABLE public.mock_interview_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES public.mock_interview_sessions(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Mock Interview Answers
CREATE TABLE public.mock_interview_answers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES public.mock_interview_sessions(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.mock_interview_questions(id) ON DELETE CASCADE,
    transcript text,
    recording_url text,
    score_overall integer,
    score_breakdown_json jsonb,
    feedback text,
    suggested_answer text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Modelling Modules
CREATE TABLE public.modelling_modules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Modelling Steps
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

-- User Modelling Progress
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

-- User Resumes
CREATE TABLE public.user_resumes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    extracted_text text,
    uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- 4. TRIGGERS
-- =============================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_call_events_updated_at
    BEFORE UPDATE ON public.call_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_lesson_progress_updated_at
    BEFORE UPDATE ON public.user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_flashcard_progress_updated_at
    BEFORE UPDATE ON public.user_flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_modelling_modules_updated_at
    BEFORE UPDATE ON public.modelling_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_modelling_progress_updated_at
    BEFORE UPDATE ON public.user_modelling_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_resumes_updated_at
    BEFORE UPDATE ON public.user_resumes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelling_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelling_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modelling_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Call Events
CREATE POLICY "Users can view their own call events" ON public.call_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own call events" ON public.call_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own call events" ON public.call_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own call events" ON public.call_events FOR DELETE USING (auth.uid() = user_id);

-- Interactions
CREATE POLICY "Users can view their own interactions" ON public.interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interactions" ON public.interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.interactions FOR DELETE USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Learning Content (public read access)
CREATE POLICY "Anyone can view learning tracks" ON public.learning_tracks FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning topics" ON public.learning_topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning lessons" ON public.learning_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view flashcard decks" ON public.flashcard_decks FOR SELECT USING (true);
CREATE POLICY "Anyone can view flashcards" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Anyone can view modelling modules" ON public.modelling_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view modelling steps" ON public.modelling_steps FOR SELECT USING (true);

-- User Lesson Progress
CREATE POLICY "Users can view their own progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON public.user_lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- User Flashcard Progress
CREATE POLICY "Users can view their own flashcard progress" ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own flashcard progress" ON public.user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard progress" ON public.user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcard progress" ON public.user_flashcard_progress FOR DELETE USING (auth.uid() = user_id);

-- Mock Interview Sessions
CREATE POLICY "Users can view their own sessions" ON public.mock_interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.mock_interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.mock_interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.mock_interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- Mock Interview Questions (via session ownership)
CREATE POLICY "Users can view questions from their sessions" ON public.mock_interview_questions FOR SELECT 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can create questions for their sessions" ON public.mock_interview_questions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can update questions from their sessions" ON public.mock_interview_questions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can delete questions from their sessions" ON public.mock_interview_questions FOR DELETE 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- Mock Interview Answers (via session ownership)
CREATE POLICY "Users can view answers from their sessions" ON public.mock_interview_answers FOR SELECT 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can create answers for their sessions" ON public.mock_interview_answers FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can update answers from their sessions" ON public.mock_interview_answers FOR UPDATE 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can delete answers from their sessions" ON public.mock_interview_answers FOR DELETE 
USING (EXISTS (SELECT 1 FROM mock_interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- User Modelling Progress
CREATE POLICY "Users can view their own modelling progress" ON public.user_modelling_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own modelling progress" ON public.user_modelling_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own modelling progress" ON public.user_modelling_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own modelling progress" ON public.user_modelling_progress FOR DELETE USING (auth.uid() = user_id);

-- User Resumes
CREATE POLICY "Users can view their own resumes" ON public.user_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own resumes" ON public.user_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own resumes" ON public.user_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resumes" ON public.user_resumes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. STORAGE BUCKETS
-- =============================================

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload their own resumes" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" ON storage.objects 
FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resumes" ON storage.objects 
FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes" ON storage.objects 
FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- DONE! Your schema is ready.
-- Next step: Export your data from Lovable Cloud
-- and import it using CSV or INSERT statements.
-- =============================================
