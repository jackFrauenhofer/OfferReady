import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInteractions } from '@/hooks/useInteractions';
import { useAuth } from '@/hooks/useAuth';
import { INTERACTION_TYPES, type InteractionType } from '@/lib/types';
import { toast } from 'sonner';

const interactionSchema = z.object({
  type: z.enum(['email', 'call', 'coffee_chat']),
  date: z.string(),
  notes: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface AddInteractionModalProps {
  contactId: string;
}

export function AddInteractionModal({ contactId }: AddInteractionModalProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { createInteraction } = useInteractions(contactId, user?.id);

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: 'email',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await createInteraction.mutateAsync({
        contact_id: contactId,
        type: data.type as InteractionType,
        date: new Date(data.date).toISOString(),
        notes: data.notes || null,
      });
      toast.success('Interaction logged');
      setOpen(false);
      form.reset({
        type: 'email',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to log interaction');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Log Interaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INTERACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you discuss?"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInteraction.isPending}>
                {createInteraction.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
