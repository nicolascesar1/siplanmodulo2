import React from 'react';
import { PESInstance, PESComponent, MonitoringInstance, MonitoringEntry } from '../types';
import { PlanTree } from './common/PlanTree';
import { Layers, Target, CheckSquare, Activity, ChevronDown, ChevronRight, AlertTriangle, TrendingUp, TrendingDown, PenLine } from 'lucide-react';

interface MonitoringCascadeViewProps {
    plan: PESInstance;
    monitoring: MonitoringInstance;
    entries: Map<string, MonitoringEntry>;
    errors: Record<string, { result?: string; analysis?: string; location?: string; impact?: string }>;
    onEntryChange: (componentId: string, field: keyof MonitoringEntry, value: string) => void;
    isLocked: boolean;
    showOnlyMyUnit: boolean;
    searchTerm?: string;
}

export const MonitoringCascadeView: React.FC<MonitoringCascadeViewProps> = ({
    plan,
    monitoring,
    entries,
    errors,
    onEntryChange,
    isLocked,
    showOnlyMyUnit,
    searchTerm = ''
}) => {
    // Helpers
    const nomenclature = plan.customNomenclature || { level1: 'Diretriz', level2: 'Objetivo', level3: 'Meta' };
    const belongsToUnit = (component: PESComponent) => component.responsible === monitoring.unitName;

    // Calcula qual targetYearN usar baseado no período do monitoramento
    const getYearlyTarget = (component: PESComponent): string | undefined => {
        // Extrair o ano do período (ex: "Q2 2025" -> 2025, "T3 2026" -> 2026)
        const periodMatch = monitoring.period.match(/[QT]\d\s+(\d{4})/);
        if (!periodMatch) return component.targetValue;
        const monitoringYear = parseInt(periodMatch[1]);
        const yearIndex = monitoringYear - plan.startYear; // 0-based

        switch (yearIndex) {
            case 0: return component.targetYear1 || component.targetValue;
            case 1: return component.targetYear2 || component.targetValue;
            case 2: return component.targetYear3 || component.targetValue;
            case 3: return component.targetYear4 || component.targetValue;
            default: return component.targetValue;
        }
    };

    const getStatusOptions = () => [
        "NÃO INICIADA", "AÇÕES PREPARATÓRIAS", "EM ANDAMENTO", "CONCLUÍDA", "PARALISADA", "SUSPENSA"
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONCLUÍDA': return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
            case 'EM ANDAMENTO': return 'bg-brand-purple/10 text-brand-purple border-brand-purple/20';
            case 'NÃO INICIADA': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'PARALISADA':
            case 'SUSPENSA': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-white text-gray-700 border-gray-300';
        }
    };

    const getPerformanceStatus = (result: string, target?: string) => {
        if (!target) return null;
        const extractNumber = (str: string) => {
            const match = str.match(/(\d+(?:[.,]\d+)?)/);
            return match ? parseFloat(match[0].replace(',', '.')) : null;
        };
        const r = extractNumber(result);
        const t = extractNumber(target);
        if (r !== null && t !== null && t > 0) {
            if (r >= t) return { type: 'success', text: 'Meta Atingida' };
            if (r < t) return { type: 'warning', text: `Abaixo da Meta (${Math.round((r / t) * 100)}%)` };
        }
        return null;
    };

    const HighlightedText = ({ text }: { text: string }) => {
        if (!searchTerm) return <>{text}</>;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return <>{parts.map((part, i) => part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">{part}</mark> : part)}</>;
    };

    const RenderInputSection = ({ component }: { component: PESComponent }) => {
        const isBelonging = belongsToUnit(component);
        const shouldShowInput = isBelonging || !showOnlyMyUnit;

        if (!shouldShowInput) {
            return (
                <div className="mt-2 text-xs text-gray-400 italic pl-2 border-l-2 border-gray-100">
                    Responsável: {component.responsible} (Apenas visualização)
                </div>
            );
        }

        const entry = entries.get(component.id) || { result: '', status: 'NÃO INICIADA', analysis: '', location: '', impact: '', componentId: component.id, updatedAt: '' };
        const fieldErrors = errors[component.id];
        const isMeta = component.type === 'Meta';
        const isPPA = plan.planType === 'ppa';
        const yearlyTarget = isMeta ? getYearlyTarget(component) : undefined;
        const performance = isMeta ? getPerformanceStatus(entry.result, yearlyTarget) : null;
        const isResultRequired = ['EM ANDAMENTO', 'CONCLUÍDA', 'REALIZADA'].includes(entry.status);
        const isAnalysisRequired = true;

        return (
            <div className="px-6 py-5 cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-gray-400">
                        <PenLine className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Preenchimento</span>
                    </div>
                    {fieldErrors && (
                        <div className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-[10px] font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pendências
                        </div>
                    )}
                </div>

                <div className={`flex flex-col gap-4 ${isLocked ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={entry.status}
                                        onChange={(e) => onEntryChange(component.id, 'status', e.target.value)}
                                        className={`w-full py-1.5 pl-2 pr-6 border rounded text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all cursor-pointer ${getStatusStyle(entry.status)} print:border-none print:bg-transparent print:shadow-none print:px-0`}
                                    >
                                        {getStatusOptions().map(opt => <option key={opt} value={opt} className="bg-white text-gray-700">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2 w-3 h-3 pointer-events-none opacity-50 print:hidden" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    {isPPA ? "Resultado Alcançado (Apenas números)" : "Resultado"} {isResultRequired && <span className="text-red-500">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={isPPA ? "number" : "text"}
                                        value={entry.result}
                                        onChange={(e) => onEntryChange(component.id, 'result', e.target.value)}
                                        placeholder={isPPA ? "Apenas números" : (isMeta ? "Ex: 45%" : "Ex: 100")}
                                        className={`w-full py-1.5 px-2 bg-white border rounded text-xs focus:ring-2 transition-all outline-none text-gray-900 ${fieldErrors?.result ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-brand-purple/20 focus:border-brand-purple'} print:border-none print:px-0 print:bg-transparent print:placeholder-transparent`}
                                    />
                                    {performance && (
                                        <div className={`absolute right-1 top-1 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 ${performance.type === 'success' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-red-50 text-red-700'}`}>
                                            {performance.type === 'success' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                            {performance.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-8 flex flex-col">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                {isPPA ? "Breve Descrição sobre as ações realizadas" : "Análise Crítica"} {isAnalysisRequired && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={entry.analysis}
                                onChange={(e) => onEntryChange(component.id, 'analysis', e.target.value)}
                                placeholder={isPPA ? "Curto comentário sobre as ações realizadas..." : (isResultRequired ? "Evidências e justificativas..." : "Explique o status...")}
                                className={`w-full flex-1 min-h-[85px] p-2 bg-white border rounded text-xs focus:ring-2 transition-all outline-none resize-y leading-relaxed text-gray-900 ${fieldErrors?.analysis ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-brand-purple/20 focus:border-brand-purple'} print:border-none print:resize-none print:px-0 print:bg-transparent print:placeholder-transparent`}
                            />
                        </div>
                    </div>

                    {isPPA && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Quando e em qual município, região ou macrorregião as ações foram realizadas? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={entry.location || ''}
                                    onChange={(e) => onEntryChange(component.id, 'location', e.target.value)}
                                    placeholder="Data/período e localização..."
                                    className={`w-full min-h-[50px] p-2 bg-white border rounded text-xs focus:ring-2 transition-all outline-none resize-y leading-relaxed text-gray-900 ${fieldErrors?.location ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-brand-purple/20 focus:border-brand-purple'} print:border-none print:resize-none print:px-0 print:bg-transparent print:placeholder-transparent`}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Qual o impacto dessas ações para a população potiguar? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={entry.impact || ''}
                                    onChange={(e) => onEntryChange(component.id, 'impact', e.target.value)}
                                    placeholder="Comentário curto..."
                                    className={`w-full min-h-[50px] p-2 bg-white border rounded text-xs focus:ring-2 transition-all outline-none resize-y leading-relaxed text-gray-900 ${fieldErrors?.impact ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-brand-purple/20 focus:border-brand-purple'} print:border-none print:resize-none print:px-0 print:bg-transparent print:placeholder-transparent`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderRow = (component: PESComponent, depth: number, isCollapsed: boolean, toggle: () => void, hasChildren: boolean) => {
        // Diretriz
        if (component.type === 'Diretriz') {
            return (
                <div className={`group ${isCollapsed ? 'mb-2' : 'bg-gray-50/30 border-b border-gray-100'} relative overflow-hidden rounded-lg border border-gray-100`}>
                <div
                    onClick={toggle}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-teal" />

                    <div className={`p-1.5 rounded-full shadow-sm border transition-colors z-10 ${hasChildren ? 'bg-brand-teal text-white border-brand-teal' : 'bg-white text-gray-400 border-gray-200 group-hover:text-brand-teal'}`}>
                        {hasChildren ? (isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />) : <ChevronRight className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 z-10">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider bg-brand-teal px-2 py-0.5 rounded-full shadow-sm">
                                <Layers className="w-3 h-3" />
                                {nomenclature.level1}
                            </span>
                            {component.code && <span className="text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-full border border-brand-teal/20">{component.code}</span>}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug"><HighlightedText text={component.content} /></h3>
                    </div>
                </div>
                
                {!isCollapsed && plan.planType === 'ppa' && (
                    <div className="border-t border-brand-teal/20 bg-brand-teal/5">
                        <RenderInputSection component={component} />
                    </div>
                )}
            </div>
            );
        }

        // Objetivo
        if (component.type === 'Objetivo') {
            return (
                <div className="border border-gray-100 bg-white my-2 shadow-sm rounded-lg relative overflow-hidden group/obj">
                <div
                    onClick={toggle}
                    className="flex items-center gap-4 py-4 pr-4 pl-4 hover:bg-brand-purple/10 transition-all cursor-pointer"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple" />

                    <div className={`p-1 rounded-full shadow-sm border transition-colors z-10 ${hasChildren ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-400 border-gray-200 group-hover/obj:text-brand-purple'}`}>
                        {hasChildren ? (isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : <ChevronRight className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-purple uppercase tracking-wider bg-brand-purple/10 px-2 py-0.5 rounded-full border border-brand-purple/20">
                                <Target className="w-3 h-3" />
                                {nomenclature.level2}
                            </span>
                            {component.code && <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{component.code}</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-relaxed"><HighlightedText text={component.content} /></p>
                    </div>
                </div>

                {!isCollapsed && plan.planType === 'ppa' && (
                    <div className="border-t border-brand-purple/20 bg-brand-purple/5">
                        <RenderInputSection component={component} />
                    </div>
                )}
            </div>
            );
        }

        // Meta
        if (component.type === 'Meta') {
            const metaBelongs = belongsToUnit(component);
            return (
                <div className={`border border-gray-100 my-2 shadow-sm rounded-lg relative overflow-hidden group/meta ${metaBelongs ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <div
                        onClick={toggle}
                        className="flex items-start gap-3 py-3 pr-4 pl-4 hover:bg-brand-blue/10 transition-all cursor-pointer"
                    >
                        {/* Colored Bar */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue" />

                        <div className={`p-1 rounded-full shadow-sm border transition-colors mt-0.5 z-10 ${hasChildren ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-400 border-gray-200 group-hover/meta:text-brand-blue'}`}>
                            {hasChildren ? (isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                                <CheckSquare className="w-3 h-3" />
                                {nomenclature.level3}
                            </span>
                            {component.code && <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{component.code}</span>}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium"><HighlightedText text={component.content} /></p>

                        <div className="flex flex-wrap gap-2 mt-2.5">
                            {(() => {
                                const yearlyTarget = getYearlyTarget(component);
                                return yearlyTarget && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                        Meta do Ano: <span className="text-gray-900 font-bold">{yearlyTarget}</span>
                                        {component.measurementUnit && <span className="text-gray-400">({component.measurementUnit})</span>}
                                    </span>
                                );
                            })()}
                            {component.targetValue && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-400 bg-gray-50/50 px-2.5 py-1 rounded-full border border-gray-100">
                                    Meta Final: <span className="font-bold">{component.targetValue}</span>
                                </span>
                            )}
                            {component.deadline && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                    Prazo: <span className="text-gray-900 font-bold">{component.deadline}</span>
                                </span>
                            )}
                            </div>
                        </div>
                    </div>

                    {!isCollapsed && (
                        <div className="border-t border-brand-blue/20 bg-brand-blue/5">
                            <RenderInputSection component={component} />
                        </div>
                    )}
                </div>
            );
        }

        // Ação
        if (component.type === 'Ação') {
            const acaoBelongs = belongsToUnit(component);
            return (
                <div className={`relative my-1 rounded-lg border overflow-hidden group/acao transition-colors ${acaoBelongs ? 'bg-slate-50/50 border-gray-100 hover:border-sky-200' : 'bg-gray-50/30 border-gray-100 opacity-70'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-400" />
                    
                    <div className="flex items-start gap-3 py-3 pr-4 pl-4 hover:bg-sky-50 cursor-default">
                        <div className="mt-0.5 flex-shrink-0 z-10 text-sky-400 opacity-0 w-4">
                            {/* Spacer to align with siblings or keep blank */}
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                                    <Activity className="w-3 h-3" />
                                    Ação
                                </span>
                                {component.code && <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">{component.code}</span>}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed"><HighlightedText text={component.content} /></p>
                        </div>
                    </div>

                    <div className="border-t border-sky-200 bg-sky-50/50">
                        <RenderInputSection component={component} />
                    </div>
                </div>
            );
        }

        return null;
    };

    // Filter Logic
    const filterPredicate = (item: PESComponent) => {
        if (!showOnlyMyUnit) return true;
        
        if (plan.planType === 'ppa') {
            // PPA: All levels can be monitored and have their own responsible units
            if (['Diretriz', 'Objetivo', 'Meta'].includes(item.type)) {
                return belongsToUnit(item);
            }
        } else {
            // PAS: Only Meta and Ação are directly assigned and monitored
            if (item.type === 'Meta' || item.type === 'Ação') {
                return belongsToUnit(item);
            }
        }
        return false;
    };

    return (
        <PlanTree
            plan={plan}
            searchTerm={searchTerm}
            renderRow={renderRow}
            filterPredicate={filterPredicate}
        />
    );
};
