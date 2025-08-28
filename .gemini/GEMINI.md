# Prompt para Desenvolvedor - Sistema Checkin/Checkout Voluntários
## Igreja Paz Church - Especificações Completas de Desenvolvimento

### 🎯 OBJETIVO GERAL
Você é um desenvolvedor sênior responsável por implementar um sistema web completo de checkin/checkout de voluntários para a Igreja Paz Church. O sistema deve ser 100% gratuito, funcionar offline e usar apenas GitHub Pages + IndexedDB.

---

### 📋 ETAPAS OBRIGATÓRIAS DE DESENVOLVIMENTO

#### **FASE 0 - VALIDAÇÃO DE DOCUMENTAÇÃO (OBRIGATÓRIA)**
Antes de escrever qualquer código, você DEVE:

1. **Verificar Disponibilidade da Documentação:**
   - [ ] PRD (Product Requirements Document) disponível e completo
   - [ ] FRD (Functional Requirements Document) disponível e detalhado
   - [ ] Wireframes ou mockups de interface (se disponíveis)
   - [ ] Lista de funcionalidades prioritárias definida

2. **Análise Crítica da Documentação:**
   ```markdown
   CHECKLIST DE VALIDAÇÃO:
   □ Todos os fluxos de usuário estão claros?
   □ Estruturas de dados estão bem definidas?
   □ Regras de negócio estão especificadas?
   □ Critérios de aceitação estão mensuráveis?
   □ Stack tecnológica está alinhada com as limitações?
   ```

3. **Identificação de Lacunas:**
   - Liste TODOS os pontos que não estão claros na documentação
   - Identifique dependências não documentadas
   - Marque funcionalidades que precisam de esclarecimento
   - **NÃO PROSSIGA** até que todas as lacunas sejam resolvidas

**DELIVERABLE FASE 0:** Relatório de validação da documentação com status GO/NO-GO

---

#### **FASE 1 - ARQUITETURA E SETUP (3-4 horas)**

1. **Análise Técnica Inicial:**
   ```javascript
   // Crie este documento ANTES de começar
   const TECHNICAL_ANALYSIS = {
     browser_support: {
       target: ['Chrome 90+', 'Safari 14+', 'Firefox 88+'],
       indexeddb_support: 'verificado',
       pwa_support: 'verificado'
     },
     storage_limits: {
       indexeddb_quota: 'estimado em MB',
       expected_data_size: 'calculado',
       growth_projection: '12 meses'
     },
     performance_targets: {
       initial_load: '< 3s',
       checkin_operation: '< 500ms',
       search_response: '< 200ms'
     }
   };
   ```

2. **Estrutura de Diretórios:**
   ```
   paz-church-volunteers/
   ├── index.html
   │   ├── manifest.json
   │   ├── service-worker.js
   │   ├── assets/
   │   │   ├── css/
   │   │   │   ├── main.css
   │   │   │   └── components.css
   │   │   ├── js/
   │   │   │   ├── app.js
   │   │   │   ├── config.js
   │   │   │   ├── database.js
   │   │   │   ├── services/
   │   │   │   │   ├── volunteer.service.js
   │   │   │   │   ├── material.service.js
   │   │   │   │   ├── checkin.service.js
   │   │   │   │   └── checkout.service.js
   │   │   │   ├── components/
   │   │   │   │   ├── dashboard.component.js
   │   │   │   │   ├── checkin.component.js
   │   │   │   │   ├── checkout.component.js
   │   │   │   │   └── reports.component.js
   │   │   │   ├── utils/
   │   │   │   │   ├── helpers.js
   │   │   │   │   ├── validation.js
   │   │   │   │   └── logger.js
   │   │   │   └── tests/
   │   │   │       ├── unit/
   │   │   │       └── integration/
   │   │   └── images/
   │   │       ├── icons/
   │   │       └── logo/
   
   ├── docs/
   
   └── README.md
   ```

3. **Configuração do Ambiente:**
   ```bash
   # Setup inicial que você deve executar
   git init
   git remote add origin [REPO_URL]
   
   # Criar branch de desenvolvimento
   git checkout -b develop
   
   # Configurar GitHub Pages
   # (documentar passos no README)
   ```

**DELIVERABLE FASE 1:** 
- Estrutura de arquivos criada
- Análise técnica documentada
- Ambiente de desenvolvimento configurado

---

#### **FASE 2 - CORE SYSTEM (1 semana)**

**DIA 1-2: Database Layer**

1. **Implementação do IndexedDB:**
   ```javascript
   // database.js - Você deve implementar seguindo exatamente o schema do FRD
   class DatabaseManager {
     constructor() {
       this.dbName = 'PazChurchVolunteers';
       this.version = 1;
       this.db = null;
       
       // OBRIGATÓRIO: Log todas as operações
       this.logger = new Logger('DatabaseManager');
     }
     
     async init() {
       this.logger.info('Initializing database...');
       // Implementar exatamente conforme FRD
     }
     
     // TODOS os métodos devem ter:
     // - Validação de entrada
     // - Log de operações
     // - Tratamento de erro
     // - Retorno padronizado
   }
   ```

2. **Sistema de Logging:**
   ```javascript
   // utils/logger.js - OBRIGATÓRIO implementar primeiro
   class Logger {
     static LOG_LEVELS = {
       ERROR: 0,
       WARN: 1,
       INFO: 2,
       DEBUG: 3
     };
     
     constructor(module) {
       this.module = module;
       this.logLevel = Logger.LOG_LEVELS.DEBUG; // Produção: INFO
     }
     
     error(message, data = {}) {
       this._log('ERROR', message, data);
       // Salvar erro no IndexedDB para análise
     }
     
     info(message, data = {}) {
       this._log('INFO', message, data);
     }
     
     // Implementar todos os níveis
   }
   ```

