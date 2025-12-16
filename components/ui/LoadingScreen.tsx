import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] w-full animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Conectando ao Banco de Dados...</h3>
        <p className="text-gray-500 text-sm">Carregando informações do servidor</p>
    </div>
);
