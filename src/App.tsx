import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/features/doctor/context/ThemeContext';
import { LandingPage } from '@/features/landing/LandingPage';
import { RoleSelectionScreen } from '@/features/role-selection/RoleSelectionScreen';
import { SimulationProvider } from '@/features/doctor/context/SimulationContext';
import { DoctorLayout } from '@/features/doctor/components/DoctorLayout';
import { DashboardPage } from '@/features/doctor/pages/DashboardPage';
import { MonitoringPage } from '@/features/doctor/pages/MonitoringPage';
import { PatientsPage } from '@/features/doctor/pages/PatientsPage';
import { PatientDetailPage } from '@/features/doctor/pages/PatientDetailPage';
import { RiskPredictionPage } from '@/features/doctor/pages/RiskPredictionPage';
import { AlertsPage } from '@/features/doctor/pages/AlertsPage';
import { DecisionSupportPage } from '@/features/doctor/pages/DecisionSupportPage';
import { AnalyticsPage } from '@/features/doctor/pages/AnalyticsPage';
import { NotificationCenterPage } from '@/features/doctor/pages/NotificationCenterPage';
import { SettingsPage } from '@/features/doctor/pages/SettingsPage';
import { NursingStaffPage } from '@/features/doctor/pages/NursingStaffPage';
import { PatientDashboardPage } from '@/features/patient/pages/PatientDashboardPage';

// Nurse Feature
import { NurseLayout } from '@/features/nurse/components/NurseLayout';

// Hospital Management Features
import { HospitalManagementLayout } from '@/features/hospital-management/components/HospitalManagementLayout';
import { HospitalManagementDashboardPage } from '@/features/hospital-management/pages/HospitalManagementDashboardPage';
import { PatientRecordsPage } from '@/features/hospital-management/pages/PatientRecordsPage';
import { BillingInvoicesPage } from '@/features/hospital-management/pages/BillingInvoicesPage';
import { DischargeDetailsPage } from '@/features/hospital-management/pages/DischargeDetailsPage';
import { EquipmentReadinessPage } from '@/features/hospital-management/pages/EquipmentReadinessPage';

// Auth Imports
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { VerifyPage } from '@/features/auth/pages/VerifyPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';

import { AuthProvider } from '@/features/auth/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <SimulationProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Role Portal Selection */}
              <Route path="/select-role" element={<RoleSelectionScreen />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Family Portal Routes */}
              <Route path="/patient/dashboard" element={<PatientDashboardPage />} />

              {/* Nurse Dashboard Route */}
              <Route path="/nurse" element={<NurseLayout />} />

              {/* Hospital Management Subsystem Routes */}
              <Route path="/hospital-management" element={<HospitalManagementLayout />}>
                <Route index element={<HospitalManagementDashboardPage />} />
                <Route path="patient-records" element={<PatientRecordsPage />} />
                <Route path="billing" element={<BillingInvoicesPage />} />
                <Route path="discharge" element={<DischargeDetailsPage />} />
                <Route path="equipment" element={<EquipmentReadinessPage />} />
              </Route>

              {/* Doctor Subsystem Routes */}
              <Route path="/doctor" element={<DoctorLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="monitoring" element={<MonitoringPage />} />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="patient/:id" element={<PatientDetailPage />} />
                <Route path="nurses" element={<NursingStaffPage />} />
                <Route path="risk" element={<RiskPredictionPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="support" element={<DecisionSupportPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="notifications" element={<NotificationCenterPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </SimulationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

