import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Rocket, LogOut, User, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-dark-500 shadow-sm border-b border-gray-200 dark:border-neon-500/20 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Rocket className="h-8 w-8 text-neon-500 group-hover:animate-pulse" />
            <span className="text-2xl font-bold text-gray-900 dark:text-neon-500 group-hover:text-neon-400 transition-colors">
              Digitel
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-neon-500 hover:bg-gray-200 dark:hover:bg-dark-200 transition-all hover:scale-110 active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-neon-500 hover:text-neon-500 dark:hover:text-neon-400 px-3 py-2 rounded-md text-sm font-bold transition-all hover:scale-105"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-300 px-3 py-2 rounded-lg">
                  <User className="h-5 w-5 text-neon-500" />
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-bold transition-all hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-neon-500 hover:text-neon-500 dark:hover:text-neon-400 px-3 py-2 rounded-md text-sm font-bold transition-all hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="bg-neon-500 text-dark-500 hover:bg-neon-400 px-4 py-2 rounded-md text-sm font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-neon-500/50"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
