import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  TrendingUp,
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import NotificationBell from '../NotificationBell';

const navigation: Array<{
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}> = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Réservations', href: '/bookings', icon: Ticket },
  { name: 'Clients', href: '/customers', icon: Users },
  { name: 'Commissions', href: '/commissions', icon: TrendingUp },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Paiements', href: '/payments', icon: CreditCard },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(() => {
    // Récupérer la préférence depuis localStorage au chargement
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Effet pour initialiser le mode dark au montage
  React.useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      const isDark = JSON.parse(saved);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  React.useEffect(() => {
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Mobile */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nooraya</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.subItems) {
                const isExpanded = expandedItems.includes(item.name);
                const isSubActive = item.subItems.some(sub => location.pathname === sub.href);
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => {
                        setExpandedItems(prev =>
                          prev.includes(item.name)
                            ? prev.filter(name => name !== item.name)
                            : [...prev, item.name]
                        );
                      }}
                      className={cn(
                        'w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                        isSubActive
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <item.icon className={cn(
                        'mr-3 h-5 w-5',
                        isSubActive
                          ? 'text-gray-500 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )} />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-8 space-y-1 mt-1">
                        {item.subItems.map(subItem => {
                          const isActive = location.pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={cn(
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                isActive
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <subItem.icon className="mr-3 h-4 w-4" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    'mr-3 h-5 w-5',
                    isActive 
                      ? 'text-gray-500 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Nooraya Dashboard
              </h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                if (item.subItems) {
                  const isExpanded = expandedItems.includes(item.name);
                  const isSubActive = item.subItems.some(sub => location.pathname === sub.href);
                  
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          setExpandedItems(prev =>
                            prev.includes(item.name)
                              ? prev.filter(name => name !== item.name)
                              : [...prev, item.name]
                          );
                        }}
                        className={cn(
                          'w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                          isSubActive
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <item.icon className={cn(
                          'mr-3 h-5 w-5',
                          isSubActive
                            ? 'text-gray-500 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        )} />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-8 space-y-1 mt-1">
                          {item.subItems.map(subItem => {
                            const isActive = location.pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className={cn(
                                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                  isActive
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                )}
                              >
                                <subItem.icon className="mr-3 h-4 w-4" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'mr-3 h-5 w-5',
                      isActive 
                        ? 'text-gray-500 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    )} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.first_name || profile?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.role === 'admin' ? 'Administrateur' : 'Agent'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="ml-3"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="hidden lg:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-96"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <NotificationBell />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}