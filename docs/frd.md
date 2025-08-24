# FRD - Sistema de Check-in/Check-out de Voluntários da Igreja

## 1. Introdução

### 1.1 Propósito do Documento
Este Functional Requirements Document (FRD) detalha as especificações funcionais técnicas para o desenvolvimento do Sistema de Check-in/Check-out de Voluntários da Igreja, baseado no PRD aprovado.

### 1.2 Escopo
O documento especifica todos os requisitos funcionais, regras de negócio, validações, integrações e comportamentos esperados do sistema.

### 1.3 Referências
- PRD - Sistema de Check-in/Check-out de Voluntários v1.0
- Google Sheets API Documentation
- PWA Standards (W3C)

## 2. Visão Geral do Sistema

### 2.1 Arquitetura
```
[PWA Frontend] ↔ [Google Apps Script] ↔ [Google Sheets Database]
        ↓
  [GitHub Pages]
```

### 2.2 Componentes Principais
- **Frontend PWA**: Interface do usuário (HTML/CSS/JS)
- **Google Apps Script**: API intermediária
- **Google Sheets**: Banco de dados
- **Service Worker**: Cache e funcionalidade offline

## 3. Requisitos Funcionais Detalhados

### 3.1 RF001 - Sistema de Check-in

#### 3.1.1 Descrição
O sistema deve permitir que voluntários registrem sua entrada para participação em cultos/eventos, informando dados pessoais e itens retirados.

#### 3.1.2 Fluxo Funcional
1. **Entrada**: Usuário acessa a página inicial da PWA
2. **Seleção**: Usuário clica no botão "Check-in"
3. **Formulário**: Sistema exibe formulário de check-in
4. **Preenchimento**: Usuário preenche dados obrigatórios
5. **Validação**: Sistema valida dados inseridos
6. **Submissão**: Sistema envia dados para Google Apps Script
7. **Persistência**: Google Apps Script salva no Google Sheets
8. **Confirmação**: Sistema exibe mensagem de sucesso

#### 3.1.3 Campos de Entrada
| Campo | Tipo | Obrigatório | Validação | Comportamento |
|-------|------|-------------|-----------|---------------|
| Nome | Text Input | Sim | Min 2 chars, Max 100 chars | Autocomplete com nomes anteriores |
| Telefone | Tel Input | Sim | Formato (XX) XXXXX-XXXX | Máscara automática |
| Sessão | Select | Sim | Lista predefinida | Dropdown com opções |
| Itens | Checkbox Group | Não | Múltipla seleção | Lista de equipamentos |
| Outros Itens | Text Input | Não | Max 200 chars | Campo livre condicional |

#### 3.1.4 Lista de Sessões
- 1º Culto (Manhã)
- 2º Culto (Tarde) 
- 3º Culto (Noite)
- Ensaio
- Evento Especial
- Reunião de Liderança

#### 3.1.5 Lista de Itens Padrão
- Crachá de Identificação
- Rádio Comunicador
- Chaves (Portões/Salas)
- Equipamento de Som
- Material de Limpeza
- Instrumentos Musicais
- Material de Decoração
- Outros (campo texto livre)

#### 3.1.6 Validações
- **Nome**: Não pode estar vazio, deve conter apenas letras e espaços
- **Telefone**: Deve seguir padrão brasileiro (11 dígitos)
- **Sessão**: Deve ser uma das opções predefinidas
- **Itens**: Se "Outros" selecionado, campo texto obrigatório

#### 3.1.7 Regras de Negócio
- RN001: Um voluntário pode fazer múltiplos check-ins no mesmo dia
- RN002: Check-in sem check-out anterior é permitido
- RN003: Data/hora são capturadas automaticamente do sistema
- RN004: Cada check-in gera um ID único sequencial

#### 3.1.8 Dados Persistidos
```json
{
  "id": "auto_increment",
  "nome": "string",
  "telefone": "string",
  "sessao": "string", 
  "tipo": "check-in",
  "data": "YYYY-MM-DD",
  "hora": "HH:MM:SS",
  "itens": "item1,item2,item3",
  "observacoes": "string",
  "timestamp": "datetime"
}
```

