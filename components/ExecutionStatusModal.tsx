import React, { useState } from 'react';
import { X, Calendar, Activity, CheckCircle2, TrendingUp, AlertCircle, FileText, Building2, Layers, Target, CheckSquare } from 'lucide-react';
import { PESComponent, MonitoringInstance, MonitoringEntry, PESInstance } from '../types';

interface ExecutionStatusModalProps {
    component: PESComponent;
    monitorings: MonitoringInstance[];
    onClose: () => void;
    plan?: PESInstance;
    isPlanMode?: boolean;
}

export const ExecutionStatusModal: React.FC<ExecutionStatusModalProps> = ({ component, monitorings, onClose, plan, isPlanMode }) => {
    const defaultPeriods = ['1º Quadrimestre', '2º Quadrimestre', '3º Quadrimestre'];
    const trimestralPeriods = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];
    const periods = plan?.monitoringFrequency === 'Trimestral' ? trimestralPeriods : defaultPeriods;
    const [selectedTab, setSelectedTab] = useState<string>(periods[0]);

    // Recursive helper to get all descendant IDs
    const getAllDescendants = (parentId: string): string[] => {
        if (!plan?.components) return [];
        const children = plan.components.filter(c => c.parentId === parentId);
        const childIds = children.map(c => c.id);
        const descendantIds = children.flatMap(c => getAllDescendants(c.id));
        return [...childIds, ...descendantIds];
    };

    // Determine relevant component IDs (self + descendants if high-level)
    const relevantComponentIds = React.useMemo(() => {
        const ids = [component.id];
        if (plan && (component.type === 'Diretriz' || component.type === 'Objetivo')) {
            ids.push(...getAllDescendants(component.id));
        }
        return new Set(ids);
    }, [component, plan]);

    // Get relevant monitorings for this plan
    const planMonitorings = monitorings.filter(m => m.planId === component.planId);

    // Helper to find entry for a specific period
    const getEntryForPeriod = (period: string) => {
        // Find monitorings for this period
        const periodMonitorings = planMonitorings.filter(m => m.period === period);

        // Find entries for RELEVANT components in those monitorings
        const entries = periodMonitorings.flatMap(m =>
            (m.entries || [])
                .filter(e => relevantComponentIds.has(e.componentId))
                .map(e => {
                    // Enrich with component name if it's a child
                    const linkedComponent = plan?.components?.find(c => c.id === e.componentId);
                    return {
                        ...e,
                        unitName: m.unitName,
                        status_monitoring: m.status,
                        componentName: linkedComponent ? linkedComponent.content : null,
                        componentType: linkedComponent ? linkedComponent.type : null,
                        componentCode: linkedComponent ? linkedComponent.code : null
                    };
                })
        );

        return entries;
    };

    const currentEntries = getEntryForPeriod(selectedTab);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${component.type === 'Meta' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                }`}>
                                {component.type}
                            </span>
                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded border border-gray-300">
                                {component.code}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-snug">{component.content}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    {periods.map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedTab(period)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${selectedTab === period
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            {period}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {currentEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <Activity className="w-12 h-12 text-gray-300 mb-3" />
                            <h3 className="text-gray-900 font-bold mb-1">Sem registros para este período</h3>
                            <p className="text-gray-500 text-sm">Nenhuma unidade reportou o status de execução para o {selectedTab}.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {currentEntries.map((entry, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                                    {entry.componentName && (
                                        <div className="px-5 py-3 border-b border-gray-100 bg-white flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${entry.componentType === 'Ação' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {entry.componentType}
                                                </span>
                                                {entry.componentCode && (
                                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200">
                                                        {entry.componentCode}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-800 leading-snug">
                                                {entry.componentName}
                                            </h4>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                        <div className="flex items-center gap-2 font-semibold text-gray-600 text-sm">
                                            <Building2 className="w-4 h-4 text-indigo-400" />
                                            {entry.unitName}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border self-start sm:self-auto ${entry.status_monitoring === 'Finalizado'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                            Status: {entry.status_monitoring}
                                        </span>
                                    </div>

                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Resultado Quantitativo</span>
                                            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                                                {entry.result}
                                                <span className="text-sm font-medium text-gray-500 self-end mb-1">{component.measurementUnit}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Status da Ação</span>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span className="font-semibold text-gray-800">Em Execução / Realizada</span>
                                                {/* Note: The individual entry status isn't explicitly stored in MonitoringEntry in the current type def, defaulting to generic layout if missing */}
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5" /> Análise Qualitativa
                                            </span>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed italic relative">
                                                <span className="absolute top-2 left-2 text-3xl text-gray-200 font-serif leading-none">“</span>
                                                <span className="relative z-10">{entry.analysis || "Sem análise registrada."}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