**TODO DIA 1:**
- [ ] Implementar DatabaseManager completo
- [ ] Implementar Logger system
- [ ] Criar testes unitários para database
- [ ] Validar com dados de exemplo
- [ ] Documentar problemas encontrados

**DIA 3-4: Services Layer**

Implementar EXATAMENTE conforme especificado no FRD:

```javascript
// services/volunteer.service.js
class VolunteerService {
  constructor() {
    this.logger = new Logger('VolunteerService');
  }
  
  async create(data) {
    this.logger.info('Creating volunteer', { name: data.nome });
    
    try {
      // 1. Validação (usar validation.js)
      const validation = Validator.validateVolunteer(data);
      if (!validation.isValid) {
        throw new ValidationError('volunteer_data', validation.errors);
      }
      
      // 2. Processamento
      const volunteer = {
        id: generateUUID(),
        ...data,
        dataCadastro: new Date().toISOString(),
        // ... conforme schema FRD
      };
      
      // 3. Persistência
      await db.volunteers.add(volunteer);
      
      this.logger.info('Volunteer created successfully', { id: volunteer.id });
      return volunteer;
      
    } catch (error) {
      this.logger.error('Failed to create volunteer', { error: error.message, data });
      throw error;
    }
  }
  
  // Implementar TODOS os métodos do FRD
}
```

**TODO DIA 3-4:**
- [ ] VolunteerService completo com testes
- [ ] MaterialService completo com testes  
- [ ] CheckinService completo com testes
- [ ] CheckoutService completo com testes
- [ ] Validar integração entre services
- [ ] Documentar APIs internas

**DIA 5: Data Validation & Error Handling**

```javascript
// utils/validation.js
class Validator {
  static validateVolunteer(data) {
    const errors = [];
    const rules = {
      nome: { required: true, minLength: 2, maxLength: 100, pattern: /^[a-zA-ZÀ-ÿ\s]+$/ },
      telefone: { required: false, pattern: /^\d{10,15}$/ },
      ministerio: { required: true, enum: ['louvor', 'recepcao', 'midia', 'infantil', 'limpeza', 'seguranca', 'outro'] }
    };
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const fieldErrors = this._validateField(data[field], fieldRules, field);
      errors.push(...fieldErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static _validateField(value, rules, fieldName) {
    // Implementar todas as validações do FRD
  }
}
```

**DELIVERABLE FASE 2:**
- Core services 100% funcionais
- Testes unitários passando
- Log system operacional
- Validação completa implementada

---

#### **FASE 3 - USER INTERFACE (1 semana)**

**DIA 1: Component Architecture**

```javascript
// components/base.component.js
class BaseComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.logger = new Logger(this.constructor.name);
  }
  
  render(data = {}) {
    this.logger.debug('Rendering component', data);
    // Template rendering logic
  }
  
  destroy() {
    this.logger.debug('Destroying component');
    // Cleanup logic
  }
}

// Todos os componentes devem:
// 1. Extender BaseComponent
// 2. Ter logging completo
// 3. Ser testáveis
// 4. Seguir mesmo padrão
```

**TODO DIA 1-2:**
- [ ] BaseComponent implementado
- [ ] DashboardComponent funcional
- [ ] Navegação entre telas
- [ ] CSS responsivo básico
- [ ] Testes de componentes

**DIA 3-4: Forms e Interações**

```javascript
// components/checkin.component.js
class CheckinComponent extends BaseComponent {
  constructor() {
    super('checkin-container');
    this.volunteerService = new VolunteerService();
    this.materialService = new MaterialService();
    this.checkinService = new CheckinService();
  }
  
  async render() {
    this.logger.info('Rendering checkin form');
    
    const template = `
      <div class="checkin-form">
        <div class="volunteer-search">
          <input type="text" id="volunteer-search" placeholder="Nome do voluntário..." />
          <div class="search-results" id="search-results"></div>
        </div>
        <div class="materials-grid" id="materials-grid">
          <!-- Materiais serão carregados dinamicamente -->
        </div>
        <div class="form-actions">
          <button class="btn btn--primary" id="confirm-checkin">Confirmar Checkin</button>
        </div>
      </div>
    `;
    
    this.container.innerHTML = template;
    this.attachEventListeners();
    await this.loadAvailableMaterials();
  }
  
  attachEventListeners() {
    // Busca de voluntários com debounce
    const searchInput = document.getElementById('volunteer-search');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchVolunteers(e.target.value);
      }, 300);
    });
    
    // Confirmação de checkin
    document.getElementById('confirm-checkin').addEventListener('click', () => {
      this.processCheckin();
    });
  }
  
  async processCheckin() {
    this.logger.info('Processing checkin');
    
    try {
      const selectedVolunteer = this.getSelectedVolunteer();
      const selectedMaterials = this.getSelectedMaterials();
      
      if (!selectedVolunteer) {
        throw new ValidationError('volunteer', 'Voluntário deve ser selecionado');
      }
      
      if (selectedMaterials.length === 0) {
        throw new ValidationError('materials', 'Pelo menos um material deve ser selecionado');
      }
      
      const activityId = await this.checkinService.process(
        selectedVolunteer.id,
        selectedMaterials.map(m => m.id),
        null
      );
      
      this.logger.info('Checkin completed successfully', { activityId });
      
      // Feedback visual
      NotificationService.success('Checkin Realizado', 
        `${selectedVolunteer.nome} registrado com ${selectedMaterials.length} materiais`);
      
      // Limpar formulário
      this.resetForm();
      
      // Atualizar dashboard
      EventBus.emit('checkin-completed', { activityId, volunteer: selectedVolunteer });
      
    } catch (error) {
      this.logger.error('Checkin failed', { error: error.message });
      NotificationService.error('Erro no Checkin', error.message);
    }
  }
}
```