### 3.2 RF002 - Sistema de Check-out

#### 3.2.1 Descrição
O sistema deve permitir que voluntários registrem sua saída, informando quais itens estão devolvendo.

#### 3.2.2 Fluxo Funcional
1. **Entrada**: Usuário acessa página inicial da PWA
2. **Seleção**: Usuário clica no botão "Check-out"  
3. **Identificação**: Sistema exibe campo de busca por nome
4. **Busca**: Usuário digita/seleciona seu nome
5. **Recuperação**: Sistema busca último check-in sem check-out
6. **Exibição**: Sistema mostra itens pendentes de devolução
7. **Seleção**: Usuário marca itens que está devolvendo
8. **Submissão**: Sistema registra check-out
9. **Confirmação**: Sistema exibe mensagem de sucesso

#### 3.2.3 Interface de Busca
- **Campo de busca**: Text input com autocomplete
- **Lista de sugestões**: Dropdown com nomes que fizeram check-in
- **Filtro**: Apenas voluntários com check-in pendente
- **Comportamento**: Busca em tempo real (debounce 300ms)

#### 3.2.4 Exibição de Itens Pendentes
```
Último Check-in: [Data] às [Hora] - [Sessão]
Itens retirados:
☑ Crachá de Identificação [checkbox]
☑ Rádio Comunicador [checkbox]  
☑ Chaves (Portões/Salas) [checkbox]
```

#### 3.2.5 Validações
- **Identificação**: Nome deve corresponder a check-in pendente
- **Itens**: Pelo menos um item deve ser selecionado para devolução
- **Temporal**: Check-out deve ser posterior ao check-in

#### 3.2.6 Regras de Negócio
- RN005: Check-out só é válido se houver check-in pendente
- RN006: Voluntário pode devolver apenas parte dos itens
- RN007: Múltiplos check-outs para mesmo check-in são permitidos
- RN008: Sistema identifica automaticamente itens não devolvidos

#### 3.2.7 Dados Persistidos
```json
{
  "id": "auto_increment",
  "nome": "string",
  "telefone": "string_do_checkin",
  "sessao": "string_do_checkin",
  "tipo": "check-out", 
  "data": "YYYY-MM-DD",
  "hora": "HH:MM:SS",
  "itens": "item1_devolvido,item2_devolvido",
  "observacoes": "string",
  "checkin_ref": "id_do_checkin_original",
  "timestamp": "datetime"
}
```

### 3.3 RF003 - Interface Principal (Home)

#### 3.3.1 Descrição
Tela inicial da PWA com navegação principal e status do sistema.

#### 3.3.2 Layout
```
[Logo da Igreja]
Sistema de Voluntários

[Botão CHECK-IN] [grande, verde]
[Botão CHECK-OUT] [grande, azul]

Status: Online ● 
Última sincronização: [timestamp]
```

#### 3.3.3 Elementos da Interface
- **Logo/Título**: Identidade visual da igreja
- **Botões principais**: Navegação para check-in/check-out
- **Status de conexão**: Indicador online/offline
- **Timestamp**: Última sincronização com Google Sheets
- **Versão**: Número da versão do sistema (rodapé)

#### 3.3.4 Comportamento Responsivo
- **Mobile (≤ 768px)**: Botões empilhados verticalmente
- **Tablet/Desktop (> 768px)**: Botões lado a lado
- **Botões**: Altura mínima 60px para touch
- **Fonte**: Mínimo 16px para legibilidade

### 3.4 RF004 - Integração com Google Sheets

#### 3.4.1 Descrição
Sistema de persistência de dados utilizando Google Sheets como banco de dados através de Google Apps Script.

#### 3.4.2 Estrutura da Planilha

