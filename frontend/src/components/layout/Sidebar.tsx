import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Wallet, FileSpreadsheet, Sparkles, Building2 } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Empleados', icon: Users },
  { to: '/positions', label: 'Cargos', icon: Briefcase },
  { to: '/payroll', label: 'Nóminas', icon: Wallet },
  { to: '/imports', label: 'Importar Excel', icon: FileSpreadsheet },
  { to: '/analysis', label: 'Análisis', icon: Sparkles },
];

// Sección aparte para no tocar la navegación existente (Cargos, etc.).
const settingsLinks = [{ to: '/departments', label: 'Departamentos', icon: Building2 }];

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onNavigate} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg
            className="sidebar-brand-mark"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="7" fill="#142e4d" />
            <rect x="8" y="18" width="4" height="8" rx="1" fill="#b8873b" />
            <rect x="14" y="12" width="4" height="14" rx="1" fill="#edeff3" />
            <rect x="20" y="6" width="4" height="20" rx="1" fill="#b8873b" />
          </svg>
          <span className="sidebar-brand-text">
            Smart Payroll AI
            <span className="sidebar-brand-sub">Gestión de nómina</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          <span className="sidebar-section-label">Configuración</span>
          {settingsLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">Smart-Payroll-AI · v1.0</div>
      </aside>
    </>
  );
}
