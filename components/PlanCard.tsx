
import React from 'react';
import { PESInstance } from '../types';
import { Calendar, FileText, ChevronRight, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface PlanCardProps {
  plan: PESInstance;
  modelName?: string;
  onClick: (plan: PESInstance) => void;
  customAction?: React.ReactNode;
  onDelete?: (plan: PESInstance) => void;
}

const statusBadges = {
  'Realizada': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Em andamento': 'bg-blue-50 text-blue-700 border-blue-100',
  'Não realizada': 'bg-gray-50 text-gray-600 border-gray-100',
};

export const PlanCard: React.FC<PlanCardProps> = ({ plan, modelName, onClick, customAction, onDelete }) => {
  return (
    <div
      onClick={() => onClick(plan)}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300 cursor-pointer relative flex flex-col h-full shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${statusBadges[plan.status]}`}>
          {plan.status}
        </span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(plan); }}
              className="p-1.5 rounded-full text-gray-400 bg-white hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100 hover:border-red-200 shadow-sm"
              title="Excluir Plano"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); customAction && (customAction as any)(); }}
            className="p-1.5 rounded-full text-gray-400 bg-white hover:bg-brand-purple/10 hover:text-brand-purple transition-all border border-gray-100 hover:border-brand-purple/20 shadow-sm"
            title="Ver Status Geral"
          >
            <div className="w-4 h-4 text-xs font-bold flex items-center justify-center">?</div>
          </button>
          <div className="p-1.5 rounded-full text-brand-purple/20 bg-brand-purple/10 group-hover:bg-brand-purple group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-purple transition-colors line-clamp-2 leading-tight">
        {plan.name}
      </h3>

      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-4">
        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Vigência: {plan.startYear} - {plan.endYear}</span>
        </span>
        {plan.monitoringFrequency && (
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${plan.monitoringFrequency === 'Trimestral' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
            {plan.monitoringFrequency}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
        {plan.description || "Sem descrição definida para este plano."}
      </p>

      <div className="border-t border-gray-100 pt-4 mt-auto">
        <div className="flex items-center justify-end text-xs text-gray-400">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>Atualizado hoje</span>
          </div>
        </div>
        {customAction && (
          <div className="mt-4 pt-2 border-t border-gray-50">
            {customAction}
          </div>
        )}
      </div>
    </div>
  );
};
