import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../components/dashboard/Dashboard';

const Index: React.FC = () => {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default Index;
