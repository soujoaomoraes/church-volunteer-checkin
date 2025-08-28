# FRD - Sistema de Checkin/Checkout de Voluntários
## Igreja Paz Church - Functional Requirements Document

### 1. Informações do Documento

**Versão:** 1.0  
**Data:** Agosto 2025  
**Autor:** Equipe de Desenvolvimento  
**Aprovação:** Liderança Igreja Paz Church  
**Referência:** PRD Sistema Checkin/Checkout v1.0

### 2. Arquitetura do Sistema

#### 2.1 Stack Tecnológica
```
Frontend: HTML5 + CSS3 + JavaScript ES6+
Database: IndexedDB (Browser Native)
Hosting: GitHub Pages
Domain: Custom (opcional)
PWA: Service Worker + Web App Manifest
```

#### 2.2 Estrutura de Arquivos
```
/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── components.css
│   ├── js/
│   │   ├── app.js
│   │   ├── database.js
│   │   ├── components/
│   │   │   ├── checkin.js
│   │   │   ├── checkout.js
│   │   │   ├── dashboard.js
│   │   │   └── reports.js
│   │   └── utils/
│   │       ├── helpers.js
│   │       └── validation.js
│   └── images/
└── README.md
```

### 3. Banco de Dados (IndexedDB)

#### 3.1 Schema de Dados

**Database Name:** `PazChurchVolunteers`  
**Version:** 1  
**Object Stores:**

```javascript
// Store: volunteers
{
  keyPath: "id",
  autoIncrement: false,
  indexes: {
    "nome": { unique: false },
    "telefone": { unique: false },
    "ministerio": { unique: false },
    "ativo": { unique: false }
  }
}

// Store: materials
{
  keyPath: "id",
  autoIncrement: false,
  indexes: {
    "nome": { unique: false },
    "tipo": { unique: false },
    "status": { unique: false },
    "emprestadoPara": { unique: false }
  }
}

// Store: activities
{
  keyPath: "id",
  autoIncrement: false,
  indexes: {
    "voluntarioId": { unique: false },
    "tipo": { unique: false },
    "dataHora": { unique: false }
  }
}

// Store: settings
{
  keyPath: "key",
  autoIncrement: false
}
```

#### 3.2 Estruturas de Dados Detalhadas

```javascript
// Volunteer Record
const VolunteerSchema = {
  id: "string (UUID v4)",
  nome: "string (2-100 chars)",
  telefone: "string? (10-15 digits)",
  ministerio: "string (predefined list)",
  ativo: "boolean",
  dataCadastro: "ISO 8601 datetime",
  checkinAtivo: {
    id: "string (activity ID)",
    dataHora: "ISO 8601 datetime",
    materiais: ["array of material IDs"],
    observacoes: "string? (0-500 chars)"
  } || null,
  stats: {
    totalCheckins: "number",
    horasServidas: "number",
    ultimoCheckin: "ISO 8601 datetime"
  }
}

// Material Record
const MaterialSchema = {
  id: "string (UUID v4)",
  nome: "string (2-50 chars)",
  codigo: "string? (1-20 chars)",
  tipo: "enum ['cracha', 'radio', 'chave', 'equipamento', 'outro']",
  status: "enum ['disponivel', 'emprestado', 'manutencao', 'perdido']",
  emprestadoPara: "string? (volunteer ID)",
  dataEmprestimo: "ISO 8601 datetime?",
  observacoes: "string? (0-300 chars)",
  dataCadastro: "ISO 8601 datetime",
  stats: {
    totalEmprestimos: "number",
    ultimoEmprestimo: "ISO 8601 datetime"
  }
}

// Activity Record
const ActivitySchema = {
  id: "string (UUID v4)",
  voluntarioId: "string (volunteer ID)",
  voluntarioNome: "string (cached)",
  tipo: "enum ['checkin', 'checkout']",
  dataHora: "ISO 8601 datetime",
  materiais: [{
    id: "string",
    nome: "string",
    status: "enum ['emprestado', 'devolvido', 'nao_devolvido']",
    observacao: "string?"
  }],
  observacoes: "string? (0-500 chars)",
  duracao: "number? (minutes, only for checkout)"
}

// Settings Record
const SettingsSchema = {
  key: "string",
  value: "any",
  updatedAt: "ISO 8601 datetime"
}
```

### 4. Funcionalidades Detalhadas

#### 4.1 RF001 - Gerenciamento de Voluntários

**RF001.1 - Cadastrar Voluntário**
- **Entrada:** Nome, telefone (opcional), ministério
- **Processamento:** 
  - Validar nome (min 2 chars, max 100)
  - Validar telefone se fornecido (regex)
  - Gerar UUID único
  - Salvar no IndexedDB
- **Saída:** ID do voluntário ou erro de validação

