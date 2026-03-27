import fs from 'fs';
const file = 'c:/Users/nicolas.goncalves/.gemini/antigravity/scratch/siplanmodulo2/siplanmodulo2/services/database.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const SEED_PES: PESInstance = {
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
    { id: 'obj-22', planId: 'plan-pes-2024-2027', parentId: 'dir-09', type: 'Objetivo', content: '22: PROMOVER A IMPLANTAÇÃO DA SAÚDE DIGITAL E TELESSAÚDE NA REDE ESTADUAL DO SUS, POR MEIO da modernização da rede', status: 'Em andamento' },
    { id: 'meta-oe22m1', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE22M1', content: 'Promover a modernização do parque tecnológico para o funcionamento da saúde digital.', indicator: 'Número de estações adquiridas por ano', baseline: '2446', targetValue: '300', measurementUnit: 'Número absoluto', targetYear1: '300', targetYear2: '300', targetYear3: '300', targetYear4: '300', responsible: 'Unidade de Gestão de Tecnologia', status: 'Em andamento' },
    { id: 'meta-oe22m2', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE22M2', content: 'Promover a estruturação da rede lógica para a implantação da internet de alta velocidade.', indicator: 'Número de equipamentos adquiridos por ano', baseline: '308', targetValue: '130', measurementUnit: 'Número absoluto', responsible: 'Unidade de Gestão de Tecnologia', status: 'Em andamento' },
    { id: 'meta-oe22m3', planId: 'plan-pes-2024-2027', parentId: 'obj-22', type: 'Meta', code: 'OE22M3', content: 'Desenvolver sistemas para a implantação da saúde digital e telessaúde no RN.', indicator: 'Número de sistemas', baseline: '9', targetValue: '3', responsible: 'Unidade de Gestão de Tecnologia', status: 'Em andamento' }
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
    { id: 'acao-m1-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m1', type: 'Ação', content: 'Aquisição de 300 estações de trabalho', responsible: 'UGTIC', budget: 'R$ 1.500.000,00', resourceSource: '0.5.00 Recursos', expenseElement: '44.90.52', indicator: 'Número de estações', status: 'Em andamento' },
    { id: 'acao-m1-2', planId: 'plan-pas-2025', parentId: 'meta-oe22m1', type: 'Ação', content: 'Manutenção de equipamentos', responsible: 'UGTIC', budget: 'R$ 400.000,00', resourceSource: '0.5.00 Recursos', expenseElement: '33.90.30', indicator: 'Número de kits', status: 'Em andamento' },
    { id: 'acao-m2-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m2', type: 'Ação', content: 'Aquisição de 130 equipamentos de rede', responsible: 'UGTIC', budget: 'R$ 335.000,00', status: 'Em andamento' },
    { id: 'acao-m3-1', planId: 'plan-pas-2025', parentId: 'meta-oe22m3', type: 'Ação', content: 'Contratar mão de obra', responsible: 'UGTIC', budget: 'R$ 1.203.840,00', status: 'Em andamento' }
  ]
};`;
content = content.replace(/const SEED_PLAN: PESInstance = \{[\s\S]*?\n\};\n\nconst SEED_MONITORING/, replacement + '\n\nconst SEED_MONITORING');
content = content.replace(/const seedData = \[SEED_PLAN, SEED_PPA\];/, 'const seedData = [SEED_PES, SEED_PLAN, SEED_PPA];');

fs.writeFileSync(file, content);
console.log('updated db.ts');
