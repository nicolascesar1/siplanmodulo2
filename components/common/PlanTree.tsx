import React, { useState, useEffect } from 'react';
import { PESInstance, PESComponent } from '../../types';
import { AlertCircle, ChevronsDown, ChevronsUp } from 'lucide-react';

interface PlanTreeProps {
    plan: PESInstance;
    searchTerm?: string;
    /**
     * Function to check if a specific item should be visible (e.g. based on unit filter).
     * If not provided, it defaults to true (or just search term match).
     * The Tree logic handles hierarchical search matching (showing parents if child matches).
     */
    filterPredicate?: (item: PESComponent) => boolean;

    /**
     * Render prop for the content of each row.
     * @param component The component to render
     * @param depth 0=Diretriz, 1=Objetivo, 2=Meta, 3=Ação
     * @param isCollapsed Whether the item is collapsed (if it has children)
     * @param toggle Function to toggle collapse state
     * @param hasChildren Whether the item has visible children
     */
    renderRow: (
        component: PESComponent,
        depth: number,
        isCollapsed: boolean,
        toggle: () => void,
        hasChildren: boolean
    ) => React.ReactNode;
}

export const PlanTree: React.FC<PlanTreeProps> = ({
    plan,
    searchTerm = '',
    filterPredicate,
    renderRow
}) => {
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

    // --- Search & Filter Logic ---
    // Helper: Check if item matches search term text
    const matchesSearch = (item: PESComponent) => {
        if (!searchTerm) return true;
        return item.content.toLowerCase().includes(searchTerm.toLowerCase());
    };

    // Helper: Check if item matches external predicate (e.g. My Unit)
    const matchesPredicate = (item: PESComponent) => {
        if (!filterPredicate) return true;
        return filterPredicate(item);
    };

    // Recursive check: Item is visible if IT matches OR ANY of its children match
    const isVisible = (item: PESComponent): boolean => {
        // 1. Direct Match against search AND predicate
        const directMatch = matchesSearch(item) && matchesPredicate(item);

        // 2. Check children
        const children = plan.components?.filter(c => c.parentId === item.id) || [];
        const childrenMatch = children.some(child => isVisible(child));

        // Special case: If searching, we usually show parents even if they don't match, provided a child matches.
        // If filtering by unit, logic might be different (usually show parent container).
        // Combined: Visible if (Self Matches OR Child Matches)
        return directMatch || childrenMatch;
    };

    // Initialize: Get visible items
    // We only need to filter the top level (Diretrizes). Hierarchy will follow.
    // However, for getChildren(), we need to filter them too.

    // Reset/Auto-expand on search
    useEffect(() => {
        if (searchTerm) {
            setCollapsedIds(new Set()); // Expand all
        }
    }, [searchTerm]);

    const toggle = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const newCollapsed = new Set(collapsedIds);
        if (newCollapsed.has(id)) {
            newCollapsed.delete(id);
        } else {
            newCollapsed.add(id);
        }
        setCollapsedIds(newCollapsed);
    };

    const expandAll = () => setCollapsedIds(new Set());
    const collapseAll = () => {
        const allParentIds = new Set<string>();
        plan.components?.forEach(c => {
            if (c.type !== 'Ação') allParentIds.add(c.id);
        });
        setCollapsedIds(allParentIds);
    };

    const getChildren = (parentId: string, type: string) => {
        return (plan.components || [])
            .filter(c => c.parentId === parentId && c.type === type)
            .filter(isVisible);
    };

    const topLevelDiretrizes = (plan.components || [])
        .filter(c => c.type === 'Diretriz')
        .filter(isVisible);

    if (topLevelDiretrizes.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">{searchTerm ? 'Nenhum resultado para a busca.' : 'A estrutura do plano está vazia.'}</p>
            </div>
        );
    }

    const renderTreeLevel = (parentId: string, type: 'Objetivo' | 'Meta' | 'Ação', depth: number) => {
        const items = getChildren(parentId, type);
        if (items.length === 0) return null;

        if (type === 'Ação') {
            // Agrupar por ano
            const itemsByYear = items.reduce((acc, item) => {
                const year = item.actionYear || 'Geral/Anterior';
                if (!acc[year]) acc[year] = [];
                acc[year].push(item);
                return acc;
            }, {} as Record<string | number, PESComponent[]>);

            const sortedYears = Object.keys(itemsByYear).sort().reverse(); // Mais recentes primeiro

            return (
                <div className="space-y-4 mt-2 mb-2">
                    {sortedYears.map(year => (
                        <div key={year} className="bg-white rounded-lg p-2.5 border border-sky-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-200" />
                            <h4 className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                {year === 'Geral/Anterior' ? 'Ações Gerais / Sem Ano' : `Ações Planejadas para ${year}`}
                            </h4>
                            <div className="space-y-1 ml-1">
                                {itemsByYear[year].map(item => (
                                    <div key={item.id}>
                                        {renderRow(item, depth, false, () => toggle(item.id), false)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div>
                {items.map(item => {
                    const nextType = type === 'Objetivo' ? 'Meta' : (type === 'Meta' ? 'Ação' : null);
                    const childrenCount = nextType ? getChildren(item.id, nextType).length : 0;
                    const isCollapsed = collapsedIds.has(item.id);

                    return (
                        <div key={item.id}>
                            {renderRow(item, depth, isCollapsed, () => toggle(item.id), childrenCount > 0)}

                            {/* Render Children with Tree Lines */}
                            {!isCollapsed && nextType && (
                                <div className={`ml-3 pl-3 border-l ${type === 'Objetivo' ? 'border-brand-purple/30' :
                                    type === 'Meta' ? 'border-brand-blue/30' :
                                        'border-gray-200'
                                    }`}>
                                    {renderTreeLevel(item.id, nextType as any, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-500 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header / Global Controls */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Estrutura do Plano</h3>
                    {(() => {
                        const count = plan.components?.filter(c => c.type === 'Diretriz').length || 0;
                        const label = plan.customNomenclature?.level1 || 'Diretriz';
                        let displayLabel = label;
                        if (count !== 1) {
                            if (label === 'Objetivo Geral') displayLabel = 'Objetivos Gerais';
                            else if (label === 'Diretriz') displayLabel = 'Diretrizes';
                            else displayLabel = label + 's';
                        }
                        return <span className="text-xs text-gray-400 font-normal">({count} {displayLabel})</span>;
                    })()}
                </div>
                <div className="flex gap-2">
                    <button onClick={expandAll} className="flex items-center text-xs font-medium text-gray-600 hover:text-brand-purple bg-white border border-gray-200 hover:border-brand-purple/30 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        <ChevronsDown className="w-3.5 h-3.5 mr-1.5" /> Expandir
                    </button>
                    <button onClick={collapseAll} className="flex items-center text-xs font-medium text-gray-600 hover:text-brand-purple bg-white border border-gray-200 hover:border-brand-purple/30 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        <ChevronsUp className="w-3.5 h-3.5 mr-1.5" /> Recolher
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {topLevelDiretrizes.map(diretriz => {
                    const objectivesCount = getChildren(diretriz.id, 'Objetivo').length;
                    const isCollapsed = collapsedIds.has(diretriz.id);

                    return (
                        <div key={diretriz.id} className="group/item">
                            {renderRow(diretriz, 0, isCollapsed, () => toggle(diretriz.id), objectivesCount > 0)}

                            {!isCollapsed && (
                                <div className="ml-3 pl-3 border-l border-brand-teal/30 mt-2">
                                    {renderTreeLevel(diretriz.id, 'Objetivo', 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
