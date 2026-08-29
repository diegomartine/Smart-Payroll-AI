export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="loading-block">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
