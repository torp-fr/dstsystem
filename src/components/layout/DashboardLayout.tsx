import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNav from './DashboardTopNav';

declare global {
  interface Window {
    Domain?: {
      PlanningRealtimeService?: {
        initialize: () => Promise<void>;
        cleanup: () => Promise<void>;
      };
    };
  }
}

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize real-time planning service on dashboard load
  useEffect(() => {
    const initializeRealtimeService = async () => {
      try {
        if (window.Domain?.PlanningRealtimeService?.initialize) {
          await window.Domain.PlanningRealtimeService.initialize();
        }
      } catch (error) {
        console.error('[DashboardLayout] Failed to initialize PlanningRealtimeService:', error);
      }
    };

    initializeRealtimeService();

    // Cleanup when leaving dashboard
    return async () => {
      try {
        if (window.Domain?.PlanningRealtimeService?.cleanup) {
          await window.Domain.PlanningRealtimeService.cleanup();
        }
      } catch (error) {
        console.error('[DashboardLayout] Error cleaning up PlanningRealtimeService:', error);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <DashboardTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-secondary/20">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
