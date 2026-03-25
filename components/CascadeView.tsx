import React, { useState } from 'react';
import { PESInstance, PESComponent, MonitoringInstance } from '../types';
import { PlanTree } from './common/PlanTree';
import { Layers, Target, CheckSquare, Activity, ChevronDown, ChevronRight, Pencil, Trash2, PieChart, Plus, CalendarPlus } from 'lucide-react';

interface CascadeViewProps {
    plan: PESInstance;
    onEdit?: (item: PESComponent) => void;
    onDelete?: (id: string) => void;
    editingId?: string | null;
    renderEditForm?: (item: PESComponent) => React.ReactNode;
    searchTerm?: string;
    monitorings?: MonitoringInstance[];
    selectedPeriod?: string;
    onShowStatus?: (component: PESComponent) => void;
    onAddChild?: (parentId: string, childType: 'Objetivo' | 'Meta' | 'Ação') => void;
}

export const CascadeView: React.FC<CascadeViewProps> = ({
    plan, onEdit, onDelete, editingId, renderEditForm, searchTerm = '',
    onShowStatus, onAddChild
}) => {
    const nomenclature = plan.customNomenclature || { level1: 'Diretriz', level2: 'Objetivo', level3: 'Meta' };
    const [actionYearMenuId, setActionYearMenuId] = useState<string | null>(null);
    const baseYear = plan.startYear || new Date().getFullYear();
    const planYears = Array.from({ length: (plan.endYear || baseYear + 3) - baseYear + 1 }, (_, i) => baseYear + i);

    const HighlightedText = ({ text }: { text: string }) => {
        if (!searchTerm) return <>{text}</>;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return <>{parts.map((part, i) => part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">{part}</mark> : part)}</>;
    };

    const renderRow = (
        component: PESComponent,
        depth: number,
        isCollapsed: boolean,
        toggle: () => void,
        hasChildren: boolean
    ) => {
        const isEditing = editingId === component.id;

        // Custom Styles per Type
        // Custom Styles per Type
        if (component.type === 'Diretriz') {
            if (isEditing && renderEditForm) {
                return <div className="p-4 bg-brand-teal/10 border-l-4 border-brand-teal">{renderEditForm(component)}</div>;
            }
            return (
                <div
                    onClick={toggle}
                    className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group ${isCollapsed ? 'mb-2' : 'bg-gray-50/30 border-b border-gray-100'} relative overflow-hidden rounded-lg border border-gray-100`}
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

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-md transform translate-x-2 group-hover:translate-x-0 z-20">
                        {onAddChild && <button onClick={(e) => { e.stopPropagation(); onAddChild(component.id, 'Objetivo'); }} className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors" title={`Adicionar ${nomenclature.level2}`}><Plus className="w-4 h-4" /></button>}
                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(component); }} className="p-2 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                </div>
            );
        }

        if (component.type === 'Objetivo') {
            if (isEditing && renderEditForm) return <div className="p-4 bg-gray-50">{renderEditForm(component)}</div>;
            return (
                <div
                    onClick={toggle}
                    className="flex items-center gap-4 py-4 pr-4 pl-4 hover:bg-brand-purple/10 transition-all cursor-pointer group/obj border border-gray-100 bg-white my-2 shadow-sm rounded-lg relative overflow-hidden"
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

                    <div className="flex items-center gap-1 opacity-0 group-hover/obj:opacity-100 transition-opacity bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm z-20">
                        {onAddChild && <button onClick={(e) => { e.stopPropagation(); onAddChild(component.id, 'Meta'); }} className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-md" title={`Adicionar ${nomenclature.level3}`}><Plus className="w-3.5 h-3.5" /></button>}
                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(component); }} className="p-1.5 text-gray-400 hover:text-brand-purple rounded-md"><Pencil className="w-3.5 h-3.5" /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                </div>
            );
        }

        if (component.type === 'Meta') {
            if (isEditing && renderEditForm) return <div className="p-4 bg-brand-blue/5">{renderEditForm(component)}</div>;
            return (
                <div
                    onClick={toggle}
                    className="flex items-start gap-3 py-3 pr-4 pl-4 hover:bg-brand-blue/10 transition-all cursor-pointer group/meta border border-gray-100 bg-white my-2 shadow-sm rounded-lg hover:border-brand-blue hover:shadow-md relative"
                >
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

                        {(component.targetValue || component.deadline) && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {component.targetValue && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                        Alvo: <span className="text-gray-900 font-bold">{component.targetValue}</span>
                                    </span>
                                )}
                                {component.deadline && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                        Prazo: <span className="text-gray-900 font-bold">{component.deadline}</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover/meta:opacity-100 transition-opacity bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm z-20">

                        {onAddChild && plan.planType !== 'ppa' && (
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActionYearMenuId(actionYearMenuId === component.id ? null : component.id); }}
                                    className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors flex items-center gap-1"
                                    title="Adicionar Ação para um ano"
                                >
                                    <CalendarPlus className="w-3.5 h-3.5" />
                                </button>
                                {actionYearMenuId === component.id && (
                                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">Adicionar Ação para:</div>
                                        {planYears.map(year => (
                                            <button
                                                key={year}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionYearMenuId(null);
                                                    // onAddChild passa tipo + parentId. O year será setado no ComponentManager via initialData
                                                    if (onAddChild) onAddChild(component.id, 'Ação');
                                                    // Armazenar year no sessionStorage para o ComponentManager pegar
                                                    sessionStorage.setItem('newActionYear', year.toString());
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors flex items-center gap-2"
                                            >
                                                <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />
                                                Ano {year}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(component); }} className="p-1.5 text-gray-400 hover:text-brand-blue rounded-md"><Pencil className="w-3.5 h-3.5" /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                </div>
            );
        }

        if (component.type === 'Ação') {
            if (isEditing && renderEditForm) return <div className="p-4 bg-sky-50">{renderEditForm(component)}</div>;
            return (
                <div className="flex items-start gap-3 py-3 pr-4 pl-4 hover:bg-sky-50 transition-colors group/acao relative my-1 bg-slate-50/50 rounded-lg border border-gray-100 hover:border-sky-200 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-400" />

                    <div className="mt-0.5 flex-shrink-0 z-10 text-sky-400 opacity-0 w-4">
                        {/* Spacer to align with siblings or keep blank */}
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                                <Activity className="w-3 h-3" />
                                Ação
                            </span>
                            {component.actionYear && <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">{component.actionYear}</span>}
                            {component.code && <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">{component.code}</span>}
                            {component.status && <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${component.status === 'Realizada' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'}`}>{component.status}</span>}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed"><HighlightedText text={component.content} /></p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/acao:opacity-100 transition-opacity bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm z-20">

                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(component); }} className="p-1.5 text-gray-400 hover:text-brand-purple rounded-md"><Pencil className="w-3.5 h-3.5" /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                </div>
            );
        }

        return null;
    };

    return <PlanTree plan={plan} searchTerm={searchTerm} renderRow={renderRow} />;
};
