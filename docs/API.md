# API Documentation

Sistema de Check-in/Check-out de Voluntários - Igreja Central

## 🔗 Visão Geral

A API utiliza **Google Apps Script** como backend, conectando-se ao **Google Sheets** como banco de dados. Todas as operações são realizadas via HTTP requests para o endpoint do Apps Script.

## 🏗️ Arquitetura

```
PWA Frontend ↔ Google Apps Script ↔ Google Sheets
```

- **Frontend:** Vanilla JavaScript PWA
- **Backend:** Google Apps Script (serverless)
- **Database:** Google Sheets (planilha)
- **Auth:** Google OAuth (opcional)

## 📡 Endpoint Base

```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

## 🔐 Autenticação

### Desenvolvimento
- Endpoint público para testes
- Sem autenticação necessária

### Produção
- Google OAuth 2.0
- Permissões específicas por usuário
- Rate limiting automático

## 📋 Endpoints

### 1. Test Connection

**GET** `/test`

Testa conectividade com a API.

```javascript
// Request
fetch(`${API_BASE_URL}?action=test`)

// Response
{
  "success": true,
  "message": "API funcionando",
  "timestamp": "2024-08-24T21:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Get Statistics

**GET** `/stats`

Retorna estatísticas do sistema.

```javascript
// Request
fetch(`${API_BASE_URL}?action=stats`)

// Response
{
  "success": true,
  "data": {
    "present": 12,      // Voluntários presentes
    "today": 25,        // Check-ins hoje
    "pending": 8        // Itens pendentes
  }
}
```

### 3. Search Volunteer

**GET** `/search?query={query}`

Busca voluntário por nome ou telefone.

```javascript
// Request
fetch(`${API_BASE_URL}?action=search&query=João`)

// Response - Encontrado
{
  "success": true,
  "data": {
    "nome": "João Silva",
    "telefone": "(11) 99999-9999",
    "data": "24/08/2024",
    "hora": "09:30",
    "sessao": "1º Culto",
    "itens": ["Microfone", "Tablet", "Outros: Cabo HDMI"]
  }
}

// Response - Não encontrado
{
  "success": false,
  "message": "Voluntário não encontrado"
}
```

### 4. Submit Check-in

**POST** `/checkin`

Registra entrada de voluntário.

```javascript
// Request
fetch(`${API_BASE_URL}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'checkin',
    data: {
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      sessao: "1º Culto",
      itens: ["Microfone", "Tablet"],
      outros: "Cabo HDMI",
      data: "24/08/2024",
      hora: "09:30",
      timestamp: "2024-08-24T12:30:00.000Z"
    }
  })
})

// Response - Sucesso
{
  "success": true,
  "message": "Check-in realizado com sucesso",
  "data": {
    "id": "row_123",
    "nome": "João Silva"
  }
}

// Response - Erro (duplicado)
{
  "success": false,
  "message": "Voluntário já fez check-in hoje",
  "error": "duplicate_entry"
}
```

### 5. Submit Check-out

**POST** `/checkout`

Registra saída de voluntário.

```javascript
// Request
fetch(`${API_BASE_URL}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'checkout',
    data: {
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      originalData: "24/08/2024",
      originalHora: "09:30",
      returnedItems: ["Microfone", "Tablet"],
      pendingItems: ["Outros: Cabo HDMI"],
      checkoutData: "24/08/2024",
      checkoutHora: "12:30",
      timestamp: "2024-08-24T15:30:00.000Z"
    }
  })
})

// Response
{
  "success": true,
  "message": "Check-out realizado com sucesso",
  "data": {
    "returnedCount": 2,
    "pendingCount": 1
  }
}
```

### 6. Get Cached Volunteers

**GET** `/volunteers?query={query}`

Retorna lista de voluntários para autocomplete.

```javascript
// Request
fetch(`${API_BASE_URL}?action=volunteers&query=Jo`)

// Response
{
  "success": true,
  "data": [
    {
      "nome": "João Silva",
      "telefone": "(11) 99999-9999"
    },
    {
      "nome": "José Santos",
      "telefone": "(11) 88888-8888"
    }
  ]
}
```

### 7. Sync Offline Data

**POST** `/sync`

Sincroniza dados salvos offline.

```javascript
// Request
fetch(`${API_BASE_URL}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'sync',
    data: [
      {
        type: 'checkin',
        timestamp: '2024-08-24T10:00:00.000Z',
        data: { /* dados do check-in */ }
      },
      {
        type: 'checkout', 
        timestamp: '2024-08-24T14:00:00.000Z',
        data: { /* dados do check-out */ }
      }
    ]
  })
})

