
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Search,
  Plus,
  Settings,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  Filter,
  Download,
  CalendarRange,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { PESInstance, MonitoringInstance, UserRole } from '../types';
import { DeadlinesModal } from '../components/deadlines/DeadlinesModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface MonitoringListProps {
  plans: PESInstance[];
  units: string[];
  userRole: UserRole;
  monitorings: MonitoringInstance[];
  onCreateMonitoring: (m: MonitoringInstance) => void;
  onUpdateMonitoring: (m: MonitoringInstance) => void;
  onDeleteMonitoring?: (id: string) => void;
}

// Helper para cores de status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Finalizado': return 'bg-emerald-500';
    case 'Submetido': return 'bg-brand-purple';
    case 'Em Preenchimento': return 'bg-brand-blue';
    default: return 'bg-gray-400';
  }
};

export const MonitoringList: React.FC<MonitoringListProps> = ({ plans, units, userRole, monitorings, onCreateMonitoring, onUpdateMonitoring, onDeleteMonitoring }) => {
  const navigate = useNavigate();

  // Filter States
  // ... (lines skipped)

  const [filterText, setFilterText] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const location = useLocation();

  // Set filter from navigation state
  React.useEffect(() => {
    const s = location.state as { planId?: string } | null;
    if (s?.planId) {
      setFilterPlan(s.planId);
      // Clean up state after use to avoid persistent filter on manual navigations later
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState(false);
  const [monitoringToDelete, setMonitoringToDelete] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [submissionStart, setSubmissionStart] = useState('');
  const [submissionEnd, setSubmissionEnd] = useState('');

  // Generate periods based on plan frequency
  const availablePeriods = useMemo(() => {
    if (!selectedPlanId) return [];
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return [];

    const isTrimestral = plan.monitoringFrequency === 'Trimestral';
    const startObj = plan.startYear || new Date().getFullYear();
    const endObj = plan.endYear || startObj + 3;
    const periods = [];

    for (let y = startObj; y <= endObj; y++) {
      if (isTrimestral) {
        periods.push({ value: `T1 ${y}`, label: `T1 ${y} (Jan-Mar)` });
        periods.push({ value: `T2 ${y}`, label: `T2 ${y} (Abr-Jun)` });
        periods.push({ value: `T3 ${y}`, label: `T3 ${y} (Jul-Set)` });
        periods.push({ value: `T4 ${y}`, label: `T4 ${y} (Out-Dez)` });
      } else {
        periods.push({ value: `Q1 ${y}`, label: `Q1 ${y} (Jan-Abr)` });
        periods.push({ value: `Q2 ${y}`, label: `Q2 ${y} (Mai-Ago)` });
        periods.push({ value: `Q3 ${y}`, label: `Q3 ${y} (Set-Dez)` });
      }
    }
    return periods;
  }, [selectedPlanId, plans]);

  // Auto-select first period when plan changes
  React.useEffect(() => {
    if (availablePeriods.length > 0 && !availablePeriods.find(p => p.value === selectedPeriod)) {
      setSelectedPeriod(availablePeriods[0].value);
    }
  }, [availablePeriods, selectedPeriod]);

  const handleSaveDeadlines = (updatedMonitorings: MonitoringInstance[]) => {
    updatedMonitorings.forEach(m => onUpdateMonitoring(m));
  };

  // Computed for Modal Confirmation
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const matchingItemsCount = selectedPlan ? (selectedPlan.components || []).filter(c =>
    (c.type === 'Ação' || c.type === 'Meta') &&
    c.responsible &&
    c.responsible === selectedUnit
  ).length : 0;

  // Filter Logic
  const filteredMonitorings = useMemo(() => {
    return monitorings.filter(item => {

      // Safety Check: Only show monitoring if the plan still exists
      const planExists = plans.some(p => p.id === item.planId);
      if (!planExists) return false;

      // Role-based filtering
      if (userRole !== 'admin') {
        // Simplificação: Se não for admin, vê apenas da unidade mockada ou todas se não houver lógica de auth real
        // Para este demo, vamos deixar ver tudo ou filtrar por nome se for muito específico
        // if (!item.unitName.includes("Tecnologia")) return false; 
      }

      const matchesText =
        item.title.toLowerCase().includes(filterText.toLowerCase()) ||
        item.unitName.toLowerCase().includes(filterText.toLowerCase());

      const matchesPlan = filterPlan ? item.planId === filterPlan : true;
      const matchesUnit = filterUnit ? item.unitName === filterUnit : true;
      const matchesPeriod = filterPeriod ? item.period.includes(filterPeriod) : true;
      const matchesStatus = filterStatus ? item.status === filterStatus : true;

      return matchesText && matchesPlan && matchesUnit && matchesPeriod && matchesStatus;
    });
  }, [monitorings, plans, filterText, filterPlan, filterUnit, filterPeriod, filterStatus, userRole]);

  const handleCreate = () => {
    if (!selectedPlanId || !selectedUnit || !selectedPeriod) return;

    const newMonitoring: MonitoringInstance = {
      id: Date.now().toString(),
      planId: selectedPlanId,
      unitName: selectedUnit,
      title: `Monitoramento ${selectedPeriod} - ${selectedUnit.split(' ')[0]}`,
      period: selectedPeriod,
      status: 'Não Preenchido',
      progress: 0,
      submissionStart: submissionStart || undefined,
      submissionEnd: submissionEnd || undefined,
      createdAt: new Date().toISOString()
    };

    onCreateMonitoring(newMonitoring);
    setIsModalOpen(false);
    setSelectedPlanId('');
    setSelectedUnit('');
    setSelectedPeriod('');
    setSubmissionStart('');
    setSubmissionEnd('');
  };

  const clearFilters = () => {
    setFilterText('');
    setFilterPlan('');
    setFilterUnit('');
    setFilterPeriod('');
    setFilterStatus('');
  };

  const handleExportCSV = () => {
    if (filteredMonitorings.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Definição dos cabeçalhos
    const headers = ['Coordenação/Unidade', 'Plano', 'Título', 'Período Ref.', 'Início Prazo Envio', 'Fim Prazo Envio', 'Status', 'Progresso (%)', 'Data Criação'];

    // Mapeamento das linhas
    const rows = filteredMonitorings.map(item => {
      const planName = plans.find(p => p.id === item.planId)?.name || 'N/A';
      const createdDate = new Date(item.createdAt).toLocaleDateString('pt-BR');

      // Escapando aspas e vírgulas para formato CSV válido
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

      return [
        escapeCsv(item.unitName),
        escapeCsv(planName),
        escapeCsv(item.title),
        escapeCsv(item.period),
        escapeCsv(item.submissionStart || ''),
        escapeCsv(item.submissionEnd || ''),
        escapeCsv(item.status),
        escapeCsv(item.progress.toString()),
        escapeCsv(createdDate)
      ].join(',');
    });

    // Montagem do conteúdo
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Criação do Blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monitoramentos_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderProgressCircle = (percentage: number) => {
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let strokeColor = "#f3f4f6"; // Gray for 0%
    if (percentage > 0 && percentage < 30) strokeColor = "#ef4444"; // Red for low
    else if (percentage >= 30 && percentage < 100) strokeColor = "#eab308"; // Clear Yellow for medium
    else if (percentage === 100) strokeColor = "#10b981"; // Green for high

    return (
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-black">{percentage}%</span>
      </div>
    );
  };

  // Helper para formatar data DD/MM/AAAA
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    // Assume entrada YYYY-MM-DD e converte com fuso local para evitar problemas de dia
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper para verificar status do Prazo de Envio
  const getSubmissionStatus = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const now = new Date();
    // Resetar hora para comparar apenas datas
    now.setHours(0, 0, 0, 0);

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    if (now >= startDate && now <= endDate) {
      return <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">NO PRAZO</span>;
    } else if (now > endDate) {
      return <span className="text-[10px] font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-200">ENCERRADO</span>;
    } else {
      return <span className="text-[10px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">AGUARDANDO</span>;
    }
  };

  const hasFilters = filterText || filterPlan || filterUnit || filterPeriod || filterStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] animate-in fade-in duration-300 relative">

      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-black">Monitoramentos</h2>
            <p className="text-sm text-gray-500 mt-1">Acompanhe e preencha os relatórios periódicos da unidade.</p>
          </div>

          {userRole === 'admin' && (
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsDeadlinesModalOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Configurar Disponibilização
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar Consolidado
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-4 space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col xl:flex-row gap-4">

          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar por título ou coordenação..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 overflow-x-auto">
            {/* Filtro de Planos */}
            <div className="relative min-w-[180px] flex-1">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none pr-8 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="">Todos os Planos</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro de Unidades (Visível apenas para Admin, pois técnicos veem apenas a sua) */}
            {userRole === 'admin' && (
              <div className="relative min-w-[180px] flex-1">
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="w-full appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none pr-8 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="">Todas as Unidades</option>
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Filtro de Período */}
            <div className="relative min-w-[140px]">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none pr-8 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="">Todos os Períodos</option>
                <optgroup label="Quadrimestral (PAS)">
                  <option value="Q1">Q1 (1º Quad)</option>
                  <option value="Q2">Q2 (2º Quad)</option>
                  <option value="Q3">Q3 (3º Quad)</option>
                </optgroup>
                <optgroup label="Trimestral (PPA)">
                  <option value="T1">T1 (1º Trim)</option>
                  <option value="T2">T2 (2º Trim)</option>
                  <option value="T3">T3 (3º Trim)</option>
                  <option value="T4">T4 (4º Trim)</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro de Status */}
            <div className="relative min-w-[150px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none pr-8 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="">Todos os Status</option>
                <option value="Não Preenchido">Não Preenchido</option>
                <option value="Em Preenchimento">Em Preenchimento</option>
                <option value="Submetido">Submetido</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-medium text-gray-500">
            <span className="text-black font-bold">{filteredMonitorings.length}</span> resultados encontrados
          </span>

          <div className="flex items-center gap-4 h-8">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center text-xs font-medium text-brand-purple hover:text-brand-purple/80 transition-colors">
                <X className="w-3 h-3 mr-1" /> Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
              <th className="px-6 py-4 cursor-pointer hover:text-brand-purple group transition-colors">
                <div className="flex items-center">Coordenação <ArrowDownUp className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" /></div>
              </th>
              <th className="px-4 py-4 cursor-pointer hover:text-brand-purple group transition-colors">
                <div className="flex items-center">Título <ArrowDownUp className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" /></div>
              </th>
              <th className="px-4 py-4 cursor-pointer hover:text-brand-purple group transition-colors">
                <div className="flex items-center">Período Ref. <ArrowDownUp className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" /></div>
              </th>
              <th className="px-4 py-4 cursor-pointer hover:text-brand-purple group transition-colors">
                <div className="flex items-center">Status / Progresso <ArrowDownUp className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" /></div>
              </th>
              <th className="px-4 py-4 cursor-pointer hover:text-brand-purple group transition-colors">
                <div className="flex items-center">Prazo de Envio <ArrowDownUp className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" /></div>
              </th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50 bg-white">
            {filteredMonitorings.length > 0 ? (
              filteredMonitorings.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/monitoring/${row.id}`)}
                >
                  <td className="px-6 py-4 text-black font-bold max-w-[280px]">
                    <div className="line-clamp-2" title={row.unitName}>{row.unitName}</div>
                    <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[250px] font-medium">
                      {plans.find(p => p.id === row.planId)?.name || 'Plano Desconhecido'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-black font-medium text-xs">
                    {row.title}
                  </td>
                  <td className="px-4 py-4 text-black font-bold text-xs uppercase">
                    {row.period}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {renderProgressCircle(row.progress)}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-black">{row.status}</span>
                        <div className={`h-1 w-full rounded-full mt-1 ${getStatusColor(row.status)} opacity-40`}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {row.submissionStart && row.submissionEnd ? (
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center text-xs text-black font-bold">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {formatDate(row.submissionStart)} - {formatDate(row.submissionEnd)}
                        </div>
                        {getSubmissionStatus(row.submissionStart, row.submissionEnd)}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {onDeleteMonitoring && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setMonitoringToDelete(row.id); }}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Excluir Monitoramento"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-brand-purple hover:bg-brand-purple/10 p-1.5 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-medium">Nenhum monitoramento encontrado</p>
                    <p className="text-xs mt-1">
                      {plans.length === 0 ? "Cadastre um plano primeiro." : "Tente ajustar os filtros de busca ou crie um novo."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2 mt-auto">
        <span className="text-xs text-gray-500 mr-2">Página 1 de 1</span>

        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button className="w-9 h-9 flex items-center justify-center bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50 border-r border-gray-200" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-brand-purple/20 text-black font-bold text-sm">
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isModalOpen && userRole === 'admin' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Novo Monitoramento</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="p-6 space-y-4">
              {plans.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Nenhum Plano Cadastrado</p>
                  <p className="text-xs text-gray-500 mt-1">Você precisa criar um Plano Estratégico antes de gerar monitoramentos.</p>
                  <button onClick={() => navigate('/admin')} className="mt-4 text-brand-purple font-bold text-xs hover:underline">Ir para Administração</button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Selecione o Plano <span className="text-red-500">*</span></label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                    >
                      <option value="">Selecione...</option>
                      {plans.filter(p => p.planType !== 'pes').map(p => <option key={p.id} value={p.id}>{p.name} ({p.planType?.toUpperCase() || 'Padrão'})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Unidade Responsável <span className="text-red-500">*</span></label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                    >
                      <option value="">Selecione...</option>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Período de Referência <span className="text-red-500">*</span></label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                    >
                      <option value="">Selecione...</option>
                      {availablePeriods.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Início do Prazo</label>
                      <input
                        type="date"
                        value={submissionStart}
                        onChange={(e) => setSubmissionStart(e.target.value)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Fim do Prazo</label>
                      <input
                        type="date"
                        value={submissionEnd}
                        onChange={(e) => setSubmissionEnd(e.target.value)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                      />
                    </div>
                  </div>

                  {selectedPlanId && selectedUnit && (
                    <div className="bg-brand-purple/5 p-3 rounded-lg border border-brand-purple/20 text-brand-purple text-xs">
                      <p className="font-bold mb-1">Resumo da Geração:</p>
                      <ul className="list-disc ml-4 mt-1 mb-2">
                        <li><span className="font-bold">{matchingItemsCount}</span> Metas/Ações vinculadas à unidade <span className="font-semibold">{selectedUnit}</span>.</li>
                      </ul>
                      {submissionStart && submissionEnd ? (
                        <p className="italic border-t border-brand-purple/20 pt-1 mt-1">O monitoramento ficará disponível para a unidade de {new Date(submissionStart + 'T12:00:00').toLocaleDateString('pt-BR')} a {new Date(submissionEnd + 'T12:00:00').toLocaleDateString('pt-BR')}.</p>
                      ) : (
                        <p className="italic border-t border-brand-purple/20 pt-1 mt-1 text-amber-600">Sem prazo definido — o monitoramento não ficará acessível para a unidade até que as datas sejam configuradas.</p>
                      )}
                    </div>
                  )}

                    <button
                    onClick={handleCreate}
                    disabled={!selectedPlanId || !selectedUnit}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Gerar Monitoramento
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeadlinesModalOpen && (
        <DeadlinesModal
          monitorings={monitorings}
          onClose={() => setIsDeadlinesModalOpen(false)}
          onSave={handleSaveDeadlines}
        />
      )}

      <ConfirmDialog 
        isOpen={!!monitoringToDelete}
        title="Excluir Monitoramento"
        message="Tem certeza que deseja excluir este período de monitoramento? Todos os preenchimentos feitos pelas áreas técnicas serão perdidos permanentemente."
        confirmText="Sim, Excluir"
        onConfirm={() => { if (monitoringToDelete && onDeleteMonitoring) onDeleteMonitoring(monitoringToDelete); setMonitoringToDelete(null); }}
        onCancel={() => setMonitoringToDelete(null)}
      />
    </div>
  );
};
