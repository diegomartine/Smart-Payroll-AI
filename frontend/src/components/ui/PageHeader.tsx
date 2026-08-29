import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({ title, description, actions, backTo, backLabel }: PageHeaderProps) {
  return (
    <div>
      {backTo && (
        <Link to={backTo} className="breadcrumb-back">
          <ArrowLeft size={15} />
          {backLabel ?? 'Volver'}
        </Link>
      )}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {description && <p className="page-header-desc">{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
