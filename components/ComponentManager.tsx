import React, { useState, useCallback } from 'react';
import { PESInstance, PESComponent, ComponentType, MonitoringInstance } from '../types';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { CascadeView } from './CascadeView';
import { ComponentForm } from './forms/ComponentForm';
import { getFieldConfig } from '../utils/metaTypeConfig';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ComponentManagerProps {
    plan: PESInstance;
    monitorings?: MonitoringInstance[];
    units: string[];
    onUpdatePlan: (updatedPlan: PESInstance) => void;
    selectedPeriod?: string;
}

export const ComponentManager: React.FC<ComponentManagerProps> = ({ plan, monitorings = [], units, onUpdatePlan, selectedPeriod }) => {
    // Navigation State / Search
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [addingContext, setAddingContext] = useState<{ parentId: string | null; type: ComponentType }>({ parentId: null, type: 'Diretriz' });
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // Helpers
    const getComponentById = (id: string | null) => id ? plan.components?.find(c => c.id === id) : null;
    const baseYear = plan.startYear ? Number(plan.startYear) : new Date().getFullYear();

    // Calcula o nível hierárquico (0=raiz, 1=filho, 2=neto, 3=bisneto)
    const getLevelIndex = useCallback((componentType: ComponentType, parentId: string | null): number => {
        if (!parentId) return 0;
        let depth = 0;
        let currentParentId: string | null | undefined = parentId;
        while (currentParentId) {
            depth++;
            const parent = plan.components?.find(c => c.id === currentParentId);
            currentParentId = parent?.parentId;
        }
        return depth;
    }, [plan.components]);

    // Handlers
    const handleAddRoot = () => {
        setAddingContext({ parentId: null, type: 'Diretriz' });
        setIsAdding(true);
    };

    const handleAddChild = (parentId: string, childType: ComponentType) => {
        setAddingContext({ parentId, type: childType });
        setIsAdding(true);
    };

    const handleSaveNewItem = (data: Partial<PESComponent>) => {
        const newComponent: PESComponent = {
            id: Date.now().toString(),
            planId: plan.id,
            parentId: addingContext.parentId,
            type: addingContext.type,
            status: 'Em andamento',
            content: data.content || '',
            ...data
        } as PESComponent;

        onUpdatePlan({ ...plan, components: [...(plan.components || []), newComponent] });
        setIsAdding(false);
    };

    const handleUpdateItem = (data: Partial<PESComponent>) => {
        if (!editingItemId) return;

        let updatedComponents = (plan.components || []).map(c => {
            if (c.id === editingItemId) {
                return { ...c, ...data };
            }
            return c;
        });

        // Propagate responsible changes recursively to all descendants
        if (data.responsible) {
            const childrenToUpdate = new Set<string>();
            const findChildren = (pid: string) => {
                plan.components?.forEach(c => {
                    if (c.parentId === pid) {
                        childrenToUpdate.add(c.id);
                        findChildren(c.id);
                    }
                });
            };
            findChildren(editingItemId);

            updatedComponents = updatedComponents.map(c => {
                if (childrenToUpdate.has(c.id)) {
                    return { ...c, responsible: data.responsible };
                }
                return c;
            });
        }

        onUpdatePlan({ ...plan, components: updatedComponents });
        setEditingItemId(null);
    };

    const handleDeleteItem = (id: string) => {
        setItemToDelete(id);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const idsToDelete = new Set<string>();
        const findChildren = (pid: string) => { idsToDelete.add(pid); plan.components?.forEach(c => { if (c.parentId === pid) findChildren(c.id); }); };
        findChildren(itemToDelete);
        onUpdatePlan({ ...plan, components: (plan.components || []).filter(c => !idsToDelete.has(c.id)) });
        setItemToDelete(null);
    };

    const getInitialAddData = () => {
        const data: Partial<PESComponent> = {};
        if (addingContext.type === 'Ação') {
            // Pegar o ano armazenado pelo CascadeView
            const storedYear = sessionStorage.getItem('newActionYear');
            if (storedYear) {
                data.actionYear = parseInt(storedYear);
                sessionStorage.removeItem('newActionYear');
            }
        }
        
        // Inherit responsible from parent recursively
        if (addingContext.parentId) {
            let currentParentId: string | null | undefined = addingContext.parentId;
            while (currentParentId) {
                const parent = getComponentById(currentParentId);
                if (parent?.responsible) {
                    data.responsible = parent.responsible;
                    break;
                }
                currentParentId = parent?.parentId;
            }

            // Hierarchical Code Generation
            const immediateParent = getComponentById(addingContext.parentId);
            if (immediateParent?.code && !data.code) {
                const childrenCount = plan.components?.filter(c => c.parentId === immediateParent.id).length || 0;
                data.code = `${immediateParent.code}.${childrenCount + 1}`;
            }
        }
        return Object.keys(data).length > 0 ? data as any : undefined;
    };

    // Render Helpers
    const renderEditForm = (item: PESComponent) => {
        const customLabel = item.type === 'Diretriz' ? plan.customNomenclature?.level1 : item.type === 'Objetivo' ? plan.customNomenclature?.level2 : item.type === 'Meta' ? plan.customNomenclature?.level3 : item.type === 'Ação' ? plan.customNomenclature?.level4 : undefined;
        const levelIdx = getLevelIndex(item.type, item.parentId || null);
        const fieldCfg = getFieldConfig(plan.planType, levelIdx);
        return (
            <ComponentForm
                type={item.type}
                parentId={item.parentId || null}
                units={units}
                baseYear={baseYear}
                initialData={item}
                onSave={handleUpdateItem}
                onCancel={() => setEditingItemId(null)}
                customLabel={customLabel}
                fieldConfig={fieldCfg}
            />
        );
    };

    return (
        <div className="p-6 bg-gray-50/30 min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200/60 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Estrutura do Plano</h2>
                    <p className="text-sm text-gray-500 mt-1">Gerencie hierarquicamente os componentes do planejamento</p>
                </div>
                <div className="flex gap-4">
                    {!isAdding && !editingItemId && plan.planType !== 'pas' && (
                        <button onClick={handleAddRoot} className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-all shadow-md shadow-brand-purple/30 text-sm font-medium">
                            <Plus className="w-4 h-4 mr-2" />Adicionar Item ({plan.customNomenclature?.level1 || 'Diretriz'})
                        </button>
                    )}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar componente..."
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-purple/20 outline-none w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Form Area */}
            {isAdding && (
                <ComponentForm
                    type={addingContext.type}
                    parentId={addingContext.parentId}
                    units={units}
                    baseYear={baseYear}
                    initialData={getInitialAddData()}
                    onSave={handleSaveNewItem}
                    onCancel={() => setIsAdding(false)}
                    customLabel={addingContext.type === 'Diretriz' ? plan.customNomenclature?.level1 : addingContext.type === 'Objetivo' ? plan.customNomenclature?.level2 : addingContext.type === 'Meta' ? plan.customNomenclature?.level3 : addingContext.type === 'Ação' ? plan.customNomenclature?.level4 : undefined}
                    fieldConfig={getFieldConfig(plan.planType, getLevelIndex(addingContext.type, addingContext.parentId))}
                />
            )}

            {/* Main Tree View */}
            {!isAdding && (
                <CascadeView
                    plan={plan}
                    onEdit={(item) => setEditingItemId(item.id)}
                    onDelete={handleDeleteItem}
                    editingId={editingItemId}
                    renderEditForm={renderEditForm}
                    searchTerm={searchTerm}
                    monitorings={monitorings}
                    selectedPeriod={selectedPeriod}
                    onAddChild={handleAddChild}
                />
            )}


            <ConfirmDialog 
                isOpen={!!itemToDelete}
                title="Excluir Componente"
                message="Tem certeza que deseja excluir? Isso excluirá também todos os itens filhos (ações, metas) em cascata."
                confirmText="Sim, Excluir em Cascata"
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
};
