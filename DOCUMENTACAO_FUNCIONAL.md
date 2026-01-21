# Documentação Funcional - SIPLAN (Módulo 2)

## 1. Visão Geral

O **SIPLAN (Sistema de Planejamento em Saúde)** é uma aplicação web desenvolvida para facilitar a gestão, monitoramento e execução do Planejamento Estratégico em Saúde (PES). O sistema permite que gestores e técnicos da secretária de saúde organizem suas estratégias de forma hierárquica e acompanhem o progresso das ações ao longo do tempo.

## 2. Objetivo

Promover transparência e eficiência no acompanhamento dos planos de saúde estaduais, garantindo que as diretrizes estratégicas sejam desdobradas em ações práticas e mensuráveis, com monitoramento periódico de resultados.

## 3. Principais Funcionalidades

### 3.1 Gestão de Planos de Saúde (PES)

O sistema permite o gerenciamento completo dos Planos Estaduais de Saúde.

- **Criação de Planos**: Administradores podem criar novos planos definindo nome, vigência (ano inicial e final) e descrição.
- **Visualização**: Listagem de todos os planos cadastrados com seus respectivos status (Realizada, Em andamento, Não realizada).
- **Edição e Exclusão**: Possibilidade de alterar dados básicos ou remover planos obsoletos.

### 3.2 Estruturação Hierárquica do Plano

O plano é organizado em uma estrutura lógica de "cascata", permitindo um detalhamento progressivo:

1. **Diretrizes**: Orientações estratégicas de alto nível.
2. **Objetivos**: Metas qualitativas vinculadas a uma diretriz.
3. **Metas**: Indicadores quantitativos com prazos e valores de referência (Linha de Base e Meta Final), incluindo a anualização (metas para cada ano).
4. **Ações**: Atividades operacionais necessárias para atingir as metas, incluindo:
    - Responsável (Setor/Pessoa).
    - Fonte de Recurso.
    - Orçamento Estimado.

### 3.3 Monitoramento e Avaliação

Funcionalidade crítica para o acompanhamento da execução do plano.

- **Ciclos de Monitoramento**: Criação de ciclos de avaliação (ex: 1º Quadrimestre de 2025) para coleta de dados.
- **Preenchimento de Resultados**: Técnicos e Gestores reportam o status das ações e metas sob sua responsabilidade.
  - Registro de resultados alcançados.
  - Classificação do status (Em Andamento, Concluído, etc.).
  - Análise crítica qualitativa sobre o desempenho.
- **Painéis de Progresso**: Visualização do percentual de conclusão dos monitoramentos.

### 3.4 Controle de Acesso e Perfis

O sistema implementa diferentes níveis de permissão para garantir a segurança e integridade dos dados:

- **Administrador (Admin)**: Acesso total. Pode criar planos, abrir ciclos de monitoramento, gerenciar usuários e excluir registros.
- **Gestor**: Acesso focado na gestão. Pode visualizar planos e monitorar as ações de sua unidade.
- **Técnico**: Perfil operacional. Visualiza os planos e preenche os dados de monitoramento das ações pelas quais é responsável.

## 4. Glossário de Termos

- **PES**: Plano Estadual de Saúde.
- **Linha de Base**: Valor inicial de um indicador antes do início das ações.
- **Monitoramento**: Processo contínuo de coleta e análise de informações sobre a execução do plano.

## 5. Informações Técnicas (Resumo)

- **Plataforma**: Web (Acessível via navegador).
- **Tecnologia**: Desenvolvido em React (Frontend moderno e responsivo).
