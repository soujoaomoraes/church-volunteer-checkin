# PRD - Sistema de Check-in/Check-out de Voluntários da Igreja

## 1. Objetivo do Sistema

Criar um sistema web simples e eficiente para gerenciar o check-in e check-out de voluntários durante os cultos e eventos da igreja, permitindo o controle de presença e empréstimo de equipamentos (crachás, rádios, etc.) de forma digitalizada e automatizada.

### Objetivos Específicos:
- Substituir processos manuais de controle de voluntários
- Facilitar o rastreamento de equipamentos emprestados
- Gerar histórico automático de participação dos voluntários
- Reduzir tempo gasto em processos administrativos durante os cultos
- Permitir acesso fácil aos dados pelos líderes da equipe

## 2. Escopo do Projeto

### 2.1 Dentro do Escopo (O que será desenvolvido):

**Funcionalidades Principais:**
- Sistema de check-in para voluntários com captura de:
  - Nome do voluntário
  - Sessão/culto que irá participar
  - Número de telefone
  - Lista de itens retirados (crachá, rádio, etc.)
  - Data e hora automática do registro
- Sistema de check-out para voluntários com:
  - Identificação do voluntário
  - Lista de itens devolvidos
  - Data e hora automática do registro
- Interface web responsiva (PWA)
- Integração com Google Sheets como banco de dados
- Funcionalidade offline básica (cache de interface)

**Características Técnicas:**
- Progressive Web App (PWA) instalável
- Hospedagem gratuita no GitHub Pages
- Interface mobile-first
- Zero custo de operação
- Manutenção mínima

### 2.2 Fora do Escopo (O que NÃO será desenvolvido):

- Sistema de autenticação complexo (login/senha)
- Relatórios avançados ou dashboards
- Notificações push
- Integração com outros sistemas da igreja
- Funcionalidades offline completas (sincronização complexa)
- Sistema de permissões granulares
- Backup automático (além do Google Sheets)
- Impressão de relatórios
- Gestão de usuários administrativos

## 3. Perfis de Usuário

### 3.1 Voluntário
**Características:**
- Membro ativo da igreja que participa de ministérios
- Usa principalmente smartphone durante os cultos
- Precisa de processo rápido e intuitivo
- Pode ter conhecimento técnico limitado

**Necessidades:**
- Fazer check-in rapidamente antes do culto
- Registrar itens retirados facilmente
- Fazer check-out ao final da participação
- Interface simples e clara

**Frequência de Uso:** 2-4 vezes por semana

### 3.2 Líder de Equipe
**Características:**
- Responsável por coordenar voluntários
- Precisa acompanhar presença e uso de equipamentos
- Acessa dados principalmente após os cultos
- Pode usar computador ou smartphone

**Necessidades:**
- Consultar dados de check-in/check-out
- Verificar quais equipamentos estão emprestados
- Acessar histórico de participação dos voluntários
- Identificar equipamentos não devolvidos

**Frequência de Uso:** Diária (consulta de dados)

## 4. Fluxo do Usuário

### 4.1 Fluxo de Check-in (Voluntário)
1. Voluntário acessa o sistema via PWA no smartphone
2. Seleciona a opção "Check-in"
3. Preenche formulário:
   - Digite ou selecione nome
   - Seleciona sessão/culto
   - Informa telefone (autocompletar se já cadastrado)
   - Marca itens que está retirando (checkboxes)
4. Confirma o check-in
5. Sistema registra automaticamente data/hora
6. Exibe confirmação de sucesso

### 4.2 Fluxo de Check-out (Voluntário)
1. Voluntário acessa o sistema via PWA
2. Seleciona a opção "Check-out"
3. Identifica-se (nome ou busca)
4. Sistema mostra itens que foram retirados no check-in
5. Voluntário marca quais itens está devolvendo
6. Confirma o check-out
7. Sistema registra automaticamente data/hora
8. Exibe confirmação de sucesso

