import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  LearningTrack,
  LearningTopic,
  LearningLesson,
  UserLessonProgress,
  LearningTrackWithTopics,
  LearningTopicWithLessons,
  LessonWithProgress,
  LessonStatus,
} from '@/lib/learning-types';

// Fetch all tracks
export function useLearningTracks() {
  return useQuery({
    queryKey: ['learningTracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_tracks')
        .select('*')
        .order('title');
      if (error) throw error;
      return data as LearningTrack[];
    },
  });
}

// Fetch track by slug with topics and lessons
export function useLearningTrack(trackSlug: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['learningTrack', trackSlug, userId],
    queryFn: async () => {
      if (!trackSlug) return null;

      // Get track
      const { data: track, error: trackError } = await supabase
        .from('learning_tracks')
        .select('*')
        .eq('slug', trackSlug)
        .maybeSingle();
      if (trackError) throw trackError;
      if (!track) return null;

      // Get topics for this track
      const { data: topics, error: topicsError } = await supabase
        .from('learning_topics')
        .select('*')
        .eq('track_id', track.id)
        .order('order_index');
      if (topicsError) throw topicsError;

      // Get all lessons for these topics
      const topicIds = topics.map((t) => t.id);
      const { data: lessons, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select('*')
        .in('topic_id', topicIds)
        .order('order_index');
      if (lessonsError) throw lessonsError;

      // Get user progress if logged in
      let progressMap: Record<string, UserLessonProgress> = {};
      if (userId) {
        const lessonIds = lessons.map((l) => l.id);
        const { data: progress } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds);
        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.lesson_id] = p as UserLessonProgress;
            return acc;
          }, {} as Record<string, UserLessonProgress>);
        }
      }

      // Build the nested structure with progress
      const topicsWithLessons: LearningTopicWithLessons[] = topics.map((topic) => {
        const topicLessons = lessons.filter((l) => l.topic_id === topic.id);
        const completedLessons = topicLessons.filter(
          (l) => progressMap[l.id]?.status === 'complete'
        ).length;

        return {
          ...topic,
          lessons: topicLessons as LearningLesson[],
          progress: {
            completed: completedLessons,
            total: topicLessons.length,
            percentage: topicLessons.length > 0 ? Math.round((completedLessons / topicLessons.length) * 100) : 0,
          },
        } as LearningTopicWithLessons;
      });

      const totalLessons = lessons.length;
      const completedLessons = Object.values(progressMap).filter(
        (p) => p.status === 'complete'
      ).length;

      return {
        ...track,
        topics: topicsWithLessons,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        },
      } as LearningTrackWithTopics;
    },
    enabled: !!trackSlug,
  });
}

// Fetch topic by slug with lessons
export function useLearningTopic(
  trackSlug: string | undefined,
  topicSlug: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ['learningTopic', trackSlug, topicSlug, userId],
    queryFn: async () => {
      if (!trackSlug || !topicSlug) return null;

      // Get track first
      const { data: track, error: trackError } = await supabase
        .from('learning_tracks')
        .select('*')
        .eq('slug', trackSlug)
        .maybeSingle();
      if (trackError) throw trackError;
      if (!track) return null;

      // Get topic
      const { data: topic, error: topicError } = await supabase
        .from('learning_topics')
        .select('*')
        .eq('track_id', track.id)
        .eq('slug', topicSlug)
        .maybeSingle();
      if (topicError) throw topicError;
      if (!topic) return null;

      // Get lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('topic_id', topic.id)
        .order('order_index');
      if (lessonsError) throw lessonsError;

      // Get user progress
      let progressMap: Record<string, UserLessonProgress> = {};
      if (userId) {
        const lessonIds = lessons.map((l) => l.id);
        const { data: progress } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds);
        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.lesson_id] = p as UserLessonProgress;
            return acc;
          }, {} as Record<string, UserLessonProgress>);
        }
      }

      const lessonsWithProgress: LessonWithProgress[] = lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap[lesson.id],
      })) as LessonWithProgress[];

      const completedLessons = lessonsWithProgress.filter(
        (l) => l.progress?.status === 'complete'
      ).length;

      return {
        track,
        topic: {
          ...topic,
          lessons: lessonsWithProgress,
          progress: {
            completed: completedLessons,
            total: lessons.length,
            percentage: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
          },
        } as LearningTopicWithLessons & { lessons: LessonWithProgress[] },
      };
    },
    enabled: !!trackSlug && !!topicSlug,
  });
}

