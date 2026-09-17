'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon, ZapIcon, XIcon } from './icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // Keep max 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 max-w-[480px] mx-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 w-full bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg pointer-events-auto transition-all animate-in slide-in-from-top fade-in duration-300"
          >
            {t.type === 'success' && <CheckIcon className="text-emerald-400" size={20} />}
            {t.type === 'error' && <AlertTriangleIcon className="text-rose-400" size={20} />}
            {t.type === 'info' && <ZapIcon className="text-sky-400" size={20} />}
            <span className="flex-1 text-sm font-medium text-slate-100">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-200">
              <XIcon size={16} />
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
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
