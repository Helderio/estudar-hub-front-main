import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo, WASignature } from '@/shared/ui/brand';
import { adminNavGroups } from './adminNav';

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-16 shrink-0 items-center border-b border-border px-4', collapsed && 'justify-center px-0')}>
        <Logo to="/admin" compact={collapsed} />
      </div>

      <nav aria-label="Administração" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            {collapsed ? <div className="mx-auto mb-2 h-px w-6 bg-border" /> : <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground/80">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                      isActive ? 'bg-secondary font-semibold text-foreground' : 'font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                      collapsed && 'justify-center px-0',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -left-3 bottom-1.5 top-1.5 w-0.5 rounded-full bg-primary" />}
                      <item.icon size={17} className={cn('shrink-0', isActive && 'text-primary')} />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('flex items-center border-t border-border px-3 py-3', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && <WASignature className="pl-3 text-xs" />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </aside>
  );
};
