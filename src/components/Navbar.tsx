import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Bell, LogOut, User, BookOpen } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Projectos' },
    { to: '/events', label: 'Eventos' },
    { to: '/institutions', label: 'Instituições' },
    { to: '/chat', label: 'Chat' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen size={18} className="text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">EstudarHub</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary hover:ring-2 hover:ring-primary/30 transition-all"
                  >
                    {user?.name.charAt(0)}
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-1 animate-scale-in">
                        <Link to={`/profile/${user?.id}`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                          <User size={14} /> Meu Perfil
                        </Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors w-full text-left">
                          <LogOut size={14} /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">Entrar</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">Criar conta</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="p-4 space-y-2">
            {isAuthenticated ? (
              <>
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(link.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/create-project" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary">Criar Projecto</Link>
                <Link to={`/profile/${user?.id}`} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground">Meu Perfil</Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-foreground">Entrar</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center">Criar conta</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
