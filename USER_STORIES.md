# Planejamento de Sprints e Histórias de Usuário

Este documento descreve o planejamento de desenvolvimento do sistema SIPLAN, dividido em Sprints. A equipe é composta por **1 Desenvolvedor Sênior (Dev)** e **1 Estagiário**.

As histórias refletem as funcionalidades já implementadas e a estrutura atual do projeto.

---

## Sprint 1: Fundação e Gestão Básica de Planos
**Objetivo**: Estabelecer a arquitetura base do projeto e permitir o gerenciamento macro dos Planos de Saúde (PES).

### [US01] Gerenciar Planos de Saúde (PES)
- **Responsável**: Dev (Lógica de Estado/CRUD)
- **Estimativa**: 5 Pontos
- **Como** Gestor, **quero** criar, editar e excluir Planos de Saúde (PES), **para** definir os ciclos de planejamento estratégico do estado.

**Critérios de Aceitação**:
1. O sistema deve permitir criar um novo PES informando: Nome, Ano Início, Ano Fim, Descrição e Modelo.
2. Deve validar se o Ano Fim é maior ou igual ao Ano Início.
3. Deve listar todos os planos cadastrados na tela inicial ("Meus Planos").
4. Deve permitir a exclusão de um plano, solicitando confirmação do usuário.
5. Deve permitir editar os dados básicos de um plano existente.
6. Os dados devem ser persistidos localmente (simulação de banco de dados/localStorage).
7. Ao clicar em um plano, deve redirecionar para a visão detalhada do mesmo.

### [US02] Estrutura Inicial do Layout e Navegação
- **Responsável**: Estagiário (UI/UX)
- **Estimativa**: 3 Pontos
- **Como** Usuário, **quero** navegar facilmente entre as telas do sistema, **para** acessar as funcionalidades de forma intuitiva.

**Critérios de Aceitação**:
1. O sistema deve ter uma barra lateral (Sidebar) com links para "Planos", "Monitoramento" e "Admin".
2. A Sidebar deve destacar a página ativa atual.
3. Deve haver um Header exibindo o título da página atual e o usuário logado.
4. O layout deve ser responsivo (adaptável a diferentes tamanhos de tela).
5. Deve utilizar a paleta de cores padrão do sistema (Roxo/Azul) para manter a identidade visual.

### [US03] Cadastro de Diretrizes e Objetivos
- **Responsável**: Estagiário (Formulários Básicos)
- **Estimativa**: 5 Pontos
- **Como** Técnico, **quero** adicionar Diretrizes e Objetivos a um plano, **para** iniciar a estruturação hierárquica.

**Critérios de Aceitação**:
1. Dentro de um Plano, deve haver botões para adicionar "Nova Diretriz".
2. Dentro de uma Diretriz, deve haver opção para adicionar "Novo Objetivo".
3. O formulário deve conter campos para Conteúdo e Descrição.
4. Deve ser impossível criar um Objetivo sem uma Diretriz pai vinculada.
5. A interface deve mostrar visualmente quem é "pai" de quem (indentação básica).

---

## Sprint 2: Detalhamento Hierárquico e Componentes Complexos
**Objetivo**: Completar a árvore hierárquica (Metas/Ações) e implementar visualizações avançadas.

### [US04] Gestão de Metas e Indicadores
- **Responsável**: Dev (Regras de Negócio)
- **Estimativa**: 8 Pontos
- **Como** Técnico, **quero** definir Metas com indicadores e prazos, **para** que possam ser mensuradas futuramente.

**Critérios de Aceitação**:
1. Permitir adicionar Metas vinculadas a um Objetivo.
2. O formulário de Meta deve exigir: Indicador, Linha de Base e Meta Final.
3. Deve permitir definir a anualização da meta (valores previstos para cada ano do plano).
4. Deve calcular automaticamente se a soma das anualizações corresponde à meta final (se aplicável).
5. Deve validar tipos de dados numéricos nos campos de valor.

