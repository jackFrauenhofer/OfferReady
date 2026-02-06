import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useInteractions } from '@/hooks/useInteractions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const notesSchema = z.object({
  notes: z.string().min(1, 'Please add notes about your call'),
});

type NotesFormData = z.infer<typeof notesSchema>;

interface CallNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  onComplete: () => void;
}

export function CallNotesModal({
  open,
  onOpenChange,
  contactId,
  contactName,
  onComplete,
}: CallNotesModalProps) {
  const { user } = useAuth();
  const { createInteraction } = useInteractions(contactId, user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: '',
    },
  });

  const onSubmit = async (data: NotesFormData) => {
    setIsSubmitting(true);
    try {
      await createInteraction.mutateAsync({
        contact_id: contactId,
        type: 'call',
        date: new Date().toISOString(),
        notes: data.notes,
      });
      toast.success('Call notes saved');
      form.reset();
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Call Notes</DialogTitle>
          <DialogDescription>
            You've marked {contactName} as call done. Add notes about your conversation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What did you discuss?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key takeaways, follow-up items, impressions..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
