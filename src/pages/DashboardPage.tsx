import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Phone, Activity, PhoneCall, Target, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useProfile } from '@/hooks/useProfile';
import { useUpcomingCalls, useCallEvents } from '@/hooks/useCallEvents';
import { useFlashcardMastery } from '@/hooks/useFlashcardMastery';
import { useTasks } from '@/hooks/useTasks';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';
import { MasteryCircle } from '@/components/dashboard/MasteryCircle';
import { ResumeUploader } from '@/components/dashboard/ResumeUploader';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { contacts, isLoading: contactsLoading } = useContacts(user?.id);
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: upcomingCalls = [], isLoading: callsLoading } = useUpcomingCalls(user?.id, 7);
  const { callEvents } = useCallEvents(user?.id);
  const { data: masteryData, isLoading: masteryLoading } = useFlashcardMastery(user?.id);
  const { tasks, toggleTaskComplete, isLoading: tasksLoading } = useTasks(user?.id);
  const navigate = useNavigate();

  // Fetch interactions for this week
  const { data: weeklyInteractions = [] } = useQuery({
    queryKey: ['weeklyInteractions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const showOnboarding = profile && !profile.onboarding_completed;

  const completedCallsCount = useMemo(() => {
    return callEvents.filter((event) => event.status === 'completed').length;
  }, [callEvents]);

  // Calculate weekly activity progress
  const weeklyProgress = useMemo(() => {
    const interactionsGoal = profile?.weekly_interactions_goal || 10;
    const flashcardsGoal = profile?.weekly_flashcards_goal || 20;
    const interactionsThisWeek = weeklyInteractions.length;
    const flashcardsThisWeek = masteryData?.studiedThisWeek || 0;
    
    return {
      interactions: {
        current: interactionsThisWeek,
        goal: interactionsGoal,
        percentage: Math.min((interactionsThisWeek / interactionsGoal) * 100, 100),
      },
      flashcards: {
        current: flashcardsThisWeek,
        goal: flashcardsGoal,
        percentage: Math.min((flashcardsThisWeek / flashcardsGoal) * 100, 100),
      },
    };
  }, [weeklyInteractions, profile, masteryData]);

  // Get pending tasks (sorted by due date, limited to 5)
  const pendingTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .slice(0, 5);
  }, [tasks]);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskComplete.mutateAsync({ id: taskId, completed: !completed });
      toast.success('Task completed!');
    } catch {
      toast.error('Failed to update task');
    }
  };

  if (profileLoading || contactsLoading || callsLoading || masteryLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <OnboardingModal open={!!showOnboarding} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <AddContactModal />
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interactions this week</span>
              <span className="font-medium">
                {weeklyProgress.interactions.current}/{weeklyProgress.interactions.goal}
              </span>
            </div>
            <Progress value={weeklyProgress.interactions.percentage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Flashcards studied this week</span>
              <span className="font-medium">
                {weeklyProgress.flashcards.current}/{weeklyProgress.flashcards.goal}
              </span>
            </div>
            <Progress value={weeklyProgress.flashcards.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mastery Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Flashcard Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MasteryCircle 
              studiedCards={masteryData?.masteredCards || 0} 
              totalCards={masteryData?.totalCards || 0} 
            />
          </CardContent>
        </Card>

        {/* Upcoming Calls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Upcoming Calls
              {upcomingCalls.length > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  {upcomingCalls.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming calls
              </p>
            ) : (
              upcomingCalls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate('/calendar')}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{call.contact?.name || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">
                      {call.contact?.firm || 'No firm'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(call.start_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Total Calls Had */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              Total Calls Had
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-4xl font-bold text-primary">{completedCallsCount}</span>
              <span className="text-sm text-muted-foreground mt-1">
                {completedCallsCount === 1 ? 'call completed' : 'calls completed'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks To Do */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks To Do
              {pendingTasks.length > 0 && (
                <span className="ml-1 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter((t) => !t.completed).length}
                </span>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No pending tasks
            </p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm truncate',
                      task.completed && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </p>
                    {task.contact && (
                      <span className="text-xs text-muted-foreground">
                        {task.contact.name}
                      </span>
                    )}
                  </div>
                  {task.task_type === 'thank_you' && (
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                      Thank You
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <ResumeUploader />
    </div>
  );
}
