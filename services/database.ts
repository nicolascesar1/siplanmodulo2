
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
const SEED_PES: PESInstance = {
  id: 'plan-pes-2024-2027',
  name: 'Plano Estadual de Saúde (PES) 2024-2027',
  startYear: 2024,
  endYear: 2027,
  description: 'Planejamento base Quadrienal da Saúde focado na Diretriz 09.',
  modelId: 'm1',
  status: 'Em andamento',
  planType: 'pes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    { id: 'dir-09', planId: 'plan-pes-2024-2027', type: 'Diretriz', content: '09: FORTALECER A CAPACIDADE ORGANIZACIONAL PARA APOIAR A MELHORIA DA QUALIDADE NO SISTEMA DE SAÚDE NO RN', status: 'Em andamento' },
    { id: 'obj-22', planId: 'plan-pes-2024-2027', parentId: 'dir-09', type: 'Objetivo', content: '22: PROMOVER A IMPLANTAÇÃO DA SAÚDE DIGITAL E TELESSAÚDE NA REDE ESTADUAL DO SUS, POR MEIO DA MODERNIZAÇÃO DA REDE E DO FORTALECIMENTO E INTEGRAÇÃO DOS PRINCIPAIS SISTEMAS DE INFORMAÇÃO', status: 'Em andamento' },
    { id: 'meta-oe22m1', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE 22.M1', content: 'Promover a modernização do parque tecnológico para o funcionamento da saúde digital.', indicator: 'Número de estações adquiridas por ano', baseline: '2446', targetValue: '300', measurementUnit: 'Número absoluto', targetYear1: '300', targetYear2: '300', targetYear3: '300', targetYear4: '300', responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento' },
    { id: 'meta-oe22m2', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE 22.M2', content: 'Promover a estruturação da rede lógica para a implantação da internet de alta velocidade.', indicator: 'Número de equipamentos adquiridos por ano', baseline: '308', targetValue: '130', measurementUnit: 'Número absoluto', responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento' },
    { id: 'meta-oe22m3', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE 22.M3', content: 'Desenvolver sistemas para a implantação da saúde digital e telessaúde no RN.', indicator: 'Número de sistemas', baseline: '9', targetValue: '3', responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento' },
    { id: 'meta-oe22m4', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE 22.M4', content: 'Definir um conjunto de instrumentos normativos para garantir a segurança da informação.', indicator: 'Número de instrumentos definidos', baseline: '1', targetValue: '1', responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento' },
    { id: 'meta-oe22m8', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE 22.M8', content: 'Fortalecer a governança de dados e a transparência institucional no CIEGES', indicator: 'Número de gestores com acesso ao CIEGES', baseline: '2', targetValue: '5', responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', status: 'Em andamento' },
    
    // Novo Objetivo para abrigar a Meta M5, pois Objetivos não podem misturar áreas donas de Metas
    { id: 'obj-23', planId: 'plan-pes-2024-2027', parentId: 'dir-09', type: 'Objetivo', content: '23: IMPLEMENTAR AÇÕES INTEGRADAS DE PROMOÇÃO À SAÚDE NA REDE ASSISTENCIAL', status: 'Em andamento' },
    { id: 'meta-oe22m5', planId: 'plan-pes-2024-2027', parentId: 'obj-23', type: 'Meta', code: 'OE 23.M5', content: 'Implementar o Plano de Saúde Digital na SESAP', indicator: 'Número de metas concluídas', baseline: '0', targetValue: '2', responsible: 'Coordenadoria de Promoção à Saúde', status: 'Em andamento' },
    
    { id: 'obj-infra', planId: 'plan-pes-2024-2027', parentId: 'dir-09', type: 'Objetivo', content: 'PROMOVER A MODERNIZAÇÃO E MANUTENÇÃO DA INFRAESTRUTURA FÍSICA E TECNOLÓGICA DA REDE ESTADUAL DE SAÚDE', status: 'Em andamento' },
    { id: 'meta-infra-01', planId: 'plan-pes-2024-2027', parentId: 'obj-infra', type: 'Meta', code: 'OE 09.M1', content: 'Promover a melhoria da infraestrutura física e tecnológica das unidades de saúde estaduais.', indicator: 'Número de unidades reformadas', baseline: '10', targetValue: '5', measurementUnit: 'Unidade', responsible: 'Gabinete / SESAP', status: 'Em andamento' }
  ]
};


