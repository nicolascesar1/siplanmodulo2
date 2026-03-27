import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { UserRole, PESInstance } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
    userRole: UserRole;
    setUserRole: (r: UserRole) => void;
    plans: PESInstance[];
}

export const MainLayout: React.FC<LayoutProps> = ({ children, userRole, setUserRole, plans }) => {
    const location = useLocation();

    const getBreadcrumbs = () => {
        const path = location.pathname;
        if (path === '/admin') return ['Início', 'Administração'];
        if (path === '/plans') return ['Início', 'Instrumentos'];
        
        if (path.includes('/plan/')) {
            const id = path.split('/').pop();
            const plan = plans.find(p => p.id === id);
            return ['Início', 'Instrumentos', plan ? plan.name : 'Detalhes'];
        }

        if (path === '/monitorings') return ['Início', 'Monitoramentos'];

        if (path.includes('/monitoring/')) {
            // Can't easily get monitoring name here without passing more props, 
            // but we can identify the section.
            return ['Início', 'Monitoramentos', 'Preenchimento'];
        }

        return ['Início'];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="h-screen flex bg-[#f3f4f6] font-sans overflow-hidden">
            <Sidebar userRole={userRole} />

            <main className="flex-1 flex flex-col min-w-0">
                <Header userRole={userRole} setUserRole={setUserRole} />

                <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full">
                        <nav className="flex items-center text-[10px] font-bold text-gray-400 mb-6 bg-white/80 backdrop-blur-md w-fit px-4 py-2 rounded-xl border border-white/40 shadow-sm transition-all hover:shadow-md">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-3 h-3 mx-2.5 text-gray-300" />}
                                    <span className={`uppercase tracking-widest transition-all ${index === breadcrumbs.length - 1 ? 'text-brand-purple font-black' : 'hover:text-brand-purple/70 cursor-default'}`}>
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
