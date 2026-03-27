# Histórias de Usuário - Sistema SIPLAN

Este documento descreve as funcionalidades do sistema SIPLAN a partir da perspectiva do usuário final. Ele incorpora as regras estruturais que diferenciam o planejamento global de 4 anos (PPA e PES) das programações anuais operacionais (PAS).

---

## Sprint 1: Estruturação dos Planos Quadrienais (PPA e PES)
**Objetivo**: Permitir a criação e o preenchimento das bases estratégicas de 4 anos. O PPA é carregado completamente nesta etapa, enquanto o PES é estruturado apenas nas altas instâncias até suas metas.

| User Story | Descrição | Critérios de Aceitação |
| :--- | :--- | :--- |
| **Configuração de Planos Quadrienais (PPA e PES)** | Como Gestor, quero criar a casca dos Planos Estratégicos (PPA ou PES) estipulando seu ciclo de 4 anos, para iniciar o planejamento de longo prazo. | **CA#01:** Criar um plano especificando se é um "PPA" ou um "PES", informando o quadriênio (ex: 2024 a 2027).<br>**CA#02:** O sistema permitirá customizar os nomes da hierarquia (ex: Eixo, Diretriz, Objetivo) dependendo se é PPA ou o modelo da Saúde.<br>**CA#03:** Ao tentar excluir o plano base, o sistema exigirá confirmação de segurança severa, pois isso impactará os 4 anos. |
| **Cadastro da Estrutura Estratégica Base** | Como Técnico, quero registrar as diretrizes, objetivos e programas que conduzem todo o cenário governamental, construindo o organograma do plano. | **CA#01:** O usuário conseguirá criar as "pastas" hierárquicas principais (ex: Eixos e Programas).<br>**CA#02:** O usuário terá clareza sobre qual item pertence a qual pasta matriz.<br>**CA#03:** O usuário deve conseguir atrelar Metas de quatro anos a estes programas. |
| **Consolidação de Metas Quadrienais** | Como Técnico, quero registrar os grandes indicadores e parâmetros que definem se o meu plano vai ter sucesso ao final dos 4 anos. | **CA#01:** Preenchimento obrigatório de Indicador, Linha de Base (ponto inicial) e a Meta Final esperada do quadriênio.<br>**CA#02:** Para o PPA, o usuário já poderá atrelar as Ações imediatas válidas pelos 4 anos logo abaixo destas metas (porque o PPA não possui uma programação anual separada). |

---

## Sprint 2: Programação Anual (PAS) e Detalhamento Operacional
**Objetivo**: Abastecer anualmente o planejamento estadual de Saúde. O sistema congelará o plano de 4 anos (PES) e permitirá que o usuário crie "Ações" e "Orçamentos" exclusivos para o ano corrente através da PAS.

| User Story | Descrição | Critérios de Aceitação |
| :--- | :--- | :--- |
| **Importação e Criação da PAS (Anual)** | Como Gestor da Saúde, quero gerar a minha Programação Anual de Saúde (PAS) baseada no plano quadrienal de saúde (PES), para focar minhas operações dentro deste único ano letivo. | **CA#01:** Ao criar uma PAS (ex: PAS 2025), o usuário deve informar a qual PES ela pertence.<br>**CA#02:** O sistema deve automaticamente "copiar/espelhar" toda a ramificação do PES escolhido até a linha da sua respectiva Meta, impedindo a adulteração dessa base maior.<br>**CA#03:** A interface deve evidenciar ao usuário de que ano específico é aquele instrumento de saúde em que ele está operando. |
| **Cadastro Operacional e Orçamentário de Ações** | Como Gestor responsável naquele ano, quero vincular Ações, Custos e localizações às metas estaduais, provendo o que vamos entregar anualmente para bater as metas de saúde e as métricas do PPA. | **CA#01:** O usuário criará Ações **diretamente nas métricas do PPA** ou **dentro da PAS do ano respectivo**.<br>**CA#02:** Será exigido o cadastramento de Responsável, Região, Fonte Financeira e o valor do Custo (R$) da ação.<br>**CA#03:** O sistema deve ter a autonomia para somar o dinheiro orçado pelas ações da base e exibir um custo condensado consolidado em seus pais hierárquicos (custo por Meta/Programa). |
| **Visão Estrutural Completa (Cascata) e Histórico** | Como Analista de Controle, quero observar a expansão visual de um plano inteiro, para ler todas as ligações de uma estratégia em segundos. | **CA#01:** Para PPA, o mapa revelará a descida do "Eixo" fixado até as métricas e ações daquele PPA.<br>**CA#02:** Para PAS, o mapa mostrará toda a base copiada do "Plano de Saúde Quadrienal" terminando nas novas Ações dinâmicas daquele ano exato.<br>**CA#03:** Para o PES puro, a árvore terminará nas Metas (forma legal de 4 anos). Porém, haverá um botão de "Visão Consolidada" que, quando ativado, puxará e exibirá embaixo das metas todas as Ações praticadas nas diversas PAS daquele quadriênio.<br>**CA#04:** O custo orçamentário agregado será mostrado em evidência no cabeçalho das pastas. |

