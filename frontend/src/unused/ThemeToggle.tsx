import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          resolvedTheme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'
        } ${className}`}
        aria-label="Toggle theme"
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"
          animate={{ left: resolvedTheme === 'dark' ? '32px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3 h-3 text-purple-600" />
          ) : (
            <Sun className="w-3 h-3 text-yellow-500" />
          )}
        </motion.div>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`}>
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-yellow-500'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-500'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-lg transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          aria-label="System theme"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default: icon variant
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      className={`p-2 rounded-xl transition-colors ${
        resolvedTheme === 'dark'
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 text-purple-600 hover:bg-gray-200'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedTheme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}