**RF001.2 - Buscar Voluntário**
- **Nota:** Esta função é usada para fins administrativos e de checkout, não para o fluxo principal de check-in.
- **Entrada:** Termo de busca (min 2 chars)
- **Processamento:**
  - Busca fuzzy no nome
  - Busca por telefone (exact match)
  - Ordenar por relevância
  - Limitar a 10 resultados
- **Saída:** Array de voluntários ou lista vazia

**RF001.3 - Listar Voluntários Ativos**
- **Entrada:** Filtros opcionais (ministério, data)
- **Processamento:**
  - Filtrar por checkinAtivo !== null
  - Aplicar filtros adicionais
  - Ordenar por dataHora do checkin
- **Saída:** Array de voluntários ativos

```javascript
// Implementação de referência
class VolunteerService {
  async create(data) {
    const volunteer = {
      id: generateUUID(),
      nome: data.nome.trim(),
      telefone: data.telefone?.trim() || null,
      ministerio: data.ministerio,
      ativo: true,
      dataCadastro: new Date().toISOString(),
      checkinAtivo: null,
      stats: {
        totalCheckins: 0,
        horasServidas: 0,
        ultimoCheckin: null
      }
    };
    
    await db.volunteers.add(volunteer);
    return volunteer;
  }

  async search(term) {
    const volunteers = await db.volunteers
      .where('nome')
      .startsWithIgnoreCase(term)
      .or('telefone')
      .equals(term)
      .toArray();
      
    return volunteers
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .slice(0, 10);
  }
}
```

#### 4.2 RF002 - Gerenciamento de Materiais

**RF002.1 - Cadastrar Material**
- **Entrada:** Nome, código (opcional), tipo
- **Processamento:**
  - Validar nome único
  - Validar código único se fornecido
  - Definir status como 'disponivel'
  - Salvar no IndexedDB
- **Saída:** ID do material ou erro

**RF002.2 - Listar Materiais Disponíveis**
- **Entrada:** Filtros opcionais (tipo)
- **Processamento:**
  - Filtrar por status === 'disponivel'
  - Aplicar filtros de tipo
  - Ordenar por nome
- **Saída:** Array de materiais disponíveis

**RF002.3 - Atualizar Status Material**
- **Entrada:** ID material, novo status, dados adicionais
- **Processamento:**
  - Validar transição de status
  - Atualizar campos relacionados
  - Salvar histórico se necessário
- **Saída:** Material atualizado ou erro

```javascript
// Estados válidos para materiais
const MATERIAL_STATES = {
  disponivel: ['emprestado', 'manutencao'],
  emprestado: ['disponivel', 'perdido', 'manutencao'],
  manutencao: ['disponivel'],
  perdido: ['disponivel', 'manutencao']
};
```

#### 4.3 RF003 - Processo de Checkin

**RF003.1 - Iniciar Checkin**
- **Nota sobre o fluxo:** A interface de check-in agora funciona como um formulário de registro. O componente de UI primeiro coleta os dados do voluntário, chama o `VolunteerService.create()` e, em seguida, usa o ID do voluntário recém-criado para chamar o `CheckinService.process()`.
- **Entrada para o Serviço (`CheckinService.process`):** Volunteer ID, array de material IDs, observações
- **Validações (no `CheckinService`):**
  - Voluntário existe e ativo
  - Não possui checkin ativo
  - Todos os materiais existem e disponíveis
- **Processamento:**
  - Criar activity record (tipo: checkin)
  - Atualizar status dos materiais para 'emprestado'
  - Definir emprestadoPara nos materiais
  - Atualizar checkinAtivo do voluntário
  - Incrementar stats do voluntário
- **Saída:** Activity ID ou erro de validação

**RF003.2 - Validar Disponibilidade**
- **Entrada:** Array de material IDs
- **Processamento:**
  - Verificar se todos existem
  - Verificar se status === 'disponivel'
  - Retornar lista de conflitos
- **Saída:** Boolean ou array de conflitos

```javascript
// Fluxo de checkin
async function processCheckin(voluntarioId, materiaisIds, observacoes) {
  const transaction = db.transaction(['volunteers', 'materials', 'activities'], 'readwrite');
  
  try {
    // 1. Validações
    const volunteer = await transaction.volunteers.get(voluntarioId);
    if (!volunteer || volunteer.checkinAtivo) {
      throw new Error('Voluntário inválido ou já ativo');
    }
    
    const materiais = await Promise.all(
      materiaisIds.map(id => transaction.materials.get(id))
    );
    
    const indisponiveis = materiais.filter(m => !m || m.status !== 'disponivel');
    if (indisponiveis.length > 0) {
      throw new Error('Materiais indisponíveis');
    }
    
    // 2. Criar activity
    const activity = {
      id: generateUUID(),
      voluntarioId: volunteer.id,
      voluntarioNome: volunteer.nome,
      tipo: 'checkin',
      dataHora: new Date().toISOString(),
      materiais: materiais.map(m => ({
        id: m.id,
        nome: m.nome,
        status: 'emprestado'
      })),
      observacoes
    };
    
    // 3. Atualizar registros
    await transaction.activities.add(activity);
    
    volunteer.checkinAtivo = {
      id: activity.id,
      dataHora: activity.dataHora,
      materiais: materiaisIds,
      observacoes
    };
    volunteer.stats.totalCheckins++;
    volunteer.stats.ultimoCheckin = activity.dataHora;
    await transaction.volunteers.put(volunteer);
    
    // 4. Atualizar materiais
    for (const material of materiais) {
      material.status = 'emprestado';
      material.emprestadoPara = voluntarioId;
      material.dataEmprestimo = activity.dataHora;
      material.stats.totalEmprestimos++;
      material.stats.ultimoEmprestimo = activity.dataHora;
      await transaction.materials.put(material);
    }
    
    await transaction.complete();
    return activity.id;
    
  } catch (error) {
    transaction.abort();
    throw error;
  }
}
```

