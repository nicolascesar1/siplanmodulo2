import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { UserRole } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
    userRole: UserRole;
    setUserRole: (r: UserRole) => void;
}

export const MainLayout: React.FC<LayoutProps> = ({ children, userRole, setUserRole }) => {
    const location = useLocation();

    const getBreadcrumbs = () => {
        if (location.pathname === '/admin') return ['Início', 'Painel Administrativo'];
        if (location.pathname === '/plans') return ['Início', 'Planos'];
        if (location.pathname.includes('/plan/')) return ['Início', 'Planos', 'Detalhes'];
        if (location.pathname === '/dashboard') return ['Início', 'Dashboard'];
        if (location.pathname === '/monitorings') return ['Início', 'Monitoramentos'];
        if (location.pathname.includes('/monitoring/')) return ['Início', 'Monitoramentos', 'Preenchimento'];
        return ['Início', 'Geral'];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="h-screen flex bg-[#f3f4f6] font-sans overflow-hidden">
            <Sidebar userRole={userRole} />

            <main className="flex-1 flex flex-col min-w-0">
                <Header userRole={userRole} setUserRole={setUserRole} />

                <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full">
                        <nav className="flex items-center text-xs text-gray-500 mb-6 bg-white/50 w-fit px-3 py-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />}
                                    <span className={index === breadcrumbs.length - 1 ? 'text-indigo-600 font-bold' : 'hover:text-gray-800 transition-colors'}>
                                        {crumb}
                                    </span>
                                </React.Fragment>
                            ))}
                        </nav>

                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
