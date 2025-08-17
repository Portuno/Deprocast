export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export const projects: Project[] = [
  { id: '1', name: 'Web Development', color: '#00D4FF' },
  { id: '2', name: 'Mobile App', color: '#A855F7' },
  { id: '3', name: 'Marketing Campaign', color: '#10B981' },
  { id: '4', name: 'Research Project', color: '#F59E0B' },
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Design the login interface wireframes',
    status: 'pending',
    priority: 'high',
    projectId: '1'
  },
  {
    id: '2',
    title: 'Set up React Native project structure',
    status: 'in-progress',
    priority: 'high',
    projectId: '2'
  },
  {
    id: '3',
    title: 'Create social media content calendar',
    status: 'pending',
    priority: 'medium',
    projectId: '3'
  },
  {
    id: '4',
    title: 'Research competitor pricing models',
    status: 'completed',
    priority: 'medium',
    projectId: '4'
  },
  {
    id: '5',
    title: 'Implement user authentication API',
    status: 'pending',
    priority: 'high',
    projectId: '1'
  },
  {
    id: '6',
    title: 'Design app navigation flow',
    status: 'pending',
    priority: 'medium',
    projectId: '2'
  },
  {
    id: '7',
    title: 'Write blog post about productivity tips',
    status: 'pending',
    priority: 'low',
    projectId: '3'
  },
  {
    id: '8',
    title: 'Analyze user feedback survey results',
    status: 'in-progress',
    priority: 'medium',
    projectId: '4'
  }
];

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
  { id: 'journal', label: 'Journal', icon: 'BookOpen' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'protocols', label: 'Protocols', icon: 'Settings' },
  { id: 'profile', label: 'My Profile', icon: 'User' },
];

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'low' | 'stressed';
  date: string;
  tags: string[];
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  steps: string[];
  category: 'focus' | 'planning' | 'review' | 'break';
  duration: number; // in minutes
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'break' | 'focus';
  projectId?: string;
}

export const journalEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'Morning Reflection',
    content: 'Started the day with clear goals. Feeling motivated to tackle the login interface design. The wireframes are coming together nicely.',
    mood: 'good',
    date: '2024-01-15',
    tags: ['morning', 'motivation', 'design']
  },
  {
    id: '2',
    title: 'Project Progress',
    content: 'Made significant progress on the React Native setup. The project structure is clean and ready for development.',
    mood: 'great',
    date: '2024-01-14',
    tags: ['progress', 'react-native', 'development']
  }
];

export const protocols: Protocol[] = [
  {
    id: '1',
    name: 'Deep Focus Session',
    description: 'A 90-minute focused work session with breaks',
    steps: [
      'Clear your workspace and close distractions',
      'Set a timer for 45 minutes',
      'Work on single task without interruption',
      'Take a 10-minute break',
      'Repeat for second 45-minute session'
    ],
    category: 'focus',
    duration: 90
  },
  {
    id: '2',
    name: 'Weekly Planning',
    description: 'Organize and prioritize tasks for the upcoming week',
    steps: [
      'Review previous week\'s accomplishments',
      'List all upcoming tasks and deadlines',
      'Prioritize tasks by importance and urgency',
      'Schedule tasks into calendar blocks',
      'Set weekly goals and success metrics'
    ],
    category: 'planning',
    duration: 30
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Design wireframes review',
    date: '2024-01-16',
    time: '09:00',
    type: 'task',
    projectId: '1'
  },
  {
    id: '2',
    title: 'Team standup',
    date: '2024-01-16',
    time: '10:30',
    type: 'meeting'
  },
  {
    id: '3',
    title: 'Deep focus session',
    date: '2024-01-16',
    time: '14:00',
    type: 'focus'
  }
];