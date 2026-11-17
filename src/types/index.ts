export type UserRole = 'doctor' | 'nurse' | 'family' | 'admin' | 'patient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance';
  version: string;
  environment: 'development' | 'production';
  modules: {
    auth: boolean;
    database: boolean;
    iotSimulation: boolean;
    aiEngine: boolean;
  };
}
