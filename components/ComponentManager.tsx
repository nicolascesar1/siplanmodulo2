import React, { useState } from 'react';
import { PESInstance, PESComponent, ComponentType, MonitoringInstance } from '../types';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { CascadeView } from './CascadeView';
import { ExecutionStatusModal } from './ExecutionStatusModal';
import { ComponentForm } from './forms/ComponentForm';

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
    const [selectedComponentForStatus, setSelectedComponentForStatus] = useState<PESComponent | null>(null);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [addingContext, setAddingContext] = useState<{ parentId: string | null; type: ComponentType }>({ parentId: null, type: 'Diretriz' });
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // Helpers
    const getComponentById = (id: string | null) => id ? plan.components?.find(c => c.id === id) : null;
    const baseYear = plan.startYear ? Number(plan.startYear) : new Date().getFullYear();

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

        // Propagate responsible changes
        if (data.responsible) {
            const originalItem = plan.components?.find(c => c.id === editingItemId);
            if (originalItem?.type === 'Meta') {
                updatedComponents = updatedComponents.map(c => {
                    if (c.parentId === editingItemId && c.type === 'Ação') {
                        return { ...c, responsible: data.responsible };
                    }
                    return c;
                });
            }
        }

        onUpdatePlan({ ...plan, components: updatedComponents });
        setEditingItemId(null);
    };

    const handleDeleteItem = (id: string) => {
        if (!confirm("Tem certeza? Isso excluirá também todos os itens filhos (cascata).")) return;
        const idsToDelete = new Set<string>();
        const findChildren = (pid: string) => { idsToDelete.add(pid); plan.components?.forEach(c => { if (c.parentId === pid) findChildren(c.id); }); };
        findChildren(id);
        onUpdatePlan({ ...plan, components: (plan.components || []).filter(c => !idsToDelete.has(c.id)) });
    };

    // Calculate Initial Data for Add Form (e.g. inheriting responsible)
    const getInitialAddData = () => {
        if (addingContext.type === 'Ação' && addingContext.parentId) {
            const parentMeta = getComponentById(addingContext.parentId);
            if (parentMeta?.responsible) return { responsible: parentMeta.responsible } as any;
        }
        return undefined;
    };

    // Render Helpers
    const renderEditForm = (item: PESComponent) => (
        <ComponentForm
            type={item.type}
            parentId={item.parentId || null}
            units={units}
            baseYear={baseYear}
            initialData={item}
            onSave={handleUpdateItem}
            onCancel={() => setEditingItemId(null)}
        />
    );

    return (
        <div className="p-6 bg-gray-50/30 min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200/60 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Estrutura do Plano</h2>
                    <p className="text-sm text-gray-500 mt-1">Gerencie hierarquicamente os componentes do planejamento</p>
                </div>
                <div className="flex gap-4">
                    {!isAdding && !editingItemId && (
                        <button onClick={handleAddRoot} className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-all shadow-md shadow-brand-purple/30 text-sm font-medium">
                            <Plus className="w-4 h-4 mr-2" />Adicionar Item (Diretriz)
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
                    onShowStatus={(comp) => setSelectedComponentForStatus(comp)}
                    onAddChild={handleAddChild}
                />
            )}

            {/* Execution Status Modal */}
            {selectedComponentForStatus && (
                <ExecutionStatusModal
                    component={selectedComponentForStatus}
                    monitorings={monitorings}
                    plan={plan}
                    onClose={() => setSelectedComponentForStatus(null)}
                />
            )}
        </div>
    );
};
