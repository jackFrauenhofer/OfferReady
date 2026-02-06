import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useCallEvents } from '@/hooks/useCallEvents';
import { useInteractions } from '@/hooks/useInteractions';
import { ScheduleCallModal } from '@/components/calendar/ScheduleCallModal';
import { EditCallModal } from '@/components/calendar/EditCallModal';
import type { CallEvent, CallEventStatus } from '@/lib/types';

export function CalendarPage() {
  const { user } = useAuth();
  const { contacts } = useContacts(user?.id);
  const { callEvents, isLoading, createCallEvent, updateCallEvent, updateCallEventStatus, deleteCallEvent } = useCallEvents(user?.id);
  const { createInteraction } = useInteractions(user?.id, undefined);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<(CallEvent & { contact?: { id: string; name: string; firm: string | null } }) | null>(null);

  const events: EventInput[] = useMemo(() => {
    return callEvents.map((event) => {
      const contact = event.contact;
      const displayTitle = contact
        ? `${contact.name}${contact.firm ? ` - ${contact.firm}` : ''}`
        : event.title;

      const colorMap: Record<CallEventStatus, string> = {
        scheduled: 'hsl(var(--primary))',
        completed: 'hsl(142 76% 36%)',
        canceled: 'hsl(var(--muted-foreground))',
      };

      return {
        id: event.id,
        title: displayTitle,
        start: event.start_at,
        end: event.end_at,
        backgroundColor: colorMap[event.status],
        borderColor: colorMap[event.status],
        extendedProps: {
          ...event,
        },
      };
    });
  }, [callEvents]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start);
    setScheduleModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventData = clickInfo.event.extendedProps as CallEvent & { contact?: { id: string; name: string; firm: string | null } };
    setSelectedEvent({
      ...eventData,
      id: clickInfo.event.id,
    });
    setEditModalOpen(true);
  };

  const handleScheduleCall = async (data: {
    contact_id: string;
    title: string;
    start_at: string;
    end_at: string;
    location?: string;
    notes?: string;
  }) => {
    try {
      await createCallEvent.mutateAsync({
        contact_id: data.contact_id,
        title: data.title,
        start_at: new Date(data.start_at).toISOString(),
        end_at: new Date(data.end_at).toISOString(),
        location: data.location || null,
        notes: data.notes || null,
        status: 'scheduled',
        external_provider: null,
        external_event_id: null,
        updateContactStage: true, // Sync with pipeline
      });
      toast.success('Call scheduled - contact moved to Scheduled stage');
      setScheduleModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule call');
    }
  };

  const handleUpdateCall = async (id: string, data: Partial<{
    title: string;
    start_at: string;
    end_at: string;
    location: string;
    notes: string;
  }>) => {
    try {
      await updateCallEvent.mutateAsync({
        id,
        title: data.title,
        start_at: data.start_at ? new Date(data.start_at).toISOString() : undefined,
        end_at: data.end_at ? new Date(data.end_at).toISOString() : undefined,
        location: data.location || null,
        notes: data.notes || null,
      });
      toast.success('Call updated');
    } catch (error) {
      toast.error('Failed to update call');
    }
  };

  const handleStatusChange = async (id: string, status: CallEventStatus) => {
    try {
      await updateCallEventStatus.mutateAsync({ id, status, updateContactStage: true });
      if (status === 'completed') {
        toast.success('Call completed - contact moved to Call Done stage');
      } else {
        toast.success(`Call marked as ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCall = async (id: string) => {
    try {
      await deleteCallEvent.mutateAsync(id);
      toast.success('Call deleted');
    } catch (error) {
      toast.error('Failed to delete call');
    }
  };

  const handleLogInteraction = async (event: { contact_id: string; start_at: string; notes: string | null }) => {
    try {
      await createInteraction.mutateAsync({
        contact_id: event.contact_id,
        type: 'call',
        date: event.start_at,
        notes: event.notes,
      });
      toast.success('Interaction logged');
    } catch (error) {
      toast.error('Failed to log interaction');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground">Schedule and manage your calls</p>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </div>

      <ScheduleCallModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        contacts={contacts}
        onSubmit={handleScheduleCall}
        defaultDate={selectedDate}
        isSubmitting={createCallEvent.isPending}
      />

      <EditCallModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        event={selectedEvent}
        onSubmit={handleUpdateCall}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteCall}
        onLogInteraction={handleLogInteraction}
        isSubmitting={updateCallEvent.isPending}
      />
    </div>
  );
}
