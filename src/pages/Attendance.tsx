import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';

const AttendancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <AttendanceCalendar />
    </DashboardLayout>
  );
};

export default AttendancePage; 