| Coluna | Campo | Tipo | Descrição |
|--------|-------|------|-----------|
| A | ID | Number | Auto incremento |
| B | Nome | Text | Nome do voluntário |
| C | Telefone | Text | Telefone formatado |
| D | Sessão | Text | Sessão/culto |
| E | Tipo | Text | "check-in" ou "check-out" |
| F | Data | Date | YYYY-MM-DD |
| G | Hora | Time | HH:MM:SS |
| H | Itens | Text | Lista separada por vírgula |
| I | Observações | Text | Campo livre |
| J | CheckinRef | Number | ID do check-in relacionado |
| K | Timestamp | DateTime | Timestamp completo |

#### 3.4.3 Google Apps Script - Funções

##### 3.4.3.1 doPost(request) - Receber Check-in/Check-out
```javascript
function doPost(e) {
  // Processar dados recebidos
  // Validar dados
  // Inserir nova linha na planilha
  // Retornar confirmação
}
```

##### 3.4.3.2 doGet(request) - Buscar Dados
```javascript
function doGet(e) {
  // Processar parâmetros de busca
  // Consultar planilha
  // Retornar dados filtrados
}
```

##### 3.4.3.3 getLastCheckin(nome) - Buscar Último Check-in
```javascript
function getLastCheckin(nome) {
  // Buscar último check-in sem check-out
  // Retornar dados do check-in
}
```

#### 3.4.4 Endpoints da API

##### 3.4.4.1 POST /checkin
**Request:**
```json
{
  "action": "checkin",
  "nome": "string",
  "telefone": "string", 
  "sessao": "string",
  "itens": ["item1", "item2"]
}
```

**Response:**
```json
{
  "success": true,
  "id": 123,
  "message": "Check-in realizado com sucesso",
  "timestamp": "2025-08-24T14:30:00Z"
}
```

##### 3.4.4.2 POST /checkout
**Request:**
```json
{
  "action": "checkout",
  "nome": "string",
  "itens": ["item1", "item2"],
  "checkin_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "id": 124, 
  "message": "Check-out realizado com sucesso",
  "itens_pendentes": ["item3"],
  "timestamp": "2025-08-24T16:30:00Z"
}
```

##### 3.4.4.3 GET /last-checkin?nome=string
**Response:**
```json
{
  "success": true,
  "checkin": {
    "id": 123,
    "nome": "string",
    "sessao": "string",
    "data": "2025-08-24",
    "hora": "14:30:00", 
    "itens": ["item1", "item2", "item3"]
  }
}
```

### 3.5 RF005 - Progressive Web App (PWA)

#### 3.5.1 Descrição
Implementação de funcionalidades PWA para instalação e uso offline básico.

#### 3.5.2 Web App Manifest (manifest.json)
```json
{
  "name": "Sistema de Voluntários - Igreja",
  "short_name": "Voluntários",
  "description": "Check-in e Check-out de Voluntários",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 3.5.3 Service Worker
```javascript
// Cache de arquivos estáticos
const CACHE_NAME = 'voluntarios-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/js/offline.js'
];

