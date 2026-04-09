import React, { useState, useEffect } from 'react';
import { PESFormValues, PESModel, PESInstance } from '../types';
import { Save, X, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface PlanFormProps {
  initialValues?: PESFormValues;
  models: PESModel[];
  plans?: PESInstance[];
  onSubmit: (values: PESFormValues) => void;
  onCancel: () => void;
  title: string;
}

const defaultValues: PESFormValues = {
  name: '',
  startYear: new Date().getFullYear() + 1,
  endYear: new Date().getFullYear() + 4,
  description: '',
  modelId: '',
  status: 'Em andamento',
  monitoringFrequency: 'Quadrimestral',
  planType: 'pes'
};

export const PlanForm: React.FC<PlanFormProps> = ({ initialValues, models, plans = [], onSubmit, onCancel, title }) => {
  const [form, setForm] = useState<PESFormValues>(initialValues || defaultValues);
  
  // Custom nomenclature happens for PES, PPA and Custom
  const isPas = form.planType === 'pas';
  const isCustom = form.planType === 'custom';
  const hasCustomNomenclatureInitial = !!initialValues?.customNomenclature;
  const [useCustomNomenclature, setUseCustomNomenclature] = useState<boolean>(isCustom || (!isPas && hasCustomNomenclatureInitial));
  const [customNomenclature, setCustomNomenclature] = useState(
    initialValues?.customNomenclature || { level1: 'Objetivo Geral', level2: 'Objetivo Específico', level3: 'Entrega', level4: 'Ação' }
  );

  // Set default model if creating new and models exist
  useEffect(() => {
    if (!initialValues && models.length > 0 && !form.modelId) {
      setForm(prev => ({ ...prev, modelId: models[0].id }));
    }
  }, [models, initialValues, form.modelId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Year') ? parseInt(value) || 0 : value
    }));
  };

  const handlePlanTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const val = e.target.value as 'ppa' | 'pes' | 'pas' | 'custom';
     setForm(prev => {
        const changes: Partial<PESFormValues> = { planType: val };
        if (val === 'pas') {
           changes.monitoringFrequency = 'Quadrimestral';
           setUseCustomNomenclature(false);
           // Default pas years
           if (!prev.referenceYear) changes.referenceYear = new Date().getFullYear();
           changes.startYear = changes.referenceYear;
           changes.endYear = changes.referenceYear;
        } else if (val === 'ppa') {
           changes.monitoringFrequency = 'Trimestral';
        } else if (val === 'pes') {
           changes.monitoringFrequency = 'Quadrimestral';
        } else if (val === 'custom') {
           changes.monitoringFrequency = 'Quadrimestral';
           setUseCustomNomenclature(true);
           setCustomNomenclature({ level1: 'Eixo', level2: 'Programa', level3: 'Meta', level4: 'Ação' });
        }
        return { ...prev, ...changes };
     });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.planType !== 'pas' && form.endYear < form.startYear) {
      alert("O Ano Fim deve ser maior ou igual ao Ano Início.");
      return;
    }
    
    if (form.planType === 'pas' && !form.basePlanId) {
      alert("Selecione um Plano Base (PES) para a Programação Anual.");
      return;
    }

    const finalForm: PESFormValues = {
      ...form,
      customNomenclature: (useCustomNomenclature && form.planType !== 'pas') ? customNomenclature : undefined,
      planAcronym: form.planType === 'custom' ? form.planAcronym : undefined
    };
    
    // For PAS, force start and end year to reference year
    if (finalForm.planType === 'pas' && finalForm.referenceYear) {
       finalForm.startYear = finalForm.referenceYear;
       finalForm.endYear = finalForm.referenceYear;
    }

    onSubmit(finalForm);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomNomenclature(prev => ({ ...prev, [name]: value }));
  };

  const isPpaOrPes = form.planType === 'ppa' || form.planType === 'pes';
  const showYearFields = isPpaOrPes || form.planType === 'custom';
  const showNomenclature = isPpaOrPes || form.planType === 'custom';

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-black">
            {title}
          </h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Type Selector */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 mb-2">
             <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">Qual tipo de instrumento você deseja criar?</label>
             <select
                name="planType"
                value={form.planType || 'pes'}
                onChange={handlePlanTypeChange}
                className="w-full px-4 py-2.5 bg-white text-black font-bold border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all shadow-sm"
                required
              >
                <option value="pes">Plano Estadual de Saúde (PES) - Quadrienal Base</option>
                <option value="pas">Programação Anual de Saúde (PAS) - Derivado Anual</option>
                <option value="ppa">Plano Plurianual de Apoio (PPA) - Quadrienal Independente</option>
                <option value="custom">📋 Plano Personalizado — Nomenclatura Livre</option>
              </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome do Plano/Instrumento <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={form.planType === 'pas' ? "Ex: PAS 2025" : "Ex: Plano Estratégico 2024-2027"}
                className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all placeholder:text-gray-300 text-sm"
                required
                autoFocus
              />
            </div>

            {form.planType === 'custom' && (
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sigla (para badge) <span className="text-gray-400 font-normal">Opcional</span></label>
                <input
                  type="text"
                  name="planAcronym"
                  value={form.planAcronym || ''}
                  onChange={handleChange}
                  placeholder="Ex: POA, PMS, PAE"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-white text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm uppercase tracking-wider font-bold placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                />
              </div>
            )}
            
            {form.planType === 'pas' && (
               <>
                 <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ano de Referência <span className="text-red-500">*</span></label>
                   <input
                     type="number"
                     name="referenceYear"
                     value={form.referenceYear || new Date().getFullYear()}
                     onChange={handleChange}
                     className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                     required
                   />
                 </div>
                 <div className="col-span-1 md:col-span-2">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Escolha o Plano Base (PES) <span className="text-red-500">*</span></label>
                   <select
                     name="basePlanId"
                     value={form.basePlanId || ''}
                     onChange={handleChange}
                     className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                     required={form.planType === 'pas'}
                   >
                     <option value="">Selecione um PES aprovado...</option>
                     {plans.filter(p => p.planType === 'pes').map(p => (
                       <option key={p.id} value={p.id}>{p.name} ({p.startYear}-{p.endYear})</option>
                     ))}
                   </select>
                   <p className="text-xs text-gray-400 mt-1">A Programação Anual importará as Diretrizes, Objetivos e Metas do PES selecionado de forma automática.</p>
                 </div>
               </>
            )}

            {showYearFields && (
               <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ano Início <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="startYear"
                      value={form.startYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                      required
                    />
                  </div>
      
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ano Fim <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="endYear"
                      value={form.endYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                      required
                    />
                  </div>
               </>
            )}
          </div>

          {/* Section: Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                required
              >
                <option value="Não iniciado">Não iniciado</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Frequência de Monitoramento</label>
              <select
                name="monitoringFrequency"
                value={form.monitoringFrequency || 'Quadrimestral'}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
              >
                <option value="Quadrimestral">Quadrimestral (3x ao ano - Padrão Sec. Saúde)</option>
                <option value="Trimestral">Trimestral (4x ao ano - Padrão Plan.)</option>
              </select>
            </div>
          </div>

          {/* Section: Custom Nomenclature */}
          {showNomenclature && (
             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                     <Settings className="w-4 h-4 text-brand-purple" />
                     <label className="text-sm font-bold text-gray-800 cursor-pointer select-none" onClick={() => setUseCustomNomenclature(!useCustomNomenclature)}>
                       Personalizar Nomenclatura Hierárquica
                     </label>
                   </div>
                   <p className="text-xs text-gray-400 mt-0.5 ml-6">{form.planType === 'custom' ? 'Defina os nomes dos níveis hierárquicos do seu plano' : 'Adequar os termos se for um PPA Diferenciado'}</p>
                 </div>
                 <button
                   type="button"
                   onClick={() => setUseCustomNomenclature(!useCustomNomenclature)}
                   className={`flex items-center transition-colors ${useCustomNomenclature ? 'text-brand-purple' : 'text-gray-300 hover:text-gray-500'}`}
                 >
                   {useCustomNomenclature ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9" />}
                 </button>
               </div>
   
               {useCustomNomenclature && (
                 <div className={`grid grid-cols-1 ${form.planType === 'custom' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-4 pt-4 mt-2 border-t border-gray-100`}>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nível 1 (Ex: Objetivo Geral)</label>
                     <input
                       type="text"
                       name="level1"
                       value={customNomenclature.level1}
                       onChange={handleCustomChange}
                       className="w-full px-3 py-2 bg-gray-50 text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                       required={useCustomNomenclature}
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nível 2 (Ex: Objetivo Específico)</label>
                     <input
                       type="text"
                       name="level2"
                       value={customNomenclature.level2}
                       onChange={handleCustomChange}
                       className="w-full px-3 py-2 bg-gray-50 text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                       required={useCustomNomenclature}
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nível 3 (Ex: Entrega)</label>
                     <input
                       type="text"
                       name="level3"
                       value={customNomenclature.level3}
                       onChange={handleCustomChange}
                       className="w-full px-3 py-2 bg-gray-50 text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                       required={useCustomNomenclature}
                     />
                   </div>
                   {form.planType === 'custom' && (
                     <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nível 4 (Ex: Ação)</label>
                       <input
                         type="text"
                         name="level4"
                         value={customNomenclature.level4 || 'Ação'}
                         onChange={handleCustomChange}
                         className="w-full px-3 py-2 bg-gray-50 text-black font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                         required
                       />
                     </div>
                   )}
                 </div>
               )}
             </div>
          )}

          {/* Section: Description */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição do Instrumento</label>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva a finalidade..."
              className="w-full px-4 py-3 bg-white text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none resize-none transition-all text-sm shadow-sm font-medium"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:scale-95 transition-all shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Instrumento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
