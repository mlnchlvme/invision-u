import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

let _push = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  useEffect(() => { _push = push; return () => { _push = null; }; }, [push]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', bottom: 80, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--green)' : 'var(--text)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 'var(--r)',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUpGlobal .25s ease both',
              maxWidth: 320,
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function toast(msg, type = 'info') {
  if (_push) _push(msg, type);
}
