import React from 'react';
import { PESInstance, PESComponent, MonitoringInstance, MonitoringEntry } from '../types';
import { PlanTree } from './common/PlanTree';
import { Layers, Target, CheckSquare, Activity, ChevronDown, ChevronRight, AlertTriangle, TrendingUp, TrendingDown, PenLine, Eye } from 'lucide-react';

interface MonitoringCascadeViewProps {
    plan: PESInstance;
    monitoring: MonitoringInstance;
    entries: Map<string, MonitoringEntry>;
    errors: Record<string, { result?: string; analysis?: string; location?: string; impact?: string }>;
    onEntryChange: (componentId: string, field: keyof MonitoringEntry, value: string) => void;
    isLocked: boolean;
    showOnlyMyUnit: boolean;
    searchTerm?: string;
    allMonitorings?: MonitoringInstance[];
}



export const MonitoringCascadeView: React.FC<MonitoringCascadeViewProps> = ({
    plan,
    monitoring,
    entries,
    errors,
    onEntryChange,
    isLocked,
    showOnlyMyUnit,
    searchTerm = '',
    allMonitorings = []
}) => {
    // Helpers
    const nomenclature = plan.customNomenclature || { level1: 'Diretriz', level2: 'Objetivo', level3: 'Meta' };
    const belongsToUnit = (component: PESComponent) => component.responsible === monitoring.unitName;

    // Verifica se a Meta possui Ações filhas pertencentes à unidade do monitoramento
    const hasChildActionsForUnit = (metaId: string): boolean => {
        return plan.components.some(c =>
            c.parentId === metaId &&
            c.type === 'Ação' &&
            c.responsible === monitoring.unitName
        );
    };

    // Verifica se o item é uma Meta "secundária" (unidade tem ações, mas não é dona da meta)
    const isSecondaryMeta = (component: PESComponent): boolean => {
        return component.type === 'Meta' && !belongsToUnit(component) && hasChildActionsForUnit(component.id);
    };

    // Verifica recursivamente se existe alguma Meta pertencente à unidade sob este nó
    const hasPrimaryMetaUnderNode = (nodeId: string): boolean => {
        const children = plan.components.filter(c => c.parentId === nodeId);
        for (const child of children) {
            if (child.type === 'Meta' && belongsToUnit(child)) return true;
            if (child.type === 'Objetivo' || child.type === 'Meta') {
                if (hasPrimaryMetaUnderNode(child.id)) return true;
            }
        }
        return false;
    };

    // Diretrizes e Objetivos em PAS funcionam como "contexto secundário" 
    // se não houver responsabilidade direta neles ou em nenhuma Meta abaixo
    const isSecondaryContext = (component: PESComponent): boolean => {
        if (component.type === 'Ação' || component.type === 'Meta') return false;
        if (belongsToUnit(component)) return false;
        
        // No PAS, colorir apenas se houver Meta primária abaixo
        return !hasPrimaryMetaUnderNode(component.id);
    };

    // Busca o responsável relevante para um nó (dele mesmo ou da primeira Meta filha)
    const getResponsibleForNode = (nodeId: string): string | undefined => {
        const node = plan.components.find(c => c.id === nodeId);
        if (node?.responsible) return node.responsible;
        // Buscar a primeira Meta filha
        const children = plan.components.filter(c => c.parentId === nodeId);
        for (const child of children) {
            if (child.type === 'Meta' && child.responsible) return child.responsible;
            const deeper = getResponsibleForNode(child.id);
            if (deeper) return deeper;
        }
        return undefined;
    };

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

    // --- Progress Calculation ---
    const extractNumber = (str: string) => {
        if (!str) return null;
        const match = str.replace(/\./g, '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[0]) : null;
    };

    // Compute accumulated result across all monitorings for a given component
    const getAccumulatedResult = (componentId: string): number => {
        let total = 0;
        // Current entry (live, not yet saved)
        const currentEntry = entries.get(componentId);
        if (currentEntry) {
            const val = extractNumber(currentEntry.result);
            if (val !== null) total += val;
        }
        // Other monitorings for the same plan (exclude current to avoid double-count)
        allMonitorings.forEach(m => {
            if (m.id === monitoring.id) return; // skip current
            if (m.planId !== monitoring.planId) return; // different plan
            m.entries?.forEach(e => {
                if (e.componentId === componentId) {
                    const val = extractNumber(e.result);
                    if (val !== null) total += val;
                }
            });
        });
        return total;
    };
    
    const getProgressBgColor = (pct: number, isSecondary: boolean) => {
        if (isSecondary) return 'bg-gray-400';
        if (pct === 0) return 'bg-gray-300';
        if (pct < 34) return 'bg-red-400';
        if (pct < 67) return 'bg-yellow-400';
        if (pct < 100) return 'bg-green-500';
        return 'bg-emerald-500';
    };
    
    const getProgressTextColor = (pct: number, isSecondary: boolean) => {
        if (isSecondary) return 'text-gray-500';
        if (pct === 0) return 'text-gray-400';
        if (pct < 34) return 'text-red-500';
        if (pct < 67) return 'text-yellow-600';
        if (pct < 100) return 'text-green-600';
        return 'text-emerald-500';
    };

    // Buscar a entry preenchida pelo dono real da meta (nos allMonitorings)
    const getOwnerEntry = (componentId: string): MonitoringEntry | null => {
        for (const m of allMonitorings) {
            if (m.planId !== monitoring.planId) continue;
            if (m.id === monitoring.id) continue;
            const found = m.entries?.find(e => e.componentId === componentId);
            if (found && (found.result || found.analysis)) return found;
        }
        return null;
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
        const isSecondary = isSecondaryMeta(component);
        
        // Se não pertence à unidade, NUNCA mostrar campos editáveis
        if (!isBelonging) {
            // Se estamos filtrando por unidade e o item não é secundário, não mostrar nada
            if (showOnlyMyUnit && !isSecondary) {
                return (
                    <div className="mt-2 text-xs text-gray-400 italic pl-2 border-l-2 border-gray-100">
                        Responsável: {component.responsible} (Apenas visualização)
                    </div>
                );
            }
            
            // Para itens de outros setores: view read-only com dados do dono
            const ownerEntry = getOwnerEntry(component.id);
            const localEntry = entries.get(component.id) || { result: '', status: 'NÃO INICIADA', analysis: '', componentId: component.id, updatedAt: '' };
            const displayEntry = ownerEntry || localEntry;
            const isPPA = plan.planType === 'ppa';

            return (
                <div className="px-6 py-4 cursor-default bg-gray-50/80 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Somente Visualização</span>
                        </div>
                        <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 font-medium">
                            Resp.: {component.responsible}
                        </span>
                    </div>

                    <div className="opacity-60 pointer-events-none select-none">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4 space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                                    <div className={`w-full py-1.5 pl-2 pr-6 border rounded text-xs font-semibold ${getStatusStyle(displayEntry.status)}`}>
                                        {displayEntry.status || 'NÃO INICIADA'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Resultado</label>
                                    <div className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 min-h-[28px]">
                                        {displayEntry.result || <span className="text-gray-300 italic">Não preenchido</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-8">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    {isPPA ? 'Descrição' : 'Análise Crítica'}
                                </label>
                                <div className="w-full min-h-[60px] p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {displayEntry.analysis || <span className="text-gray-300 italic">Não preenchido</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- COMPONENTE PERTENCE À UNIDADE: View editável ---
        const shouldShowInput = isBelonging || !showOnlyMyUnit;

        if (!shouldShowInput) {
            return (
                <div className="mt-2 text-xs text-gray-400 italic pl-2 border-l-2 border-gray-100">
                    Responsável: {component.responsible} (Apenas visualização)
                </div>
            );
        }

        const localEntry = entries.get(component.id) || { result: '', status: 'NÃO INICIADA', analysis: '', location: '', impact: '', componentId: component.id, updatedAt: '' };
        const fieldErrors = errors[component.id];
        const isMeta = component.type === 'Meta';
        const isPPA = plan.planType === 'ppa';
        const yearlyTarget = isMeta ? getYearlyTarget(component) : undefined;
        const entry = localEntry;

        const performance = isMeta ? getPerformanceStatus(entry.result, yearlyTarget) : null;
        const isResultRequired = ['EM ANDAMENTO', 'CONCLUÍDA', 'REALIZADA'].includes(entry.status);
        const isAnalysisRequired = true;

        // --- PRIMARY (editable) view ---
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
            const isSecondary = isSecondaryContext(component);
            return (
                <div className={`group ${isCollapsed ? 'mb-2' : 'bg-gray-50/30 border-b border-gray-100'} relative overflow-hidden rounded-lg border border-gray-100 transition-all ${isSecondary ? 'grayscale opacity-75' : ''}`}>
                <div
                    onClick={toggle}
                    className={`flex items-center gap-4 p-5 transition-all cursor-pointer ${isSecondary ? 'hover:bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                    <div className={`absolute top-0 left-0 w-1 h-full ${isSecondary ? 'bg-gray-400' : 'bg-brand-teal'}`} />

                    <div className={`p-1.5 rounded-full shadow-sm border transition-colors z-10 ${hasChildren ? (isSecondary ? 'bg-gray-400 text-white border-gray-400' : 'bg-brand-teal text-white border-brand-teal') : 'bg-white text-gray-400 border-gray-200 group-hover:text-brand-teal'}`}>
                        {hasChildren ? (isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />) : <ChevronRight className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 z-10">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className={`flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm ${isSecondary ? 'bg-gray-400' : 'bg-brand-teal'}`}>
                                <Layers className="w-3 h-3" />
                                {nomenclature.level1}
                            </span>
                            {component.code && <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${isSecondary ? 'text-gray-500 bg-gray-100 border-gray-200' : 'text-brand-teal bg-brand-teal/10 border-brand-teal/20'}`}>{component.code}</span>}
                        </div>
                        <h3 className={`text-base font-bold leading-snug ${isSecondary ? 'text-gray-600' : 'text-gray-900'}`}><HighlightedText text={component.content} /></h3>
                        {isSecondary && (() => {
                            const resp = component.responsible || getResponsibleForNode(component.id);
                            return resp ? (
                                <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    Resp.: {resp}
                                </span>
                            ) : null;
                        })()}
                    </div>
                </div>
                
                {!isCollapsed && plan.planType === 'ppa' && (
                    <div className={`border-t bg-opacity-10 ${isSecondary ? 'border-gray-200 bg-gray-50' : 'border-brand-teal/20 bg-brand-teal/5'}`}>
                        <RenderInputSection component={component} />
                    </div>
                )}
            </div>
            );
        }

        // Objetivo
        if (component.type === 'Objetivo') {
            const isSecondary = isSecondaryContext(component);
            return (
                <div className={`border border-gray-100 bg-white my-2 shadow-sm rounded-lg relative overflow-hidden group/obj transition-all ${isSecondary ? 'grayscale opacity-75' : ''}`}>
                <div
                    onClick={toggle}
                    className={`flex items-center gap-4 py-4 pr-4 pl-4 transition-all cursor-pointer ${isSecondary ? 'hover:bg-gray-100' : 'hover:bg-brand-purple/10'}`}
                >
                    <div className={`absolute top-0 left-0 w-1 h-full ${isSecondary ? 'bg-gray-400' : 'bg-brand-purple'}`} />

                    <div className={`p-1 rounded-full shadow-sm border transition-colors z-10 ${hasChildren ? (isSecondary ? 'bg-gray-400 text-white border-gray-400' : 'bg-brand-purple text-white border-brand-purple') : 'bg-white text-gray-400 border-gray-200 group-hover/obj:text-brand-purple'}`}>
                        {hasChildren ? (isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : <ChevronRight className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isSecondary ? 'text-gray-500 bg-gray-100 border-gray-200' : 'text-brand-purple bg-brand-purple/10 border-brand-purple/20'}`}>
                                <Target className="w-3 h-3" />
                                {nomenclature.level2}
                            </span>
                            {component.code && <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{component.code}</span>}
                        </div>
                        <p className={`text-sm font-medium leading-relaxed ${isSecondary ? 'text-gray-500' : 'text-gray-800'}`}><HighlightedText text={component.content} /></p>
                        {isSecondary && (() => {
                            const resp = component.responsible || getResponsibleForNode(component.id);
                            return resp ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    Resp.: {resp}
                                </span>
                            ) : null;
                        })()}
                    </div>
                </div>

                {!isCollapsed && plan.planType === 'ppa' && (
                    <div className={`border-t bg-opacity-10 ${isSecondary ? 'border-gray-200 bg-gray-50' : 'border-brand-purple/20 bg-brand-purple/5'}`}>
                        <RenderInputSection component={component} />
                    </div>
                )}
            </div>
            );
        }

        // Meta
        if (component.type === 'Meta') {
            const metaBelongs = belongsToUnit(component);
            const isSecondary = isSecondaryMeta(component);
            // Se a Meta não é sua, é sempre cinza. A cor sobe a partir da Meta.
            const showAsGrey = !metaBelongs;
            
            return (
                <div className={`border my-2 shadow-sm rounded-lg relative overflow-hidden group/meta transition-all ${metaBelongs ? 'bg-white border-gray-100' : showAsGrey ? 'bg-gray-50/50 border-dashed border-gray-300 grayscale opacity-75' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div
                        onClick={toggle}
                        className={`flex items-start gap-3 py-3 pr-4 pl-4 transition-all cursor-pointer ${showAsGrey ? 'hover:bg-gray-100' : 'hover:bg-brand-blue/10'}`}
                    >
                        {/* Colored Bar */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${showAsGrey ? 'bg-gray-400' : 'bg-brand-blue'}`} />

                        <div className={`p-1 rounded-full shadow-sm border transition-colors mt-0.5 z-10 ${
                            showAsGrey 
                                ? (hasChildren ? 'bg-gray-400 text-white border-gray-400' : 'bg-white text-gray-400 border-gray-200 group-hover/meta:text-gray-500')
                                : (hasChildren ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-400 border-gray-200 group-hover/meta:text-brand-blue')
                        }`}>
                            {hasChildren ? (isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isSecondaryMeta(component)
                                    ? 'text-gray-500 bg-gray-100 border-gray-200'
                                    : 'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
                            }`}>
                                <CheckSquare className="w-3 h-3" />
                                {nomenclature.level3}
                            </span>
                            {component.code && <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{component.code}</span>}
                            {isSecondaryMeta(component) && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    <Eye className="w-3 h-3" />
                                    Visualização
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium"><HighlightedText text={component.content} /></p>
                        {showAsGrey && component.responsible && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                Resp.: {component.responsible}
                            </span>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            {(() => {
                                const yearlyTarget = getYearlyTarget(component);
                                const finalTarget = component.targetValue;
                                const isSecondary = isSecondaryMeta(component);
                                
                                // Para metas secundárias, buscar resultado do dono real
                                const currentEntry = entries.get(component.id);
                                const ownerEntry = isSecondary ? getOwnerEntry(component.id) : null;
                                const effectiveResult = isSecondary 
                                    ? (ownerEntry ? extractNumber(ownerEntry.result) : null)
                                    : (currentEntry ? extractNumber(currentEntry.result) : null);
                                const yearlyTargetNum = yearlyTarget ? extractNumber(yearlyTarget) : null;
                                const finalTargetNum = finalTarget ? extractNumber(finalTarget) : null;
                                
                                const annualPct = (effectiveResult !== null && yearlyTargetNum && yearlyTargetNum > 0)
                                    ? Math.round((effectiveResult / yearlyTargetNum) * 100)
                                    : 0;
                                    
                                const accumulated = getAccumulatedResult(component.id);
                                const totalPct = (finalTargetNum && finalTargetNum > 0)
                                    ? Math.round((accumulated / finalTargetNum) * 100)
                                    : 0;

                                return (
                                    <>
                                        {yearlyTarget && (
                                            <div className={`inline-flex items-center gap-2 text-[10px] font-medium pr-2.5 rounded-full border ${isSecondary ? 'bg-white border-gray-200' : 'bg-gray-50/80 border-gray-200'}`}>
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-r ${isSecondary ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white shadow-sm'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isSecondary ? 'bg-gray-400' : 'bg-brand-purple'}`} />
                                                    <span className="text-gray-500">Ano:</span>
                                                    <span className={`${isSecondary ? 'text-gray-600' : 'text-gray-900'} font-bold`}>{yearlyTarget}</span>
                                                    {component.measurementUnit && <span className="text-gray-400">({component.measurementUnit})</span>}
                                                </span>
                                                {yearlyTargetNum && yearlyTargetNum > 0 && (
                                                    <div className="flex items-center gap-1.5 print:hidden">
                                                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-500 ${getProgressBgColor(annualPct, isSecondary)}`}
                                                                style={{ width: `${Math.min(annualPct, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-bold ${getProgressTextColor(annualPct, isSecondary)}`}>{annualPct}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {finalTarget && (
                                            <div className={`inline-flex items-center gap-2 text-[10px] font-medium pr-2.5 rounded-full border ${isSecondary ? 'bg-white border-gray-200' : 'bg-gray-50/80 border-gray-200'}`}>
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-r ${isSecondary ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-200 bg-white shadow-sm text-gray-500'}`}>
                                                    <span>Total:</span>
                                                    <span className={`${isSecondary ? 'text-gray-500' : 'text-gray-900'} font-bold`}>{finalTarget}</span>
                                                </span>
                                                {finalTargetNum && finalTargetNum > 0 && (
                                                    <div className="flex items-center gap-1.5 print:hidden">
                                                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-500 ${getProgressBgColor(totalPct, isSecondary)}`}
                                                                style={{ width: `${Math.min(totalPct, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-bold ${getProgressTextColor(totalPct, isSecondary)}`}>{totalPct}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            
                            {component.deadline && (
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full border ${isSecondaryMeta(component) ? 'text-gray-500 bg-white border-gray-200' : 'text-gray-600 bg-white shadow-sm border-gray-200'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSecondaryMeta(component) ? 'bg-gray-400' : 'bg-brand-blue'}`} />
                                    Prazo: <span className={`${isSecondaryMeta(component) ? 'text-gray-600' : 'text-gray-900'} font-bold`}>{component.deadline}</span>
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
        // Regra absoluta para qualquer monitoramento: Só mostrar o que pertence à unidade
        // O `PlanTree.tsx` já cuida de renderizar os pais (Objetivo, Diretriz) automaticamente 
        // caso uma Meta ou Ação filha seja visível. 

        if (item.type === 'Ação') {
            return belongsToUnit(item);
        }

        if (item.type === 'Meta') {
            return belongsToUnit(item) || isSecondaryMeta(item);
        }

        if (['Diretriz', 'Objetivo'].includes(item.type)) {
            return belongsToUnit(item);
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