// Estratégia Cache First para assets
// Estratégia Network First para dados
```

#### 3.5.4 Funcionalidade Offline
- **Cache**: Interface completa disponível offline
- **Dados**: Formulários funcionam, dados salvos localmente
- **Sincronização**: Quando online, enviar dados pendentes
- **Feedback**: Indicador claro de status offline/online

### 3.6 RF006 - Sistema de Busca e Autocomplete

#### 3.6.1 Descrição
Funcionalidade de busca de voluntários e autocomplete para melhorar usabilidade.

#### 3.6.2 Autocomplete de Nomes
- **Fonte de dados**: Google Sheets (nomes únicos)
- **Trigger**: A partir do 2º caractere digitado
- **Algoritmo**: Busca por início do nome (case insensitive)
- **Limite**: Máximo 10 sugestões
- **Performance**: Debounce de 300ms

#### 3.6.3 Cache de Nomes
```javascript
// Cache local de nomes frequentes
const nomeCache = {
  data: [],
  lastUpdate: null,
  ttl: 3600000 // 1 hora
};
```

#### 3.6.4 Busca de Telefones
- **Comportamento**: Ao selecionar nome, autocompletar telefone
- **Cache**: Manter últimos 50 registros de nome+telefone
- **Fallback**: Se não encontrado, campo vazio para digitação

## 4. Requisitos de Interface (UI/UX)

### 4.1 Design System

#### 4.1.1 Cores Principais
```css
--primary: #2196F3;    /* Azul principal */
--secondary: #4CAF50;  /* Verde check-in */
--error: #F44336;      /* Vermelho erro */
--warning: #FF9800;    /* Laranja aviso */
--success: #4CAF50;    /* Verde sucesso */
--background: #F5F5F5; /* Cinza claro */
--text: #212121;       /* Texto principal */
--text-light: #757575; /* Texto secundário */
```

#### 4.1.2 Tipografia
```css
--font-primary: 'Roboto', Arial, sans-serif;
--font-size-large: 1.5rem;   /* Títulos */
--font-size-medium: 1rem;    /* Texto normal */
--font-size-small: 0.875rem; /* Texto pequeno */
```

#### 4.1.3 Espaçamentos
```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
```

### 4.2 Componentes de Interface

#### 4.2.1 Botões
```css
.btn-primary {
  background: var(--primary);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 8px;
  font-size: var(--font-size-medium);
  min-height: 44px; /* Touch target */
}

.btn-success {
  background: var(--success);
  /* Demais propriedades iguais */
}
```

#### 4.2.2 Campos de Formulário
```css
.form-field {
  margin-bottom: var(--spacing-md);
  position: relative;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: var(--font-size-medium);
  min-height: 44px;
}
```

#### 4.2.3 Mensagens de Feedback
```css
.alert-success {
  background: #E8F5E8;
  color: var(--success);
  padding: var(--spacing-md);
  border-radius: 4px;
  border-left: 4px solid var(--success);
}

.alert-error {
  background: #FDEDEF;
  color: var(--error);
  /* Demais propriedades similares */
}
```

### 4.3 Layout Responsivo

#### 4.3.1 Breakpoints
```css
/* Mobile First */
@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

