import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Edit3, BarChart3, Network, Loader2, ArrowLeft, Download, FileText, ChevronDown, ChevronRight, BarChart2, Building2 } from 'lucide-react';
import { PESInstance, PESModel, MonitoringInstance, PESFormValues, PESComponent } from '../types';
import { PlanForm } from '../components/PlanForm';
import { ComponentManager } from '../components/ComponentManager';
import { useToast } from '../context/ToastContext';

// Temporary ArrowLeftIcon
const ArrowLeftIcon = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>;

interface PlanDetailProps {
    plans: PESInstance[];
    models: PESModel[];
    monitorings: MonitoringInstance[];
    units: string[];
    onUpdate: (plan: PESInstance) => Promise<void>;
}

export const PlanDetail: React.FC<PlanDetailProps> = ({ plans, models, monitorings, units, onUpdate }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const { showToast } = useToast();

    // Consolidated Results Filter
    const [selectedPeriod, setSelectedPeriod] = useState<string>('Todos');

    const plan = plans.find(p => p.id === id);
    const model = models.find(m => m.id === plan?.modelId);

    if (!plan) return <Navigate to="/" />;

    const handleEditSubmit = async (values: PESFormValues) => {
        await onUpdate({
            ...plan,
            ...values,
            updatedAt: new Date().toISOString()
        });
        setIsEditing(false);
        showToast('Plano atualizado com sucesso!', 'success');
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'Realizada': 'bg-teal-100 text-teal-700 border-teal-200',
            'Em andamento': 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
            'Não realizada': 'bg-gray-100 text-gray-600 border-gray-200',
        }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${styles}`}>{status}</span>;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-bl-full opacity-50 -mr-8 -mt-8 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={() => navigate('/plans')} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 group">
                                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{plan.name}</h1>
                            {getStatusBadge(plan.status)}
                        </div>
                        <div className="text-gray-500 text-sm font-medium flex gap-4 ml-10 mt-2">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs border border-gray-100"><BarChart3 className="w-3.5 h-3.5 text-brand-purple" /> {plan.startYear} - {plan.endYear}</span>
                            {plan.monitoringFrequency && (
                                <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border font-bold ${plan.monitoringFrequency === 'Trimestral' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                    {plan.monitoringFrequency}
                                </span>
                            )}
                        </div>
                        {plan.description && (
                            <p className="mt-4 ml-10 text-gray-600 text-sm max-w-4xl leading-relaxed bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                                {plan.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 items-end min-w-[200px]">
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filtro de Resultados</label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-brand-purple focus:border-brand-purple block p-2 w-full shadow-sm"
                                >
                                    <option value="Todos">Todos os Períodos</option>
                                    {plan.monitoringFrequency === 'Trimestral' ? (
                                        <>
                                            <option value="1º Trimestre">1º Trimestre</option>
                                            <option value="2º Trimestre">2º Trimestre</option>
                                            <option value="3º Trimestre">3º Trimestre</option>
                                            <option value="4º Trimestre">4º Trimestre</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="1º Quadrimestre">1º Quadrimestre</option>
                                            <option value="2º Quadrimestre">2º Quadrimestre</option>
                                            <option value="3º Quadrimestre">3º Quadrimestre</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-brand-purple/30 hover:text-brand-purple transition-colors text-sm font-medium shadow-sm w-full"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar Info
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden">
                <ComponentManager
                    plan={plan}
                    monitorings={monitorings}
                    units={units}
                    onUpdatePlan={async (p) => { await onUpdate(p); showToast('Estrutura atualizada', 'success'); }}
                    selectedPeriod={selectedPeriod}
                />
            </div>

            {isEditing && (
                <PlanForm
                    title="Editar Plano"
                    initialValues={plan}
                    models={models}
                    onCancel={() => setIsEditing(false)}
                    onSubmit={handleEditSubmit}
                />
            )}
        </div>
    );
};
