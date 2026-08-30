import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const sectionNames: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Empleados',
  positions: 'Cargos',
  payroll: 'Nóminas',
  imports: 'Importar Excel',
  analysis: 'Análisis',
  departments: 'Departamentos',
};

interface TopbarProps {
  onOpenMenu: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const location = useLocation();
  const segment = location.pathname.split('/')[1] ?? '';
  const section = sectionNames[segment] ?? 'Smart Payroll AI';

  return (
    <header className="topbar">
      <div className="flex gap-12" style={{ alignItems: 'center' }}>
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-eyebrow">Smart Payroll AI</div>
          <div className="topbar-title">{section}</div>
        </div>
      </div>
    </header>
  );
}
