-- Add task_type column to distinguish auto-generated vs manual tasks
-- Also add call_event_id to link thank-you tasks to their originating call
ALTER TABLE public.tasks 
ADD COLUMN task_type text DEFAULT 'manual',
ADD COLUMN call_event_id uuid REFERENCES public.call_events(id) ON DELETE SET NULL;

-- Create index for efficient querying
CREATE INDEX idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX idx_tasks_call_event_id ON public.tasks(call_event_id);

-- Add a unique constraint to prevent duplicate thank-you tasks for the same call
CREATE UNIQUE INDEX idx_tasks_unique_thankyou_per_call 
ON public.tasks(call_event_id) 
WHERE task_type = 'thank_you' AND call_event_id IS NOT NULL;