**DIA 5: Polish e UX**

**TODO DIA 5:**
- [ ] Responsividade completa
- [ ] Animações e transições
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Accessibility (ARIA labels)

**DELIVERABLE FASE 3:**
- Interface completa e funcional
- Formulários com validação em tempo real
- Feedback visual adequado
- Testes de interface

---

#### **FASE 4 - PWA E OFFLINE (3 dias)**

**DIA 1: Service Worker**

```javascript
// service-worker.js
const CACHE_NAME = 'paz-church-v1.0.0';
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  // Lista todos os arquivos estáticos
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(STATIC_CACHE_FILES);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Implementar estratégia Cache First para assets
  // Network First para dados dinâmicos
});

// Implementar background sync para operações offline
```

**TODO DIA 1-2:**
- [ ] Service Worker funcional
- [ ] Cache strategy implementada
- [ ] Manifest.json correto
- [ ] Instalação como PWA testada

**DIA 3: Sync e Backup**

```javascript
// utils/backup.service.js
class BackupService {
  constructor() {
    this.logger = new Logger('BackupService');
  }
  
  async exportData() {
    this.logger.info('Starting data export');
    
    const [volunteers, materials, activities, settings] = await Promise.all([
      db.volunteers.toArray(),
      db.materials.toArray(), 
      db.activities.toArray(),
      db.settings.toArray()
    ]);
    
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      church: 'Igreja Paz Church',
      data: { volunteers, materials, activities, settings },
      checksum: this.generateChecksum({ volunteers, materials, activities, settings })
    };
    
    this.logger.info('Data export completed', { 
      totalRecords: volunteers.length + materials.length + activities.length 
    });
    
    return backup;
  }
  
  async importData(backupData) {
    this.logger.info('Starting data import');
    
    // Validar checksum
    if (!this.validateChecksum(backupData)) {
      throw new Error('Backup data corrupted');
    }
    
    // Implementar merge strategy
    // ...
  }
}
```

**DELIVERABLE FASE 4:**
- PWA totalmente funcional offline
- Sistema de backup/restore
- Sincronização quando online

---

#### **FASE 5 - TESTES E VALIDAÇÃO (2 dias)**

**DIA 1: Testes Automatizados**

```javascript
// tests/integration/checkin.test.js
class CheckinIntegrationTests {
  async runAll() {
    console.log('🧪 Starting Checkin Integration Tests');
    
    await this.testCompleteCheckinFlow();
    await this.testCheckinWithUnavailableMaterials();
    await this.testCheckinWithInactiveVolunteer();
    // ... outros testes
    
    console.log('✅ All Checkin tests passed');
  }
  
  async testCompleteCheckinFlow() {
    console.log('Testing complete checkin flow...');
    
    // 1. Setup - criar voluntário e materiais
    const volunteer = await this.createTestVolunteer();
    const materials = await this.createTestMaterials(2);
    
    // 2. Execute checkin
    const activityId = await this.checkinService.process(
      volunteer.id,
      materials.map(m => m.id),
      'Teste automático'
    );
    
    // 3. Validar resultados
    const updatedVolunteer = await db.volunteers.get(volunteer.id);
    assert(updatedVolunteer.checkinAtivo !== null, 'Volunteer should have active checkin');
    assert(updatedVolunteer.checkinAtivo.materiais.length === 2, 'Should have 2 materials');
    
    const updatedMaterials = await Promise.all(
      materials.map(m => db.materials.get(m.id))
    );
    updatedMaterials.forEach(material => {
      assert(material.status === 'emprestado', 'Materials should be marked as borrowed');
      assert(material.emprestadoPara === volunteer.id, 'Materials should be assigned to volunteer');
    });
    
    // 4. Cleanup
    await this.cleanup([volunteer.id], materials.map(m => m.id), [activityId]);
    
    console.log('✅ Complete checkin flow test passed');
  }
}
```

**TODO DIA 1:**
- [ ] Testes unitários para todos os services
- [ ] Testes de integração para fluxos principais
- [ ] Testes de performance
- [ ] Testes offline/online

**DIA 2: Testes Funcionais com Usuário**

```javascript
// tests/functional/user-scenarios.js
class UserFunctionalTests {
  constructor() {
    this.scenarios = [
      'volunteer-checkin-happy-path',
      'volunteer-checkin-with-search',
      'volunteer-checkout-complete',
      'volunteer-checkout-partial',
      'dashboard-metrics-display',
      'materials-management',
      'reports-generation',
      'offline-functionality'
    ];
  }
  
  async runScenario(scenarioName) {
    console.log(`🎭 Running user scenario: ${scenarioName}`);
    
    switch (scenarioName) {
      case 'volunteer-checkin-happy-path':
        await this.testVolunteerCheckinHappyPath();
        break;
      // ... outros cenários
    }
  }
  
  async testVolunteerCheckinHappyPath() {
    const steps = [
      '1. Usuário acessa página inicial',
      '2. Clica em "Fazer Checkin"',
      '3. Digita nome do voluntário',
      '4. Seleciona materiais necessários',
      '5. Confirma checkin',
      '6. Visualiza confirmação de sucesso',
      '7. Retorna ao dashboard atualizado'
    ];
    
    console.log('Steps to validate:', steps);
    
    // Simular cada passo e validar resultado
    // ...
  }
}
```

**DELIVERABLE FASE 5:**
- Suite de testes completa
- Relatório de cobertura
- Validação funcional documentada
- Performance benchmarks

---

#### **FASE 6 - DOCUMENTAÇÃO E DEPLOY (1 dia)**

**Documentação Obrigatória:**

