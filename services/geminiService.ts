
/**
 * Serviço de IA desativado.
 * As funções são stubs para manter compatibilidade de tipos, mas não executam lógica.
 */

export const generatePESDescription = async (name: string, startYear: number, endYear: number): Promise<string> => {
  return "";
};

export const generateComponentSuggestions = async (
  type: 'Diretriz' | 'Objetivo' | 'Ação',
  contextDescription: string,
  parentContent?: string
): Promise<string[]> => {
  return [];
};