const SEED_PLAN: PESInstance = {
  id: 'plan-pas-2025',
  name: 'Programação Anual de Saúde (PAS) 2025',
  startYear: 2025,
  endYear: 2025,
  description: 'Ações operacionais para o ano de 2025 referentes ao PES 2024-2027.',
  modelId: 'm1',
  status: 'Em andamento',
  planType: 'pas',
  basePlanId: 'plan-pes-2024-2027',
  referenceYear: 2025,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: [
    // A PAS agora só contém AÇÕES. Diretrizes, Objetivos e Metas vêm do PES Base.
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
    {
      id: 'acao-m2-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Aquisição de 130 equipamentos de rede',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 335.000,00', status: 'Em andamento'
    },
    {
      id: 'acao-m2-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Contratar 10.560 horas de mão de obra técnica especializada para manutenção de rede',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 738.137,67', status: 'Realizada'
    },
    {
      id: 'acao-m3-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m3', type: 'Ação', content: 'Contratar 12.672 de mão de obra horas para desenvolvimento de 3 sistemas de saúde digital',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 1.203.840,00', status: 'Em andamento'
    },
    {
      id: 'acao-m4-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m4', type: 'Ação', content: 'Contratação de profissional analista de segurança da informação para implementação da PSI',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 253.400,00', status: 'Em andamento'
    },
    {
      id: 'acao-m5-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m5', type: 'Ação', content: 'Executar 2 ações do plano de saúde digital',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 400.000,00', status: 'Em andamento'
    },
    {
      id: 'acao-m8-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m8', type: 'Ação', content: 'Modernização da Sala de Situação da UGTIC, por meio da aquisição de 05 televisores',
      responsible: 'Unidade de Gestão de Tecnologia e Sistemas de Informação', budget: 'R$ 8.000,00', status: 'Não realizada'
    },
    {
      id: 'acao-coadi-01', planId: 'plan-pas-2025', parentId: 'meta-infra-01', type: 'Ação', content: 'Reforma e manutenção do Hospital Regional de São Paulo do Potengi',
      responsible: 'COADI (Coordenadoria de Administração e Infraestrutura)', budget: 'R$ 850.000,00', status: 'Em andamento'
    },
    {
      id: 'acao-coadi-02', planId: 'plan-pas-2025', parentId: 'meta-infra-01', type: 'Ação', content: 'Aquisição de transformadores para o Hospital Dr. João Machado',
      responsible: 'COADI (Coordenadoria de Administração e Infraestrutura)', budget: 'R$ 312.000,00', status: 'Concluído'
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

const SEED_MONITORING_COADI: MonitoringInstance = {
  id: 'mon-q1-2025-coadi',
  planId: 'plan-pas-2025',
  unitName: 'COADI (Coordenadoria de Administração e Infraestrutura)',
  title: 'Monitoramento Q1 2025 - COADI',
  period: '1º Quadrimestre',
  status: 'Em Preenchimento',
  progress: 50,
  submissionStart: '2025-04-01',
  submissionEnd: '2025-04-30',
  createdAt: new Date().toISOString(),
  entries: [
    { componentId: 'acao-coadi-01', result: '0', status: 'EM ANDAMENTO', analysis: 'Processo de licitaçâo para reforma em fase de cotação de preços.', updatedAt: new Date().toISOString() },
    { componentId: 'acao-coadi-02', result: '1', status: 'CONCLUÍDA', analysis: 'Transformadores entregues e em fase de instalação.', updatedAt: new Date().toISOString() }
  ]
};

const SEED_MONITORING_GABINETE: MonitoringInstance = {
  id: 'mon-q1-2025-gabinete',
  planId: 'plan-pas-2025',
  unitName: 'Gabinete / SESAP',
  title: 'Monitoramento Q1 2025 - Gabinete',
  period: '1º Quadrimestre',
  status: 'Em Preenchimento',
  progress: 10,
  submissionStart: '2025-04-01',
  submissionEnd: '2025-04-30',
  createdAt: new Date().toISOString(),
  entries: [
    { componentId: 'meta-infra-01', result: '1', status: 'EM ANDAMENTO', analysis: 'Uma unidade (João Machado) com obra concluída. Outras em fase de projeto.', updatedAt: new Date().toISOString() }
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
      let data: PESInstance[] = [];

      if (!storedPlans) {
        data = [SEED_PES, SEED_PLAN, SEED_PPA];
        localStorage.setItem(TABLES.PLANS, JSON.stringify(data));
      } else {
        data = JSON.parse(storedPlans) as PESInstance[];
        
        // MIGRATION / AUTO-INJECTION logic
        let updated = false;

        // 1. Garante que o PES real existe e está com a responsabilidade corrigida
        const pesIndex = data.findIndex(p => p.id === SEED_PES.id);
        if (pesIndex === -1) {
          data.unshift(SEED_PES); // Adiciona no início
          updated = true;
        } else {
            const hasOldResponsible = data[pesIndex].components.some(c => c.responsible === 'Unidade de Gestão de Tecnologia');
            const hasObjInfra = data[pesIndex].components.some(c => c.id === 'obj-infra');
            if (hasOldResponsible || !hasObjInfra) {
                data[pesIndex] = SEED_PES; // Substitui pela versão corrigida e com nova hierarquia
                updated = true;
            }
        }

        // 2. Corrige o PAS legado (que estava com anos de PES e sem basePlanId, ou com componentes duplicados)
        const pasIndex = data.findIndex(p => p.id === 'plan-pas-2025');
        if (pasIndex !== -1) {
          const pas = data[pasIndex];
          const hasRedundant = pas.components.some(c => c.type === 'Diretriz' || c.type === 'Objetivo' || c.type === 'Meta');
          const hasCoadiAction = pas.components.some(c => c.id === 'acao-coadi-01');
          
          // Se o PAS estiver com a vigência errada, duplicados ou faltando as novas ações da COADI
          if ((pas.startYear === 2024 && pas.endYear === 2027) || hasRedundant || !hasCoadiAction) {
             data[pasIndex] = SEED_PLAN; // Substitui pelo SEED_PLAN limpo (que agora tem COADI)
             updated = true;
          }
        }

        // 3. Garante que o PPA existe e está atualizado
        const existingPpaIndex = data.findIndex(p => p.id === SEED_PPA.id);
        if (existingPpaIndex === -1) {
          data.push(SEED_PPA);
          updated = true;
        } else if (data[existingPpaIndex].components.some(c => c.id === 'ppa-oe-829')) {
          data[existingPpaIndex] = SEED_PPA;
          updated = true;
        }

        if (updated) {
          localStorage.setItem(TABLES.PLANS, JSON.stringify(data));
        }
      }

      return SIMULATE_NETWORK(data) as Promise<PESInstance[]>;
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
      
      // Migration / Integration for New Scenario
      let data: MonitoringInstance[] = [];
      if (!storedMonitorings) {
        data = [SEED_MONITORING, SEED_MONITORING_COADI, SEED_MONITORING_GABINETE];
        localStorage.setItem(TABLES.MONITORINGS, JSON.stringify(data));
      } else {
        data = JSON.parse(storedMonitorings) as MonitoringInstance[];
        const hasCoadi = data.some(m => m.unitName.includes('COADI'));
        if (!hasCoadi) {
          data.push(SEED_MONITORING_COADI);
          data.push(SEED_MONITORING_GABINETE);
          localStorage.setItem(TABLES.MONITORINGS, JSON.stringify(data));
        }
      }
      return SIMULATE_NETWORK(data) as Promise<MonitoringInstance[]>;
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
