import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PESInstance, MonitoringInstance, PESComponent, MonitoringEntry, UserRole } from '../types';
import {
    ArrowLeft,
    Save,
    CheckCircle2,
    AlertCircle,
    Target,
    Activity,
    Layers,
    ChevronDown,
    ChevronRight,
    FileText,
    Clock,
    BarChart2,
    AlertTriangle,
    PieChart,
    PenLine,
    Filter,
    Eye,
    EyeOff,
    Send,
    Lock,
    Copy,
    TrendingDown,
    TrendingUp
} from 'lucide-react';

import { ComponentManager } from '../components/ComponentManager';
import { MonitoringCascadeView } from '../components/MonitoringCascadeView';
import { useToast } from '../context/ToastContext';

interface MonitoringDetailProps {
    plans: PESInstance[];
    monitorings: MonitoringInstance[];
    onUpdateMonitoring: (monitoring: MonitoringInstance) => void;
    userRole: UserRole;
}

export const MonitoringDetail: React.FC<MonitoringDetailProps> = ({ plans, monitorings: initialMonitorings, onUpdateMonitoring, userRole }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [monitoring, setMonitoring] = useState<MonitoringInstance | undefined>(
        initialMonitorings.find(m => m.id === id)
    );

    const plan = plans.find(p => p.id === monitoring?.planId);

    const [entries, setEntries] = useState<Map<string, MonitoringEntry>>(new Map());
    const [errors, setErrors] = useState<Record<string, { result?: string; analysis?: string }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Smart Filter State - Se for Técnico/Gestor, já inicia filtrado por padrão para ajudar no foco
    const [showOnlyMyUnit, setShowOnlyMyUnit] = useState(userRole !== 'admin');

    useEffect(() => {
        if (monitoring && monitoring.entries) {
            const entryMap = new Map<string, MonitoringEntry>();
            monitoring.entries.forEach(e => entryMap.set(e.componentId, e));
            setEntries(entryMap);
        }
        if (plan) {
            const initialExpanded = new Set<string>();
            // Expand first diretriz by default
            const firstDiretriz = plan.components.find(c => c.type === 'Diretriz');
            if (firstDiretriz) initialExpanded.add(firstDiretriz.id);
            setExpandedIds(initialExpanded);
        }
    }, [monitoring, plan]);

    // Is Locked logic: 
    // - If finalized, locked for everyone
    // - If 'Submetido', locked for Technician and Manager (waiting for Admin)
    // - If submission date expired, locked for Technician and Manager
    const isLocked = useMemo(() => {
        if (!monitoring) return true;
        if (monitoring.status === 'Finalizado') return true;
        if (monitoring.status === 'Submetido' && userRole !== 'admin') return true;

        // Check date expiry for non-admins
        if (userRole !== 'admin' && monitoring.submissionEnd) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const endDate = new Date(monitoring.submissionEnd + 'T00:00:00');
            if (now > endDate) return true;
        }

        return false;
    }, [monitoring, userRole]);

    // Helper to check if a component belongs to the current monitoring unit
    const belongsToUnit = (component: PESComponent) => {
        if (!monitoring) return false;
        return component.responsible === monitoring.unitName;
    };

    // Helper to check if a branch (Diretriz or Objetivo) contains relevant items for the current unit
    const branchHasRelevantItems = (parentId: string) => {
        if (!showOnlyMyUnit) return true; // Show everything if filter is off

        // Find all descendants
        let hasRelevant = false;
        const traverse = (pid: string) => {
            plan?.components.forEach(c => {
                if (c.parentId === pid) {
                    if ((c.type === 'Meta' || c.type === 'Ação') && belongsToUnit(c)) {
                        hasRelevant = true;
                    }
                    traverse(c.id);
                }
            });
        };
        traverse(parentId);
        return hasRelevant;
    };

    if (!monitoring || !plan) {
        return <div className="p-8 text-center text-gray-500">Monitoramento não encontrado.</div>;
    }

    // --- LOGICA DE IMPORTAÇÃO DE DADOS ANTERIORES ---
    const getPreviousMonitoring = () => {
        // Helper para transformar "Q1 2025" ou "T1 2025" em valor numérico comparável (20251)
        const parsePeriod = (p: string) => {
            const match = p.match(/([QT])(\d)\s+(\d{4})/);
            if (!match) return 0;
            return parseInt(match[3]) * 10 + parseInt(match[2]);
        };

        const currentVal = parsePeriod(monitoring.period);

        // Filtrar mesmo plano e unidade, ID diferente, período anterior
        const candidates = initialMonitorings.filter(m =>
            m.planId === monitoring.planId &&
            m.unitName === monitoring.unitName &&
            m.id !== monitoring.id &&
            parsePeriod(m.period) < currentVal
        );

        // Ordenar decrescente (mais recente primeiro)
        candidates.sort((a, b) => parsePeriod(b.period) - parsePeriod(a.period));

        return candidates.length > 0 ? candidates[0] : null;
    };

    const handleImportPrevious = () => {
        const previous = getPreviousMonitoring();
        if (!previous) {
            alert("Não foi encontrado nenhum monitoramento anterior para esta unidade neste plano.");
            return;
        }

        if (!confirm(`Deseja importar os dados de "${previous.period}"? Isso preencherá os campos vazios com as informações do período anterior.`)) {
            return;
        }

        setEntries((prev) => {
            const newMap = new Map<string, MonitoringEntry>(prev);
            let count = 0;

            previous.entries?.forEach(prevEntry => {
                const currentEntry = newMap.get(prevEntry.componentId);

                // Só importa se o campo atual estiver vazio ou inexistente
                // Explicitly cast to avoid 'unknown' error if inference fails, though generic Map above should fix it.
                const isEmpty = !currentEntry || (!currentEntry.result && !currentEntry.analysis);

                if (isEmpty) {
                    newMap.set(prevEntry.componentId, {
                        componentId: prevEntry.componentId,
                        result: prevEntry.result, // Copia resultado (pode ser útil se for cumulativo)
                        analysis: `[Cópia ${previous.period}] ${prevEntry.analysis}`, // Marca origem
                        status: prevEntry.status === 'CONCLUÍDA' ? 'CONCLUÍDA' : 'EM ANDAMENTO',
                        updatedAt: new Date().toISOString()
                    });
                    count++;
                }
            });

            if (count > 0) alert(`${count} registros importados com sucesso.`);
            else alert("Nenhum campo vazio para importar.");

            return newMap;
        });
    };

    const handleEntryChange = (componentId: string, field: keyof MonitoringEntry, value: string) => {
        if (isLocked) return;

        if ((field === 'result' || field === 'analysis') && errors[componentId]?.[field]) {
            setErrors(prev => ({
                ...prev,
                [componentId]: {
                    ...prev[componentId],
                    [field]: undefined
                }
            }));
        }

        setEntries((prev: Map<string, MonitoringEntry>) => {
            const newMap = new Map(prev);
            const found = newMap.get(componentId);

            const existing: MonitoringEntry = found || {
                componentId: componentId,
                result: '',
                status: 'EM ANDAMENTO',
                analysis: '',
                location: '',
                impact: '',
                updatedAt: new Date().toISOString()
            };

            newMap.set(componentId, {
                ...existing,
                [field]: value,
                updatedAt: new Date().toISOString()
            });
            return newMap;
        });
    };

    const calculateProgress = () => {
        // Extrair o ano do período do monitoramento para filtrar ações
        const periodMatch = monitoring.period.match(/[QT]\d\s+(\d{4})/);
        const monitoringYear = periodMatch ? parseInt(periodMatch[1]) : null;

        const relevantItems = plan.components.filter(c => {
            if (c.type !== 'Meta' && c.type !== 'Ação') return false;
            // Filtrar ações pelo ano do monitoramento
            if (c.type === 'Ação' && monitoringYear) {
                if (c.actionYear && c.actionYear !== monitoringYear) return false;
            }
            return c.responsible ? c.responsible === monitoring.unitName : true;
        });

        const itemsToCount = relevantItems.length > 0 ? relevantItems : plan.components.filter(c => {
            if (c.type !== 'Meta' && c.type !== 'Ação') return false;
            if (c.type === 'Ação' && monitoringYear && c.actionYear && c.actionYear !== monitoringYear) return false;
            return true;
        });

        const filledCount = itemsToCount.filter(item => {
            const entry = entries.get(item.id) as MonitoringEntry | undefined;
            return entry && (entry.result !== '' || entry.analysis !== '');
        }).length;

        if (itemsToCount.length === 0) return 0;
        return Math.round((filledCount / itemsToCount.length) * 100);
    };

    const validate = () => {
        const newErrors: Record<string, { result?: string; analysis?: string; location?: string; impact?: string }> = {};
        let isValid = true;
        const isPPA = plan?.planType === 'ppa';

        entries.forEach((entry) => {
            const componentErrors: { result?: string; analysis?: string; location?: string; impact?: string } = {};

            if (isPPA) {
                if (!entry.analysis || !entry.analysis.trim()) {
                    componentErrors.analysis = 'A breve descrição é obrigatória.';
                }
                if (!entry.location || !entry.location.trim()) {
                    componentErrors.location = 'A localização/período é obrigatória.';
                }
                if (!entry.impact || !entry.impact.trim()) {
                    componentErrors.impact = 'O comentário sobre o impacto é obrigatório.';
                }
                if (['EM ANDAMENTO', 'CONCLUÍDA', 'REALIZADA'].includes(entry.status) && (!entry.result || !entry.result.trim() || isNaN(Number(entry.result.replace(',', '.'))))) {
                    componentErrors.result = 'O resultado alcançado deve ser apenas um número.';
                }
            } else {
                if (!entry.analysis || !entry.analysis.trim()) {
                    componentErrors.analysis = 'A análise crítica é obrigatória para justificar a situação atual.';
                }

                if (['EM ANDAMENTO', 'CONCLUÍDA', 'REALIZADA'].includes(entry.status) && (!entry.result || !entry.result.trim())) {
                    componentErrors.result = 'Informe o resultado alcançado (número ou produto) para itens iniciados.';
                }
            }

            if (Object.keys(componentErrors).length > 0) {
                newErrors[entry.componentId] = componentErrors;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSaveDraft = () => {
        setIsSaving(true);
        const entriesArray = Array.from(entries.values());
        const progress = calculateProgress();

        const updatedMonitoring: MonitoringInstance = {
            ...monitoring,
            entries: entriesArray,
            progress: progress,
            status: 'Em Preenchimento'
        };

        onUpdateMonitoring(updatedMonitoring);
        setMonitoring(updatedMonitoring);
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleSubmit = (finalStatus: 'Submetido' | 'Finalizado' = 'Submetido') => {
        if (!validate()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert("Atenção: Existem pendências no preenchimento. Verifique os campos marcados em vermelho.");
            return;
        }

        if (!confirm(userRole === 'gestor'
            ? "Tem certeza que deseja submeter este monitoramento ao Administrador? Você não poderá mais editar após o envio."
            : "Confirma a homologação/finalização deste monitoramento?")) {
            return;
        }

        setIsSaving(true);
        const entriesArray = Array.from(entries.values());
        const progress = calculateProgress();

        const updatedMonitoring: MonitoringInstance = {
            ...monitoring,
            entries: entriesArray,
            progress: progress,
            status: finalStatus
        };

        onUpdateMonitoring(updatedMonitoring);
        setMonitoring(updatedMonitoring);
        setTimeout(() => {
            setIsSaving(false);
            if (finalStatus === 'Submetido') {
                alert("Monitoramento submetido com sucesso!");
                navigate('/monitorings');
            }
        }, 800);
    };




    const previousMonitoring = useMemo(() => getPreviousMonitoring(), [monitoring, initialMonitorings]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20 print:pb-0">

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 print:border-none print:shadow-none print:p-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:flex-row">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => navigate('/monitorings')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 group print:hidden">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight print:text-xl">{monitoring.title}</h1>
                            <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                                <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3 mr-1" /> {monitoring.period}</span>
                                <span className="flex items-center font-medium"><Target className="w-3 h-3 mr-1 text-brand-purple" /> {monitoring.unitName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                        <div className="text-right hidden sm:block">
                            <div className="flex items-center gap-2 justify-end mb-1">
                                <span className="text-xs font-medium text-gray-500">Preenchimento</span>
                                <span className="text-sm font-bold text-brand-purple">{calculateProgress()}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-brand-purple/70 to-brand-purple rounded-full transition-all duration-700 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS BASED ON ROLE */}
                        <div className="flex gap-2 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-brand-purple/30 hover:text-brand-purple transition-colors text-sm font-medium shadow-sm"
                                title="Exportar Relatório para PDF"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Exportar PDF
                            </button>
                            {/* Botão de Importar Anterior */}
                            {!isLocked && previousMonitoring && (
                                <button
                                    onClick={handleImportPrevious}
                                    className="flex items-center px-4 py-2 bg-brand-purple/5 border border-brand-purple/20 text-brand-purple rounded-lg hover:bg-brand-purple/10 transition-colors text-sm font-medium shadow-sm"
                                    title={`Importar dados de ${previousMonitoring.period}`}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Importar Anterior
                                </button>
                            )}

                            {isLocked ? (
                                <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                                    <Lock className="w-4 h-4 mr-2" />
                                    {monitoring.status === 'Submetido' ? 'Em Análise pelo Admin' : (monitoring.submissionEnd && new Date() > new Date(monitoring.submissionEnd) ? 'Prazo Encerrado' : 'Finalizado')}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={isSaving}
                                        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-brand-purple/30 hover:text-brand-purple transition-colors text-sm font-medium shadow-sm disabled:opacity-70"
                                    >
                                        {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Salvar Rascunho
                                    </button>

                                    {/* Botão de Envio (Apenas Gestor ou Admin) */}
                                    {(userRole === 'gestor' || userRole === 'admin') && (
                                        <button
                                            onClick={() => handleSubmit(userRole === 'admin' ? 'Finalizado' : 'Submetido')}
                                            disabled={isSaving}
                                            className={`flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition-all disabled:opacity-70 ${userRole === 'admin'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                                                : 'bg-brand-purple hover:bg-brand-purple/90 active:bg-brand-purple/80'
                                                }`}
                                        >
                                            {isSaving ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                            {userRole === 'admin' ? 'Homologar/Finalizar' : 'Submeter ao Admin'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full print:max-w-none">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 print:hidden">
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 text-blue-900 rounded-xl border border-blue-100 text-sm shadow-sm flex-1">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">Guia de Preenchimento</p>
                            <p className="text-blue-800/80 leading-relaxed">
                                Preencha o <strong>Resultado Alcançado</strong> com dados quantitativos e utilize a <strong>Análise Crítica</strong> para justificar o desempenho.
                            </p>
                        </div>
                    </div>

                    {/* Smart Filter Toggle - Hidden for Tech/Gestor as they already default to it, but can untoggle if they want context */}
                    <button
                        onClick={() => setShowOnlyMyUnit(!showOnlyMyUnit)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm flex-shrink-0 ${showOnlyMyUnit
                            ? 'bg-brand-purple text-white border-brand-purple shadow-brand-purple/20'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {showOnlyMyUnit ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-sm font-bold">Minhas Pendências</span>
                    </button>
                </div>

                <MonitoringCascadeView
                    plan={(() => {
                        // Filtrar ações pelo ano do período do monitoramento
                        const periodMatch = monitoring.period.match(/[QT]\d\s+(\d{4})/);
                        if (!periodMatch) return plan;
                        const monitoringYear = parseInt(periodMatch[1]);
                        return {
                            ...plan,
                            components: plan.components.filter(c => {
                                // Manter tudo que não é Ação
                                if (c.type !== 'Ação') return true;
                                // Ações sem ano definido: manter (legado)
                                if (!c.actionYear) return true;
                                // Ações com ano: só mostra se for do ano do monitoramento
                                return c.actionYear === monitoringYear;
                            })
                        };
                    })()}
                    monitoring={monitoring}
                    entries={entries}
                    errors={errors}
                    onEntryChange={handleEntryChange}
                    isLocked={isLocked}
                    showOnlyMyUnit={showOnlyMyUnit}
                    searchTerm={""}
                />


            </div>
        </div>
    );
};