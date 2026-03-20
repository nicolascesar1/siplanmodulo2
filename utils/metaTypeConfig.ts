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
  { value: 'Unidade', label: 'Unidade', type: 'acumulativa' as const },
  { value: 'Quantidade', label: 'Quantidade', type: 'acumulativa' as const },
  { value: 'Pessoas', label: 'Pessoas', type: 'acumulativa' as const },
  { value: 'Equipes', label: 'Equipes', type: 'acumulativa' as const },
  { value: 'Estabelecimentos', label: 'Estabelecimentos', type: 'acumulativa' as const },
  { value: 'Leitos', label: 'Leitos', type: 'acumulativa' as const },
  { value: 'Procedimentos', label: 'Procedimentos', type: 'acumulativa' as const },
  { value: 'Doses', label: 'Doses', type: 'acumulativa' as const },
  { value: 'R$', label: 'Reais (R$)', type: 'acumulativa' as const },
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
