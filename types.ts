

export type PESStatus = 'Realizada' | 'Em andamento' | 'Não realizada';

export interface PESModel {
  id: string;
  name: string;
  description: string;
  structure: string[]; // e.g., ['Diretrizes', 'Objetivos', 'Metas']
}

export type ComponentType = 'Diretriz' | 'Objetivo' | 'Meta' | 'Ação';

export interface PESComponent {
  id: string;
  planId: string;
  parentId?: string | null; // Null se for Diretriz (raiz), ID da Diretriz se for Objetivo, etc.
  type: ComponentType;

  // Campos Comuns
  code?: string; // Código hierárquico (ex: 1.1.1)
  content: string; // Descrição principal
  description?: string; // Detalhes adicionais
  status: PESStatus;

  // Campos Compartilhados (Meta e Ação)
  indicator?: string; // Indicador (Meta ou Ação)
  measurementUnit?: string; // Unidade de Medida (Meta ou Ação)
  calculationMethod?: string; // Método de Cálculo (Meta ou Ação)

  // Campos Específicos de META
  baseline?: string; // Linha de base (Valor atual)
  targetValue?: string; // Meta final (Valor alvo acumulado ou final)
  deadline?: string; // Prazo / Vigência

  // Anualização (Novo)
  targetYear1?: string; // 2024
  targetYear2?: string; // 2025
  targetYear3?: string; // 2026
  targetYear4?: string; // 2027

  // Campos Específicos de AÇÃO
  responsible?: string; // Responsável pela execução (Setor/Pessoa)
  resourceSource?: string; // Fonte de Recurso
  budget?: string; // Valor Proposto / Orçamento estimado
  subFunction?: string; // Subfunção
  subAction?: string; // Subação (ex: 124201...)
  expenseElement?: string; // Elemento de Despesa (ex: 44.90.52...)
  technicalObservations?: string; // Observações Técnicas
}

export interface PESInstance {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  modelId: string;
  status: PESStatus;
  components: PESComponent[]; // Array contendo todos os itens da hierarquia
  createdAt: string;
  updatedAt: string;
}

export interface PESFormValues {
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  modelId: string;
  status: PESStatus;
}

// Estrutura para os dados preenchidos no monitoramento (inspirado na planilha)
export interface MonitoringEntry {
  componentId: string; // ID da Meta ou Ação
  result: string; // "RESULTADO ALCANÇADO DA AÇÃO/META" (Numérico ou texto curto)
  status: string; // "STATUS (AE/ME)" (Ex: EM ANDAMENTO, CONCLUÍDA)
  analysis: string; // "ANÁLISE CRÍTICA DO RESULTADO"
  updatedAt: string;
}

// Definição de Papéis
export type UserRole = 'admin' | 'gestor' | 'tecnico';

export interface MonitoringInstance {
  id: string;
  planId: string;
  unitName: string; // Coordenação/Unidade Responsável
  title: string;
  period: string; // ex: Q1 2025
  status: 'Não Preenchido' | 'Em Preenchimento' | 'Submetido' | 'Finalizado';
  progress: number;
  entries?: MonitoringEntry[]; // Array com os dados preenchidos
  submissionStart?: string; // Data de início do prazo de envio
  submissionEnd?: string; // Data limite para envio pelo técnico/gestor
  createdAt: string;
}

export type ReportType = 'RDQA' | 'RAG';

export interface ReportInstance {
  id: string;
  type: ReportType;
  year: number;
  period: string;
  unitName: string;
  status: 'Não Iniciado' | 'Em Andamento' | 'Concluído';
  content: string;
  lastUpdated: string;
}