// Fetch single lesson with navigation
export function useLearningLesson(
  trackSlug: string | undefined,
  topicSlug: string | undefined,
  lessonSlug: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ['learningLesson', trackSlug, topicSlug, lessonSlug, userId],
    queryFn: async () => {
      if (!trackSlug || !topicSlug || !lessonSlug) return null;

      // Get track
      const { data: track } = await supabase
        .from('learning_tracks')
        .select('*')
        .eq('slug', trackSlug)
        .maybeSingle();
      if (!track) return null;

      // Get topic
      const { data: topic } = await supabase
        .from('learning_topics')
        .select('*')
        .eq('track_id', track.id)
        .eq('slug', topicSlug)
        .maybeSingle();
      if (!topic) return null;

      // Get all lessons in topic for navigation
      const { data: allLessons } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('topic_id', topic.id)
        .order('order_index');

      // Get current lesson
      const { data: lesson } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('topic_id', topic.id)
        .eq('slug', lessonSlug)
        .maybeSingle();
      if (!lesson) return null;

      // Get progress
      let progress: UserLessonProgress | null = null;
      if (userId) {
        const { data } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lesson.id)
          .maybeSingle();
        progress = data as UserLessonProgress | null;
      }

      // Find prev/next lessons
      const currentIndex = allLessons?.findIndex((l) => l.id === lesson.id) ?? -1;
      const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null;
      const nextLesson = currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIndex + 1] : null;

      return {
        track: track as LearningTrack,
        topic: topic as LearningTopic,
        lesson: { ...lesson, progress } as LessonWithProgress,
        prevLesson: prevLesson as LearningLesson | null,
        nextLesson: nextLesson as LearningLesson | null,
        totalLessons: allLessons?.length ?? 0,
        currentIndex: currentIndex + 1,
      };
    },
    enabled: !!trackSlug && !!topicSlug && !!lessonSlug,
  });
}

// Update lesson progress
export function useUpdateLessonProgress(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      status,
      confidence,
    }: {
      lessonId: string;
      status?: LessonStatus;
      confidence?: number;
    }) => {
      if (!userId) throw new Error('Not authenticated');

      const updates: Partial<UserLessonProgress> = {
        last_viewed_at: new Date().toISOString(),
      };
      if (status !== undefined) updates.status = status;
      if (confidence !== undefined) updates.confidence = confidence;

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            ...updates,
          },
          { onConflict: 'user_id,lesson_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningTrack'] });
      queryClient.invalidateQueries({ queryKey: ['learningTopic'] });
      queryClient.invalidateQueries({ queryKey: ['learningLesson'] });
    },
  });
}

// Find next incomplete lesson in a track
export function useFindNextLesson(trackSlug: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['nextLesson', trackSlug, userId],
    queryFn: async () => {
      if (!trackSlug) return null;

      // Get track
      const { data: track } = await supabase
        .from('learning_tracks')
        .select('*')
        .eq('slug', trackSlug)
        .maybeSingle();
      if (!track) return null;

      // Get all topics ordered
      const { data: topics } = await supabase
        .from('learning_topics')
        .select('*')
        .eq('track_id', track.id)
        .order('order_index');
      if (!topics?.length) return null;

      // Get all lessons ordered
      const topicIds = topics.map((t) => t.id);
      const { data: lessons } = await supabase
        .from('learning_lessons')
        .select('*')
        .in('topic_id', topicIds)
        .order('order_index');
      if (!lessons?.length) return null;

      // Get user progress
      let completedLessonIds: Set<string> = new Set();
      if (userId) {
        const { data: progress } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('status', 'complete');
        if (progress) {
          completedLessonIds = new Set(progress.map((p) => p.lesson_id));
        }
      }

      // Find first incomplete lesson (ordered by topic, then lesson order)
      for (const topic of topics) {
        const topicLessons = lessons
          .filter((l) => l.topic_id === topic.id)
          .sort((a, b) => a.order_index - b.order_index);

        for (const lesson of topicLessons) {
          if (!completedLessonIds.has(lesson.id)) {
            return {
              track,
              topic,
              lesson,
            };
          }
        }
      }

      // All complete - return first lesson
      const firstTopic = topics[0];
      const firstLesson = lessons.find((l) => l.topic_id === firstTopic.id);
      return firstLesson
        ? { track, topic: firstTopic, lesson: firstLesson }
        : null;
    },
    enabled: !!trackSlug,
  });
}

// Search lessons
export function useSearchLessons(query: string, trackSlug?: string) {
  return useQuery({
    queryKey: ['searchLessons', query, trackSlug],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      let lessonsQuery = supabase
        .from('learning_lessons')
        .select(`
          *,
          topic:learning_topics(
            *,
            track:learning_tracks(*)
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(20);

      const { data, error } = await lessonsQuery;
      if (error) throw error;

      // Filter by track if specified
      if (trackSlug && data) {
        return data.filter((l: any) => l.topic?.track?.slug === trackSlug);
      }

      return data;
    },
    enabled: query.length >= 2,
  });
}