---

## Sprint 3: Prestação de Contas (Monitoramento)
**Objetivo**: Permitir o monitoramento dinâmico. Pontuando de forma diferente o PPA (monitoramento quadrienal das ações globais) em contraste à PAS (monitoramento da execução operacional anual).

| User Story | Descrição | Critérios de Aceitação |
| :--- | :--- | :--- |
| **Abertura Institucional do Monitoramento** | Como Administrador, quero deflagrar ciclos oficiais de monitoramento (permissão de relatórios) garantindo estrita aderência de datas aos ritos da lei. | **CA#01:** Para O PPA, dispara avaliações globais das entregas de 4 anos e ações (ex Trimestral).<br>**CA#02:** Para a Saúde, o sistema **não monitora o PES diretamente**. Ele obriga o monitoramento sempre sob a PAS respectiva daquele ano (quadrimestral).<br>**CA#03:** O usuário Administrador dita quem entra e quando se fecha a validade daquele ciclo, trancando alterações estruturais de forma subjacente. |
| **Avaliação Operacional de Resultado** | Como Técnico da ponta, eu acesso o sistema a fim de relatar e comprovar que uma meta ou ação do meu setor caminhou (ou estagnou) no dado ciclo. | **CA#01:** O sistema isola exibições e exibe ao técnico logado apenas o que pertence ao espectro e responsabilidade do setor dele.<br>**CA#02:** Um termômetro rápido de progressão em "Dashboard" vai subindo cada vez que o técnico preenche os formulários.<br>**CA#03:** É possível justificar cenários negativos usando campos de relatório discursivo nos itens. |
| **Exportação em PDF** | Como Autoridade Pública ou Fiscalizador, desejo emitir relatórios fixos de todo painel atual do monitoramento para o conselho estadual ou cidadão. | **CA#01:** Função nativa da página imprimindo um PDF claro derivado do mapa hierárquico, substituindo inputs vazios pelas respostas geradas nos relatórios por técnicos. |

---

## Sprint 4: Apresentação Fina e Confianças Visuais
**Objetivo**: Entregar as garantias sensíveis de interface que protegem um operador humano de fadiga laborativa diária durante manipulação extensa de painéis técnicos.

| User Story | Descrição | Critérios de Aceitação |
| :--- | :--- | :--- |
| **Avisos do Sistema (Notificações)** | Como Operador de Cadastro, exijo da máquina uma confirmação evidente sobre se minha longa página de trabalho acabou de ser anexada ao bando de dados correto do governo sem problemas no momento em que apertei para salvar. | **CA#01:** Cada inclusão, exclusão ou salvamento reage ao vivo através de uma notificação rápida e evidente ("Toast Lateral") comunicando em verbo ("Salvo com sucesso").<br>**CA#02:** Impedimento físico à tela ("Lendo... / Carregando...") quando as massas de relatórios da PAS ou do PPA tornarem demorado o processamento de salvar no banco de dados. |