#### 4.4 RF004 - Processo de Checkout

**RF004.1 - Listar Materiais do Voluntário**
- **Entrada:** Volunteer ID
- **Processamento:**
  - Buscar checkinAtivo do voluntário
  - Recuperar materiais emprestados
  - Retornar com status atual
- **Saída:** Array de materiais ou erro

**RF004.2 - Processar Checkout**
- **Entrada:** Volunteer ID, status por material, observações
- **Validações:**
  - Voluntário possui checkin ativo
  - Status válido para cada material
- **Processamento:**
  - Criar activity record (tipo: checkout)
  - Calcular duração do serviço
  - Atualizar status dos materiais
  - Limpar checkinAtivo do voluntário
  - Atualizar estatísticas
- **Saída:** Activity ID ou erro

```javascript
// Status possíveis no checkout
const CHECKOUT_STATUS = {
  devolvido: 'disponivel',
  nao_devolvido: 'perdido',
  danificado: 'manutencao'
};

async function processCheckout(voluntarioId, materiaisStatus, observacoes) {
  const transaction = db.transaction(['volunteers', 'materials', 'activities'], 'readwrite');
  
  try {
    const volunteer = await transaction.volunteers.get(voluntarioId);
    if (!volunteer?.checkinAtivo) {
      throw new Error('Voluntário não possui checkin ativo');
    }
    
    const checkinTime = new Date(volunteer.checkinAtivo.dataHora);
    const checkoutTime = new Date();
    const duracao = Math.round((checkoutTime - checkinTime) / 60000); // minutos
    
    const activity = {
      id: generateUUID(),
      voluntarioId,
      voluntarioNome: volunteer.nome,
      tipo: 'checkout',
      dataHora: checkoutTime.toISOString(),
      materiais: [],
      observacoes,
      duracao
    };
    
    // Processar cada material
    for (const [materialId, status] of Object.entries(materiaisStatus)) {
      const material = await transaction.materials.get(materialId);
      if (material && material.emprestadoPara === voluntarioId) {
        material.status = CHECKOUT_STATUS[status];
        material.emprestadoPara = null;
        material.dataEmprestimo = null;
        
        activity.materiais.push({
          id: materialId,
          nome: material.nome,
          status,
          observacao: null
        });
        
        await transaction.materials.put(material);
      }
    }
    
    // Finalizar checkout
    await transaction.activities.add(activity);
    
    volunteer.checkinAtivo = null;
    volunteer.stats.horasServidas += Math.round(duracao / 60);
    await transaction.volunteers.put(volunteer);
    
    await transaction.complete();
    return activity.id;
    
  } catch (error) {
    transaction.abort();
    throw error;
  }
}
```

#### 4.5 RF005 - Dashboard e Relatórios

**RF005.1 - Métricas em Tempo Real**
- **Entrada:** Filtros de data (opcional)
- **Processamento:**
  - Contar voluntários ativos
  - Contar materiais por status
  - Calcular tempo médio de serviço
  - Listar últimas atividades
- **Saída:** Objeto com métricas

**RF005.2 - Relatório de Atividades**
- **Entrada:** Período, filtros
- **Processamento:**
  - Buscar activities no período
  - Agrupar por voluntário/material/tipo
  - Calcular estatísticas
- **Saída:** Dados formatados para exibição/export

```javascript
// Geração de métricas
async function getDashboardMetrics() {
  const [volunteers, materials, activities] = await Promise.all([
    db.volunteers.toArray(),
    db.materials.toArray(),
    db.activities.orderBy('dataHora').reverse().limit(50).toArray()
  ]);
  
  const ativos = volunteers.filter(v => v.checkinAtivo);
  const materiaisStatus = materials.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  
  const checkouts = activities
    .filter(a => a.tipo === 'checkout' && a.duracao)
    .slice(0, 10);
  
  const tempoMedio = checkouts.length > 0 
    ? Math.round(checkouts.reduce((sum, a) => sum + a.duracao, 0) / checkouts.length)
    : 0;
  
  return {
    voluntariosAtivos: ativos.length,
    materiaisDisponiveis: materiaisStatus.disponivel || 0,
    materiaisEmprestados: materiaisStatus.emprestado || 0,
    materiaisPerdidos: materiaisStatus.perdido || 0,
    tempoMedioServico: tempoMedio,
    ultimasAtividades: activities.slice(0, 10)
  };
}
```

