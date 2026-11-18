import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ compact = false, poster = false }) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const ThemeIcon = nextTheme === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors ${poster ? 'poster-theme-toggle' : 'rounded-full border border-line text-muted hover:border-punch-500 hover:text-ink'} ${compact ? 'h-10 w-10' : 'px-3.5 py-2'}`}
    >
      <ThemeIcon className="h-4 w-4" />
      {!compact && <span>{nextTheme === 'dark' ? 'Dark' : 'Light'} mode</span>}
    </button>
  );
};

export default ThemeToggle;