### 4.3 Fluxo de Consulta (Líder)
1. Líder acessa Google Sheets diretamente
2. Visualiza planilha com todos os registros
3. Pode filtrar por data, nome, itens não devolvidos
4. Identifica pendências ou padrões de uso

## 5. Especificações Funcionais

### 5.1 Formulário de Check-in
**Campos Obrigatórios:**
- Nome do voluntário (texto ou dropdown)
- Sessão/Culto (dropdown: "1º Culto", "2º Culto", "3º Culto", "Ensaio", "Evento Especial")
- Telefone (formato brasileiro com máscara)

**Campos Opcionais:**
- Itens retirados (checkboxes múltiplos):
  - Crachá de identificação
  - Rádio comunicador
  - Chaves
  - Equipamento de som
  - Material de limpeza
  - Outros (campo livre)

**Campos Automáticos:**
- Data (YYYY-MM-DD)
- Hora (HH:MM:SS)
- Tipo de registro ("check-in")

### 5.2 Formulário de Check-out
**Campos Obrigatórios:**
- Identificação do voluntário (busca por nome)

**Campos Dinâmicos:**
- Lista de itens retirados no check-in (baseado no último check-in sem check-out)
- Checkboxes para marcar itens devolvidos

**Campos Automáticos:**
- Data (YYYY-MM-DD)
- Hora (HH:MM:SS)
- Tipo de registro ("check-out")

### 5.3 Estrutura da Planilha Google Sheets
**Colunas:**
- A: ID (auto-incremento)
- B: Nome
- C: Telefone
- D: Sessão
- E: Tipo (check-in/check-out)
- F: Data
- G: Hora
- H: Itens (lista separada por vírgula)
- I: Observações (campo livre)

## 6. Especificações Técnicas

### 6.1 Tecnologias
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **PWA:** Service Worker, Web App Manifest
- **Backend:** Google Sheets API (via Google Apps Script)
- **Hospedagem:** GitHub Pages
- **Domínio:** github.io gratuito

### 6.2 Requisitos PWA
- Manifest.json configurado
- Service Worker para cache básico
- Ícones para instalação (192x192, 512x512)
- Modo standalone
- Funciona offline (interface, sem dados)

### 6.3 Integração Google Sheets
- Google Apps Script como proxy/API
- Autenticação via API Key (limitada)
- Operações: CREATE (insert), READ (select)
- Rate limit: 100 requests/100 segundos/usuário

### 6.4 Responsividade
- Design mobile-first
- Breakpoints: 320px, 768px, 1024px
- Botões grandes (min 44px) para touch
- Fonte legível (min 16px)

## 7. Requisitos Não-Funcionais

### 7.1 Performance
- Carregamento inicial < 3 segundos
- Operações de check-in/out < 5 segundos
- Tamanho total da aplicação < 500KB

### 7.2 Usabilidade
- Interface intuitiva (máximo 3 cliques para qualquer ação)
- Feedback visual para todas as ações
- Mensagens de erro claras
- Suporte a gestos mobile (swipe, tap)

### 7.3 Compatibilidade
- Navegadores: Chrome, Firefox, Safari, Edge (últimas 2 versões)
- Dispositivos: iOS 12+, Android 7+
- Resolução mínima: 320x568px

### 7.4 Segurança
- Comunicação HTTPS (GitHub Pages nativo)
- Validação básica de dados no frontend
- Sanitização de inputs
- Rate limiting no Google Sheets

### 7.5 Manutenibilidade
- Código documentado
- Estrutura simples e modular
- Deploy automático via GitHub Actions
- Logs básicos de erro

## 8. Cronograma de Desenvolvimento

### Fase 1 - Setup e Infraestrutura (1 semana)
- Configuração do repositório GitHub
- Setup do Google Sheets e Apps Script
- Configuração inicial do PWA

