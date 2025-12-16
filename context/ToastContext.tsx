import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextData {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`pointer-events-auto flex items-center p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-10 duration-300 ${
              t.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : 
              t.type === 'error' ? 'bg-white border-red-100 text-red-800' : 
              'bg-white border-blue-100 text-blue-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />}
            {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 mr-3" />}
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
