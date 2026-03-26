import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
    isOpen, title, message, onConfirm, onCancel, 
    confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = true 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-brand-purple/10 text-brand-purple'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{message}</p>
                    <div className="flex items-center gap-3 justify-end">
                        <button onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            {cancelText}
                        </button>
                        <button onClick={onConfirm} className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-brand-purple hover:bg-brand-purple/90 shadow-brand-purple/20'}`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
