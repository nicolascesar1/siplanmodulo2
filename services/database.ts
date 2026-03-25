
import { PESInstance, MonitoringInstance, PESComponent, MonitoringEntry } from '../types';

// Simula o tempo de resposta de um banco de dados real (300ms)
const DELAY = 300;
const SIMULATE_NETWORK = (data: any) => new Promise(resolve => setTimeout(() => resolve(data), DELAY));

// Keys do LocalStorage (Atuam como "Tabelas" do banco)
const TABLES = {
  PLANS: 'pes_plans',
  MONITORINGS: 'pes_monitorings'
};

// --- DADOS DO PDF (SEED) ---
const SEED_PLAN: PESInstance = {
  id: 'plan-pas-2025',
  name: 'Programação Anual de Saúde (PAS) 2025',
  startYear: 2024,
  endYear: 2027,
  description: 'Planejamento focado na Diretriz 09: Fortalecer a capacidade organizacional para apoiar a melhoria da qualidade no sistema de saúde no RN.',
  modelId: 'm1',
  status: 'Em andamento',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    // DIRETRIZ
    { id: 'dir-09', planId: 'plan-pas-2025', type: 'Diretriz', content: '09: FORTALECER A CAPACIDADE ORGANIZACIONAL PARA APOIAR A MELHORIA DA QUALIDADE NO SISTEMA DE SAÚDE NO RN', status: 'Em andamento' },

    // OBJETIVO
    { id: 'obj-22', planId: 'plan-pas-2025', parentId: 'dir-09', type: 'Objetivo', content: '22: PROMOVER A IMPLANTAÇÃO DA SAÚDE DIGITAL E TELESSAÚDE NA REDE ESTADUAL DO SUS, POR MEIO DA MODERNIZAÇÃO DA REDE E DO FORTALECIMENTO E INTEGRAÇÃO DOS PRINCIPAIS SISTEMAS DE INFORMAÇÃO', status: 'Em andamento' },

    // --- META OE22M1 ---
    {
      id: 'meta-oe22m1', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M1',
      content: 'Promover a modernização do parque tecnológico para o funcionamento da saúde digital.',
      indicator: 'Número de estações adquiridas por ano', baseline: '2446', targetValue: '300', measurementUnit: 'Número absoluto',
      targetYear1: '300', targetYear2: '300', targetYear3: '300', targetYear4: '300',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    // Ações M1
    {
      id: 'acao-m1-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m1', type: 'Ação', content: 'Aquisição de 300 estações de trabalho',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 1.500.000,00', resourceSource: '0.5.00 Recursos não vinculados',
      expenseElement: '44.90.52', indicator: 'Número de estações de trabalho adquiridas', status: 'Em andamento'
    },
    {
      id: 'acao-m1-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m1', type: 'Ação', content: 'Conferir a manutenção de equipamentos por meio da aquisição de ferramentas e insumos',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 400.000,00', resourceSource: '0.5.00 Recursos não vinculados',
      expenseElement: '33.90.30', indicator: 'Número de kits de manutenção adquiridos', status: 'Em andamento'
    },
    {
      id: 'acao-m1-3', planId: 'plan-pas-2025', parentId: 'meta-oe22m1', type: 'Ação', content: 'Contratação de 84 impressoras para o nível central',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 512.553,61', resourceSource: '0.5.00 Recursos não vinculados',
      expenseElement: '33.90.39', indicator: 'Número de impressoras contratadas', status: 'Realizada'
    },

    // --- META OE22M2 ---
    {
      id: 'meta-oe22m2', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M2',
      content: 'Promover a estruturação da rede lógica para a implantação da internet de alta velocidade.',
      indicator: 'Número de equipamentos adquiridos por ano', baseline: '308', targetValue: '130', measurementUnit: 'Número absoluto',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    // Ações M2
    {
      id: 'acao-m2-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Aquisição de 130 equipamentos de rede',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 335.000,00', status: 'Em andamento'
    },
    {
      id: 'acao-m2-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Contratar 10.560 horas de mão de obra técnica especializada para manutenção de rede',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 738.137,67', status: 'Realizada'
    },
    {
      id: 'acao-m2-3', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Realizar 70 visitas para apoio técnico e treinamento de sistemas',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 29.400,00', resourceSource: '0.6.00 Transferências Fundo a Fundo', status: 'Em andamento'
    },
    {
      id: 'acao-m2-4', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Fornecimento de rede fibra ótica em 26 unidades, mediante contratação de serviço',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 128.400,00', status: 'Em andamento'
    },
    {
      id: 'acao-m2-5', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Fornecimento de rede IP multiserviços para redundância de serviço de rede',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 84.000,00', status: 'Realizada'
    },
    {
      id: 'acao-m2-6', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Contratar 4.224 horas de mão de obra técnica especializada para manutenção de rede (Novo)',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 295.680,00', status: 'Em andamento'
    },
    {
      id: 'acao-m2-7', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Contratação de serviço de telefonia móvel',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 214.200,00', status: 'Realizada'
    },
    {
      id: 'acao-m2-8', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Contratação de serviço de telefonia fixa',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 935.126,88', status: 'Realizada'
    },

    // --- META OE22M3 ---
    {
      id: 'meta-oe22m3', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M3',
      content: 'Desenvolver sistemas para a implantação da saúde digital e telessaúde no Rio Grande do Norte.',
      indicator: 'Número de sistemas desenvolvidos por ano', baseline: '9', targetValue: '3',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m3-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m3', type: 'Ação', content: 'Contratar 12.672 de mão de obra horas para desenvolvimento de 3 sistemas de saúde digital',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 1.203.840,00', status: 'Em andamento'
    },

    // --- META OE22M4 ---
    {
      id: 'meta-oe22m4', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M4',
      content: 'Definir um conjunto de instrumentos normativos para garantir a segurança da informação.',
      indicator: 'Número de instrumentos definidos', baseline: '1', targetValue: '1',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m4-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m4', type: 'Ação', content: 'Contratação de profissional analista de segurança da informação para implementação da PSI',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 253.400,00', status: 'Em andamento'
    },
    {
      id: 'acao-m4-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m4', type: 'Ação', content: 'Aquisição de 01 DATA CENTER HCI',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 6.258.910,04', status: 'Em andamento'
    },

    // --- META OE22M5 ---
    {
      id: 'meta-oe22m5', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M5',
      content: 'Implementar o Plano de Saúde Digital na SESAP',
      indicator: 'Número de metas do Plano concluídas', baseline: '0', targetValue: '2',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m5-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m5', type: 'Ação', content: 'Executar 2 ações do plano de saúde digital',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 400.000,00', status: 'Em andamento'
    },

    // --- META OE22M6 (NOVO DO PDF) ---
    {
      id: 'meta-oe22m6', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M6',
      content: 'Implementar e monitorar o Plano Diretor de Tecnologia da Informação e Comunicação.',
      indicator: 'Número de metas do PDTIC concluídas', baseline: '1', targetValue: '20',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m6-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m6', type: 'Ação', content: 'Executar o plano de capacitação em TIC, realizando 12 capacitações para a equipe',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 180.000,00', status: 'Em andamento'
    },

    // --- META OE22M7 ---
    {
      id: 'meta-oe22m7', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M7',
      content: 'Aprimorar a informatização da gestão da SESAP.',
      indicator: 'Número de sistemas gestores em uso', baseline: '17', targetValue: '2',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m7-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m7', type: 'Ação', content: 'Contratar 9.878 horas de mão de obra para desenvolvimento de sistemas gestores',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 930.709,53', status: 'Realizada'
    },
    {
      id: 'acao-m7-4', planId: 'plan-pas-2025', parentId: 'meta-oe22m7', type: 'Ação', content: 'Realizar 05 eventos de lançamento de softwares',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 25.000,00', status: 'Não realizada'
    },

    // --- META OE22M8 (NOVO DO PDF) ---
    {
      id: 'meta-oe22m8', planId: 'plan-pas-2025', parentId: 'obj-22', type: 'Meta', code: 'OE22M8',
      content: 'Apoiar a tomada de decisão gestão por meio do aprimoramento do centro de inteligência estratégica para a gestão do SUS.',
      indicator: 'Número de gestores com acesso ao CIEGES', baseline: '0', targetValue: '50',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento'
    },
    {
      id: 'acao-m8-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m8', type: 'Ação', content: 'Aprimoramento do CIEGES RN, por meio da contratação de profissional analista de dados',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 253.400,00', status: 'Em andamento'
    },
    {
      id: 'acao-m8-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m8', type: 'Ação', content: 'Modernização da Sala de Situação da UGTIC, por meio da aquisição de 05 televisores',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 8.000,00', status: 'Não realizada'
    }
  ]
};

const SEED_MONITORING: MonitoringInstance = {
  id: 'mon-q1-2025',
  planId: 'plan-pas-2025',
  unitName: 'Unidade de Gestão de Tecnologia e Sistemas de Informação',
  title: 'Monitoramento 1º Quadrimestre (Janeiro/Abril)',
  period: '1º Quadrimestre',
  status: 'Em Preenchimento',
  progress: 65,
  submissionStart: '2025-04-01',
  submissionEnd: '2025-04-30',
  createdAt: new Date().toISOString(),
  entries: [
    // OE22M1
    { componentId: 'meta-oe22m1', result: '0', status: 'EM ANDAMENTO', analysis: 'Processo de aquisição de 280 computadores em tramitação.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m1-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Processo de aquisição de 280 computadores em tramitação. SEI nº 00610004.000694/2025-32', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m1-2', result: '0', status: 'EM ANDAMENTO', analysis: 'Processo de aquisição de 150 kits em tramitação. SEI nº 00610004.003755/2024-32', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m1-3', result: '76', status: 'CONCLUÍDA', analysis: 'Foram contratadas 230 impressoras através do processo SEI nº 00610004.000339/2024-82. Sendo 76 no nível central.', updatedAt: new Date().toISOString() },

    // OE22M2
    { componentId: 'meta-oe22m2', result: '0', status: 'EM ANDAMENTO', analysis: 'Aquisição de 50 roteadores e planejamento de aquisição de switches.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Aguardando entrega de 50 roteadores, aquisição através do processo nº 00610004.003333/2024-67', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-2', result: '10.000', status: 'CONCLUÍDA', analysis: 'Contratação de 10.560 horas de serviço técnico através de aditivo ao contrato 170/2020. Processo SEI nº 00610096.002256/2024-46', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-3', result: '12', status: 'EM ANDAMENTO', analysis: 'Realização de 12 visitas no quadrimestre, incluindo 6 visitas ao HDML para treinamento do sistema OPME. Considerando também o Decreto 34.094 que suspendeu a concessão de diárias.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-4', result: '0', status: 'EM ANDAMENTO', analysis: 'Aguardando a entrega dos roteadores adquiridos para concluir a expansão da fibra para as unidades de Caicó.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-5', result: '1', status: 'CONCLUÍDA', analysis: 'Contrato de link dedicado redundante para atender a CORSA com vigência até 19/06/2025. Processo SEI nº 00610004.001207/2024-78', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-6', result: '0', status: 'EM ANDAMENTO', analysis: 'Tramitação para contratação de serviço técnico, incluindo novos técnicos, através do processo sei nº 00610004.000352/2024-31', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-7', result: '1', status: 'CONCLUÍDA', analysis: 'Contrato 112/2024 de serviço de telefonia móvel, através do processo SEI nº 00610928.000005/2024-97, com vigência até 06/2026', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m2-8', result: '1', status: 'CONCLUÍDA', analysis: 'Contrato 21/2025 de serviço de telefonia fixa, através do processo sei nº 00610004.000352/2024-31.', updatedAt: new Date().toISOString() },

    // OE22M3
    { componentId: 'meta-oe22m3', result: '1', status: 'EM ANDAMENTO', analysis: 'Entrega do REGULA NAE Oeste', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m3-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Tramitação para contratação de serviço técnico, incluindo novos programadores, através do processo sei nº 00610004.000352/2024-31', updatedAt: new Date().toISOString() },

    // OE22M4
    { componentId: 'meta-oe22m4', result: '0', status: 'EM ANDAMENTO', analysis: 'Iniciado processo de elaboração da Política de Segurança da Informação (PSI).', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m4-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Tramitação para contratação de serviço técnico, incluindo analista de segurança da informação, através do processo sei nº 00610004.000352/2024-31', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m4-2', result: '0', status: 'EM ANDAMENTO', analysis: 'Aquisição de equipamentos para implantação da datacenter em tramitação através do processeo SEI nº 00610004.000456/2025-27.', updatedAt: new Date().toISOString() },

    // OE22M5
    { componentId: 'meta-oe22m5', result: '0', status: 'EM ANDAMENTO', analysis: 'O núcleo de saúde digital está trabalhando para a execução de 4 ações do plano em 2025', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m5-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Foram iniciadas tratativas para execução de 4 ações previstas no Plano de Saúde Digital.', updatedAt: new Date().toISOString() },

    // OE22M6
    { componentId: 'meta-oe22m6', result: '0', status: 'AÇÕES PREPARATÓRIAS', analysis: 'Considerando a vigência do PDTIC anterior de 2023-2024, está sendo realizada a revisão...', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m6-1', result: '0', status: 'AÇÕES PREPARATÓRIAS', analysis: 'Iniciando tramitação de processo para contratar empresa para realização de 17 cursos na área de TIC', updatedAt: new Date().toISOString() },

    // OE22M7
    { componentId: 'meta-oe22m7', result: '0', status: 'EM ANDAMENTO', analysis: 'Desenvolvimento dos SIPLAN e sistema de acompanhamento de contratos.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m7-1', result: '9.878', status: 'CONCLUÍDA', analysis: 'Contratação de 9.878 horas de serviço técnico através de aditivo ao contrato 170/2020. Processo SEI nº 00610096.002256/2024-46', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m7-4', result: '0', status: 'PARALISADA', analysis: 'Considerando o Decreto 34.094, que suspendeu a contratação de mão de obra, veículos e imóveis, eventos de lançamento de softwares foram adiados.', updatedAt: new Date().toISOString() },

    // OE22M8
    { componentId: 'meta-oe22m8', result: '5', status: 'EM ANDAMENTO', analysis: '5 gestores, entre coordenadores e subcoordenadores, com acesso ao CIEGES no quadrimestre.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m8-1', result: '0', status: 'EM ANDAMENTO', analysis: 'Tramitação para contratação de serviço técnico, incluindo analista de dados, através do processo sei nº 00610004.000352/2024-31', updatedAt: new Date().toISOString() },
    { componentId: 'acao-m8-2', result: '0', status: 'NÃO INICIADA', analysis: 'Ainda não houve início de tramitação de processo para aquisição de televisões.', updatedAt: new Date().toISOString() },
  ]
};

// Helpers de persistência
const getTable = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      // Se estiver vazio, popula com o SEED
      if (key === TABLES.PLANS) return [SEED_PLAN] as unknown as T[];
      if (key === TABLES.MONITORINGS) return [SEED_MONITORING] as unknown as T[];
      return [];
    }
    return JSON.parse(item);
  } catch {
    return [];
  }
};

const setTable = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- DADOS DO PPA (SEED) ---
const SEED_PPA: PESInstance = {
  id: 'plan-ppa-2024-2027',
  name: 'Plano Plurianual (PPA) 2024-2027',
  startYear: 2024,
  endYear: 2027,
  description: 'PPA focado na implantação da saúde digital e telessaúde na rede estadual do SUS.',
  modelId: 'm1',
  status: 'Em andamento',
  planType: 'ppa',
  monitoringFrequency: 'Trimestral',
  customNomenclature: { level1: 'Objetivo Geral', level2: 'Objetivo Específico', level3: 'Entrega' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    // NÍVEL 1: OBJETIVO GERAL
    { 
      id: 'ppa-og-1', planId: 'plan-ppa-2024-2027', type: 'Diretriz', 
      content: 'Promover a implantação da saúde digital e telessaúde na rede estadual do SUS, por meio da modernização da rede e do fortalecimento e integração dos principais sistemas de informação, incluindo o monitoramento de processos e resultados relacionados às prioridades de saúde', 
      indicator: 'Número de sistemas integrados', measurementUnit: 'Número absoluto', targetValue: '20',
      targetYear1: '5', targetYear2: '5', targetYear3: '5', targetYear4: '5',
      status: 'Em andamento' 
    },

    // NÍVEL 2: OBJETIVO ESPECÍFICO 728
    { 
      id: 'ppa-oe-728', planId: 'plan-ppa-2024-2027', parentId: 'ppa-og-1', type: 'Objetivo', code: '728',
      content: 'Promover a modernização do parque tecnológico para o funcionamento da saúde digital e telessaúde, por meio de aquisições e manutenções de estações de trabalho', 
      indicator: 'Número de estações adquiridas', measurementUnit: 'Número absoluto', targetValue: '1200',
      targetYear1: '300', targetYear2: '300', targetYear3: '300', targetYear4: '300',
      status: 'Em andamento' 
    },
    // NÍVEL 3: ENTREGAS DO OE 728
    {
      id: 'ppa-ent-1447', planId: 'plan-ppa-2024-2027', parentId: 'ppa-oe-728', type: 'Meta', code: '1447',
      content: 'Modernização dos serviços de saúde da rede estadual do SUS',
      indicator: 'Número de serviços modernizados', measurementUnit: 'Número absoluto', targetValue: '4',
      targetYear1: '1', targetYear2: '1', targetYear3: '1', targetYear4: '1',
      status: 'Não iniciado'
    },

    // NÍVEL 2: OBJETIVO ESPECÍFICO 729
    { 
      id: 'ppa-oe-729', planId: 'plan-ppa-2024-2027', parentId: 'ppa-og-1', type: 'Objetivo', code: '729',
      content: 'Promover a estruturação da rede lógica para a implantação da internet de alta velocidade, por meio de aquisições e manutenções de equipamentos de TIC', 
      indicator: 'Número de equipamentos adquiridos', measurementUnit: 'Número absoluto', targetValue: '520',
      targetYear1: '130', targetYear2: '130', targetYear3: '130', targetYear4: '130',
      status: 'Em andamento' 
    },
    // NÍVEL 3: ENTREGAS DO OE 729
    {
      id: 'ppa-ent-1448', planId: 'plan-ppa-2024-2027', parentId: 'ppa-oe-729', type: 'Meta', code: '1448',
      content: 'Unidades estruturadas com rede lógica e internet de alta velocidade',
      indicator: 'Número de unidades com internet de alta velocidade', measurementUnit: 'Número absoluto', targetValue: '8',
      targetYear1: '2', targetYear2: '2', targetYear3: '2', targetYear4: '2',
      status: 'Em andamento'
    },

    // NÍVEL 2: OBJETIVO ESPECÍFICO 730
    { 
      id: 'ppa-oe-730', planId: 'plan-ppa-2024-2027', parentId: 'ppa-og-1', type: 'Objetivo', code: '730',
      content: 'Desenvolver sistemas que garantam a celeridade e transparência nos processos e projetos de bens e serviços da saúde, incluindo o desenvolvimento de sistemas para a implantação da saúde digital e telessaúde', 
      indicator: 'Sistemas desenvolvidos', measurementUnit: 'Número absoluto', targetValue: '12',
      targetYear1: '3', targetYear2: '3', targetYear3: '3', targetYear4: '3',
      status: 'Em andamento' 
    },
    // NÍVEL 3: ENTREGAS DO OE 730
    {
      id: 'ppa-ent-1449', planId: 'plan-ppa-2024-2027', parentId: 'ppa-oe-730', type: 'Meta', code: '1449',
      content: 'Implementação do Datacenter',
      indicator: 'Número de sistemas implementados no Datacenter', measurementUnit: 'Número absoluto', targetValue: '4',
      targetYear1: '1', targetYear2: '1', targetYear3: '1', targetYear4: '1',
      status: 'Não iniciado'
    },

    // NÍVEL 2: OBJETIVO ESPECÍFICO 731
    { 
      id: 'ppa-oe-731', planId: 'plan-ppa-2024-2027', parentId: 'ppa-og-1', type: 'Objetivo', code: '731',
      content: 'Implementar o Plano de Segurança da Informação (PSI) para garantir a segurança das informações e dados', 
      indicator: '% de implantação das metas do plano (PSI)', measurementUnit: 'Percentual', targetValue: '100',
      targetYear1: '25', targetYear2: '25', targetYear3: '25', targetYear4: '25',
      status: 'Não iniciado' 
    },
    // NÍVEL 3: ENTREGAS DO OE 731
    {
      id: 'ppa-ent-1450', planId: 'plan-ppa-2024-2027', parentId: 'ppa-oe-731', type: 'Meta', code: '1450',
      content: 'Dados e informações de usuários da rede estadual do SUS armazenados de forma segura',
      indicator: 'Número de unidade com dados e informações armazenados de forma segura', measurementUnit: 'Número absoluto', targetValue: '4',
      targetYear1: '1', targetYear2: '1', targetYear3: '1', targetYear4: '1',
      status: 'Não iniciado'
    }
  ]
};

// --- API MOCKS ---
export const db = {
  plans: {
    getAll: async (): Promise<PESInstance[]> => {
      const storedPlans = localStorage.getItem(TABLES.PLANS);
      if (!storedPlans) {
        const seedData = [SEED_PLAN, SEED_PPA];
        localStorage.setItem(TABLES.PLANS, JSON.stringify(seedData));
        return SIMULATE_NETWORK(seedData) as Promise<PESInstance[]>;
      } else {
        const data = JSON.parse(storedPlans) as PESInstance[];
        // Auto-injetar o PPA se o usuário já tiver o PAS cacheado sem ele,
        // OU forçar a atualização se ele tiver a versão antiga com o 'ppa-oe-829'
        const existingPpaIndex = data.findIndex(p => p.id === SEED_PPA.id);
        
        if (existingPpaIndex === -1) {
          data.push(SEED_PPA);
          localStorage.setItem(TABLES.PLANS, JSON.stringify(data));
        } else if (data[existingPpaIndex].components.some(c => c.id === 'ppa-oe-829')) {
          // Substitui a versão "quebrada" pela versão atual do SEED_PPA
          data[existingPpaIndex] = SEED_PPA;
          localStorage.setItem(TABLES.PLANS, JSON.stringify(data));
        }

        return SIMULATE_NETWORK(data) as Promise<PESInstance[]>;
      }
    },
    create: async (item: PESInstance): Promise<PESInstance> => {
      const items = getTable<PESInstance>(TABLES.PLANS);
      const newItems = [...items, item];
      setTable(TABLES.PLANS, newItems);
      return SIMULATE_NETWORK(item) as Promise<PESInstance>;
    },
    update: async (item: PESInstance): Promise<PESInstance> => {
      const items = getTable<PESInstance>(TABLES.PLANS);
      const newItems = items.map(i => i.id === item.id ? item : i);
      setTable(TABLES.PLANS, newItems);
      return SIMULATE_NETWORK(item) as Promise<PESInstance>;
    },
    delete: async (id: string): Promise<void> => {
      const items = getTable<PESInstance>(TABLES.PLANS);
      const newItems = items.filter(i => i.id !== id);
      setTable(TABLES.PLANS, newItems);
      return SIMULATE_NETWORK(null) as Promise<void>;
    }
  },

  monitorings: {
    getAll: async (): Promise<MonitoringInstance[]> => {
      const storedMonitorings = localStorage.getItem(TABLES.MONITORINGS);
      if (!storedMonitorings) {
        const seedData = [SEED_MONITORING];
        localStorage.setItem(TABLES.MONITORINGS, JSON.stringify(seedData));
        return SIMULATE_NETWORK(seedData) as Promise<MonitoringInstance[]>;
      } else {
        const data = JSON.parse(storedMonitorings) as MonitoringInstance[];
        const existingIdx = data.findIndex(m => m.id === SEED_MONITORING.id);
        if (existingIdx === -1) {
          data.push(SEED_MONITORING);
          localStorage.setItem(TABLES.MONITORINGS, JSON.stringify(data));
        } else if (data[existingIdx].period === 'Q1 2025') {
          // Fix the period string if the user has the old cache
          data[existingIdx] = SEED_MONITORING;
          localStorage.setItem(TABLES.MONITORINGS, JSON.stringify(data));
        }
        return SIMULATE_NETWORK(data) as Promise<MonitoringInstance[]>;
      }
    },
    create: async (item: MonitoringInstance): Promise<MonitoringInstance> => {
      const items = getTable<MonitoringInstance>(TABLES.MONITORINGS);
      const newItems = [item, ...items]; // Newer first
      setTable(TABLES.MONITORINGS, newItems);
      return SIMULATE_NETWORK(item) as Promise<MonitoringInstance>;
    },
    update: async (item: MonitoringInstance): Promise<MonitoringInstance> => {
      const items = getTable<MonitoringInstance>(TABLES.MONITORINGS);
      const newItems = items.map(i => i.id === item.id ? item : i);
      setTable(TABLES.MONITORINGS, newItems);
      return SIMULATE_NETWORK(item) as Promise<MonitoringInstance>;
    },
    delete: async (id: string): Promise<void> => {
      const items = getTable<MonitoringInstance>(TABLES.MONITORINGS);
      const newItems = items.filter(i => i.id !== id);
      setTable(TABLES.MONITORINGS, newItems);
      return SIMULATE_NETWORK(null) as Promise<void>;
    }
  }
};
