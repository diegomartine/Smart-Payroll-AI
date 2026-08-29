import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal } from '../components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    setOptions(null);
    resolver.current?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal onClose={() => close(false)} title={options.title}>
          <div className="stack" style={{ gap: 16 }}>
            <div className="flex gap-12" style={{ alignItems: 'flex-start' }}>
              <AlertTriangle
                size={20}
                color={options.danger ? '#b3261e' : '#93650f'}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              {options.description && (
                <p className="text-muted" style={{ fontSize: 13.5 }}>
                  {options.description}
                </p>
              )}
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => close(false)}>
                Cancelar
              </button>
              <button
                className={options.danger ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={() => close(true)}
              >
                {options.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}
