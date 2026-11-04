import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Attention') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Information') => addToast({ type: 'info', title, message }),
    remove: removeToast
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white text-slate-800 shadow-soft';
      case 'error':
        return 'border-red-200 bg-white text-slate-800 shadow-soft';
      case 'warning':
        return 'border-amber-200 bg-white text-slate-800 shadow-soft';
      default:
        return 'border-teal-200 bg-white text-slate-800 shadow-soft';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 text-xs shadow-lift ${getStyles(
              t.type
            )}`}
          >
            {getIcon(t.type)}
            <div className="flex-1 min-w-0">
              {t.title && <div className="font-semibold text-slate-900 leading-tight">{t.title}</div>}
              <div className="text-slate-600 mt-0.5 leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('Toast:', msg),
      error: (msg) => console.error('Toast error:', msg),
      warning: (msg) => console.warn('Toast warning:', msg),
      info: (msg) => console.info('Toast info:', msg)
    };
  }
  return context;
};
