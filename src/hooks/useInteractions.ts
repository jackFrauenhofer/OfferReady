import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Interaction, InteractionType } from '@/lib/types';

export function useInteractions(contactId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['interactions', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Interaction[];
    },
    enabled: !!contactId,
  });

  const createInteraction = useMutation({
    mutationFn: async (interaction: { 
      contact_id: string; 
      type: InteractionType; 
      date: string; 
      notes: string | null 
    }) => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          ...interaction,
          user_id: userId,
        })
        .select()
        .single();
      if (error) throw error;
      
      // Update last_contacted_at on the contact
      const updateData: { last_contacted_at: string; next_followup_at?: string } = {
        last_contacted_at: interaction.date,
      };
      
      // If interaction type is call, auto-suggest follow-up in 7 days
      if (interaction.type === 'call') {
        const followUpDate = new Date(interaction.date);
        followUpDate.setDate(followUpDate.getDate() + 7);
        updateData.next_followup_at = followUpDate.toISOString();
      }
      
      await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', interaction.contact_id);
      
      return { data, suggestedFollowUp: interaction.type === 'call' };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', variables.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contact_id] });
    },
  });

  return {
    interactions,
    isLoading,
    createInteraction,
  };
}