### Fase 2 - Funcionalidades Core (2 semanas)
- Desenvolvimento do formulário de check-in
- Integração com Google Sheets
- Testes básicos

### Fase 3 - Check-out e Refinamentos (1 semana)
- Desenvolvimento do formulário de check-out
- Melhorias na interface
- Testes de usabilidade

### Fase 4 - PWA e Deploy (1 semana)
- Finalização do PWA (Service Worker, Manifest)
- Deploy no GitHub Pages
- Testes finais e documentação

**Total: 5 semanas**

## 9. Critérios de Aceitação

### 9.1 Funcionalidades
- [ ] Voluntário consegue fazer check-in em menos de 30 segundos
- [ ] Voluntário consegue fazer check-out em menos de 20 segundos
- [ ] Dados são salvos corretamente no Google Sheets
- [ ] Sistema funciona offline (interface básica)
- [ ] PWA é instalável em dispositivos móveis

### 9.2 Qualidade
- [ ] Interface responsiva em todos os dispositivos testados
- [ ] Tempo de carregamento dentro do especificado
- [ ] Zero erros JavaScript no console
- [ ] Validação adequada de todos os campos

### 9.3 Operação
- [ ] Sistema hospedado no GitHub Pages
- [ ] Custo zero de operação
- [ ] Documentação básica para líderes

## 10. Melhorias Futuras (Backlog)

### 10.1 Curto Prazo (3-6 meses)
- **Relatórios básicos:** Páginas web simples com estatísticas
- **Busca avançada:** Filtros por data, voluntário, itens
- **Notificações visuais:** Alertas para itens não devolvidos
- **Modo escuro:** Para uso durante cultos com pouca luz
- **Autocomplete:** Nomes de voluntários frequentes

### 10.2 Médio Prazo (6-12 meses)
- **Dashboard para líderes:** Interface web para consulta de dados
- **Backup automático:** Export periódico para outras planilhas
- **Integração com calendário:** Associar check-ins a eventos específicos
- **Sistema de lembretes:** Notificações para itens não devolvidos
- **Multi-igreja:** Suporte a múltiplas congregações

### 10.3 Longo Prazo (1+ anos)
- **App nativo:** Versões iOS/Android dedicadas
- **Sincronização offline:** Funcionalidade completa sem internet
- **Integração com sistemas da igreja:** ERP, cadastro de membros
- **Analytics avançadas:** Relatórios de participação e engajamento
- **Sistema de permissões:** Diferentes níveis de acesso

## 11. Riscos e Mitigações

### 11.1 Riscos Técnicos
**Risco:** Limites da API do Google Sheets
**Mitigação:** Implementar cache local e otimizar requests

**Risco:** GitHub Pages indisponível
**Mitigação:** Documentar processo de deploy alternativo (Netlify, Vercel)

**Risco:** Mudanças na API do Google
**Mitigação:** Monitoramento mensal e versionamento da integração

### 11.2 Riscos de Produto
**Risco:** Baixa adoção pelos voluntários
**Mitigação:** Treinamento simples e interface intuitiva

**Risco:** Perda de dados
**Mitigação:** Backups manuais semanais e histórico do Google Sheets

## 12. Métricas de Sucesso

### 12.1 Adoção
- Meta: 80% dos voluntários usando o sistema em 2 meses
- Métrica: Número de check-ins por semana

### 12.2 Eficiência
- Meta: Reduzir tempo de processo administrativo em 50%
- Métrica: Tempo médio de check-in/check-out

### 12.3 Qualidade dos Dados
- Meta: 95% dos check-ins com check-out correspondente
- Métrica: Relatório de itens não devolvidos

### 12.4 Satisfação do Usuário
- Meta: Feedback positivo de 90% dos usuários
- Métrica: Pesquisa de satisfação mensal

---

**Versão:** 1.0  
**Data:** Agosto 2025  
**Responsável:** Equipe de Tecnologia da Igreja  
**Aprovação:** Liderança de Voluntários