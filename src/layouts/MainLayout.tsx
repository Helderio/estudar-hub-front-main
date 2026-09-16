import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNav } from '@/components/BottomNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background transition-theme">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow">
        Saltar para o conteúdo
      </a>
      <Navbar />
      <div className="flex pt-16">
        <AppSidebar />
        <main id="conteudo" className="min-w-0 flex-1 px-4 py-6 pb-28 md:px-8 lg:py-10 lg:pb-12">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