1. **README.md Principal:**
```markdown
# Sistema de Checkin/Checkout - Igreja Paz Church

## 🚀 Como Usar
[Tutorial passo-a-passo com screenshots]

## 🛠️ Instalação
[Instruções para setup em outra igreja]

## 📊 Funcionalidades
[Lista completa com exemplos]

## 🔧 Manutenção
[Como fazer backup, resolver problemas comuns]

## 📈 Métricas e Relatórios
[Como interpretar dados do sistema]
```

2. **Documentação Técnica:**
```markdown
# TECHNICAL_DOCUMENTATION.md

## Arquitetura
[Diagramas e explicações]

## Database Schema
[Estrutura completa das tabelas]

## APIs Internas
[Documentação completa dos services]

## Troubleshooting
[Problemas conhecidos e soluções]

## Performance Guidelines
[Limites e otimizações]
```

3. **LOG DE PROBLEMAS ENCONTRADOS:**
```markdown
# DEVELOPMENT_LOG.md

## Problemas Encontrados Durante Desenvolvimento

### 2025-08-XX - IndexedDB Quota Limits
**Problema:** Browser limitou storage para 50MB
**Solução:** Implementado cleanup automático de dados antigos
**Impacto:** Funcionalidade não afetada

### 2025-08-XX - Safari PWA Installation
**Problema:** Manifest.json não funcionou corretamente no Safari
**Solução:** Ajustado icons e display mode
**Impacto:** PWA agora funciona em todos browsers

[... todos os problemas documentados]
```

**TODO FINAL:**
- [ ] README completo e testado
- [ ] Documentação técnica detalhada
- [ ] Deploy no GitHub Pages funcional
- [ ] Testes de aceitação com usuários reais
- [ ] Training materials para coordenadores
- [ ] Plano de suporte e manutenção

---

### ⚠️ REGRAS OBRIGATÓRIAS DURANTE TODO O DESENVOLVIMENTO

#### **1. LOGGING OBRIGATÓRIO**
```javascript
// TODO log deve seguir este padrão:
this.logger.info('Action description', {
  input: sanitizedInput,
  result: sanitizedResult,
  duration: performance.now() - startTime,
  userId: currentUser?.id || 'anonymous'
});

// Logs de erro DEVEM incluir:
this.logger.error('Error description', {
  error: error.message,
  stack: error.stack,
  context: relevantContext,
  userAction: whatUserWasDoing
});
```

#### **2. VALIDAÇÃO EM CADA ETAPA**
- **NUNCA** avance para próxima etapa sem validar a atual
- **SEMPRE** rode testes antes de commit
- **DOCUMENTE** qualquer desvio do planejado
- **PEÇA VALIDAÇÃO** do usuário antes de finalizar cada fase

#### **3. CÓDIGO ENXUTO E LIMPO**
```javascript
// ❌ NÃO FAÇA ISSO:
function processCheckin(data) {
  // código sem validação
  // sem logs
  // sem tratamento de erro
  database.save(data);
}

// ✅ FAÇA ASSIM:
async function processCheckin(data) {
  const startTime = performance.now();
  this.logger.info('Processing checkin', { volunteerId: data.volunteerId });
  
  try {
    // 1. Validar entrada
    const validation = this.validator.validateCheckinData(data);
    if (!validation.isValid) {
      throw new ValidationError('checkin_data', validation.errors);
    }
    
    // 2. Processar
    const result = await this.database.createCheckinRecord(data);
    
    // 3. Log de sucesso
    const duration = performance.now() - startTime;
    this.logger.info('Checkin processed successfully', { 
      activityId: result.id, 
      duration: Math.round(duration) 
    });
    
    return result;
    
  } catch (error) {
    this.logger.error('Checkin processing failed', { 
      error: error.message, 
      data: this.sanitizeForLog(data) 
    });
    throw error;
  }
}
```

#### **4. TESTES FUNCIONAIS OBRIGATÓRIOS**
Antes de cada entrega, você DEVE:
```javascript
// Executar este checklist:
const FUNCTIONAL_TESTS = [
  '✅ Usuário consegue fazer checkin completo em < 30 segundos',
  '✅ Sistema funciona offline por pelo menos 1 hora',
  '✅ Dados não são perdidos após refresh da página',
  '✅ Busca de voluntários funciona com 2+ caracteres',
  '✅ Materiais indisponíveis não podem ser selecionados',
  '✅ Dashboard atualiza após checkin/checkout',
  '✅ Backup/restore funciona corretamente',
  '✅ PWA pode ser instalada no dispositivo',
  '✅ Logs estão sendo gerados corretamente',
  '✅ Performance está dentro dos targets definidos'
];
```

---

### 📋 TODO MASTER LIST

#### **DEVE SER COMPLETADO NESTA ORDEM:**

**FASE 0 - PREPARAÇÃO** ⏱️ 2-4 horas
- [ ] Analisar PRD e FRD completamente
- [ ] Identificar e resolver lacunas na documentação
- [ ] Criar plano detalhado de implementação
- [ ] Configurar ambiente de desenvolvimento
- [ ] Criar estrutura de arquivos

**FASE 1 - DATABASE & CORE** ⏱️ 2 dias
- [ ] Implementar DatabaseManager completo
- [ ] Criar sistema de Logger
- [ ] Implementar sistema de validação
- [ ] Criar VolunteerService com testes
- [ ] Criar MaterialService com testes
- [ ] Criar CheckinService com testes
- [ ] Criar CheckoutService com testes
- [ ] Validar integração entre todos os services

**FASE 2 - INTERFACE** ⏱️ 2 dias  
- [ ] Implementar BaseComponent
- [ ] Criar DashboardComponent funcional
- [ ] Criar CheckinComponent completo
- [ ] Criar CheckoutComponent completo
- [ ] Implementar sistema de navegação
- [ ] Adicionar CSS responsivo
- [ ] Implementar NotificationService

