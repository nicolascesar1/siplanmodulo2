# Backlog do Sistema SIPLAN (v3.0 - Orientado a Protótipo)

Este documento consolidado serve como a especificação técnica dos requisitos do SIPLAN, focando na validação visual e lógica do protótipo funcional para posterior implementação definitiva pelos desenvolvedores.

---

## 🏛️ Épico 1: Gestão de Instrumentos Estratégicos (PES & PPA)
**Status**: ✅ Protótipo OK
**Descrição**: Abrange a criação da base de diretrizes, objetivos e metas para os ciclos de 4 anos.

| User Story | Descrição | Critérios de Aceitação (Expanded) |
| :--- | :--- | :--- |
| **Configuração de Estrutura Multi-Anual** | Como Gestor, quero criar a casca dos Planos Estratégicos (PPA ou PES) para iniciar o planejamento de longo prazo. | **CA#01:** Criar um plano especificando o tipo (PPA ou PES) e o quadriênio de vigência (ex: 2024-2027).<br>**CA#02:** Customizar a nomenclatura da hierarquia conforme o modelo de plano (Ex: Eixo no PPA, Diretriz no PES).<br>**CA#03:** Definir a frequência de monitoramento (Quadrimestral ou Trimestral) no ato da criação.<br>**CA#04:** Visualizar a árvore hierárquica completa em modo "Cascata" para conferência visual imediata.<br>**CA#05:** Impedir a exclusão direta de planos com dependências ativas sem confirmação reforçada.<br>**CA#06:** Diferenciar visualmente itens editáveis de itens "folders" (agrupadores) no controle de componentes. |

---

## ⚙️ Épico 2: Ciclo Operacional e Programação Financeira (PAS)
**Status**: ✅ Protótipo OK
**Descrição**: Foca na operacionalização anual da Saúde, onde a estratégia do PES é detalhada em ações e recursos.

| User Story | Descrição | Critérios de Aceitação (Expanded) |
| :--- | :--- | :--- |
| **Programação Anual e Herança Lógica** | Como Gestor da Saúde, quero gerar a PAS baseada no PES, consolidando os recursos financeiros para o ano corrente. | **CA#01:** Vincular obrigatoriamente uma PAS a um PES de referência no momento da criação.<br>**CA#02:** Espelhar automaticamente a estrutura do PES (Diretriz -> Objetivo -> Meta) para a PAS.<br>**CA#03:** Expor o selo **"🔒 Herdado"** em componentes vindos do PES para indicar que são apenas leitura na PAS.<br>**CA#04:** Implementar máscara de moeda padrão BRL (R$ 0,00) para todos os campos de orçamento (Budget).<br>**CA#05:** Exigir preenchimento de campos operacionais em Ações: Responsável, Fonte de Recurso e Elemento de Despesa.<br>**CA#06:** Exibir o selo de referência na listagem principal para identificar qual PAS pertence a qual plano base. |

---

## 📈 Épico 3: Monitoramento, Governança e Transparência
**Status**: 🚧 Protótipo em Ajuste
**Descrição**: Abrange o acompanhamento de metas, preenchimento de relatórios e exportação de resultados.

| User Story | Descrição | Critérios de Aceitação (Expanded) |
| :--- | :--- | :--- |
| **Acompanhamento de Resultados e Ciclos** | Como Administrador ou Técnico, quero monitorar o progresso das ações para garantir a transparência da gestão. | **CA#01:** Gerar períodos de monitoramento automáticos baseados na frequência do plano (Q1, Q2, Q3 ou T1 a T4).<br>**CA#02:** Filtrar a lista de monitoramento porUnidade de Gestão ou por Instrumento específico.<br>**CA#03:** Atalho **"Monitorar Agora"** no detalhe do plano que redireciona o usuário já com os filtros aplicados.<br>**CA#04:** Dashboard visual (Termômetro) que quantifica o preenchimento total vs. pendente por ciclo.<br>**CA#05:** Permitir a inclusão de justificativas detalhadas para metas que não atingiram 100% no período.<br>**CA#06:** Estruturar a funcionalidade de exportação "Print/PDF" formatada para apresentação em conselhos. |

---

## 🔧 Épico 4: Administração do Sistema e Higiene de Dados
**Status**: ✅ Protótipo OK
**Descrição**: Refere-se à manutenção da interface administrativa, breadcrumbs e integridade entre frontend e mock-database.

| User Story | Descrição | Critérios de Aceitação (Expanded) |
| :--- | :--- | :--- |
| **Experiência Administrativa Premium** | Como Administrador, quero um controle centralizado e limpo do sistema para minimizar erro humano. | **CA#01:** Painel administrativo em grid horizontal com ícones padronizados para cada módulo de gestão.<br>**CA#02:** Navegação via Breadcrumbs dinâmicos que exibem o nome do plano atual com estilo *glassmorphism*.<br>**CA#03:** Feedback imediato via Toasts para operações de sucesso (Criação, Edição, Deleção).<br>**CA#04:** Padronização rigorosa dos códigos de metas no banco de dados SEED (ex: OE 22.M1).<br>**CA#05:** Remoção de componentes legados e redundantes da interface para evitar poluição visual.<br>**CA#06:** Loading states em operações de salvamento simulado no localStorage para feedback de processamento. |
