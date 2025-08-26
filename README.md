
# 🏛️ Sistema de Check-in/Check-out - Igreja Central

Sistema PWA (Progressive Web App) para controle de entrada e saída de voluntários da igreja, com rastreamento de equipamentos e funcionalidade offline. **Agora 100% local, sem dependência de backend ou Google Sheets, usando IndexedDB para armazenamento robusto.**

## 🚀 Características

- **📱 PWA Nativo**: Instalável em dispositivos móveis e desktop
- **🌐 Offline-First**: Funciona sem conexão à internet
- **� IndexedDB**: Armazenamento local robusto, sem limite prático de registros
- **⚡ Zero Dependências**: Vanilla JavaScript puro
- **🎨 Mobile-First**: Interface otimizada para tablets e smartphones
- **🔄 Exportação CSV**: Backup e portabilidade dos dados direto do navegador
- **🔔 Notificações**: Toast messages e feedback visual
- **♿ Acessível**: Suporte completo a leitores de tela

## 🏗️ Arquitetura

```
PWA Frontend (Vanilla JS) + IndexedDB (local) + Service Worker
```

- **Frontend**: Vanilla JavaScript PWA
- **Database**: IndexedDB (no navegador)
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
│   ├── indexeddb.js    # Utilitário IndexedDB local
│   ├── api.js          # (Obsoleto) Integração antiga com Google Apps Script
│   ├── ui.js           # Controle de interface
│   ├── checkin.js      # Lógica de check-in
│   └── checkout.js     # Lógica de check-out
├── assets/
│   ├── icons/          # Ícones PWA
│   └── images/         # Imagens do app
└── docs/               # Documentação completa
  ├── CHANGELOG.md    # Histórico de mudanças
  ├── todo.md         # Próximos passos
  ├── status.md       # Status atual do projeto
```

## ⚡ Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/church-volunteer-checkin.git
cd church-volunteer-checkin
```

### 2. Deploy no GitHub Pages

Basta subir os arquivos para o repositório e ativar o GitHub Pages. Não há dependências de backend ou configuração extra.

## 🔧 Configuração

### Configuração

O sistema já está pronto para uso local. Basta abrir o `index.html` no navegador ou acessar via GitHub Pages.



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
- Armazenamento local de dados (IndexedDB)
- Exportação CSV para backup
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
  git commit -m "Deploy PWA local IndexedDB"
  git push origin main
  ```

2. **Ative GitHub Pages:**
  - Settings → Pages
  - Source: Deploy from branch
  - Branch: main / root

3. **Configure domínio personalizado (opcional):**
  - Adicione arquivo `CNAME`
  - Configure DNS do domínio

## 🔒 Segurança

- **HTTPS obrigatório** para funcionalidade PWA
- **CSP headers** recomendados
- **Validação** client-side
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

- **[CHANGELOG.md](docs/CHANGELOG.md)**: Histórico de mudanças
- **[todo.md](docs/todo.md)**: Próximos passos
- **[status.md](docs/status.md)**: Status atual do projeto

## 🐛 Problemas Conhecidos

- Service Worker requer HTTPS em produção
- IndexedDB pode não funcionar em modo privado em alguns navegadores
- Push notifications requerem configuração adicional

## 🗺️ Roadmap

- [ ] **Importação de CSV**: Restaurar dados
- [ ] **Melhorias de UX para IndexedDB**
- [ ] **Testes automatizados**
- [ ] **CI/CD**: Pipeline de deploy
- [ ] **Analytics**: Dashboard de relatórios
- [ ] **Push**: Notificações push
- [ ] **Multi-church**: Suporte múltiplas igrejas

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Créditos

Desenvolvido com ❤️ para a **Igreja Central**

- **Tecnologias**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: (Removido) Google Apps Script, Google Sheets
- **Hosting**: GitHub Pages
- **Design**: Mobile-first, Acessível

---

**📱 Instale o app:** Visite o site no seu dispositivo e clique em "Instalar" ou "Adicionar à tela inicial"
