import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState
        icon={<Compass size={20} />}
        title="Página no encontrada"
        description="La ruta que buscas no existe o fue movida."
        action={
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Ir al dashboard
          </Link>
        }
      />
    </div>
  );
}