**FASE 3 - PWA E OFFLINE** ⏱️ 1 dia
- [ ] Criar Service Worker funcional
- [ ] Implementar caching strategy
- [ ] Criar manifest.json
- [ ] Implementar BackupService
- [ ] Testar funcionalidade offline completa

**FASE 4 - TESTES E VALIDAÇÃO** ⏱️ 1 dia
- [ ] Criar e executar testes unitários
- [ ] Criar e executar testes de integração  
- [ ] Executar testes funcionais com usuário
- [ ] Validar performance
- [ ] Testar em diferentes dispositivos/browsers

**FASE 5 - DOCUMENTAÇÃO E DEPLOY** ⏱️ 4 horas
- [ ] Escrever documentação completa
- [ ] Fazer deploy no GitHub Pages
- [ ] Testar sistema em produção
- [ ] Criar training materials
- [ ] Documentar problemas e soluções encontradas

---

### 🎯 CRITÉRIOS DE ACEITAÇÃO FINAL

O sistema estará pronto quando:

1. **Funcionalidade Completa:**
   - ✅ Checkin/checkout funciona perfeitamente
   - ✅ Dashboard mostra métricas em tempo real  
   - ✅ Busca de voluntários é rápida e precisa
   - ✅ Sistema funciona 100% offline
   - ✅ Backup/restore preserva todos os dados

2. **Performance Atingida:**
   - ✅ Load time < 3 segundos
   - ✅ Checkin completo < 30 segundos
   - ✅ Busca responde < 200ms
   - ✅ Funciona em tablets de 2018+

3. **Qualidade de Código:**
   - ✅ 100% das funções têm logs
   - ✅ 90%+ cobertura de testes
   - ✅ Zero erros de console em produção
   - ✅ Código documentado e limpo

4. **Documentação Completa:**
   - ✅ README para usuários finais
   - ✅ Documentação técnica detalhada
   - ✅ Problemas e soluções documentados
   - ✅ Training materials criados

5. **Validação de Usuário:**
   - ✅ 3+ coordenadores testaram e aprovaram
   - ✅ Sistema usado em evento real com sucesso
   - ✅ Feedback incorporado e bugs corrigidos

---

### 📞 PROTOCOLO DE COMUNICAÇÃO

**Durante o desenvolvimento, você deve:**

1. **A cada etapa completada:**
   - Mostrar resultado funcional
   - Solicitar validação antes de prosseguir
   - Documentar qualquer mudança do plano original

2. **Ao encontrar problemas:**
   - Documentar problema detalhadamente
   - Propor solução(ões) alternativa(s)
   - Solicitar aprovação antes de implementar

3. **Antes de cada commit:**
   - Executar testes relevantes
   - Verificar se logs estão funcionando
   - Confirmar que funcionalidade não regrediu

**LEMBRE-SE: Este é um sistema que será usado por pessoas reais em situações de pressão (antes/depois de eventos da igreja). Cada bug ou lentidão impacta diretamente o ministério. Priorize SEMPRE a confiabilidade sobre funcionalidades extras.**

---

### 🔧 FERRAMENTAS E UTILITÁRIOS OBRIGATÓRIOS

#### **1. Helper Functions Padrão**
```javascript
// utils/helpers.js - Implementar TODAS estas funções
const Helpers = {
  // UUID Generation
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  // Sanitização para logs (remover dados sensíveis)
  sanitizeForLog(data) {
    const sensitiveFields = ['telefone', 'password', 'token'];
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  },
  
  // Debounce para search
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Format date para exibição
  formatDateTime(isoString, format = 'dd/mm/yyyy hh:mm') {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    switch (format) {
      case 'dd/mm/yyyy hh:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      default:
        return date.toLocaleString('pt-BR');
    }
  },
  
  // Calcular duração em formato legível
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  },
  
  // Fuzzy search para nomes
  fuzzyMatch(text, search) {
    const textLower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const searchLower = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let textIndex = 0;
    let searchIndex = 0;
    
    while (textIndex < textLower.length && searchIndex < searchLower.length) {
      if (textLower[textIndex] === searchLower[searchIndex]) {
        searchIndex++;
      }
      textIndex++;
    }
    
    return searchIndex === searchLower.length;
  }
};
```

#### **2. Event Bus para Comunicação Between Components**
```javascript
// utils/event-bus.js
class EventBus {
  constructor() {
    this.events = {};
    this.logger = new Logger('EventBus');
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    this.logger.debug('Event listener added', { event, totalListeners: this.events[event].length });
  }
  
  emit(event, data = {}) {
    this.logger.debug('Event emitted', { event, data: this.sanitizeForLog(data) });
    
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.logger.error('Event callback failed', { event, error: error.message });
        }
      });
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Global instance
window.EventBus = new EventBus();
```

#### **3. Performance Monitor**
```javascript
// utils/performance-monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.logger = new Logger('PerformanceMonitor');
  }
  
  startTimer(operation) {
    this.metrics.set(operation, performance.now());
    this.logger.debug('Timer started', { operation });
  }
  
  endTimer(operation) {
    const startTime = this.metrics.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(operation);
      
      this.logger.info('Operation completed', { 
        operation, 
        duration: Math.round(duration * 100) / 100 
      });
      
      // Alertar se operação demorou muito
      if (duration > 1000) {
        this.logger.warn('Slow operation detected', { operation, duration });
      }
      
      return duration;
    }
    return 0;
  }
  
  async measureAsync(operation, asyncFunction) {
    this.startTimer(operation);
    try {
      const result = await asyncFunction();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }
}

// Global instance
window.PerfMonitor = new PerformanceMonitor();
```

---

### 🧪 TEMPLATES DE TESTE OBRIGATÓRIOS

