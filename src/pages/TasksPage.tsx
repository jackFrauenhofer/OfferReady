import { useState, useMemo } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Check, Trash2, Heart, ListTodo, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading, createTask, toggleTaskComplete, deleteTask } = useTasks(user?.id);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Separate tasks by type
  const { thankYouTasks, manualTasks } = useMemo(() => {
    const thankYou = tasks.filter((t) => t.task_type === 'thank_you');
    const manual = tasks.filter((t) => t.task_type !== 'thank_you');
    return { thankYouTasks: thankYou, manualTasks: manual };
  }, [tasks]);

  // Further separate by completion status
  const pendingThankYou = thankYouTasks.filter((t) => !t.completed);
  const completedThankYou = thankYouTasks.filter((t) => t.completed);
  const pendingManual = manualTasks.filter((t) => !t.completed);
  const completedManual = manualTasks.filter((t) => t.completed);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await createTask.mutateAsync({
        title: newTaskTitle.trim(),
        due_date: newTaskDueDate || null,
      });
      toast.success('Task created');
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setDialogOpen(false);
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleToggleComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      await toggleTaskComplete.mutateAsync({ id: taskId, completed: !currentCompleted });
      toast.success(!currentCompleted ? 'Task completed!' : 'Task reopened');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">
            {pendingThankYou.length + pendingManual.length} pending tasks
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateTask}
                disabled={createTask.isPending}
                className="w-full"
              >
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thank You Tasks Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-destructive" />
            Thank You Notes
            {pendingThankYou.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingThankYou.length} pending
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Auto-generated reminders to send thank you notes after calls
          </p>
        </CardHeader>
        <CardContent>
          {pendingThankYou.length === 0 && completedThankYou.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No thank you tasks yet. They'll appear here 12 hours after completing a call.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingThankYou.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                />
              ))}
              {completedThankYou.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Completed ({completedThankYou.length})
                  </p>
                  {completedThankYou.slice(0, 5).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Tasks Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-5 w-5 text-primary" />
            My Tasks
            {pendingManual.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingManual.length} pending
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your personal to-do list</p>
        </CardHeader>
        <CardContent>
          {pendingManual.length === 0 && completedManual.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                No tasks yet. Create one to get started!
              </p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingManual.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDelete}
                />
              ))}
              {completedManual.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Completed ({completedManual.length})
                  </p>
                  {completedManual.slice(0, 5).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    due_date: string | null;
    contact?: { id: string; name: string; firm: string | null } | null;
  };
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group',
        task.completed && 'opacity-60'
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id, task.completed)}
        className="h-5 w-5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.contact && (
            <span className="text-xs text-muted-foreground">
              {task.contact.name}
              {task.contact.firm && ` @ ${task.contact.firm}`}
            </span>
          )}
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && !task.completed && 'text-destructive',
                isDueToday && !task.completed && 'text-warning',
                !isOverdue && !isDueToday && 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
