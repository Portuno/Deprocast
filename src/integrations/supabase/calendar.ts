import { supabase } from './client';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'break' | 'focus';
  projectId?: string;
  description?: string;
  durationMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalendarEventData {
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'break' | 'focus';
  projectId?: string;
  description?: string;
  durationMinutes?: number;
}

export async function createCalendarEvent(eventData: CreateCalendarEventData): Promise<CalendarEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      type: eventData.type,
      project_id: eventData.projectId || null,
      description: eventData.description || null,
      duration_minutes: eventData.durationMinutes || null,
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    date: data.date,
    time: data.time,
    type: data.type,
    projectId: data.project_id,
    description: data.description,
    durationMinutes: data.duration_minutes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getCalendarEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type,
    projectId: row.project_id,
    description: row.description,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCalendarEventsByDate(date: string): Promise<CalendarEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('time', { ascending: true });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type,
    projectId: row.project_id,
    description: row.description,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCalendarEventStats(startDate: string, endDate: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_events')
    .select('type')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const events = data || [];
  const totalEvents = events.length;
  const meetings = events.filter(e => e.type === 'meeting').length;
  const focusSessions = events.filter(e => e.type === 'focus').length;
  const tasks = events.filter(e => e.type === 'task').length;
  const breaks = events.filter(e => e.type === 'break').length;

  return {
    totalEvents,
    meetings,
    focusSessions,
    tasks,
    breaks,
  };
}

export async function updateCalendarEvent(
  id: string,
  updates: Partial<CreateCalendarEventData>
): Promise<CalendarEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.time !== undefined) updateData.time = updates.time;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes;

  const { data, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    date: data.date,
    time: data.time,
    type: data.type,
    projectId: data.project_id,
    description: data.description,
    durationMinutes: data.duration_minutes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