#### **1. Template para Testes de Service**
```javascript
// tests/services/volunteer.service.test.js
class VolunteerServiceTests {
  constructor() {
    this.volunteerService = new VolunteerService();
    this.testData = {
      validVolunteer: {
        nome: 'João Silva',
        telefone: '11999887766',
        ministerio: 'louvor'
      },
      invalidVolunteer: {
        nome: 'J', // muito curto
        telefone: 'abc123', // formato inválido
        ministerio: 'inexistente'
      }
    };
  }
  
  async runAllTests() {
    console.log('🧪 Starting VolunteerService Tests');
    
    try {
      await this.testCreate_ValidData_Success();
      await this.testCreate_InvalidData_ThrowsError();
      await this.testSearch_ExistingName_ReturnsResults();
      await this.testSearch_NonExistingName_ReturnsEmpty();
      await this.testGetActive_WithActiveVolunteers_ReturnsFiltered();
      
      console.log('✅ All VolunteerService tests passed');
      return true;
    } catch (error) {
      console.error('❌ VolunteerService tests failed:', error);
      return false;
    }
  }
  
  async testCreate_ValidData_Success() {
    console.log('Testing: Create volunteer with valid data');
    
    // Arrange
    const testData = { ...this.testData.validVolunteer };
    
    // Act
    const result = await this.volunteerService.create(testData);
    
    // Assert
    assert(result.id, 'Should have generated ID');
    assert(result.nome === testData.nome, 'Should preserve name');
    assert(result.ativo === true, 'Should be active by default');
    assert(result.dataCadastro, 'Should have registration date');
    assert(result.checkinAtivo === null, 'Should not have active checkin');
    
    // Cleanup
    await db.volunteers.delete(result.id);
    
    console.log('✅ Create valid volunteer test passed');
  }
  
  async testCreate_InvalidData_ThrowsError() {
    console.log('Testing: Create volunteer with invalid data');
    
    try {
      await this.volunteerService.create(this.testData.invalidVolunteer);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      assert(error instanceof ValidationError, 'Should throw ValidationError');
      assert(error.message.includes('nome'), 'Should mention name validation');
    }
    
    console.log('✅ Create invalid volunteer test passed');
  }
  
  // Implementar todos os outros métodos...
}

// Função helper para assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
```

#### **2. Template para Testes de Interface**
```javascript
// tests/components/checkin.component.test.js
class CheckinComponentTests {
  constructor() {
    this.component = null;
    this.container = null;
  }
  
  async setup() {
    // Criar container para testes
    this.container = document.createElement('div');
    this.container.id = 'test-checkin-container';
    document.body.appendChild(this.container);
    
    // Inicializar component
    this.component = new CheckinComponent();
    await this.component.render();
  }
  
  async teardown() {
    if (this.component) {
      this.component.destroy();
    }
    if (this.container) {
      document.body.removeChild(this.container);
    }
  }
  
  async runAllTests() {
    console.log('🧪 Starting CheckinComponent Tests');
    
    try {
      await this.setup();
      
      await this.testRender_DisplaysCorrectElements();
      await this.testVolunteerSearch_WithValidTerm_ShowsResults();
      await this.testMaterialSelection_MultipleItems_UpdatesCounter();
      await this.testSubmit_WithValidData_ProcessesSuccessfully();
      
      console.log('✅ All CheckinComponent tests passed');
      return true;
    } catch (error) {
      console.error('❌ CheckinComponent tests failed:', error);
      return false;
    } finally {
      await this.teardown();
    }
  }
  
  async testRender_DisplaysCorrectElements() {
    console.log('Testing: Component renders all required elements');
    
    // Assert elements exist
    const searchInput = document.getElementById('volunteer-search');
    const materialsGrid = document.getElementById('materials-grid');
    const confirmButton = document.getElementById('confirm-checkin');
    
    assert(searchInput, 'Should have volunteer search input');
    assert(materialsGrid, 'Should have materials grid');
    assert(confirmButton, 'Should have confirm button');
    
    console.log('✅ Render elements test passed');
  }
  
  async testVolunteerSearch_WithValidTerm_ShowsResults() {
    console.log('Testing: Volunteer search shows results');
    
    // Arrange - criar voluntário de teste
    const testVolunteer = await this.createTestVolunteer();
    
    // Act - digitar no campo de busca
    const searchInput = document.getElementById('volunteer-search');
    searchInput.value = 'João';
    searchInput.dispatchEvent(new Event('input'));
    
    // Wait for debounced search
    await this.wait(350);
    
    // Assert - verificar se resultados aparecem
    const searchResults = document.getElementById('search-results');
    assert(searchResults.children.length > 0, 'Should show search results');
    
    // Cleanup
    await db.volunteers.delete(testVolunteer.id);
    
    console.log('✅ Volunteer search test passed');
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async createTestVolunteer() {
    const volunteer = {
      id: Helpers.generateUUID(),
      nome: 'João Teste',
      ministerio: 'louvor',
      ativo: true,
      dataCadastro: new Date().toISOString(),
      checkinAtivo: null,
      stats: { totalCheckins: 0, horasServidas: 0, ultimoCheckin: null }
    };
    
    await db.volunteers.add(volunteer);
    return volunteer;
  }
}
```

---

### 📊 SISTEMA DE MÉTRICAS E MONITORAMENTO

