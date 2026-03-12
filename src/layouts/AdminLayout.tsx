import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

export const AdminLayout = () => {
  const [period, setPeriod] = useState('30d');

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar period={period} onPeriodChange={setPeriod} />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet context={{ period }} />
        </main>
      </div>
    </div>
  );
};
