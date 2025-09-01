export interface MicroTask {
  id: string;
  title: string;
  description: string;
  estimated_time: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  project_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MicroTaskFormData {
  title: string;
  description: string;
  estimated_time: number;
  priority: 'low' | 'medium' | 'high';
  project_id?: string;
}

export interface MicroTaskFilters {
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  project_id?: string;
  search?: string;
}
