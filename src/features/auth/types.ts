import { UserRole } from '@/types';

export interface DoctorSignupFormData {
  fullName: string;
  email: string;
  phone: string;
  medRegNo: string;
  specialization: string;
  hospital: string;
  password: string;
  confirmPassword: string;
}

export interface PatientSignupFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  preferredLanguage: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface RoleMeta {
  id: UserRole;
  title: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
}
