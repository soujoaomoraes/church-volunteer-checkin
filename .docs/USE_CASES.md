# Principais Casos de Uso

Este documento descreve os cenários de uso mais comuns para a persona principal do sistema: o **Coordenador de Voluntários**. Para uma descrição detalhada das personas e dos fluxos de usuário, consulte as seções 3 e 7 do [Documento de Requisitos do Produto (PRD)](./product-requiriment-document.md).

--- 

### Persona: Coordenador de Voluntários

**Objetivo:** Gerenciar a entrada e saída de voluntários e o empréstimo de materiais de forma rápida e eficiente antes, durante e depois dos eventos da igreja.

--- 

### Caso de Uso 1: Registrar e Fazer Check-in de um Voluntário

**Contexto:** Um voluntário chega para servir em um evento.

1.  O coordenador acessa o sistema e navega para a tela de **"Check-in"**.
2.  Preenche o formulário de registro com os dados do voluntário (Nome, Ministério, etc.).
3.  Seleciona na grade de materiais os itens que o voluntário está pegando (ex: 1 crachá, 1 rádio).
4.  Clica em **"Confirmar Check-in"**.
5.  O sistema, em uma única operação, cria o novo registro do voluntário e simultaneamente processa o seu check-in com os materiais selecionados.
6.  Uma mensagem de sucesso é exibida e o formulário é limpo, pronto para o próximo voluntário.

### Caso de Uso 2: Registrar a Saída de um Voluntário (Checkout)

**Contexto:** Um voluntário termina seu turno e está indo para casa.

1.  O coordenador seleciona a opção **"Fazer Checkout"**.
2.  Busca e seleciona o voluntário na lista de ativos.
3.  O sistema exibe os materiais que foram emprestados para aquele voluntário.
4.  Para cada material, o coordenador marca o status da devolução:
    - **Devolvido:** O material está OK.
    - **Danificado:** O material foi devolvido com avarias.
    - **Não Devolvido:** O voluntário esqueceu ou perdeu o material.
5.  Clica em **"Finalizar Checkout"**.
6.  O sistema registra a saída, calcula o tempo de serviço, e atualiza o status do voluntário e dos materiais.

### Caso de Uso 3: Consultar o Status Geral em Tempo Real

**Contexto:** Durante o evento, um líder pergunta quantos voluntários estão servindo na mídia.

1.  O coordenador acessa o **Dashboard** (tela inicial).
2.  Visualiza os contadores principais: "Voluntários Ativos", "Materiais Emprestados".
3.  Filtra a lista de voluntários ativos pelo ministério "mídia".
4.  Informa rapidamente ao líder a quantidade e os nomes dos voluntários.

### Caso de Uso 4: Gerenciar o Inventário de Materiais

**Contexto:** A equipe comprou novos rádios e precisa adicioná-los ao sistema.

1.  O coordenador vai para a seção **"Gestão de Materiais"**.
2.  Clica em **"Adicionar Novo Material"**.
3.  Preenche as informações (Nome: "Rádio 05", Tipo: "radio", Código: "R005").
4.  Salva o novo material, que agora está disponível para ser emprestado nos próximos check-ins.