### 5. Interface do Usuário

#### 5.1 RF006 - Componentes da Interface



**RF006.2 - Seletor de Materiais**
- **Layout:** Grid responsivo
- **Estados:** Disponível, Selecionado, Indisponível
- **Contador:** Total selecionados
- **Validação:** Mínimo 1 item

**RF006.3 - Modal de Confirmação**
- **Conteúdo:** Resumo da operação
- **Ações:** Confirmar, Cancelar, Voltar
- **Escape:** ESC key ou click fora

#### 5.2 RF007 - Navegação e Roteamento

**Single Page Application (SPA)**
```javascript
const ROUTES = {
  '/': 'dashboard',
  '/checkin': 'checkin',
  '/checkout': 'checkout',
  '/materials': 'materials',
  '/reports': 'reports',
  '/settings': 'settings'
};

// Hash-based routing
window.addEventListener('hashchange', handleRoute);
function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const component = ROUTES[hash];
  if (component) {
    loadComponent(component);
  }
}
```

### 6. Validações e Regras de Negócio

#### 6.1 RN001 - Regras de Checkin
- Um voluntário só pode ter 1 checkin ativo por vez
- Materiais devem estar disponíveis no momento do checkin
- Nome do voluntário é obrigatório (min 2, max 100 chars)
- Pelo menos 1 material deve ser selecionado

#### 6.2 RN002 - Regras de Checkout
- Apenas voluntários com checkin ativo podem fazer checkout
- Todos os materiais emprestados devem ter status definido
- Duração mínima de serviço: 1 minuto
- Observações são obrigatórias para materiais não devolvidos

#### 6.3 RN003 - Regras de Materiais
- Nome do material deve ser único
- Código do material deve ser único (se fornecido)
- Transições de status devem seguir regras definidas
- Material em manutenção não pode ser emprestado

#### 6.4 Validações de Entrada

```javascript
const ValidationRules = {
  volunteer: {
    nome: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/
    },
    telefone: {
      required: false,
      pattern: /^\d{10,15}$/
    },
    ministerio: {
      required: true,
      enum: ['louvor', 'recepcao', 'midia', 'infantil', 'limpeza', 'seguranca', 'outro']
    }
  },
  
  material: {
    nome: {
      required: true,
      minLength: 2,
      maxLength: 50,
      unique: true
    },
    codigo: {
      required: false,
      maxLength: 20,
      unique: true
    },
    tipo: {
      required: true,
      enum: ['cracha', 'radio', 'chave', 'equipamento', 'outro']
    }
  }
};

function validateField(value, rules) {
  const errors = [];
  
  if (rules.required && !value) {
    errors.push('Campo obrigatório');
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    errors.push(`Mínimo ${rules.minLength} caracteres`);
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Máximo ${rules.maxLength} caracteres`);
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    errors.push('Formato inválido');
  }
  
  return errors;
}
```

### 7. Performance e Otimização

#### 7.1 RF008 - Requisitos de Performance

**Tempo de Resposta:**
- Busca de voluntários: < 200ms
- Checkin/checkout: < 500ms
- Carregamento dashboard: < 300ms
- Geração de relatórios: < 1s

**Otimizações IndexedDB:**
```javascript
// Usar índices para queries frequentes
const INDEX_CONFIG = {
  volunteers: {
    'nome': { unique: false },
    'ativo': { unique: false },
    'ministerio-ativo': { unique: false, multiEntry: false }
  },
  materials: {
    'status': { unique: false },
    'tipo-status': { unique: false, multiEntry: false }
  },
  activities: {
    'dataHora': { unique: false },
    'voluntarioId-dataHora': { unique: false, multiEntry: false }
  }
};

