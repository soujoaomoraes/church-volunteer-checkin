# 🏛️ Sistema de Check-in/Check-out - Igreja Central

Sistema PWA (Progressive Web App) para controle de entrada e saída de voluntários da igreja, com rastreamento de equipamentos e funcionalidade offline.

## 🚀 Características

- **📱 PWA Nativo**: Instalável em dispositivos móveis e desktop
- **🌐 Offline-First**: Funciona sem conexão à internet
- **📊 Google Sheets**: Backend integrado com planilhas Google
- **⚡ Zero Dependências**: Vanilla JavaScript puro
- **🎨 Mobile-First**: Interface otimizada para tablets e smartphones
- **🔄 Sync Automático**: Sincronização automática quando online
- **🔔 Notificações**: Toast messages e feedback visual
- **♿ Acessível**: Suporte completo a leitores de tela

## 🏗️ Arquitetura

```
PWA Frontend ↔ Google Apps Script ↔ Google Sheets
```

- **Frontend**: Vanilla JavaScript PWA
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **Hosting**: GitHub Pages (gratuito)
- **Cache**: Service Worker + IndexedDB

## 📁 Estrutura do Projeto

```
├── index.html          # Página principal do PWA
├── sw.js               # Service Worker
├── manifest.json       # Manifesto PWA
├── package.json        # Scripts e dependências de dev
├── css/
│   └── styles.css      # Sistema de design CSS
├── js/
│   ├── app.js          # Inicialização da aplicação
│   ├── config.js       # Configurações centrais
│   ├── utils.js        # Funções utilitárias
│   ├── validation.js   # Validação de formulários
│   ├── api.js          # Integração com Google Apps Script
│   ├── ui.js           # Controle de interface
│   ├── checkin.js      # Lógica de check-in
│   └── checkout.js     # Lógica de check-out
├── assets/
│   ├── icons/          # Ícones PWA
│   └── images/         # Imagens do app
└── docs/               # Documentação completa
    ├── SETUP.md        # Guia de instalação
    ├── API.md          # Documentação da API
    └── CHANGELOG.md    # Histórico de mudanças
```

## ⚡ Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/church-volunteer-checkin.git
cd church-volunteer-checkin
```

### 2. Instale Dependências (Desenvolvimento)

```bash
npm install
```

### 3. Execute Localmente

```bash
npm start
# ou
npm run dev
```

Acesse: `http://localhost:8080`

### 4. Build para Produção

```bash
npm run build
```

## 🔧 Configuração

### Frontend (js/config.js)

```javascript
const CONFIG = {
  CHURCH: {
    NAME: 'Igreja Central',
    SESSIONS: ['1º Culto', '2º Culto', 'Escola Bíblica']
  },
  API: {
    BASE_URL: 'https://script.google.com/macros/s/{SCRIPT_ID}/exec'
  }
};
```

### Backend (Google Apps Script)

1. Crie uma nova planilha Google Sheets
2. Abra Apps Script (`script.google.com`)
3. Implemente os endpoints da API
4. Publique como web app
5. Configure as permissões

Ver [docs/API.md](docs/API.md) para detalhes completos.

## 📱 Funcionalidades

### ✅ Check-in de Voluntários
- Formulário com validação em tempo real
- Seleção de equipamentos
- Formatação automática de telefone
- Autocomplete de nomes

### ✅ Check-out de Voluntários
- Busca por nome ou telefone
- Controle de devolução de itens
- Rastreamento de pendências
- Histórico de atividades

### ✅ Funcionalidade Offline
- Cache inteligente de recursos
- Armazenamento local de dados
- Sincronização automática
- Indicadores de status de conexão

### ✅ Interface Responsiva
- Design mobile-first
- Suporte a touch e teclado
- Modo escuro automático
- Acessibilidade completa

## 🚀 Deploy

### GitHub Pages (Recomendado)

1. **Configure o repositório:**
   ```bash
   git add .
   git commit -m "Deploy PWA"
   git push origin main
   ```

2. **Ative GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: main / root

3. **Configure domínio personalizado (opcional):**
   - Adicione arquivo `CNAME`
   - Configure DNS do domínio

### Outros Provedores

- **Netlify**: Arraste a pasta do projeto
- **Vercel**: Conecte o repositório GitHub
- **Firebase Hosting**: `firebase deploy`

Ver [docs/SETUP.md](docs/SETUP.md) para instruções detalhadas.

## 🔒 Segurança

- **HTTPS obrigatório** para funcionalidade PWA
- **CSP headers** recomendados
- **Rate limiting** no Google Apps Script
- **Validação** client-side e server-side
- **Sanitização** de dados de entrada

## 🧪 Testes

```bash
# Servidor de desenvolvimento
npm run dev

# Teste PWA (HTTPS)
npm run serve:https

# Validação de código
npm run lint

# Teste de performance
npm run lighthouse
```

## 📊 Monitoramento

- **Google Analytics**: Métricas de uso
- **Lighthouse**: Performance e PWA score
- **Apps Script Logs**: Debugging backend
- **Browser DevTools**: Debug frontend

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Documentação

- **[SETUP.md](docs/SETUP.md)**: Guia completo de instalação
- **[API.md](docs/API.md)**: Documentação da API
- **[CHANGELOG.md](docs/CHANGELOG.md)**: Histórico de mudanças

## 🐛 Problemas Conhecidos

- Service Worker requer HTTPS em produção
- IndexedDB não funciona em modo privado
- Push notifications requerem configuração adicional

Ver [docs/SETUP.md#troubleshooting](docs/SETUP.md#troubleshooting) para soluções.

## 🗺️ Roadmap

- [ ] **Backend**: Google Apps Script API
- [ ] **Database**: Configuração Google Sheets
- [ ] **Auth**: Sistema de autenticação
- [ ] **Icons**: Criação de ícones PWA
- [ ] **Tests**: Testes automatizados
- [ ] **CI/CD**: Pipeline de deploy
- [ ] **Analytics**: Dashboard de relatórios
- [ ] **Push**: Notificações push
- [ ] **Multi-church**: Suporte múltiplas igrejas

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Créditos

Desenvolvido com ❤️ para a **Igreja Central**

- **Tecnologias**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Google Apps Script, Google Sheets
- **Hosting**: GitHub Pages
- **Design**: Mobile-first, Acessível

---

**📱 Instale o app:** Visite o site no seu dispositivo e clique em "Instalar" ou "Adicionar à tela inicial"
