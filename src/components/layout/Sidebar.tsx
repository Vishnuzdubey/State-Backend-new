import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft,
  LayoutDashboard,
  Factory,
  Truck,
  Radio,
  Cpu,
  CreditCard,
  Users,
  Settings,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SIDEBAR_MENU } from '@/utils/constants';

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Factory,
  Truck,
  Radio,
  Cpu,
  CreditCard,
  Users,
  Settings,
  Package
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  // Hide the main sidebar during manufacturer onboarding to provide a focused flow
  if (location.pathname.startsWith('/manufacturer/onboarding')) {
    return null;
  }
  if (!user) return null;

  const menuItems = SIDEBAR_MENU[user.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-lg",
          "lg:relative lg:translate-x-0 lg:shadow-none",
          collapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold">RoadEye Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-gray-100",
                        isActive 
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                          : "text-gray-600",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User info */}
          {!collapsed && (
            <div className="border-t p-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}