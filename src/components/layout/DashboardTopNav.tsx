import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface DashboardTopNavProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const DashboardTopNav = ({ toggleSidebar, sidebarOpen }: DashboardTopNavProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border-border flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 hover:bg-secondary/30 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Bienvenue</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-border-border">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardTopNav;
