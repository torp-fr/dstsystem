import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Crosshair,
  Calculator,
  Calendar,
} from 'lucide-react';

interface DashboardSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DashboardSidebar = ({ open, setOpen }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: BarChart3, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Users, label: 'Clients', path: '/dashboard/clients' },
    { icon: Crosshair, label: 'Opérateurs', path: '/dashboard/operators' },
    { icon: Calculator, label: 'Coûts', path: '/dashboard/costs' },
    { icon: Calendar, label: 'Calendrier', path: '/dashboard/calendar' },
    { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Package, label: 'Offres & Formules', path: '/dashboard/offers' },
    { icon: DollarSign, label: 'Finances', path: '/dashboard/finances' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static md:translate-x-0 w-64 h-screen bg-card border-r border-border flex flex-col transition-transform duration-300 z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">DST-System</h1>
          <p className="text-xs text-muted-foreground mt-1">Gestion d'entreprise</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default DashboardSidebar;
