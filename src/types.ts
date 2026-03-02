export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
}

export interface Complaint {
  id: number;
  user_id: number;
  user_name: string;
  area_name: string;
  location: string;
  lat?: number;
  lng?: number;
  description: string;
  image: string;
  waste_type: string;
  priority: 'Low' | 'Medium' | 'High';
  suggested_action: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface Stats {
  total: number;
  pending: number;
  completed: number;
  inProgress: number;
}
