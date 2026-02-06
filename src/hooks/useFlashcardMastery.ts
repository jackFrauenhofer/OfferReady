import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export function useFlashcardMastery(userId: string | undefined) {
  return useQuery({
    queryKey: ['flashcardMastery', userId],
    queryFn: async () => {
      // Get all flashcards
      const { data: flashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id');

      if (flashcardsError) throw flashcardsError;
      
      const totalCards = flashcards?.length || 0;
      
      if (!userId || totalCards === 0) {
        return { totalCards, masteredCards: 0, studiedThisWeek: 0 };
      }

      // Get user progress - mastered means confidence >= 4
      const { data: progress, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('confidence, last_reviewed_at')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      const masteredCards = progress?.filter(p => (p.confidence || 0) >= 4).length || 0;

      // Count cards studied this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      const studiedThisWeek = progress?.filter(p => {
        if (!p.last_reviewed_at) return false;
        const reviewDate = new Date(p.last_reviewed_at);
        return reviewDate >= weekStart && reviewDate <= weekEnd;
      }).length || 0;

      return { totalCards, masteredCards, studiedThisWeek };
    },
    enabled: !!userId,
  });
}
