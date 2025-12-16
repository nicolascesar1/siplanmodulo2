import React, { useState } from 'react';
import { Menu, Sun, Bell, ChevronDown, CheckCircle, LogOut } from 'lucide-react';
import { UserRole } from '../../types';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
    userRole: UserRole;
    setUserRole: (r: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ userRole, setUserRole }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { showToast } = useToast();

    const roles: { id: UserRole, label: string, desc: string }[] = [
        { id: 'admin', label: 'Administrador', desc: 'Acesso total ao sistema' },
        { id: 'gestor', label: 'Gestor (Coordenação)', desc: 'Valida e submete monitoramentos' },
        { id: 'tecnico', label: 'Técnico (Executor)', desc: 'Preenche dados de execução' },
    ];

    const currentRoleLabel = roles.find(r => r.id === userRole)?.label;

    const handleRoleChange = (roleId: UserRole) => {
        setUserRole(roleId);
        setIsDropdownOpen(false);
        showToast(`Perfil alterado para ${roleId.toUpperCase()}`, 'info');
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm transition-all">
            <div className="flex items-center">
                <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-2">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button className="p-1.5 bg-white text-yellow-500 shadow-sm rounded-full transition-all">
                        <Sun className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-all ml-1">
                        <Bell className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-full transition-all border border-transparent hover:border-gray-200 group"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${userRole === 'admin' ? 'bg-gradient-to-br from-brand-purple to-indigo-700' :
                            userRole === 'gestor' ? 'bg-gradient-to-br from-brand-teal to-teal-700' :
                                'bg-gradient-to-br from-brand-blue to-blue-700'
                            }`}>
                            {userRole === 'admin' ? 'AD' : userRole === 'gestor' ? 'GE' : 'TE'}
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold text-gray-700 leading-none">Usuário {userRole === 'admin' ? 'Admin' : 'Sistema'}</span>
                                <span className="text-[10px] text-gray-500 leading-none mt-1 uppercase">{currentRoleLabel}</span>
                            </div>
                            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Simular Perfil</p>
                                    <div className="space-y-1">
                                        {roles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => handleRoleChange(role.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between group transition-colors ${userRole === role.id
                                                    ? 'bg-brand-purple/10 text-brand-purple ring-1 ring-brand-purple/20'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-bold">{role.label}</div>
                                                    <div className="text-[10px] text-gray-400 font-normal">{role.desc}</div>
                                                </div>
                                                {userRole === role.id && <CheckCircle className="w-4 h-4 text-brand-purple" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sair do Sistema
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
