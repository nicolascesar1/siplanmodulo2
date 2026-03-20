import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, Settings, Database, FileStack } from 'lucide-react';
import { UserRole } from '../../types';
import { SiplanLogo } from '../ui/Logo';

interface SidebarProps {
    userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
    const location = useLocation();
    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    }

    const linkClass = (path: string) => `
    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
    ${isActive(path)
            ? 'bg-brand-purple/10 text-brand-purple shadow-sm border border-brand-purple/20'
            : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:border-gray-100 border border-transparent'}
  `;

    return (
        <aside className="w-72 bg-gray-50/50 flex-shrink-0 hidden md:flex flex-col border-r border-gray-200 z-20 backdrop-blur-xl">
            <div className="h-20 flex flex-col items-center justify-center border-b border-gray-100 p-4 bg-white/50">
                <SiplanLogo />
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Menu Principal</h3>
                    <div className="space-y-1">

                        <Link to="/monitorings" className={linkClass('/monitorings')}>
                            <ClipboardCheck className={`w-5 h-5 mr-3 transition-colors ${isActive('/monitorings') ? 'text-brand-purple' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            Monitoramentos
                        </Link>
                    </div>
                </div>

                {userRole === 'admin' && (
                    <div className="animate-in fade-in duration-300">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Administração</h3>
                        <div className="space-y-1">
                            <Link to="/admin" className={linkClass('/admin')}>
                                <Settings className={`w-5 h-5 mr-3 transition-colors ${isActive('/admin') ? 'text-brand-purple' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                Painel Administrativo
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white/50">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Database className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-800">Banco de Dados</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Conectado (Mock)
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
