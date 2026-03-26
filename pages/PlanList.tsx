import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, FileText, ChevronRight, BarChart2 as BarChart2Icon } from 'lucide-react';
import { PESInstance, PESModel, MonitoringInstance } from '../types';
import { PlanCard } from '../components/PlanCard';
import { ExecutionStatusModal } from '../components/ExecutionStatusModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

// Temporary ArrowLeftIcon until we update PlanCard or use lucide everywhere
const ArrowLeftIcon = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>;


interface PlanListProps {
    plans: PESInstance[];
    models: PESModel[];
    monitorings: MonitoringInstance[];
    onCreateClick: () => void;
    onDeletePlan?: (id: string) => void;
}

export const PlanList: React.FC<PlanListProps> = ({ plans, models, monitorings, onCreateClick, onDeletePlan }) => {
    const navigate = useNavigate();
    const [selectedPlanForStatus, setSelectedPlanForStatus] = useState<PESInstance | null>(null);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={() => navigate('/admin')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 group">
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Planos e Instrumentos</h2>
                        <p className="text-sm text-gray-500 mt-1">Gerencie os planos cadastrados no sistema</p>
                    </div>
                </div>

                <button
                    onClick={onCreateClick}
                    className="flex items-center justify-center bg-brand-purple text-white px-5 py-2.5 rounded-lg hover:bg-brand-purple/90 active:bg-brand-purple/80 transition-all shadow-md shadow-brand-purple/20 font-medium text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, ano..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all shadow-sm"
                    />
                </div>
                <button className="text-sm text-brand-purple font-medium hover:text-brand-purple/80 transition-colors flex items-center px-2">
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 border border-gray-100">
                        <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Nenhum plano encontrado</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Comece criando o primeiro Plano para sua unidade ou ajuste os filtros.</p>
                    <button onClick={onCreateClick} className="text-brand-purple font-bold hover:underline">
                        Criar meu primeiro Plano
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                modelName={models.find(m => m.id === plan.modelId)?.name}
                                onClick={() => navigate(`/plan/${plan.id}`)}
                                onStatusClick={(p) => setSelectedPlanForStatus(p)}
                                onDelete={onDeletePlan ? () => setPlanToDelete(plan.id) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Plan Execution Status Modal */}
            {selectedPlanForStatus && (
                <ExecutionStatusModal
                    component={{ id: 'root', type: 'Diretriz', content: selectedPlanForStatus.name, ...selectedPlanForStatus } as any}
                    monitorings={monitorings}
                    plan={selectedPlanForStatus}
                    isPlanMode={true}
                    onClose={() => setSelectedPlanForStatus(null)}
                />
            )}

            <ConfirmDialog 
                isOpen={!!planToDelete}
                title="Excluir Plano e Instrumento"
                message="Tem certeza que deseja excluir este plano? Todos os dados, metas e ações serão perdidos."
                confirmText="Sim, Excluir"
                onConfirm={() => { if (planToDelete && onDeletePlan) onDeletePlan(planToDelete); setPlanToDelete(null); }}
                onCancel={() => setPlanToDelete(null)}
            />
        </div>
    );
};