### [US05] Gestão de Ações e Orçamento
- **Responsável**: Estagiário (Formulários Extensos)
- **Estimativa**: 5 Pontos
- **Como** Gestor, **quero** detalhar as Ações necessárias para atingir as metas, incluindo orçamento e responsáveis, **para** operacionalizar o plano.

**Critérios de Aceitação**:
1. Permitir adicionar Ações vinculadas a uma Meta.
2. O formulário de Ação deve conter: Responsável, Fonte de Recurso, Orçamento e Observações.
3. Deve formatar os campos de orçamento como moeda (R$).
4. Deve permitir a edição de todos os campos de uma Ação existente.
5. Deve exibir o responsável de forma destacada no card da ação.

### [US06] Visualização em Cascata (Cascade View)
- **Responsável**: Dev (Componente Complexo)
- **Estimativa**: 8 Pontos
- **Como** Usuário, **quero** visualizar todo o plano de forma hierárquica e expansível, **para** entender a relação entre diretrizes, objetivos, metas e ações.

**Critérios de Aceitação**:
1. Deve renderizar a árvore completa: Diretriz > Objetivo > Meta > Ação.
2. Cada nível deve ser colapsável (expandir/recolher).
3. Deve utilizar cores distintas para as bordas de cada nível hierárquico (ex: Roxo para Diretriz, Azul para Objetivo).
4. Deve exibir setas indicativas de expansão que mudam de cor se houver filhos.
5. Deve manter o estado de expansão (quais itens estão abertos) ao navegar.

---

## Sprint 3: Monitoramento e Controle
**Objetivo**: Implementar o ciclo de monitoramento periódico e gestão de acessos.

### [US07] Ciclos de Monitoramento
- **Responsável**: Dev (Lógica de Monitoramento)
- **Estimativa**: 8 Pontos
- **Como** Admin, **quero** abrir ciclos de monitoramento para períodos específicos, **para** que as áreas informem o progresso.

**Critérios de Aceitação**:
1. Permitir criar um Monitoramento para um Plano específico e um período (ex: Q1 2025).
2. Deve gerar instâncias de preenchimento para cada Unidade Responsável.
3. Deve calcular o progresso geral do monitoramento (% de itens preenchidos).
4. Deve bloquear alterações no Plano Estrutural enquanto um monitoramento estiver ativo (opcional/desejável).
5. Deve permitir encerrar/finalizar um ciclo de monitoramento.

### [US08] Preenchimento de Monitoramento
- **Responsável**: Estagiário (Interface de Preenchimento)
- **Estimativa**: 5 Pontos
- **Como** Técnico, **quero** informar o resultado alcançado e o status das minhas ações/metas, **para** alimentar os relatórios de gestão.

**Critérios de Aceitação**:
1. Na tela de Monitoramento, listar apenas os itens sob responsabilidade da unidade do usuário (mockado).
2. Para cada item, permitir informar: "Resultado Alcançado", "Status" (Em Andamento/Concluído) e "Análise Crítica".
3. Deve salvar o rascunho das informações.
4. Deve permitir "Enviar/Submeter" o monitoramento quando concluído.
5. Deve mostrar visualmente quais itens já foram preenchidos e quais estão pendentes.

### [US09] Controle de Papéis (Admin/Gestor/Técnico)
- **Responsável**: Dev (Segurança/Contexto)
- **Estimativa**: 5 Pontos
- **Como** Sistema, **quero** restringir o acesso a certas funcionalidades com base no perfil do usuário, **para** garantir a integridade dos dados.

**Critérios de Aceitação**:
1. O sistema deve suportar 3 papéis: Admin, Gestor, Técnico.
2. **Admin**: Acesso total (criar planos, abrir monitoramentos, deletar registros).
3. **Técnico**: Apenas visualiza planos e preenche monitoramentos de sua unidade.
4. A interface deve ocultar botões de "Excluir" ou "Criar" para usuários sem permissão.
5. Deve haver um seletor global para simular a troca de papéis (para fins de demonstração/protótipo).