#### 4.3.2 Grid System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}
```

## 5. Validações e Tratamento de Erros

### 5.1 Validações Frontend

#### 5.1.1 Validação de Nome
```javascript
function validateNome(nome) {
  if (!nome || nome.trim().length < 2) {
    return "Nome deve ter pelo menos 2 caracteres";
  }
  if (nome.length > 100) {
    return "Nome muito longo (máximo 100 caracteres)";
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
    return "Nome deve conter apenas letras";
  }
  return null;
}
```

#### 5.1.2 Validação de Telefone
```javascript
function validateTelefone(telefone) {
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length !== 11) {
    return "Telefone deve ter 11 dígitos";
  }
  if (!cleaned.match(/^[1-9][1-9][9][0-9]{8}$/)) {
    return "Formato de telefone inválido";
  }
  return null;
}
```

### 5.2 Tratamento de Erros

#### 5.2.1 Erros de Conectividade
```javascript
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return result;
  } catch (error) {
    if (error.name === 'NetworkError') {
      showOfflineMessage();
      saveToLocalStorage();
    } else {
      showErrorMessage('Erro inesperado. Tente novamente.');
    }
  }
}
```

#### 5.2.2 Erros de Validação
- **Exibição**: Inline, próximo ao campo com erro
- **Cor**: Vermelha com ícone de aviso
- **Comportamento**: Limpar erro ao corrigir campo
- **Acessibilidade**: Atributos ARIA apropriados

### 5.3 Estados de Loading

#### 5.3.1 Feedback Visual
- **Botões**: Spinner + texto "Salvando..."
- **Formulários**: Overlay com spinner
- **Busca**: Skeleton loading para sugestões

## 6. Performance e Otimização

### 6.1 Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

### 6.2 Otimizações
- **CSS**: Minificação e compressão
- **JavaScript**: Bundle splitting, lazy loading
- **Imagens**: WebP com fallback, otimização de tamanho
- **Fonts**: Preload de fontes críticas
- **API**: Debounce em buscas, cache de responses

### 6.3 Caching Strategy
- **Static Assets**: Cache-First (1 year)
- **API Responses**: Network-First com fallback
- **User Data**: Session storage para formulários

## 7. Segurança

### 7.1 Input Sanitization
```javascript
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove brackets
    .substring(0, 200);   // Limit length
}
```

### 7.2 Rate Limiting
- **Frontend**: Debounce de requests (300ms)
- **Google Apps Script**: Max 100 requests/100s/user
- **Error Handling**: Exponential backoff para retry

### 7.3 Data Privacy
- **Armazenamento**: Apenas dados necessários
- **Logs**: Não incluir dados pessoais
- **Cache**: Limpar dados sensíveis ao fechar

## 8. Testes

### 8.1 Casos de Teste Funcionais

#### 8.1.1 TC001 - Check-in Sucesso
**Pré-condições**: Sistema online, formulário acessível
**Passos**:
1. Acessar tela de check-in
2. Preencher nome válido
3. Preencher telefone válido  
4. Selecionar sessão
5. Selecionar itens
6. Submeter formulário
**Resultado Esperado**: Check-in salvo, mensagem de sucesso

#### 8.1.2 TC002 - Check-in com Validação
**Pré-condições**: Sistema online
**Passos**:
1. Acessar tela de check-in
2. Submeter formulário vazio
**Resultado Esperado**: Mensagens de erro nos campos obrigatórios

#### 8.1.3 TC003 - Check-out Sucesso
**Pré-condições**: Voluntário com check-in pendente
**Passos**:
1. Acessar tela de check-out
2. Buscar nome do voluntário
3. Selecionar itens para devolução
4. Confirmar check-out
**Resultado Esperado**: Check-out salvo, itens atualizados

### 8.2 Casos de Teste Não-Funcionais

#### 8.2.1 Performance
- Teste de carga com 50 usuários simultâneos
- Teste de tempo de resposta (< 5s para operações)
- Teste de uso de memória (< 100MB)

#### 8.2.2 Compatibilidade
- Teste em Chrome, Firefox, Safari, Edge
- Teste em iOS 12+, Android 7+
- Teste em resoluções 320px até 1920px

#### 8.2.3 PWA
- Teste de instalação em dispositivos móveis
- Teste de funcionamento offline
- Teste de sincronização ao voltar online

## 9. Deployment e Configuração

### 9.1 GitHub Pages Setup
1. Repositório público no GitHub
2. Branch `main` como source
3. Custom domain (opcional)
4. HTTPS habilitado por padrão

### 9.2 Google Apps Script Configuration
```javascript
// Configurações do script
const CONFIG = {
  SPREADSHEET_ID: 'your_spreadsheet_id',
  SHEET_NAME: 'voluntarios',
  CORS_ORIGINS: ['https://your-church.github.io']
};
```

### 9.3 Environment Variables
```javascript
// config.js
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/.../exec',
  VERSION: '1.0.0',
  DEBUG: false
};
```

## 10. Monitoramento e Logs

### 10.1 Error Tracking
```javascript
function logError(error, context) {
  console.error('Error:', error, 'Context:', context);
  // Enviar para Google Analytics ou similar
}
```

### 10.2 Usage Analytics
- **Eventos**: Check-ins, Check-outs, Errors
- **Métricas**: Tempo de sessão, bounce rate
- **Privacy**: Dados anonimizados

### 10.3 Health Checks
- **API Status**: Endpoint de saúde no Apps Script
- **Data Integrity**: Validação periódica dos dados
- **Performance**: Monitoramento de métricas Core Web Vitals

---

**Versão**: 1.0  
**Data**: Agosto 2025  
**Aprovado por**: Equipe de Desenvolvimento  
**Próxima Revisão**: Setembro 2025