// Paginação para listas grandes
async function getVolunteersPage(page = 0, limit = 50) {
  return await db.volunteers
    .orderBy('nome')
    .offset(page * limit)
    .limit(limit)
    .toArray();
}
```

#### 7.2 RF009 - Cache e Storage

**Service Worker Cache:**
- Cache de assets estáticos: 1 ano
- Cache de dados da aplicação: 24 horas
- Cache de componentes: 7 dias

**IndexedDB Storage:**
- Limpeza automática de registros antigos (6+ meses)
- Compactação de dados mensalmente
- Backup antes de operações críticas

### 8. Offline e PWA

#### 8.1 RF010 - Funcionalidade Offline

**Recursos Disponíveis Offline:**
- ✅ Checkin/checkout básico
- ✅ Busca de voluntários
- ✅ Visualização de dados
- ❌ Backup/sincronização
- ❌ Relatórios avançados

**Estratégia de Sync:**
```javascript
// Detectar quando voltar online
window.addEventListener('online', async () => {
  const pendingActions = await getPendingActions();
  for (const action of pendingActions) {
    try {
      await processAction(action);
      await markActionAsProcessed(action.id);
    } catch (error) {
      console.error('Erro ao processar ação pendente:', error);
    }
  }
});
```

#### 8.2 RF011 - Web App Manifest

```json
{
  "name": "Sistema Voluntários - Paz Church",
  "short_name": "Paz Volunteers",
  "description": "Sistema de checkin/checkout de voluntários",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "assets/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 9. Backup e Segurança

#### 9.1 RF012 - Sistema de Backup

**Export de Dados:**
- Formato: JSON compactado
- Frequência: Manual + automático semanal
- Estrutura: Timestamped, versionado
- Storage: Download local + opcional GitHub

**Import de Dados:**
- Validação de schema
- Merge com dados existentes
- Rollback em caso de erro

```javascript
async function exportData() {
  const [volunteers, materials, activities, settings] = await Promise.all([
    db.volunteers.toArray(),
    db.materials.toArray(),
    db.activities.toArray(),
    db.settings.toArray()
  ]);
  
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: { volunteers, materials, activities, settings }
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `paz-church-backup-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

#### 9.2 RF013 - Controle de Acesso

**Autenticação Simples:**
- Senha única para acesso
- Storage em localStorage
- Timeout de sessão: 8 horas
- Bloqueio após 3 tentativas

**Logs de Auditoria:**
- Todas as operações críticas
- Timestamp + ação + dados alterados
- Retenção: 90 dias
- Export para análise

### 10. Testes e Validação

#### 10.1 RF014 - Cenários de Teste

**Testes Funcionais:**
1. Cadastro de voluntário com dados válidos/inválidos
2. Busca de voluntários (termo existente/inexistente)
3. Checkin com materiais disponíveis/indisponíveis
4. Checkout com devolução completa/parcial
5. Dashboard com dados/sem dados

**Testes de Edge Cases:**
1. IndexedDB indisponível
2. Dados corrompidos
3. Quota de storage excedida
4. Múltiplas abas abertas
5. Perda de conexão durante operação

**Testes de Performance:**
1. 1000+ voluntários cadastrados
2. 500+ materiais registrados
3. 10000+ atividades históricas
4. Busca com termos complexos
5. Geração de relatórios extensos

```javascript
// Suite de testes básica
const TestSuite = {
  async testCheckinFlow() {
    // 1. Criar voluntário
    const volunteer = await VolunteerService.create({
      nome: 'João Teste',
      ministerio: 'louvor'
    });
    
    // 2. Criar materiais
    const material1 = await MaterialService.create({
      nome: 'Crachá 001',
      tipo: 'cracha'
    });
    
    const material2 = await MaterialService.create({
      nome: 'Rádio 001',
      tipo: 'radio'
    });
    
    // 3. Fazer checkin
    const activityId = await CheckinService.process(
      volunteer.id, 
      [material1.id, material2.id],
      'Teste automatizado'
    );
    
    // 4. Validar estado
    const updatedVolunteer = await db.volunteers.get(volunteer.id);
    assert(updatedVolunteer.checkinAtivo !== null);
    assert(updatedVolunteer.checkinAtivo.materiais.length === 2);
    
    console.log('✅ Teste de checkin passou');
  }
};
```

### 11. Deploy e Configuração

#### 11.1 RF015 - GitHub Pages Setup

**Estrutura do Repositório:**
```
paz-church-volunteers/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   └── (arquivos do sistema)
├── README.md
└── LICENSE
```

**GitHub Actions (CI/CD):**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

#### 11.2 RF016 - Configuração Inicial

**First Run Setup:**
```javascript
async function initializeApp() {
  const isFirstRun = !localStorage.getItem('app_initialized');
  
  if (isFirstRun) {
    // Criar dados padrão
    await seedDefaultData();
    
    // Configurar settings
    await db.settings.bulkAdd([
      { key: 'church_name', value: 'Igreja Paz Church' },
      { key: 'admin_password', value: await hashPassword('admin123') },
      { key: 'backup_frequency', value: 'weekly' },
      { key: 'session_timeout', value: 8 * 60 * 60 * 1000 } // 8h
    ]);
    
    localStorage.setItem('app_initialized', 'true');
    showWelcomeModal();
  }
  
  // Verificar versão e migrar se necessário
  await checkAndMigrateData();
}

async function seedDefaultData() {
  const defaultMaterials = [
    { nome: 'Crachá Recepção', tipo: 'cracha' },
    { nome: 'Crachá Louvor', tipo: 'cracha' },
    { nome: 'Crachá Infantil', tipo: 'cracha' },
    { nome: 'Rádio 001', tipo: 'radio', codigo: 'R001' },
    { nome: 'Rádio 002', tipo: 'radio', codigo: 'R002' },
    { nome: 'Chave Sala 1', tipo: 'chave', codigo: 'S001' },
    { nome: 'Chave Sala 2', tipo: 'chave', codigo: 'S002' },
    { nome: 'Microfone Sem Fio', tipo: 'equipamento' },
    { nome: 'Tablet Recepção', tipo: 'equipamento' }
  ];
  
  for (const material of defaultMaterials) {
    await MaterialService.create(material);
  }
  
  console.log('✅ Dados padrão criados com sucesso');
}
```

### 12. Monitoramento e Analytics

#### 12.1 RF017 - Métricas de Uso

**Eventos Rastreados:**
- Checkins realizados por dia/semana/mês
- Materiais mais utilizados
- Voluntários mais ativos
- Tempo médio de serviço por ministério
- Taxa de devolução de materiais

**Storage de Métricas:**
```javascript
const MetricsService = {
  async trackEvent(event, data) {
    const metric = {
      id: generateUUID(),
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    await db.metrics.add(metric);
  },
  
  async getUsageStats(period = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const metrics = await db.metrics
      .where('timestamp')
      .above(startDate.toISOString())
      .toArray();
      
    return this.aggregateMetrics(metrics);
  },
  
  aggregateMetrics(metrics) {
    const stats = {
      totalCheckins: 0,
      totalCheckouts: 0,
      uniqueVolunteers: new Set(),
      materialsUsed: {},
      averageServiceTime: 0,
      busyHours: {},
      ministerios: {}
    };
    
    metrics.forEach(metric => {
      switch (metric.event) {
        case 'checkin_completed':
          stats.totalCheckins++;
          stats.uniqueVolunteers.add(metric.data.voluntarioId);
          
          // Horário mais movimentado
          const hour = new Date(metric.timestamp).getHours();
          stats.busyHours[hour] = (stats.busyHours[hour] || 0) + 1;
          
          // Ministérios
          const ministerio = metric.data.ministerio;
          stats.ministerios[ministerio] = (stats.ministerios[ministerio] || 0) + 1;
          
          // Materiais usados
          metric.data.materiais.forEach(mat => {
            stats.materialsUsed[mat.nome] = (stats.materialsUsed[mat.nome] || 0) + 1;
          });
          break;
          
        case 'checkout_completed':
          stats.totalCheckouts++;
          if (metric.data.duracao) {
            stats.averageServiceTime = 
              (stats.averageServiceTime + metric.data.duracao) / 2;
          }
          break;
      }
    });
    
    stats.uniqueVolunteers = stats.uniqueVolunteers.size;
    return stats;
  }
};
```

#### 12.2 RF018 - Health Monitoring

**Monitoramento do Sistema:**
```javascript
const HealthMonitor = {
  async checkSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      performance: await this.checkPerformance(),
      errors: await this.getRecentErrors()
    };
    
    return health;
  },
  
  async checkDatabase() {
    try {
      const start = performance.now();
      await db.volunteers.limit(1).toArray();
      const duration = performance.now() - start;
      
      const counts = await Promise.all([
        db.volunteers.count(),
        db.materials.count(),
        db.activities.count()
      ]);
      
      return {
        status: 'healthy',
        responseTime: Math.round(duration),
        records: {
          volunteers: counts[0],
          materials: counts[1],
          activities: counts[2]
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  },
  
  async checkStorage() {
    try {
      const estimate = await navigator.storage.estimate();
      const usedMB = Math.round(estimate.usage / (1024 * 1024));
      const quotaMB = Math.round(estimate.quota / (1024 * 1024));
      const usagePercent = Math.round((estimate.usage / estimate.quota) * 100);
      
      return {
        status: usagePercent < 80 ? 'healthy' : 'warning',
        used: usedMB,
        quota: quotaMB,
        usagePercent
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  },
  
  async checkPerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
        total: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024))
      } : null
    };
  }
};
```

### 13. Tratamento de Erros

#### 13.1 RF019 - Error Handling

**Hierarquia de Erros:**
```javascript
class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(field, message, value) {
    super(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR', {
      field, value
    });
  }
}

class DatabaseError extends AppError {
  constructor(operation, originalError) {
    super(`Database error during ${operation}`, 'DATABASE_ERROR', {
      operation, originalError: originalError.message
    });
  }
}

class BusinessRuleError extends AppError {
  constructor(rule, message) {
    super(message, 'BUSINESS_RULE_ERROR', { rule });
  }
}
```

**Error Recovery:**
```javascript
const ErrorHandler = {
  async handleError(error, context = {}) {
    // Log do erro
    console.error('Application Error:', error);
    await this.logError(error, context);
    
    // Estratégia de recuperação baseada no tipo
    switch (error.constructor.name) {
      case 'DatabaseError':
        return await this.recoverFromDatabaseError(error, context);
        
      case 'ValidationError':
        return await this.recoverFromValidationError(error, context);
        
      case 'BusinessRuleError':
        return await this.recoverFromBusinessRuleError(error, context);
        
      default:
        return await this.recoverFromGenericError(error, context);
    }
  },
  
  async recoverFromDatabaseError(error, context) {
    // Tentar reabrir conexão
    try {
      await db.open();
      
      // Retentar operação se fornecida
      if (context.retryFunction) {
        return await context.retryFunction();
      }
    } catch (retryError) {
      // Fallback para modo offline
      this.showErrorMessage('Sistema temporariamente indisponível. Algumas funcionalidades podem estar limitadas.');
      return { success: false, offline: true };
    }
  },
  
  async recoverFromValidationError(error, context) {
    // Mostrar erro de validação para o usuário
    this.showValidationError(error.details.field, error.message);
    return { success: false, validationError: error };
  },
  
  async logError(error, context) {
    const errorLog = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        details: error.details
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      await db.errorLogs.add(errorLog);
    } catch (logError) {
      // Fallback para localStorage se IndexedDB falhar
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(errorLog);
      localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50))); // Manter apenas 50 logs
    }
  }
};
```

#### 13.2 RF020 - User Feedback

**Sistema de Notificações:**
```javascript
const NotificationService = {
  show(type, title, message, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__icon">${this.getIcon(type)}</div>
      <div class="notification__content">
        <div class="notification__title">${title}</div>
        <div class="notification__message">${message}</div>
      </div>
      <button class="notification__close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.querySelector('#notifications').appendChild(notification);
    
    // Auto-remove
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
    
    return notification;
  },
  
  success(title, message) {
    return this.show('success', title, message);
  },
  
  error(title, message) {
    return this.show('error', title, message, 10000); // Erros ficam mais tempo
  },
  
  warning(title, message) {
    return this.show('warning', title, message);
  },
  
  info(title, message) {
    return this.show('info', title, message);
  },
  
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
};
```

### 14. Migração e Versionamento

#### 14.1 RF021 - Schema Migration

**Sistema de Versioning:**
```javascript
const CURRENT_VERSION = '1.0.0';

const MigrationService = {
  async checkAndMigrate() {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion !== CURRENT_VERSION) {
      console.log(`Migrating from ${currentVersion} to ${CURRENT_VERSION}`);
      await this.runMigrations(currentVersion, CURRENT_VERSION);
    }
  },
  
  async getCurrentVersion() {
    try {
      const versionSetting = await db.settings.get('app_version');
      return versionSetting?.value || '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  },
  
  async runMigrations(fromVersion, toVersion) {
    const migrations = this.getMigrationsToRun(fromVersion, toVersion);
    
    for (const migration of migrations) {
      try {
        console.log(`Running migration: ${migration.version}`);
        await migration.up();
        await this.setVersion(migration.version);
        console.log(`✅ Migration ${migration.version} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw new Error(`Migration failed at version ${migration.version}: ${error.message}`);
      }
    }
  },
  
  migrations: [
    {
      version: '1.0.0',
      async up() {
        // Criar índices otimizados
        if (!db.volunteers.schema.indexes.some(i => i.name === 'ministerio-ativo')) {
          await db.volunteers.schema.createIndex('ministerio-ativo', ['ministerio', 'ativo']);
        }
        
        // Adicionar campos de estatísticas aos registros existentes
        const volunteers = await db.volunteers.toArray();
        for (const volunteer of volunteers) {
          if (!volunteer.stats) {
            volunteer.stats = {
              totalCheckins: 0,
              horasServidas: 0,
              ultimoCheckin: null
            };
            await db.volunteers.put(volunteer);
          }
        }
        
        // Migrar materiais para novo formato
        const materials = await db.materials.toArray();
        for (const material of materials) {
          if (!material.stats) {
            material.stats = {
              totalEmprestimos: 0,
              ultimoEmprestimo: null
            };
            await db.materials.put(material);
          }
        }
      }
    }
  ],
  
  getMigrationsToRun(fromVersion, toVersion) {
    return this.migrations.filter(m => 
      this.compareVersions(m.version, fromVersion) > 0 && 
      this.compareVersions(m.version, toVersion) <= 0
    ).sort((a, b) => this.compareVersions(a.version, b.version));
  },
  
  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  },
  
  async setVersion(version) {
    await db.settings.put({
      key: 'app_version',
      value: version,
      updatedAt: new Date().toISOString()
    });
  }
};
```

### 15. Documentação da API Interna

#### 15.1 RF022 - Core Services API

**VolunteerService:**
```javascript
class VolunteerService {
  /**
   * Cria um novo voluntário
   * @param {Object} data - Dados do voluntário
   * @param {string} data.nome - Nome completo
   * @param {string} [data.telefone] - Telefone opcional
   * @param {string} data.ministerio - Ministério de atuação
   * @returns {Promise<Object>} Voluntário criado
   * @throws {ValidationError} Se dados inválidos
   */
  async create(data) { /* implementação */ }
  
