import { Stethoscope, ClipboardList, HeartPulse, Building2, LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';

export interface RoleOption {
  id: UserRole;
  title: string;
  badgeText: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  accentColor: string;
  borderAccent: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'doctor',
    title: 'Doctor',
    badgeText: 'Clinical Care & Risk',
    description: 'Monitor patients, analyze risk and coordinate care in real-time.',
    icon: Stethoscope,
    gradient: 'from-blue-600/10 via-blue-500/5 to-transparent dark:from-orange-500/15 dark:via-orange-600/5 dark:to-transparent',
    accentColor: 'text-blue-600 dark:text-orange-500',
    borderAccent: 'border-blue-500/40 dark:border-orange-500/40',
  },
  {
    id: 'nurse',
    title: 'Nurse',
    badgeText: 'Bedside Care & Tasks',
    description: "Manage your assigned patients' to-do lists and track their care timeline.",
    icon: ClipboardList,
    gradient: 'from-teal-600/10 via-teal-500/5 to-transparent dark:from-teal-500/15 dark:via-teal-600/5 dark:to-transparent',
    accentColor: 'text-teal-600 dark:text-teal-400',
    borderAccent: 'border-teal-500/40 dark:border-teal-500/40',
  },
  {
    id: 'family',
    title: 'Family Portal',
    badgeText: 'Personal Health & Recovery',
    description: "See your loved one's recovery progress, vitals trends, and care updates — visible only for the patients linked to your account.",
    icon: HeartPulse,
    gradient: 'from-blue-600/10 via-blue-500/5 to-transparent dark:from-orange-500/15 dark:via-orange-600/5 dark:to-transparent',
    accentColor: 'text-blue-600 dark:text-orange-500',
    borderAccent: 'border-blue-500/40 dark:border-orange-500/40',
  },
  {
    id: 'admin',
    title: 'Hospital Management',
    badgeText: 'Operations & Intelligence',
    description: 'Manage billing, equipment readiness, staff assignments, admissions, discharge paperwork, and hospital-wide operations.',
    icon: Building2,
    gradient: 'from-indigo-600/10 via-indigo-500/5 to-transparent dark:from-indigo-500/15 dark:via-indigo-600/5 dark:to-transparent',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
    borderAccent: 'border-indigo-500/40 dark:border-indigo-500/40',
  },
];

