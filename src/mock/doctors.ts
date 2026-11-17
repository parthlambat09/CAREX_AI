export interface DoctorProfile {
  id: string;
  name: string;
  shortName: string;
  specialty: string;
  roleTitle: string;
  hospitalId: string;
  email: string;
  phone: string;
  avatarInitials: string;
}

export const DOCTORS: DoctorProfile[] = [
  {
    id: 'DOC-1024',
    name: 'Dr. Rajesh Sharma, MD, FCCM',
    shortName: 'Dr. R. Sharma',
    specialty: 'Chief Intensivist & Critical Care Specialist',
    roleTitle: 'Attending Intensivist • ICU Lead',
    hospitalId: 'aiims',
    email: 'dr.sharma@aiims.edu.in',
    phone: '+91 11 2658 8500',
    avatarInitials: 'RS',
  },
  {
    id: 'doc-aiims-2',
    name: 'Dr. Ananya Sen, MD, DM',
    shortName: 'Dr. A. Sen',
    specialty: 'Cardiothoracic Critical Care Lead',
    roleTitle: 'Senior Attending Physician',
    hospitalId: 'aiims',
    email: 'dr.sen@aiims.edu.in',
    phone: '+91 11 2658 8501',
    avatarInitials: 'AS',
  },
  {
    id: 'doc-gmc-1',
    name: 'Dr. Sunita Deshmukh, MD, FCCP',
    shortName: 'Dr. S. Deshmukh',
    specialty: 'Pulmonary & Trauma ICU Director',
    roleTitle: 'Head of ICU Operations',
    hospitalId: 'gmc',
    email: 'dr.deshmukh@gmc.ac.in',
    phone: '+91 22 2373 5555',
    avatarInitials: 'SD',
  },
  {
    id: 'doc-gmc-2',
    name: 'Dr. Vikramaditya Rao, MS, MCh',
    shortName: 'Dr. V. Rao',
    specialty: 'Surgical ICU Specialist',
    roleTitle: 'Associate Professor & Consultant',
    hospitalId: 'gmc',
    email: 'dr.rao@gmc.ac.in',
    phone: '+91 22 2373 5556',
    avatarInitials: 'VR',
  },
  {
    id: 'doc-igmc-1',
    name: 'Dr. Anish Gupta, MD, EDIC',
    shortName: 'Dr. A. Gupta',
    specialty: 'Neuro & General Critical Care Lead',
    roleTitle: 'Attending Intensivist',
    hospitalId: 'igmc',
    email: 'dr.gupta@igmc.edu.in',
    phone: '+91 177 280 4251',
    avatarInitials: 'AG',
  },
  {
    id: 'doc-sevenstar-1',
    name: 'Dr. Meera Kulkarni, MD, FNB',
    shortName: 'Dr. M. Kulkarni',
    specialty: 'Cardiovascular ICU Director',
    roleTitle: 'Chief Critical Care Officer',
    hospitalId: 'sevenstar',
    email: 'dr.kulkarni@sevenstarhospital.in',
    phone: '+91 712 666 7700',
    avatarInitials: 'MK',
  },
  {
    id: 'doc-wockhardt-1',
    name: 'Dr. Kavita Nair, MD, DM',
    shortName: 'Dr. K. Nair',
    specialty: 'Neuro-Intensivist & ECMO Specialist',
    roleTitle: 'Director of Neuro Critical Care',
    hospitalId: 'wockhardt',
    email: 'dr.nair@wockhardthospitals.com',
    phone: '+91 80 4151 7777',
    avatarInitials: 'KN',
  },
];