  /**
   * Busca voluntários por termo
   * @param {string} term - Termo de busca (min 2 chars)
   * @returns {Promise<Array>} Lista de voluntários encontrados
   */
  async search(term) { /* implementação */ }
  
  /**
   * Obtém voluntários com checkin ativo
   * @param {Object} [filters] - Filtros opcionais
   * @returns {Promise<Array>} Lista de voluntários ativos
   */
  async getActive(filters = {}) { /* implementação */ }
  
  /**
   * Atualiza dados do voluntário
   * @param {string} id - ID do voluntário
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Voluntário atualizado
   */
  async update(id, updates) { /* implementação */ }
}
```

**MaterialService:**
```javascript
class MaterialService {
  /**
   * Cria novo material
   * @param {Object} data - Dados do material
   * @param {string} data.nome - Nome único do material
   * @param {string} [data.codigo] - Código único opcional
   * @param {string} data.tipo - Tipo do material
   * @returns {Promise<Object>} Material criado
   */
  async create(data) { /* implementação */ }
  
  /**
   * Lista materiais disponíveis
   * @param {Object} [filters] - Filtros por tipo, status
   * @returns {Promise<Array>} Lista de materiais disponíveis
   */
  async getAvailable(filters = {}) { /* implementação */ }
  
  /**
   * Atualiza status do material
   * @param {string} id - ID do material
   * @param {string} status - Novo status
   * @param {Object} [metadata] - Dados adicionais
   * @returns {Promise<Object>} Material atualizado
   */
  async updateStatus(id, status, metadata = {}) { /* implementação */ }
}
```

**CheckinService:**
```javascript
class CheckinService {
  /**
   * Processa checkin de voluntário
   * @param {string} voluntarioId - ID do voluntário
   * @param {Array<string>} materiaisIds - IDs dos materiais
   * @param {string} [observacoes] - Observações opcionais
   * @returns {Promise<string>} ID da atividade criada
   * @throws {BusinessRuleError} Se regras violadas
   */
  async process(voluntarioId, materiaisIds, observacoes) { /* implementação */ }
  
