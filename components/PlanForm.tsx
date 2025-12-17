
import React, { useState, useEffect } from 'react';
import { PESFormValues, PESModel } from '../types';
import { Save, X } from 'lucide-react';

interface PlanFormProps {
  initialValues?: PESFormValues;
  models: PESModel[];
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
  status: 'Em andamento'
};

export const PlanForm: React.FC<PlanFormProps> = ({ initialValues, models, onSubmit, onCancel, title }) => {
  const [form, setForm] = useState<PESFormValues>(initialValues || defaultValues);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.endYear < form.startYear) {
      alert("O Ano Fim deve ser maior ou igual ao Ano Início.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome do Plano <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Plano Estratégico 2024-2027"
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ano Início <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="startYear"
                value={form.startYear}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
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
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Section: Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Modelo de Plano</label>
              <select
                name="modelId"
                value={form.modelId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                required
                disabled={!!initialValues}
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              >
                <option value="Não realizada">Não realizada</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Realizada">Realizada</option>
              </select>
            </div>
          </div>

          {/* Section: Description */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição Geral</label>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva os objetivos gerais deste plano..."
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
