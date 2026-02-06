import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find completed calls from more than 12 hours ago that don't have a thank-you task yet
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    // Get completed call events that are older than 12 hours
    const { data: completedCalls, error: callsError } = await supabase
      .from('call_events')
      .select(`
        id,
        user_id,
        contact_id,
        title,
        updated_at,
        contact:contacts(id, name, firm)
      `)
      .eq('status', 'completed')
      .lt('updated_at', twelveHoursAgo);

    if (callsError) {
      console.error('Error fetching completed calls:', callsError);
      throw callsError;
    }

    if (!completedCalls || completedCalls.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No eligible calls found', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing thank-you tasks to avoid duplicates
    const callIds = completedCalls.map((c) => c.id);
    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('call_event_id')
      .eq('task_type', 'thank_you')
      .in('call_event_id', callIds);

    if (tasksError) {
      console.error('Error fetching existing tasks:', tasksError);
      throw tasksError;
    }

    const existingCallIds = new Set(existingTasks?.map((t) => t.call_event_id) || []);

    // Filter out calls that already have thank-you tasks
    const callsNeedingTasks = completedCalls.filter((c) => !existingCallIds.has(c.id));

    if (callsNeedingTasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All eligible calls already have thank-you tasks', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create thank-you tasks for each eligible call
    const tasksToCreate = callsNeedingTasks.map((call) => {
      const contactName = call.contact?.name || 'your contact';
      return {
        user_id: call.user_id,
        title: `Send thank you note to ${contactName}`,
        task_type: 'thank_you',
        call_event_id: call.id,
        contact_id: call.contact_id,
        due_date: new Date().toISOString().split('T')[0], // Due today
      };
    });

    const { data: createdTasks, error: createError } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select();

    if (createError) {
      console.error('Error creating tasks:', createError);
      throw createError;
    }

    console.log(`Created ${createdTasks?.length || 0} thank-you tasks`);

    return new Response(
      JSON.stringify({
        message: `Successfully created ${createdTasks?.length || 0} thank-you tasks`,
        created: createdTasks?.length || 0,
        tasks: createdTasks,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-thankyou-tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