  /**
   * Valida disponibilidade de materiais
   * @param {Array<string>} materiaisIds - IDs para validar
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateMaterials(materiaisIds) { /* implementação */ }
}
```

**CheckoutService:**
```javascript
class CheckoutService {
  /**
   * Processa checkout de voluntário
   * @param {string} voluntarioId - ID do voluntário
   * @param {Object} materiaisStatus - Status de cada material
   * @param {string} [observacoes] - Observações opcionais
   * @returns {Promise<string>} ID da atividade criada
   */
  async process(voluntarioId, materiaisStatus, observacoes) { /* implementação */ }
  
  /**
   * Obtém materiais emprestados para voluntário
   * @param {string} voluntarioId - ID do voluntário
   * @returns {Promise<Array>} Lista de materiais emprestados
   */
  async getMaterialsForVolunteer(voluntarioId) { /* implementação */ }
}
```

### 16. Conclusão e Próximos Passos

#### 16.1 Entregáveis

**Documentação Técnica:**
- ✅ FRD completo com especificações funcionais
- ✅ Schema de dados detalhado
- ✅ API interna documentada
- ✅ Fluxos de erro e recuperação

**Próximas Etapas:**
1. **Análise Técnica (1 dia)**
   - Validar viabilidade técnica
   - Confirmar limitações do IndexedDB
   - Testar performance em dispositivos alvo

2. **Prototipagem (3 dias)**
   - Criar wireframes navegáveis
   - Validar UX com coordenadores
   - Ajustar requisitos baseado no feedback

3. **Desenvolvimento MVP (2 semanas)**
   - Implementar funcionalidades core
   - Testes básicos de integração
   - Deploy inicial no GitHub Pages

4. **Teste Piloto (1 semana)**
   - Usar em 2-3 eventos reais
   - Coletar feedback dos usuários
   - Ajustes baseados na experiência prática

5. **Release Produção (1 semana)**
   - Correções finais
   - Documentação do usuário
   - Treinamento da equipe

#### 16.2 Critérios de Sucesso

**Técnicos:**
- ✅ Funciona offline em 100% dos casos
- ✅ Tempo de resposta < 500ms para operações críticas
- ✅ Zero perda de dados durante 30 dias de uso
- ✅ Compatível com tablets Android/iOS

**Funcionais:**
- ✅ 90% redução no tempo de checkin/checkout
- ✅ 95% precisão no controle de materiais
- ✅ 100% adoção pela equipe de coordenação
- ✅ Relatórios mensais gerados automaticamente

**Este FRD fornece todas as especificações técnicas necessárias para implementar o sistema de forma robusta, escalável e confiável, utilizando apenas tecnologias web gratuitas conforme requisitado.**