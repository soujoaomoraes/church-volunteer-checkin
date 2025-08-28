# Regras de Negócio Principais

Este documento resume as regras de negócio críticas que governam o comportamento do sistema. Para uma lista exaustiva de todas as validações, consulte a seção 6 do [Documento de Requisitos Funcionais (FRD)](./functional-requiriment-document.md).

## Voluntários

- Um voluntário é identificado por um ID único (`UUID`).
- O nome do voluntário é obrigatório e deve ter entre 2 e 100 caracteres.
- Um voluntário só pode ter **um check-in ativo** por vez.

## Materiais

- Um material é identificado por um ID único (`UUID`).
- O nome do material deve ser **único** em todo o sistema.
- O código do material, se fornecido, também deve ser **único**.
- O status de um material segue um fluxo de transição definido e restrito:
  - `disponivel` → `emprestado` ou `manutencao`
  - `emprestado` → `disponivel`, `perdido` ou `manutencao`
  - `manutencao` → `disponivel`
  - `perdido` → `disponivel` ou `manutencao`

## Processo de Check-in

- Um check-in só pode ser realizado por um voluntário que **não** está com um check-in ativo.
- É obrigatório selecionar pelo menos **um material** para realizar o check-in.
- Todos os materiais selecionados para um check-in devem ter o status **'disponivel'**.
- Ao realizar o check-in, o status do voluntário é atualizado e os materiais selecionados são marcados como 'emprestado' e associados a ele.

## Processo de Checkout

- Um checkout só pode ser realizado por um voluntário que **possui** um check-in ativo.
- No momento do checkout, o status de **todos os materiais** que foram emprestados no check-in deve ser informado (ex: 'devolvido', 'danificado', 'nao_devolvido').
- Ao realizar o checkout, o status do voluntário é limpo, e os materiais têm seus status atualizados conforme a devolução.
- O tempo de serviço do voluntário é calculado e armazenado.
