-- Create call_event_status enum
CREATE TYPE public.call_event_status AS ENUM ('scheduled', 'completed', 'canceled');

-- Create call_events table
CREATE TABLE public.call_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  notes TEXT,
  status call_event_status NOT NULL DEFAULT 'scheduled',
  external_provider TEXT,
  external_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own call events"
  ON public.call_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own call events"
  ON public.call_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call events"
  ON public.call_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own call events"
  ON public.call_events FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_call_events_updated_at
  BEFORE UPDATE ON public.call_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index for efficient querying by user and date range
CREATE INDEX idx_call_events_user_start ON public.call_events(user_id, start_at);