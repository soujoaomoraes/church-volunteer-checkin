# Setup Guide

Sistema de Check-in/Check-out de Voluntários - Igreja Central

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 16+ (para desenvolvimento local)
- **Git** (para controle de versão)
- **Navegador moderno** (Chrome 80+, Firefox 75+, Safari 13+)

### Instalação Local

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/church-volunteer-checkin.git
cd church-volunteer-checkin

# 2. Instalar dependências de desenvolvimento
npm install

# 3. Executar servidor local
npm start

# 4. Abrir no navegador
# http://localhost:8000
```

## 📁 Estrutura do Projeto

```
├── index.html         # Página principal da PWA
├── sw.js             # Service Worker para cache offline
├── manifest.json     # Manifest PWA
├── robots.txt        # SEO configuration
├── package.json      # Scripts de desenvolvimento
├── css/
│   └── styles.css    # Design system completo
├── js/
│   ├── app.js        # Aplicação principal
│   ├── config.js     # Configurações
│   ├── utils.js      # Utilitários
│   ├── validation.js # Validações
│   ├── api.js        # API Google Apps Script
│   ├── ui.js         # Interface
│   ├── checkin.js    # Módulo check-in
│   └── checkout.js   # Módulo check-out
├── assets/
│   ├── icons/        # Ícones PWA
│   └── images/       # Imagens
└── docs/             # Documentação
```

## 🔧 Scripts Disponíveis

```bash
# Servidor de desenvolvimento
npm start
npm run dev

# Servidor de produção
npm run serve

# Limpeza (remover arquivos antigos)
./cleanup.sh
```

## 🌐 Deploy

### GitHub Pages

1. **Configurar repositório:**
   ```bash
   git add .
   git commit -m "feat: PWA implementation"
   git push origin main
   ```

2. **Ativar GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: main / (root)

3. **Configurar domínio personalizado (opcional):**
   - Adicionar arquivo `CNAME` com seu domínio
   - Configurar DNS para apontar para GitHub Pages

### Outros Provedores

- **Netlify:** Arraste a pasta do projeto
- **Vercel:** Conecte o repositório GitHub
- **Firebase Hosting:** `firebase deploy`

## ⚙️ Configuração

### 1. Google Apps Script Backend

Edite `js/config.js`:

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec',
        // ... outras configurações
    }
};
```

### 2. Informações da Igreja

Atualize em `js/config.js`:

```javascript
const CONFIG = {
    CHURCH: {
        NAME: 'Sua Igreja',
        ADDRESS: 'Endereço da Igreja',
        // ... outras informações
    }
};
```

### 3. Ícones PWA

Substitua os ícones em `assets/icons/`:
- `favicon.ico` (16x16, 32x32, 48x48)
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)

## 🔒 Segurança

### HTTPS Obrigatório

PWAs requerem HTTPS para funcionar. Certifique-se de que:

- ✅ Certificado SSL válido
- ✅ Redirect HTTP → HTTPS
- ✅ HSTS headers configurados

### Content Security Policy

Adicione headers CSP no servidor:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://script.google.com; connect-src 'self' https://script.google.com;
```

## 📱 Teste PWA

### Chrome DevTools

1. F12 → Application → Service Workers
2. Verificar registro do SW
3. Application → Manifest
4. Lighthouse → PWA audit

### Instalação

- **Desktop:** Ícone de instalação na barra de endereços
- **Mobile:** Menu → "Adicionar à tela inicial"

## 🐛 Troubleshooting

### Service Worker não registra

```javascript
// Verificar no console
navigator.serviceWorker.getRegistrations().then(console.log);
```

### Cache não atualiza

```javascript
// Limpar cache manualmente
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
```

### Manifest inválido

- Validar em: https://manifest-validator.appspot.com/
- Verificar caminhos dos ícones
- Confirmar MIME types corretos

### Offline não funciona

1. Verificar Service Worker ativo
2. Confirmar arquivos no cache
3. Testar com DevTools offline

## 📊 Monitoramento

### Analytics

Adicione Google Analytics em `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Performance

- **Lighthouse:** Auditoria automática
- **Web Vitals:** Core Web Vitals
- **Real User Monitoring:** Para dados reais

## 🔄 Atualizações

### Versionamento

1. Atualizar versão em `package.json`
2. Atualizar `CACHE_NAME` em `sw.js`
3. Documentar mudanças em `CHANGELOG.md`

### Deploy Automático

GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy PWA
on:
  push:
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
          publish_dir: ./
```

## 📞 Suporte

- **Documentação:** `/docs/`
- **Issues:** GitHub Issues
- **Email:** contato@suaigreja.com

---

**Desenvolvido com ❤️ para a Igreja Central**
