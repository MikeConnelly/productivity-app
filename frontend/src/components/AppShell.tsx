import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, CalendarDays, Sun, Moon } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Today', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-indigo-600">Productivity</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2 px-4 text-xs font-medium transition-colors min-h-[44px] justify-center ${
                location.pathname === to
                  ? 'text-indigo-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 min-h-[44px] justify-center"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>
    </div>
  );
}
