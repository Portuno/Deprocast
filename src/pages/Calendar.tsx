import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, Focus, Coffee } from 'lucide-react';
import { CalendarEvent, calendarEvents, Task } from '../data/mockData';

type Props = { tasks?: Task[] };

const Calendar: React.FC<Props> = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(calendarEvents || []);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Helper function - must be declared before use
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const eventTypeIcons = {
    task: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    meeting: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    focus: { icon: Focus, color: 'text-green-400', bg: 'bg-green-500/20' },
    break: { icon: Coffee, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const today = new Date();
  const todayString = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  // Map tasks to calendar markers (start/in-progress and completion)
  const taskEvents: CalendarEvent[] = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return tasks.flatMap((t) => {
      const result: CalendarEvent[] = [];
      if (t.status === 'in-progress') {
        result.push({ id: `${t.id}-start`, title: t.title, date: todayString, time: '09:00', type: 'task', projectId: t.projectId });
      }
      if (t.status === 'completed' && t.completionDate) {
        const d = new Date(t.completionDate);
        const ds = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
        result.push({ id: `${t.id}-done`, title: `${t.title} – done`, date: ds, time: '18:00', type: 'task', projectId: t.projectId });
      }
      return result;
    });
  }, [tasks, todayString]);

  const allEvents = useMemo(() => [...events, ...taskEvents], [events, taskEvents]);

  const getEventsForDate = (date: string) => {
    if (!allEvents || allEvents.length === 0) return [];
    return allEvents.filter(event => event && event.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Safety check for events
  if (!events) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Loading calendar data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Schedule and track your tasks and events</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 mr-2">
                    <button onClick={() => setView('month')} className={`px-2 py-1 text-sm rounded ${view==='month'?'bg-gray-700/60 text-white':'text-gray-300 hover:bg-gray-700/40'}`}>Month</button>
                    <button onClick={() => setView('week')} className={`px-2 py-1 text-sm rounded ${view==='week'?'bg-gray-700/60 text-white':'text-gray-300 hover:bg-gray-700/40'}`}>Week</button>
                    <button onClick={() => setView('day')} className={`px-2 py-1 text-sm rounded ${view==='day'?'bg-gray-700/60 text-white':'text-gray-300 hover:bg-gray-700/40'}`}>Day</button>
                  </div>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              {view === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2 h-24"></div>;
                    }

                    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = getEventsForDate(dateString);
                    const isToday = dateString === todayString;
                    const isSelected = dateString === selectedDate;

                    return (
                      <div
                        key={`${currentDate.getMonth()}-${day}`}
                        onClick={() => setSelectedDate(dateString)}
                        className={`p-2 h-24 border border-gray-700/30 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700/30 ${
                          isToday ? 'bg-blue-900/30 border-blue-400/50' : ''
                        } ${isSelected ? 'bg-purple-900/30 border-purple-400/50' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-blue-400' : 'text-white'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, eventIndex) => {
                            if (!event || !eventTypeIcons[event.type]) return null;
                            const EventIcon = eventTypeIcons[event.type].icon;
                            return (
                              <div
                                key={`${event.id}-${eventIndex}`}
                                className={`text-xs p-1 rounded ${eventTypeIcons[event.type].bg} ${eventTypeIcons[event.type].color} truncate`}
                              >
                                <div className="flex items-center space-x-1">
                                  <EventIcon className="w-3 h-3" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'week' && (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const start = new Date(currentDate);
                    const dayDate = new Date(start.setDate(start.getDate() - start.getDay() + i));
                    const ds = formatDate(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
                    const dayEvents = getEventsForDate(ds);
                    const isToday = ds === todayString;
                    return (
                      <div key={`w-${i}`} className={`p-2 h-32 border border-gray-700/30 rounded-lg ${isToday ? 'bg-blue-900/30 border-blue-400/50' : ''}`}>
                        <div className="text-sm font-medium mb-1 text-white">{dayDate.getDate()}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0,3).map((event, idx) => {
                            if (!event || !eventTypeIcons[event.type]) return null;
                            const EventIcon = eventTypeIcons[event.type].icon;
                            return (
                              <div key={`we-${idx}`} className={`text-xs p-1 rounded ${eventTypeIcons[event.type].bg} ${eventTypeIcons[event.type].color} truncate`}>
                                <div className="flex items-center space-x-1">
                                  <EventIcon className="w-3 h-3" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'day' && (
                <div>
                  <div className="text-white font-medium mb-2">{todayString}</div>
                  <div className="space-y-2">
                    {getEventsForDate(todayString).map((event, idx) => {
                      if (!event || !eventTypeIcons[event.type]) return null;
                      const EventIcon = eventTypeIcons[event.type].icon;
                      return (
                        <div key={`d-${idx}`} className={`p-2 rounded border border-gray-700/30 ${eventTypeIcons[event.type].bg}`}>
                          <div className="flex items-center gap-2">
                            <EventIcon className={`w-4 h-4 ${eventTypeIcons[event.type].color}`} />
                            <span className="text-white text-sm">{event.time}</span>
                            <span className="text-gray-300 text-sm">{event.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Events</h3>
              <div className="space-y-3">
                {getEventsForDate(todayString).map((event, index) => {
                  if (!event || !eventTypeIcons[event.type]) return null;
                  const EventIcon = eventTypeIcons[event.type].icon;
                  return (
                    <div
                      key={`te-${index}`}
                      className={`p-3 rounded-lg ${eventTypeIcons[event.type].bg} border border-gray-600/30`}
                    >
                      <div className="flex items-center space-x-3">
                        <EventIcon className={`w-5 h-5 ${eventTypeIcons[event.type].color}`} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-sm text-gray-400">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getEventsForDate(todayString).length === 0 && (
                  <p className="text-gray-400 text-sm">No events scheduled for today</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Events</span>
                  <span className="text-white font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Meetings</span>
                  <span className="text-purple-400 font-medium">
                    {events.filter(e => e && e.type === 'meeting').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus Sessions</span>
                  <span className="text-green-400 font-medium">
                    {events.filter(e => e && e.type === 'focus').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;