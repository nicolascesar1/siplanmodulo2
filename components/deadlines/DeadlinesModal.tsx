import React, { useState, useMemo } from 'react';
import { MonitoringInstance } from '../../types';
import { X, Calendar, CheckSquare, Square, Search, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface DeadlinesModalProps {
    onClose: () => void;
    monitorings: MonitoringInstance[]; // All monitorings
    onSave: (updatedMonitorings: MonitoringInstance[]) => void;
}

export const DeadlinesModal: React.FC<DeadlinesModalProps> = ({ onClose, monitorings, onSave }) => {
    // 1. Filter State
    const [selectedPeriod, setSelectedPeriod] = useState<string>('Q1 2025');
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [applyToAll, setApplyToAll] = useState(false);

    // 3. Date Input State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // 4. Pagination (Basic)
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    // Filter Logic
    const filteredMonitorings = useMemo(() => {
        return monitorings.filter(m =>
            m.period === selectedPeriod &&
            m.unitName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [monitorings, selectedPeriod, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMonitorings.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredMonitorings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Toggle Selection
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
        setApplyToAll(false); // If manually toggling, "All" might be invalid
    };

    const toggleSelectAll = () => {
        if (applyToAll) {
            setSelectedIds(new Set());
            setApplyToAll(false);
        } else {
            // Select ALL visible (in this period)
            const allIds = new Set(filteredMonitorings.map(m => m.id));
            setSelectedIds(allIds);
            setApplyToAll(true);
        }
    };

    const handleSave = () => {
        if (!startDate || !endDate) {
            alert("Por favor, selecione as datas de início e término.");
            return;
        }

        if (selectedIds.size === 0) {
            alert("Selecione pelo menos uma unidade para aplicar os prazos.");
            return;
        }

        const updates = monitorings
            .filter(m => selectedIds.has(m.id))
            .map(m => ({
                ...m,
                submissionStart: startDate,
                submissionEnd: endDate
            }));

        onSave(updates);
        onClose();
    };

    const formatDate = (d?: string) => {
        if (!d) return '-';
        const [y, m, da] = d.split('-');
        return `${da}/${m}/${y}`;
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Definir Períodos de Disponibilização</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Date Inputs Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-1 border border-gray-200 rounded-lg flex items-center shadow-sm">
                            <div className="p-2 border-r border-gray-100 text-gray-400"><Calendar className="w-5 h-5" /></div>
                            <div className="flex-1 px-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data de Início <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full text-sm text-gray-700 font-medium outline-none bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="bg-white p-1 border border-gray-200 rounded-lg flex items-center shadow-sm">
                            <div className="p-2 border-r border-gray-100 text-gray-400"><Calendar className="w-5 h-5" /></div>
                            <div className="flex-1 px-3">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data de Término <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full text-sm text-gray-700 font-medium outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter & Period Selection */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            {/* Mock Period Selector because mockup implies defining periods for a context */}
                            <select
                                value={selectedPeriod}
                                onChange={(e) => { setSelectedPeriod(e.target.value); setCurrentPage(1); setSelectedIds(new Set()); setApplyToAll(false); }}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                            >
                                <option value="Q1 2024">Q1 2024</option>
                                <option value="Q2 2024">Q2 2024</option>
                                <option value="Q3 2024">Q3 2024</option>
                                <option value="Q1 2025">Q1 2025</option>
                            </select>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="buscar unidade..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulk Action Bar */}
                    <div
                        onClick={toggleSelectAll}
                        className={`flex items-center gap-3 p-3 rounded-lg mb-4 cursor-pointer transition-colors border select-none ${applyToAll ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                        {applyToAll ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                        <span className="text-sm font-medium">Aplicar a todos os relatórios filtrados ({filteredMonitorings.length})</span>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                    <th className="w-12 px-4 py-3 text-center">
                                        <div className="w-4 h-4" /> {/* Spacer for checkbox column logic if needed per row */}
                                    </th>
                                    <th className="px-4 py-3">Coordenação</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3">Início Atual</th>
                                    <th className="px-4 py-3">Fim Atual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedItems.length > 0 ? paginatedItems.map(item => {
                                    const isSelected = selectedIds.has(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => toggleSelect(item.id)}
                                            className={`transition-colors cursor-pointer text-sm ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-4 py-3 text-center">
                                                {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600 mx-auto" /> : <Square className="w-4 h-4 text-gray-300 mx-auto" />}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-700">{item.unitName}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>Ativo</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{formatDate(item.submissionStart)}</td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{formatDate(item.submissionEnd)}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            Nenhum monitoramento encontrado para este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs font-medium text-gray-600">
                            Página {currentPage} de {totalPages || 1}
                        </span>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedIds.size === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Aplicar Períodos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