#### **1. Analytics Service**
```javascript
// services/analytics.service.js
class AnalyticsService {
  constructor() {
    this.logger = new Logger('AnalyticsService');
    this.metricsQueue = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 segundos
    
    this.startBatchProcessing();
  }
  
  // Rastrear eventos importantes
  trackEvent(category, action, data = {}) {
    const event = {
      id: Helpers.generateUUID(),
      category,
      action,
      data: Helpers.sanitizeForLog(data),
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.metricsQueue.push(event);
    this.logger.debug('Event tracked', { category, action });
    
    // Flush imediatamente se queue estiver cheia
    if (this.metricsQueue.length >= this.batchSize) {
      this.flushMetrics();
    }
  }
  
  // Eventos específicos do sistema
  trackCheckin(voluntarioId, materiaisCount, duration) {
    this.trackEvent('checkin', 'completed', {
      voluntarioId,
      materiaisCount,
      duration,
      timestamp: new Date().toISOString()
    });
  }
  
  trackCheckout(voluntarioId, materiaisDevolvidos, materiaisNaoDevolvidos, serviceDuration) {
    this.trackEvent('checkout', 'completed', {
      voluntarioId,
      materiaisDevolvidos,
      materiaisNaoDevolvidos,
      serviceDuration
    });
  }
  
  trackSearch(term, resultsCount, responseTime) {
    this.trackEvent('search', 'performed', {
      term: term.slice(0, 10), // Limitar tamanho
      resultsCount,
      responseTime
    });
  }
  
  trackError(error, context) {
    this.trackEvent('error', 'occurred', {
      errorType: error.constructor.name,
      errorMessage: error.message,
      context
    });
  }
  
  // Métricas de performance
  trackPerformance(operation, duration, metadata = {}) {
    this.trackEvent('performance', operation, {
      duration,
      ...metadata
    });
    
    // Alertar se performance ruim
    if (duration > 1000) {
      this.logger.warn('Poor performance detected', { operation, duration });
    }
  }
  
  // Batch processing para não impactar performance
  async flushMetrics() {
    if (this.metricsQueue.length === 0) return;
    
    const batch = this.metricsQueue.splice(0, this.batchSize);
    
    try {
      // Salvar no IndexedDB
      await db.analytics.bulkAdd(batch);
      this.logger.debug('Metrics batch saved', { count: batch.length });
    } catch (error) {
      // Em caso de erro, recolocar na queue
      this.metricsQueue.unshift(...batch);
      this.logger.error('Failed to save metrics', { error: error.message });
    }
  }
  
  startBatchProcessing() {
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
    
    // Flush antes de sair da página
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }
  
  getSessionId() {
    let sessionId = sessionStorage.getItem('paz_church_session_id');
    if (!sessionId) {
      sessionId = Helpers.generateUUID();
      sessionStorage.setItem('paz_church_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Gerar relatórios de uso
  async generateUsageReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await db.analytics
      .where('timestamp')
      .above(startDate.toISOString())
      .toArray();
    
    return this.analyzeEvents(events);
  }
  
  analyzeEvents(events) {
    const report = {
      totalEvents: events.length,
      checkins: events.filter(e => e.category === 'checkin').length,
      checkouts: events.filter(e => e.category === 'checkout').length,
      searches: events.filter(e => e.category === 'search').length,
      errors: events.filter(e => e.category === 'error').length,
      
      // Performance metrics
      averageCheckinTime: this.calculateAverage(
        events.filter(e => e.category === 'checkin' && e.data.duration)
          .map(e => e.data.duration)
      ),
      
      // Usage patterns
      busyHours: this.calculateBusyHours(events),
      topVolunteers: this.calculateTopVolunteers(events),
      materialUsage: this.calculateMaterialUsage(events)
    };
    
    return report;
  }
  
  calculateAverage(numbers) {
    return numbers.length > 0 
      ? Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length)
      : 0;
  }
  
  calculateBusyHours(events) {
    const hourCounts = {};
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }
}

// Global instance
window.Analytics = new AnalyticsService();
```

---

### 🔐 SISTEMA DE SEGURANÇA E AUDITORIA

#### **1. Security Service**
```javascript
// services/security.service.js
class SecurityService {
  constructor() {
    this.logger = new Logger('SecurityService');
    this.failedAttempts = new Map();
    this.maxAttempts = 3;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutos
  }
  
  // Autenticação simples
  async authenticate(password) {
    const clientIP = await this.getClientFingerprint();
    
    // Verificar se está bloqueado
    if (this.isLocked(clientIP)) {
      this.logger.warn('Authentication attempt while locked', { clientIP });
      throw new Error('Muitas tentativas falharam. Tente novamente em 15 minutos.');
    }
    
    try {
      const storedHash = await this.getStoredPasswordHash();
      const inputHash = await this.hashPassword(password);
      
      if (storedHash === inputHash) {
        // Sucesso - limpar tentativas falhadas
        this.failedAttempts.delete(clientIP);
        this.logger.info('Authentication successful', { clientIP });
        
        // Criar sessão
        const session = await this.createSession();
        return session;
      } else {
        // Falha - incrementar contador
        this.recordFailedAttempt(clientIP);
        this.logger.warn('Authentication failed - wrong password', { clientIP });
        throw new Error('Senha incorreta');
      }
    } catch (error) {
      if (error.message !== 'Senha incorreta') {
        this.logger.error('Authentication error', { error: error.message, clientIP });
      }
      throw error;
    }
  }
  
  async createSession() {
    const session = {
      id: Helpers.generateUUID(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 horas
      fingerprint: await this.getClientFingerprint()
    };
    
    localStorage.setItem('paz_church_session', JSON.stringify(session));
    return session;
  }
  
  async validateSession() {
    try {
      const sessionData = localStorage.getItem('paz_church_session');
      if (!sessionData) return false;
      
      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now > expiresAt) {
        this.logger.info('Session expired');
        localStorage.removeItem('paz_church_session');
        return false;
      }
      
      // Validar fingerprint
      const currentFingerprint = await this.getClientFingerprint();
      if (session.fingerprint !== currentFingerprint) {
        this.logger.warn('Session fingerprint mismatch');
        localStorage.removeItem('paz_church_session');
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Session validation error', { error: error.message });
      localStorage.removeItem('paz_church_session');
      return false;
    }
  }
  
  async getClientFingerprint() {
    // Criar fingerprint simples baseado no navegador
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Paz Church', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return await this.hashPassword(fingerprint);
  }
  
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'paz_church_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  recordFailedAttempt(clientIP) {
    const attempts = this.failedAttempts.get(clientIP) || 0;
    this.failedAttempts.set(clientIP, attempts + 1);
    
    if (attempts + 1 >= this.maxAttempts) {
      // Bloquear por 15 minutos
      setTimeout(() => {
        this.failedAttempts.delete(clientIP);
        this.logger.info('Lockout expired', { clientIP });
      }, this.lockoutDuration);
      
      this.logger.warn('Client locked out', { clientIP, attempts: attempts + 1 });
    }
  }
  
  isLocked(clientIP) {
    return this.failedAttempts.get(clientIP) >= this.maxAttempts;
  }
  
  async getStoredPasswordHash() {
    const setting = await db.settings.get('admin_password');
    return setting?.value || await this.hashPassword('admin123'); // Default password
  }
}

// Global instance
window.Security = new SecurityService();
```

