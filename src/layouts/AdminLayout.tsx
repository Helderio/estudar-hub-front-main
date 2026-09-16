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
        <main className="flex-1 px-4 py-6 md:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet context={{ period }} />
          </div>
        </main>
      </div>
    </div>
  );
};
