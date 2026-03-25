import React, { useState, useMemo } from 'react';
import { PESComponent, ComponentType } from '../../types';
import { Save, AlertCircle, CalendarDays, AlertTriangle, TrendingUp } from 'lucide-react';
import { RESOURCE_SOURCES, SUB_FUNCTIONS, SUB_ACTIONS, EXPENSE_ELEMENTS } from '../../data/budgetData';
import { MEASUREMENT_UNITS, isPatamarMeta, LevelFieldConfig } from '../../utils/metaTypeConfig';

interface ComponentFormProps {
    type: ComponentType;
    parentId: string | null;
    units: string[];
    baseYear: number;
    initialData?: PESComponent;
    onSave: (data: Partial<PESComponent>) => void;
    onCancel: () => void;
    customLabel?: string;
    fieldConfig?: LevelFieldConfig; // NEW: configuração de campos dinâmicos
}

const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all";
const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(numericValue) / 100);
};

const formatDateMask = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    else if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
};

export const ComponentForm: React.FC<ComponentFormProps> = ({ type, parentId, units, baseYear, initialData, onSave, onCancel, customLabel, fieldConfig }) => {
    // Determinar quais campos mostrar via config (fallback para comportamento legado)
    const has = useMemo(() => {
        if (fieldConfig) {
            const f = fieldConfig.fields;
            return {
                indicator: f.includes('indicator'),
                annualization: f.includes('annualization'),
                baseline: f.includes('baseline'),
                responsible: f.includes('responsible'),
                budget: f.includes('budget'),
            };
        }
        // Fallback legado (caso fieldConfig não seja passado)
        return {
            indicator: type === 'Meta' || type === 'Ação',
            annualization: type === 'Meta',
            baseline: type === 'Meta',
            responsible: type === 'Meta' || type === 'Ação',
            budget: type === 'Ação',
        };
    }, [fieldConfig, type]);

    // State for all potential fields
    const [code, setCode] = useState(initialData?.code || '');
    const [content, setContent] = useState(initialData?.content || '');

    // Meta/Ação fields
    const [indicator, setIndicator] = useState(initialData?.indicator || '');
    const [measurementUnit, setMeasurementUnit] = useState(initialData?.measurementUnit || '');
    const [calculationMethod, setCalculationMethod] = useState(initialData?.calculationMethod || '');
    const [responsible, setResponsible] = useState(initialData?.responsible || '');

    // Meta specific
    const [baseline, setBaseline] = useState(initialData?.baseline || '');
    const [targetValue, setTargetValue] = useState(initialData?.targetValue || '');
    const [deadline, setDeadline] = useState(initialData?.deadline || '');
    const [year1, setYear1] = useState(initialData?.targetYear1 || '');
    const [year2, setYear2] = useState(initialData?.targetYear2 || '');
    const [year3, setYear3] = useState(initialData?.targetYear3 || '');
    const [year4, setYear4] = useState(initialData?.targetYear4 || '');

    // Ação specific
    const [resource, setResource] = useState(initialData?.resourceSource || '');
    const [budget, setBudget] = useState(initialData?.budget || '');
    const [subFunction, setSubFunction] = useState(initialData?.subFunction || '');
    const [subAction, setSubAction] = useState(initialData?.subAction || '');
    const [expenseElement, setExpenseElement] = useState(initialData?.expenseElement || '');
    const [technicalObs, setTechnicalObs] = useState(initialData?.technicalObservations || '');

    const handleSubmit = () => {
        if (!content.trim()) {
            alert("A descrição é obrigatória.");
            return;
        }

        const data: Partial<PESComponent> = {
            content,
            code,
            type,
            // Campos condicionais baseados na config
            indicator: has.indicator ? indicator : undefined,
            measurementUnit: has.indicator ? measurementUnit : undefined,
            calculationMethod: has.indicator ? calculationMethod : undefined,
            responsible: has.responsible ? responsible : undefined,

            // Baseline / Meta Final (apenas se habilitado)
            baseline: has.baseline ? baseline : undefined,
            targetValue: has.baseline ? targetValue : undefined,
            deadline: (has.baseline || has.budget) ? deadline : undefined,

            // Anualização (apenas se habilitado)
            targetYear1: has.annualization ? year1 : undefined,
            targetYear2: has.annualization ? year2 : undefined,
            targetYear3: has.annualization ? year3 : undefined,
            targetYear4: has.annualization ? year4 : undefined,

            // Campos de orçamento (apenas se habilitado)
            actionYear: has.budget ? (initialData?.actionYear || undefined) : undefined,
            resourceSource: has.budget ? resource : undefined,
            budget: has.budget ? budget : undefined,
            subFunction: has.budget ? subFunction : undefined,
            subAction: has.budget ? subAction : undefined,
            expenseElement: has.budget ? expenseElement : undefined,
            technicalObservations: has.budget ? technicalObs : undefined,
        };

        onSave(data);
    };

    const handleBudget = (e: React.ChangeEvent<HTMLInputElement>) => setBudget(formatCurrency(e.target.value));
    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => setDeadline(formatDateMask(e.target.value));

    const borderClass = has.budget ? 'border-l-4 border-l-brand-purple' : (has.indicator || has.annualization) ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-gray-500';
    const isAdding = !initialData;

    // Verifica se tem campo de indicador E anualização (bloco "Meta-like")
    const showIndicatorBlock = has.indicator && !has.budget;
    // Verifica se tem campo de orçamento (bloco "Ação-like")
    const showBudgetBlock = has.budget;

    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-in zoom-in-95 duration-200 mb-6 ${borderClass}`}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">{isAdding ? `Novo Registro (${customLabel || type})` : `Editar ${customLabel || type}`}</h3>
            </div>

            <div className="space-y-5">
                {isAdding && (
                    <div className="bg-blue-50/50 p-4 rounded-lg mb-4 text-sm text-blue-800 border border-blue-100">
                        <h4 className="font-bold flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> Adicionando {customLabel || type}</h4>
                        <p>Este item será adicionado {parentId ? `como filho do item selecionado` : 'na raiz do plano'}.</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="w-24">
                        <label className={labelClass}>Código</label>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: 1.1" className={inputClass} />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Descrição</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Descreva o conteúdo..." className={inputClass} rows={2} />
                    </div>
                </div>

                {/* Bloco Indicador + Anualização (sem orçamento) — usado por Meta (PAS) e todos os níveis do PPA */}
                {showIndicatorBlock && (
                    <div className="bg-teal-50/30 p-5 rounded-xl border border-teal-100/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {has.responsible && (
                                <div className="col-span-2">
                                    <label className={labelClass}>Responsável / Coordenação</label>
                                    <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={inputClass}>
                                        <option value="">Selecione...</option>
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            )}
                            <div><label className={labelClass}>Indicador</label><input type="text" value={indicator} onChange={(e) => setIndicator(e.target.value)} className={inputClass} /></div>
                            <div>
                                <label className={labelClass}>Unidade de Medida</label>
                                <select value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className={inputClass}>
                                    <option value="">Selecione...</option>
                                    <optgroup label="Patamar (nível por ano)">
                                        {MEASUREMENT_UNITS.filter(u => u.type === 'patamar').map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </optgroup>
                                    <optgroup label="Acumulativa (soma dos anos)">
                                        {MEASUREMENT_UNITS.filter(u => u.type === 'acumulativa').map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            <div className="md:col-span-2"><label className={labelClass}>Método de Cálculo</label><input type="text" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value)} className={inputClass} /></div>
                        </div>

                        {/* Linha de Base + Meta Final (apenas se habilitado — PAS Meta) */}
                        {has.baseline && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div><label className={labelClass}>Linha de Base</label><input type="text" value={baseline} onChange={(e) => setBaseline(e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Meta Final</label><input type="text" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className={inputClass} /></div>
                                <div>
                                    <label className={labelClass}>Prazo / Vigência</label>
                                    <input type="text" value={deadline} onChange={handleDate} placeholder="DD/MM/AAAA" className={inputClass} />
                                </div>
                            </div>
                        )}

                        {/* Anualização (se habilitado) */}
                        {has.annualization && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3"><CalendarDays className="w-4 h-4 text-teal-600" /><label className="text-xs font-bold text-teal-800 uppercase tracking-wide">Programação Anual</label></div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div><label className="block text-[10px] text-gray-400 font-bold mb-1 text-center bg-gray-50 py-1 rounded-t">Ano 1 ({baseYear})</label><input type="text" value={year1} onChange={(e) => setYear1(e.target.value)} className={`${inputClass} text-center font-semibold text-teal-700 !rounded-t-none`} placeholder="-" /></div>
                                    <div><label className="block text-[10px] text-gray-400 font-bold mb-1 text-center bg-gray-50 py-1 rounded-t">Ano 2 ({baseYear + 1})</label><input type="text" value={year2} onChange={(e) => setYear2(e.target.value)} className={`${inputClass} text-center font-semibold text-teal-700 !rounded-t-none`} placeholder="-" /></div>
                                    <div><label className="block text-[10px] text-gray-400 font-bold mb-1 text-center bg-gray-50 py-1 rounded-t">Ano 3 ({baseYear + 2})</label><input type="text" value={year3} onChange={(e) => setYear3(e.target.value)} className={`${inputClass} text-center font-semibold text-teal-700 !rounded-t-none`} placeholder="-" /></div>
                                    <div><label className="block text-[10px] text-gray-400 font-bold mb-1 text-center bg-gray-50 py-1 rounded-t">Ano 4 ({baseYear + 3})</label><input type="text" value={year4} onChange={(e) => setYear4(e.target.value)} className={`${inputClass} text-center font-semibold text-teal-700 !rounded-t-none`} placeholder="-" /></div>
                                </div>
                                {/* Totalizador para metas acumulativas */}
                                {!isPatamarMeta(measurementUnit) && measurementUnit && has.baseline && (() => {
                                    const parseNum = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n; };
                                    const sum = parseNum(year1) + parseNum(year2) + parseNum(year3) + parseNum(year4);
                                    const target = parseNum(targetValue);
                                    const diff = target - sum;
                                    return (
                                        <div className="mt-3 flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                                                <span>Soma dos anos: <span className="text-teal-700 text-sm">{sum.toLocaleString('pt-BR')}</span></span>
                                            </div>
                                            {target > 0 && sum > target && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Soma ({sum.toLocaleString('pt-BR')}) supera a meta final ({target.toLocaleString('pt-BR')})
                                                </div>
                                            )}
                                            {target > 0 && sum <= target && diff > 0 && (
                                                <div className="text-[11px] font-medium text-gray-500">
                                                    Faltam <span className="font-bold text-teal-700">{diff.toLocaleString('pt-BR')}</span> para atingir a meta final
                                                </div>
                                            )}
                                            {target > 0 && sum === target && (
                                                <div className="text-[11px] font-bold text-emerald-600">✓ Programação completa</div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* Bloco Orçamento (Ação) */}
                {showBudgetBlock && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-brand-purple/5 p-5 rounded-xl border border-brand-purple/20">
                        {has.responsible && (
                            <div className="md:col-span-3">
                                <label className={labelClass}>Responsável / Coordenação</label>
                                <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={inputClass}>
                                    <option value="">Selecione...</option>
                                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        )}
                        {has.indicator && (
                            <>
                                <div><label className={labelClass}>Indicador (AE)</label><input type="text" value={indicator} onChange={(e) => setIndicator(e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Unidade de Medida</label><input type="text" value={measurementUnit} onChange={(e) => setMeasurementUnit(e.target.value)} className={inputClass} /></div>
                            </>
                        )}
                        <div className="md:col-span-3">
                            <label className={labelClass}>Fonte de Recurso</label>
                            <select value={resource} onChange={(e) => setResource(e.target.value)} className={inputClass}>
                                <option value="">Selecione...</option>
                                {RESOURCE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className={labelClass}>Subfunção</label>
                            <select value={subFunction} onChange={(e) => setSubFunction(e.target.value)} className={inputClass}>
                                <option value="">Selecione...</option>
                                {SUB_FUNCTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className={labelClass}>Subação</label>
                            <select value={subAction} onChange={(e) => setSubAction(e.target.value)} className={inputClass}>
                                <option value="">Selecione...</option>
                                {SUB_ACTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className={labelClass}>Elemento de Despesa</label>
                            <select value={expenseElement} onChange={(e) => setExpenseElement(e.target.value)} className={inputClass}>
                                <option value="">Selecione...</option>
                                {EXPENSE_ELEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Valor Proposto (R$)</label>
                            <input type="text" value={budget} onChange={handleBudget} placeholder="R$ 0,00" className={inputClass} />
                        </div>
                        <div><label className={labelClass}>Método de Cálculo</label><input type="text" value={calculationMethod} onChange={(e) => setCalculationMethod(e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-3"><label className={labelClass}>Observações Técnicas</label><textarea value={technicalObs} onChange={(e) => setTechnicalObs(e.target.value)} rows={2} className={inputClass} /></div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
                <button onClick={handleSubmit} className="px-6 py-2 text-sm text-white bg-brand-purple rounded-lg hover:bg-brand-purple/90 flex items-center font-medium shadow-sm transition-all active:scale-95">
                    <Save className="w-4 h-4 mr-2" /> Salvar Registro
                </button>
            </div>
        </div>
    );
};
