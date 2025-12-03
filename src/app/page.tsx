import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'WellSmart HMI Dashboard',
  description: 'Real-time process monitoring with offline-first capabilities',
};

export default function Home() {
  return <DashboardLayout />;
}
