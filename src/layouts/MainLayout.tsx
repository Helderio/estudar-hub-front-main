import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNav } from '@/components/BottomNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background transition-theme">
      <Navbar />
      <div className="flex pt-16">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
