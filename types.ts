
export enum Atmosphere {
  SOVEREIGN = 'SOVEREIGN',
  TACTICAL_HUD = 'TACTICAL_HUD',
  FIELD_UNIT = 'FIELD_UNIT',
  CORE_TERMINAL = 'CORE_TERMINAL'
}

export interface Theme {
  bg: string;
  surface: string;
  accent: string;
  secondary: string;
  text: string;
  border: string;
  fontMain: string;
  fontDisplay: string;
  radius: string;
  borderWidth: string;
  textGlow: string;
  showScanlines?: boolean;
  flicker?: boolean;
}

export type ProjectState = 'Idea' | 'Planning' | 'Execution' | 'Ongoing';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  theme: Atmosphere;
  stats: UserStats;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  scheduledDate?: string;
  timeBlock?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  strategicVision: string;
  resistance: number;
  complexity: number;
  urgencyThreshold: UrgencyLevel;
  functionalState: ProjectState;
  tasks: Task[];
  status: 'active' | 'archived';
  createdAt: string;
  linkedContactIds: string[];
}

export interface Relation {
  targetContactId: string;
  nature: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedProjectIds: string[];
  relations: Relation[];
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  projectId?: string;
  contactIds: string[];
  description?: string;
  timeSlot?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  durationMinutes: number;
  date: string;
  xpEarned: number;
}

export interface VictoryNote {
  id: string;
  userId: string;
  content: string;
  date: string;
  aiInsights?: string;
  performancePattern?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  rank: string;
  bio?: string;
  lastAnalysis?: string;
}

export interface AppData {
  currentUser: User | null;
  projects: Project[];
  contacts: Contact[];
  events: CalendarEvent[];
  focusHistory: FocusSession[];
  notes: VictoryNote[];
  stats: UserStats;
}
