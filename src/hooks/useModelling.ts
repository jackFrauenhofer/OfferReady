import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModellingModule {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  steps?: ModellingStep[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface ModellingStep {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  created_at: string;
  completed?: boolean;
}

export function useModellingModules(userId: string | undefined) {
  return useQuery({
    queryKey: ['modelling-modules', userId],
    queryFn: async () => {
      // Fetch modules with their steps
      const { data: modules, error: modulesError } = await supabase
        .from('modelling_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch all steps
      const { data: steps, error: stepsError } = await supabase
        .from('modelling_steps')
        .select('*')
        .order('order_index', { ascending: true });

      if (stepsError) throw stepsError;

      // Fetch user progress if logged in
      let progressMap: Record<string, boolean> = {};
      if (userId) {
        const { data: progress } = await supabase
          .from('user_modelling_progress')
          .select('step_id, completed')
          .eq('user_id', userId);

        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.step_id] = p.completed;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      // Combine modules with steps and progress
      return modules.map((module) => {
        const moduleSteps = (steps || [])
          .filter((s) => s.module_id === module.id)
          .map((step) => ({
            ...step,
            completed: progressMap[step.id] || false,
          }));

        const completedCount = moduleSteps.filter((s) => s.completed).length;
        const totalSteps = moduleSteps.length;

        return {
          ...module,
          steps: moduleSteps,
          progress: {
            completed: completedCount,
            total: totalSteps,
            percentage: totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0,
          },
        } as ModellingModule;
      });
    },
  });
}

export function useModellingModule(moduleId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['modelling-module', moduleId, userId],
    queryFn: async () => {
      if (!moduleId) return null;

      const { data: module, error: moduleError } = await supabase
        .from('modelling_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      const { data: steps, error: stepsError } = await supabase
        .from('modelling_steps')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (stepsError) throw stepsError;

      // Fetch user progress if logged in
      let progressMap: Record<string, boolean> = {};
      if (userId) {
        const { data: progress } = await supabase
          .from('user_modelling_progress')
          .select('step_id, completed')
          .eq('user_id', userId);

        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.step_id] = p.completed;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      const moduleSteps = (steps || []).map((step) => ({
        ...step,
        completed: progressMap[step.id] || false,
      }));

      const completedCount = moduleSteps.filter((s) => s.completed).length;

      return {
        ...module,
        steps: moduleSteps,
        progress: {
          completed: completedCount,
          total: moduleSteps.length,
          percentage: moduleSteps.length > 0 ? Math.round((completedCount / moduleSteps.length) * 100) : 0,
        },
      } as ModellingModule;
    },
    enabled: !!moduleId,
  });
}

export function useMarkStepComplete(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, completed }: { stepId: string; completed: boolean }) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_modelling_progress')
        .upsert(
          {
            user_id: userId,
            step_id: stepId,
            completed,
            last_watched_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,step_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelling-modules'] });
      queryClient.invalidateQueries({ queryKey: ['modelling-module'] });
    },
  });
}
