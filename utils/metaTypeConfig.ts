/**
 * Configuração de Tipos de Meta
 * 
 * Define quais unidades de medida indicam metas de "patamar" (nível independente por ano)
 * vs metas "acumulativas" (anos se somam ao total).
 * 
 * Para adicionar novas unidades de patamar, basta incluir na lista abaixo.
 */

// Unidades de medida disponíveis no sistema
export const MEASUREMENT_UNITS = [
  // Patamar (cada ano é um nível independente)
  { value: 'Percentual', label: 'Percentual (%)', type: 'patamar' as const },
  { value: 'Proporção', label: 'Proporção', type: 'patamar' as const },
  { value: 'Taxa', label: 'Taxa', type: 'patamar' as const },
  { value: 'Índice', label: 'Índice', type: 'patamar' as const },
  { value: 'Coeficiente', label: 'Coeficiente', type: 'patamar' as const },
  { value: 'Razão', label: 'Razão', type: 'patamar' as const },

  // Acumulativas (anos se somam)
  { value: 'Número', label: 'Número absoluto', type: 'acumulativa' as const },
];

// Lista derivada de unidades consideradas "patamar"
const PATAMAR_VALUES = MEASUREMENT_UNITS
  .filter(u => u.type === 'patamar')
  .map(u => u.value.toLowerCase());

/**
 * Verifica se a unidade de medida indica uma meta de patamar.
 * Retorna true para percentuais, taxas, etc. (cada ano é independente).
 * Retorna false para números absolutos (anos se somam).
 */
export const isPatamarMeta = (measurementUnit?: string): boolean => {
  if (!measurementUnit) return false;
  return PATAMAR_VALUES.includes(measurementUnit.toLowerCase());
};

// --- Configuração de campos por tipo de plano ---

/**
 * Grupos de campos que podem ser habilitados/desabilitados por nível hierárquico.
 * - indicator: Indicador + Unidade de Medida + Método de Cálculo
 * - annualization: Anualização (valores por ano)
 * - baseline: Linha de Base + Meta Final + Prazo
 * - responsible: Responsável / Coordenação
 * - budget: Fonte de Recurso, Orçamento, Subfunção, Subação, Elemento de Despesa, Obs. Técnicas
 */
export type FieldGroup = 'indicator' | 'annualization' | 'baseline' | 'responsible' | 'budget';

export interface LevelFieldConfig {
  fields: FieldGroup[];
}

/**
 * Configuração de campos por tipo de plano.
 * Cada array representa os níveis hierárquicos (índice 0 = nível 1, etc.)
 * 
 * PAS: Diretriz (simples) → Objetivo (simples) → Meta (completa) → Ação (orçamento)
 * PPA: Obj. Geral (indicador) → Obj. Específico (indicador) → Entrega (indicador)
 */
export const MODEL_FIELD_CONFIG: Record<string, LevelFieldConfig[]> = {
  // PAS — Responsável em todos os níveis (coordenadoria, subcoordenadoria ou setor)
  'pas': [
    { fields: ['responsible'] },                                            // Nível 1: Diretriz
    { fields: ['responsible'] },                                            // Nível 2: Objetivo
    { fields: ['indicator', 'annualization', 'baseline', 'responsible'] },   // Nível 3: Meta
    { fields: ['indicator', 'responsible', 'budget'] },                     // Nível 4: Ação (pode ser subunidade da coordenadoria)
  ],
  // PPA — todos os níveis têm indicador + anualização + responsável
  'ppa': [
    { fields: ['indicator', 'annualization', 'responsible'] },  // Nível 1: Objetivo Geral
    { fields: ['indicator', 'annualization', 'responsible'] },  // Nível 2: Objetivo Específico
    { fields: ['indicator', 'annualization', 'responsible'] },  // Nível 3: Entrega
  ],
};

/**
 * Retorna a configuração de campos para um nível hierárquico específico.
 * @param planType - 'pas' ou 'ppa' (default: 'pas')
 * @param levelIndex - índice do nível (0 = raiz, 1 = segundo nível, etc.)
 */
export const getFieldConfig = (planType?: string, levelIndex?: number): LevelFieldConfig => {
  const type = planType || 'pas';
  const config = MODEL_FIELD_CONFIG[type] || MODEL_FIELD_CONFIG['pas'];
  const idx = levelIndex ?? 0;
  return config[idx] || { fields: [] };
};

