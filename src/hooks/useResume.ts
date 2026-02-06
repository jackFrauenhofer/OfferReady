import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserResume {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  extracted_text: string | null;
  uploaded_at: string;
  updated_at: string;
}

export function useResume(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserResume | null;
    },
    enabled: !!userId,
  });

  const uploadResume = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error('No user ID');

      // Upload file to storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Delete old resume records for this user
      await supabase
        .from('user_resumes')
        .delete()
        .eq('user_id', userId);

      // Create new resume record
      const { data, error: insertError } = await supabase
        .from('user_resumes')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', userId] });
    },
  });

  const deleteResume = useMutation({
    mutationFn: async () => {
      if (!userId || !resume) throw new Error('No resume to delete');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', resume.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', userId] });
    },
  });

  return {
    resume,
    isLoading,
    uploadResume,
    deleteResume,
  };
}
