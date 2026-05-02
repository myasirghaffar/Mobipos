import * as React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';
import { Menu, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

export const MainLayout = () => {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 font-serif italic text-zinc-400">
        Loading MobiPOS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-white text-zinc-900 overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white/80 backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Smartphone className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-serif italic font-bold tracking-tighter text-zinc-900">
              MOBI<span className="text-zinc-500">POS</span>
            </h1>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 shadow-sm border border-zinc-100 rounded-xl" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
};
