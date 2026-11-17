export interface HospitalEmployee {
  empId: string;
  name: string;
  roleTitle: string;
  department: string;
  email: string;
  phone: string;
  hospitalId: string;
}

export const HOSPITAL_EMPLOYEES: HospitalEmployee[] = [
  {
    empId: 'EMP-5501',
    name: 'Dr. Ramesh Sharma',
    roleTitle: 'Hospital Operations Director',
    department: 'Hospital Administration',
    email: 'admin.ops@aiims.edu.in',
    phone: '+91 11 2658 9000',
    hospitalId: 'aiims',
  },
  {
    empId: 'EMP-5502',
    name: 'Priya Nair',
    roleTitle: 'Senior Administrator',
    department: 'Resource Allocation & Billing',
    email: 'priya.nair@aiims.edu.in',
    phone: '+91 11 2658 9001',
    hospitalId: 'aiims',
  },
  {
    empId: 'EMP-5503',
    name: 'Amitav Ghosh',
    roleTitle: 'Chief Information Officer',
    department: 'Healthcare IT & Telemetry',
    email: 'amitav.ghosh@gmc.ac.in',
    phone: '+91 22 2373 6000',
    hospitalId: 'gmc',
  },
];