// Response
{
  "success": true,
  "message": "Dados sincronizados",
  "data": {
    "synced": 2,
    "failed": 0
  }
}
```

## 📊 Google Sheets Structure

### Planilha: "Voluntários"

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| A | Data | Data do check-in |
| B | Hora Check-in | Horário de entrada |
| C | Nome | Nome do voluntário |
| D | Telefone | Telefone formatado |
| E | Sessão | 1º Culto, 2º Culto, etc. |
| F | Itens | Lista de itens separados por vírgula |
| G | Status | "Presente", "Saiu", "Pendente" |
| H | Hora Check-out | Horário de saída |
| I | Itens Devolvidos | Itens retornados |
| J | Itens Pendentes | Itens não devolvidos |
| K | Observações | Campo livre |

### Planilha: "Configurações"

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| A | Chave | Nome da configuração |
| B | Valor | Valor da configuração |

Configurações padrão:
- `church_name`: Nome da igreja
- `sessions`: Lista de sessões disponíveis
- `default_items`: Itens padrão para seleção
- `admin_emails`: Emails dos administradores

## 🔧 Implementação Frontend

### API Client (js/api.js)

```javascript
const API = {
  async testConnection() {
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}?action=test`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  },

  async submitCheckin(formData) {
    const response = await fetch(CONFIG.API.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkin',
        data: formData
      })
    });
    return await response.json();
  }
  
  // ... outros métodos
};
```

### Error Handling

```javascript
// Tratamento de erros padrão
try {
  const result = await API.submitCheckin(data);
  
  if (result.success) {
    // Sucesso
    UI.showToast('Sucesso', result.message, 'success');
  } else {
    // Erro da API
    throw new Error(result.message || 'Erro desconhecido');
  }
  
} catch (error) {
  // Erro de rede/conexão
  if (error.name === 'TypeError') {
    // Provavelmente offline
    await this.storeOfflineRequest(data);
    UI.showToast('Offline', 'Dados salvos localmente', 'warning');
  } else {
    // Outros erros
    UI.showToast('Erro', error.message, 'error');
  }
}
```

### Offline Support

```javascript
// Armazenar request offline
async storeOfflineRequest(data) {
  const requests = Utils.getStorageItem('offline_requests') || [];
  requests.push({
    ...data,
    timestamp: new Date().toISOString(),
    id: Utils.generateId()
  });
  Utils.setStorageItem('offline_requests', requests);
}

// Sincronizar quando voltar online
async syncOfflineData() {
  const requests = Utils.getStorageItem('offline_requests') || [];
  
  for (const request of requests) {
    try {
      await API.sync([request]);
      // Remover da lista local
    } catch (error) {
      // Manter na lista para tentar depois
    }
  }
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `duplicate_entry` | Voluntário já fez check-in |
| `not_found` | Voluntário não encontrado |
| `invalid_data` | Dados inválidos |
| `permission_denied` | Sem permissão |
| `rate_limit` | Muitas requisições |
| `server_error` | Erro interno |
| `network_error` | Erro de conexão |

## 📈 Rate Limiting

- **Desenvolvimento:** 100 requests/minuto
- **Produção:** 60 requests/minuto por IP
- **Burst:** Até 10 requests simultâneas

## 🔍 Debugging

### Console Logs

```javascript
// Habilitar logs detalhados
CONFIG.DEBUG = true;

// Logs automáticos
Utils.log('API Request', { url, method, data });
Utils.logError('API Error', error);
```

### Network Tab

1. F12 → Network
2. Filtrar por "script.google.com"
3. Verificar requests/responses
4. Analisar timing e erros

### Apps Script Logs

1. Abrir Google Apps Script
2. Executions → Ver logs
3. Stackdriver Logging para logs avançados

---

**Desenvolvido com ❤️ para a Igreja Central**
