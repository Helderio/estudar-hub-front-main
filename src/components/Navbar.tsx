import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, User, Shield, Mail, Building2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { NotificationButton } from '@/components/NotificationButton';
import { Logo } from '@/shared/ui/brand';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/dashboard', label: 'Projectos' },
  { to: '/events', label: 'Eventos' },
  { to: '/institutions', label: 'Instituições' },
  { to: '/people', label: 'Pessoas' },
  { to: '/chat', label: 'Chat' },
];

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground';

export const Navbar = ({ contained = false }: { contained?: boolean }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isAdmin = (user as any)?.role === 'ADMIN';
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm transition-theme">
      <div className={cn('flex h-full items-center justify-between gap-4 px-4 md:px-6', contained && 'mx-auto max-w-6xl px-5 md:px-8')}>
        <Logo to={isAuthenticated ? '/dashboard' : '/'} />

        {/* Entre md e lg a barra lateral ainda não aparece; a navegação vive aqui */}
        {isAuthenticated && (
          <nav aria-label="Principal" className="hidden h-full items-stretch gap-1 md:flex lg:hidden">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center px-3 text-sm font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {link.label}
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className={iconBtn} aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationButton />
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Menu da conta"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-offset-background transition hover:ring-2 hover:ring-primary/30 hover:ring-offset-2"
                >
                  {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initial}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div role="menu" className="absolute right-0 mt-2 w-60 animate-scale-in overflow-hidden rounded-lg border border-border bg-popover shadow-[0_12px_32px_-12px_hsl(222_47%_11%/0.25)]">
                      <div className="border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link role="menuitem" to={`/profile/${user?.id}`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary">
                          <User size={15} /> O meu perfil
                        </Link>
                        <Link role="menuitem" to="/invitations" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary lg:hidden">
                          <Mail size={15} /> Convites
                        </Link>
                        <Link role="menuitem" to="/institutions" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary md:hidden">
                          <Building2 size={15} /> Instituições
                        </Link>
                        {isAdmin && (
                          <Link role="menuitem" to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary">
                            <Shield size={15} /> Painel de administração
                          </Link>
                        )}
                        <button
                          role="menuitem"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-destructive hover:bg-secondary"
                        >
                          <LogOut size={15} /> Terminar sessão
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="ml-2 hidden items-center gap-1 sm:flex">
              <Link to="/login" className="rounded-md px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Entrar
              </Link>
              <Link to="/register" className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">
                Criar conta
              </Link>
            </div>
          )}

          {!isAuthenticated && (
            <button onClick={() => setMobileOpen(!mobileOpen)} className={cn(iconBtn, 'sm:hidden')} aria-label="Abrir menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Em sessão, a navegação móvel é a barra inferior; aqui só entrar/criar conta */}
      {mobileOpen && !isAuthenticated && (
        <div className="animate-fade-in border-b border-border bg-background px-4 pb-4 sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground">
              Entrar
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
