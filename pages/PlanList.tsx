import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, FileText, ChevronRight, ArrowDownUp, MoreHorizontal, Trash2, Eye, Layout } from 'lucide-react';
import { PESInstance, PESModel, MonitoringInstance, PESFormValues } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const ArrowLeftIcon = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>;

interface PlanListProps {
    plans: PESInstance[];
    models: PESModel[];
    monitorings: MonitoringInstance[];
    onCreateClick: (initialValues?: Partial<PESFormValues>) => void;
    onDeletePlan?: (id: string) => void;
}

export const PlanList: React.FC<PlanListProps> = ({ plans, models, monitorings, onCreateClick, onDeletePlan }) => {
    // ... skipping state ...
    const navigate = useNavigate();

    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlans = useMemo(() => {
        // ... (existing filter logic)
        return plans.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.startYear.toString().includes(searchTerm) ||
            p.endYear.toString().includes(searchTerm)
        );
    }, [plans, searchTerm]);

    const getPlanTypeBadge = (type?: string, acronym?: string) => {
        const styles = {
            'pes': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'pas': 'bg-teal-100 text-teal-700 border-teal-200',
            'ppa': 'bg-blue-100 text-blue-700 border-blue-200',
            'custom': 'bg-amber-100 text-amber-700 border-amber-200',
        }[type || 'pes'] || 'bg-gray-100 text-gray-700 border-gray-200';

        const label = type === 'custom'
            ? (acronym || 'CUSTOM')
            : ({'pes': 'PES', 'pas': 'PAS', 'ppa': 'PPA'}[type || 'pes'] || type?.toUpperCase());

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider border ${styles}`}>
                {label}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'Realizada': 'bg-teal-50 text-teal-600 border-teal-100',
            'Em andamento': 'bg-brand-purple/5 text-brand-purple border-brand-purple/10',
            'Não iniciada': 'bg-gray-50 text-gray-500 border-gray-100',
            'Pendente': 'bg-amber-50 text-amber-600 border-amber-100',
        }[status] || 'bg-gray-50 text-gray-500 border-gray-100';

        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-300 relative flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/admin')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 group">
                            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Planos e Instrumentos</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Gerencie os planos e cronogramas estratégicos da unidade</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onCreateClick()}
                        className="flex items-center justify-center bg-brand-purple text-white px-5 py-2.5 rounded-lg hover:bg-brand-purple/90 active:bg-brand-purple/80 transition-all shadow-md shadow-brand-purple/20 font-bold text-sm"
                    >
                        <Plus className="w-4.5 h-4.5 mr-2" />
                        Novo Instrumento
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 text-xs">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, ano ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/10 focus:border-brand-purple transition-all shadow-sm placeholder:text-gray-400"
                        />
                    </div>
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-brand-purple font-bold hover:text-brand-purple/80 transition-colors flex items-center px-2.5 py-1.5 bg-brand-purple/5 rounded-lg border border-brand-purple/10 shadow-sm"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Limpar Filtro
                        </button>
                    )}
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                        Total de Instrumentos: <span className="text-brand-purple font-black ml-1 text-xs">{filteredPlans.length}</span>
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                            <th className="px-6 py-4">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
                                    Instrumento <ArrowDownUp className="w-3 h-3 opacity-50" />
                                </div>
                            </th>
                            <th className="px-4 py-4">Tipo</th>
                            <th className="px-4 py-4">Vigência</th>
                            <th className="px-4 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredPlans.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                            <FileText className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800">Nenhum instrumento encontrado</h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Tente ajustar sua busca ou crie um novo planejamento para começar.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPlans.map(plan => {
                                const basePlan = (plan.planType === 'pas') && plan.basePlanId ? plans.find(p => p.id === plan.basePlanId) : null;
                                
                                return (
                                    <tr key={plan.id} className="hover:bg-gray-50/80 transition-all group cursor-pointer" onClick={() => navigate(`/plan/${plan.id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-brand-purple transition-colors">
                                                    {plan.name}
                                                </span>
                                                {basePlan && (
                                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 w-fit px-1.5 py-0.5 rounded mt-1 border border-indigo-100">
                                                        REF: {basePlan.name}
                                                    </span>
                                                )}
                                                {plan.description && !basePlan && (
                                                    <span className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-[400px]">
                                                        {plan.description}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getPlanTypeBadge(plan.planType, plan.planAcronym)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-100/50 px-2 py-1 rounded inline-flex border border-gray-100">
                                                {plan.startYear} — {plan.endYear}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {plan.planType === 'pes' && (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            onCreateClick({ 
                                                                planType: 'pas', 
                                                                basePlanId: plan.id, 
                                                                name: `PAS ${new Date().getFullYear() + 1}`,
                                                                referenceYear: new Date().getFullYear() + 1
                                                            }); 
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-[10px] font-black tracking-tight border border-teal-200 transition-all"
                                                        title="Criar Programação Anual (PAS)"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        CRIAR PAS
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/plan/${plan.id}`); }}
                                                    className="p-1.5 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-all"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); if (onDeletePlan) setPlanToDelete(plan.id); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer (Visual Only) */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
                <span className="text-xs text-gray-500 font-medium ml-2">Página 1 de 1</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <button className="p-2 text-gray-400 hover:bg-gray-50 border-r border-gray-100" disabled><ChevronRight className="w-4 h-4 rotate-180" /></button>
                    <button className="px-3 py-1 text-xs font-bold bg-brand-purple/10 text-brand-purple">1</button>
                    <button className="p-2 text-gray-400 hover:bg-gray-50 border-l border-gray-100" disabled><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>


            <ConfirmDialog 
                isOpen={!!planToDelete}
                title="Excluir Plano e Instrumento"
                message="Tem certeza que deseja excluir este plano? Todos os dados, metas e ações vinculadas serão permanentemente removidos."
                confirmText="Sim, Excluir Registro"
                onConfirm={() => { if (planToDelete && onDeletePlan) onDeletePlan(planToDelete); setPlanToDelete(null); }}
                onCancel={() => setPlanToDelete(null)}
            />
        </div>
    );
};
