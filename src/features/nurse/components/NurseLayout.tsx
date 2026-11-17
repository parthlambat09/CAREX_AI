import React from 'react';
import { SimulationProvider } from '@/features/doctor/context/SimulationContext';
import { NurseDashboardPage } from '@/features/nurse/pages/NurseDashboardPage';

export const NurseLayout: React.FC = () => {
  return (
    <SimulationProvider>
      <NurseDashboardPage />
    </SimulationProvider>
  );
};
