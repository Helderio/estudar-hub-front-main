import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col transition-theme">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen size={18} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">EstudarHub</span>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
};
