# Arquitetura do Sistema

Este documento fornece uma visão geral da arquitetura do Sistema de Check-in de Voluntários. Para especificações técnicas detalhadas, consulte o [Documento de Requisitos Funcionais (FRD)](./functional-requiriment-document.md).

## Modelo Arquitetural

A aplicação segue um modelo de **Single Page Application (SPA)** com uma arquitetura **Offline-First**. Toda a lógica de negócio e armazenamento de dados reside no cliente (navegador), eliminando a necessidade de um backend de servidor tradicional.

### Componentes Principais

1.  **Camada de Interface (UI Layer):**
    - Responsável por renderizar as telas e capturar as interações do usuário.
    - Será construída com componentes modulares (ex: `CheckinComponent`, `DashboardComponent`).

2.  **Camada de Serviços (Service Layer):**
    - Contém a lógica de negócio principal da aplicação.
    - Orquestra as operações e garante que as regras de negócio sejam seguidas.
    - Ex: `CheckinService`, `VolunteerService`.

3.  **Camada de Dados (Data Layer):**
    - Abstrai o acesso ao banco de dados do navegador (IndexedDB).
    - O `DatabaseManager` centraliza todas as operações de CRUD (Create, Read, Update, Delete) de forma transacional e segura.

4.  **Utilitários (Utils):**
    - Módulos de suporte que fornecem funcionalidades reutilizáveis, como `Logger`, `Validator` e `Helpers`.

## Fluxo de Dados

O fluxo de dados é unidirecional e segue um padrão claro:

`UI Component` → `Service` → `DatabaseManager` → `IndexedDB`

- O **Componente de UI** captura um evento (ex: clique no botão "Confirmar Check-in").
- O **Serviço** correspondente é chamado para processar a lógica de negócio (ex: `CheckinService.process()`).
- O **DatabaseManager** é utilizado pelo serviço para executar as operações de leitura e escrita no banco de dados de forma transacional.

## Estratégia Offline-First

O sistema é projetado para ser totalmente funcional sem uma conexão com a internet.

- **Service Worker:** Armazena em cache todos os assets da aplicação (HTML, CSS, JS) para carregamento instantâneo e offline.
- **IndexedDB:** Armazena todos os dados da aplicação localmente no navegador.

Não há sincronização com um servidor central; a aplicação é autocontida.

---

*Para detalhes sobre a Stack Tecnológica e a Estrutura de Diretórios, consulte a seção 2 do [FRD](./functional-requiriment-document.md).*
