import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  return ctx || { show: () => {}, hide: () => {} };
}

export function NotificationProvider({ children }) {
  const [item, setItem] = useState(null);

  const show = useCallback((message, type = 'info') => {
    setItem({ message, type });
    const t = setTimeout(() => {
      setItem(null);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const hide = useCallback(() => setItem(null), []);

  return (
    <NotificationContext.Provider value={{ show, hide }}>
      {children}
      {item && (
        <div
          className="form-notification"
          role="alert"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10002,
            padding: '12px 24px',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            maxWidth: '90vw',
            fontSize: 15,
            backgroundColor: item.type === 'error' ? '#d32f2f' : item.type === 'success' ? '#2e7d32' : '#1976d2',
            color: '#fff',
          }}
        >
          {item.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