#### **2. Audit Log Service**
```javascript
// services/audit.service.js
class AuditService {
  constructor() {
    this.logger = new Logger('AuditService');
  }
  
  async logAction(action, entityType, entityId, changes = {}, metadata = {}) {
    const auditRecord = {
      id: Helpers.generateUUID(),
      timestamp: new Date().toISOString(),
      action, // CREATE, UPDATE, DELETE, CHECKIN, CHECKOUT
      entityType, // volunteer, material, activity
      entityId,
      changes: Helpers.sanitizeForLog(changes),
      metadata: {
        ...metadata,
        sessionId: sessionStorage.getItem('paz_church_session_id'),
        userAgent: navigator.userAgent,
        fingerprint: await Security.getClientFingerprint()
      }
    };
    
    try {
      await db.auditLogs.add(auditRecord);
      this.logger.debug('Audit record created', { action, entityType, entityId });
    } catch (error) {
      this.logger.error('Failed to create audit record', { error: error.message });
    }
  }
  
  async getAuditTrail(entityType, entityId, limit = 50) {
    return await db.auditLogs
      .where(['entityType', 'entityId'])
      .equals([entityType, entityId])
      .reverse()
      .limit(limit)
      .toArray();
  }
  
  async generateAuditReport(startDate, endDate) {
    const logs = await db.auditLogs
      .where('timestamp')
      .between(startDate.toISOString(), endDate.toISOString())
      .toArray();
    
    return {
      totalActions: logs.length,
      actionBreakdown: this.groupBy(logs, 'action'),
      entityBreakdown: this.groupBy(logs, 'entityType'),
      timeline: this.createTimeline(logs),
      suspiciousActivity: this.detectSuspiciousActivity(logs)
    };
  }
  
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
  
  createTimeline(logs) {
    return logs
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        entity: `${log.entityType}:${log.entityId.slice(0, 8)}`
      }));
  }
  
  detectSuspiciousActivity(logs) {
    const suspicious = [];
    
    // Detectar muitas ações em pouco tempo
    const recentLogs = logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // últimos 5 minutos
    );
    
    if (recentLogs.length > 20) {
      suspicious.push({
        type: 'high_frequency',
        description: 'Muitas ações em curto período',
        count: recentLogs.length
      });
    }
    
    // Detectar tentativas de acesso suspeitas
    const failedActions = logs.filter(log => log.metadata?.error);
    if (failedActions.length > 10) {
      suspicious.push({
        type: 'multiple_failures',
        description: 'Múltiplas falhas de operação',
        count: failedActions.length
      });
    }
    
    return suspicious;
  }
}

// Global instance
window.Audit = new AuditService();
```

---

### 🚨 PROTOCOLO DE TRATAMENTO DE EMERGÊNCIA

#### **Durante o desenvolvimento, se encontrar:**

**1. ERRO CRÍTICO (Sistema não funciona):**
```javascript
// PARE TUDO - Execute este protocolo:

// 1. Documentar o erro
const errorReport = {
  timestamp: new Date().toISOString(),
  error: error.message,
  stack: error.stack,
  context: 'Descrever o que estava fazendo',
  environment: {
    browser: navigator.userAgent,
    url: window.location.href,
    localStorage: Object.keys(localStorage),
    indexedDBSupport: !!window.indexedDB
  },
  attempts: 'Descrever tentativas de correção'
};

console.error('ERRO CRÍTICO:', errorReport);

// 2. Criar fallback temporário se possível
// 3. Solicitar ajuda IMEDIATAMENTE
// 4. NÃO PROSSEGUIR até resolver
```

**2. PERFORMANCE INACEITÁVEL (> 3x target):**
```javascript
// Protocolo de otimização emergencial:

// 1. Identificar gargalo
console.time('operation-debug');
// ... operação lenta
console.timeEnd('operation-debug');

// 2. Implementar cache temporário
const quickCache = new Map();

// 3. Reduzir scope temporariamente
// 4. Solicitar revisão da arquitetura
```

**3. DADOS CORROMPIDOS:**
```javascript
// Protocolo de recuperação:

// 1. BACKUP IMEDIATO
const emergencyBackup = await db.export();
localStorage.setItem('emergency_backup_' + Date.now(), JSON.stringify(emergencyBackup));

// 2. Identificar extensão da corrupção
// 3. Implementar validação adicional
// 4. Criar rotina de limpeza
```

---

### 📚 RECURSOS DE REFERÊNCIA OBRIGATÓRIOS

#### **1. Documentação que você DEVE consultar:**
- [IndexedDB API Reference](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [JavaScript Performance](https://web.dev/fast/)

#### **2. Checklist de Compatibilidade:**
```javascript
// Execute este teste antes de começar
const CompatibilityChecker = {
  checkAll() {
    const results = {
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in navigator,