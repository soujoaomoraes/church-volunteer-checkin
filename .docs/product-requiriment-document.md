# PRD - Sistema de Checkin/Checkout de Voluntários
## Igreja Paz Church

### 1. Visão Geral do Produto

**Nome do Produto:** Sistema de Controle de Voluntários e Materiais - Paz Church

**Objetivo:** Desenvolver uma aplicação web para controle eficiente de entrada/saída de voluntários e gestão de materiais emprestados durante os eventos da igreja, utilizando tecnologias gratuitas (GitHub Pages + IndexedDB).

**Problema Resolvido:** 
- Falta de controle sobre quais voluntários estão servindo
- Perda ou esquecimento de materiais (crachás, rádios, etc.)
- Dificuldade para rastrear responsabilidades por equipamentos
- Processo manual propenso a erros

### 2. Objetivos e Métricas de Sucesso

**Objetivos Principais:**
- Reduzir em 90% a perda de materiais da igreja
- Eliminar conflitos sobre responsabilidade por equipamentos
- Agilizar o processo de checkin/checkout em 70%
- Ter visibilidade completa dos voluntários ativos

**Métricas de Sucesso:**
- Tempo médio de checkin: < 30 segundos
- Tempo médio de checkout: < 20 segundos
- Taxa de devolução de materiais: > 95%
- Satisfação dos coordenadores: > 4.5/5

### 3. Personas e Casos de Uso

**Persona Principal: Coordenador de Voluntários**
- Responsável por registrar entrada/saída dos voluntários
- Controla empréstimo de materiais
- Precisa de interface simples e rápida

**Persona Secundária: Pastor/Líder**
- Visualiza relatórios de voluntários ativos
- Acompanha uso de materiais
- Toma decisões baseadas nos dados

**Casos de Uso Principais:**
1. Registrar chegada de voluntário com materiais
2. Registrar saída de voluntário com devolução
3. Consultar voluntários atualmente servindo
4. Visualizar materiais emprestados
5. Gerar relatórios de atividade

### 4. Funcionalidades Detalhadas

#### 4.1 Módulo de Checkin
**Funcionalidades:**
- Registrar novo voluntário (Nome, Ministério, etc.).
- Selecionar múltiplos materiais emprestados.
- Registrar horário automático de entrada.
- Confirmar checkin com um único clique, que realiza o registro e o check-in.

**Campos Obrigatórios:**
- Nome completo do voluntário
- Pelo menos um material selecionado
- Ministério/área de atuação

**Campos Opcionais:**
- Telefone
- Observações especiais

#### 4.2 Módulo de Checkout
**Funcionalidades:**
- Buscar voluntário ativo por nome
- Visualizar materiais emprestados
- Confirmar devolução de cada item
- Registrar horário automático de saída
- Marcar itens não devolvidos com motivo

**Validações:**
- Só permite checkout de voluntários com checkin ativo
- Obriga confirmação de cada material
- Registra observações para itens não devolvidos

#### 4.3 Dashboard de Controle
**Funcionalidades:**
- Lista de voluntários atualmente servindo
- Status de cada material (disponível/emprestado/perdido)
- Contadores em tempo real
- Busca e filtros avançados

**Métricas Exibidas:**
- Total de voluntários ativos
- Materiais em circulação
- Materiais disponíveis
- Tempo médio de serviço

#### 4.4 Gestão de Materiais
**Funcionalidades:**
- Cadastro de novos tipos de materiais
- Controle de quantidade por item
- Status de conservação
- Histórico de uso por material

**Materiais Padrão:**
- Crachás (numerados)
- Rádios (com código)
- Chaves de salas
- Equipamentos A/V
- Materiais de limpeza

#### 4.5 Relatórios
**Relatórios Disponíveis:**
- Voluntários por período
- Uso de materiais por data
- Itens não devolvidos
- Tempo de serviço por voluntário
- Relatório mensal consolidado

**Formatos de Exportação:**
- Visualização web
- Download CSV
- Impressão formatada

### 5. Especificações Técnicas

#### 5.1 Arquitetura
**Frontend:** 
- HTML5, CSS3, JavaScript ES6+
- Framework: Vanilla JS ou Vue.js (CDN)
- UI: CSS moderno com Flexbox/Grid
- Responsivo para tablets

**Banco de Dados:**
- IndexedDB para persistência local
- Estrutura de dados JSON
- Backup/sincronização via GitHub API (opcional)

**Hospedagem:**
- GitHub Pages (gratuito)
- Domínio personalizado (opcional)
- HTTPS automático

#### 5.2 Estrutura de Dados

```javascript
// Voluntário
{
  id: "uuid",
  nome: "string",
  telefone: "string?",
  ministerio: "string",
  ativo: boolean,
  checkinAtivo: {
    dataHora: "datetime",
    materiais: ["array de IDs"],
    observacoes: "string?"
  }
}

// Material
{
  id: "uuid",
  nome: "string",
  codigo: "string?",
  tipo: "cracha|radio|chave|equipamento",
  status: "disponivel|emprestado|manutencao|perdido",
  emprestadoPara: "voluntario_id?",
  dataEmprestimo: "datetime?",
  observacoes: "string?"
}

// Registro de Atividade
{
  id: "uuid",
  voluntarioId: "string",
  tipo: "checkin|checkout",
  dataHora: "datetime",
  materiais: ["array de objetos"],
  observacoes: "string?"
}
```

#### 5.3 Funcionalidades Técnicas
- **Offline First:** Funciona sem internet
- **PWA:** Instalável como app
- **Busca Inteligente:** Fuzzy search para nomes
- **Backup Automático:** Export/import de dados
- **Validações:** Prevenção de dados inconsistentes

### 6. Interface do Usuário

#### 6.1 Tela Principal (Dashboard)
- Header com logo da igreja e hora atual
- Cards com métricas principais
- Botões grandes para "Checkin" e "Checkout"
- Lista de voluntários ativos (sidebar)

#### 6.2 Tela de Checkin
- Campo de busca de voluntário (destaque)
- Lista de materiais com checkboxes
- Contador de materiais selecionados
- Botão "Confirmar Checkin" (verde, grande)

#### 6.3 Tela de Checkout
- Busca de voluntário ativo
- Lista de materiais emprestados
- Checkboxes de confirmação de devolução
- Campo para observações
- Botão "Finalizar Checkout" (azul, grande)

#### 6.4 Design System
**Cores:**
- Primária: #2563eb (azul)
- Secundária: #10b981 (verde)
- Alerta: #f59e0b (amarelo)
- Perigo: #ef4444 (vermelho)

**Tipografia:**
- Títulos: Inter, bold
- Texto: Inter, regular
- Tamanhos: 14px, 16px, 20px, 24px

### 7. Fluxos de Usuário

#### 7.1 Fluxo de Checkin
1. O usuário acessa a tela de "Checkin".
2. Preenche os dados do voluntário (Nome, Ministério).
3. Seleciona os materiais necessários na grade.
4. Clica em "Confirmar Checkin".
5. O sistema cria o voluntário e processa o check-in simultaneamente.
6. O sistema mostra uma confirmação e limpa o formulário.

#### 7.2 Fluxo de Checkout
1. Usuário acessa tela principal
2. Clica em "Checkout"
3. Busca voluntário ativo
4. Confirma devolução de cada material
5. Adiciona observações se necessário
6. Finaliza checkout
7. Sistema atualiza status

### 8. Requisitos Não-Funcionais

**Performance:**
- Carregamento inicial < 3s
- Operações CRUD < 500ms
- Suporte para 100+ voluntários simultâneos

**Usabilidade:**
- Interface intuitiva (< 5min treinamento)
- Acessibilidade WCAG 2.1 AA
- Suporte para dispositivos touch

**Confiabilidade:**
- Uptime 99.9% (limitado ao GitHub Pages)
- Backup automático semanal
- Recuperação de dados em caso de falha

**Segurança:**
- Dados armazenados localmente
- Sem transmissão de dados sensíveis
- Acesso controlado (senha simples)

### 9. Roadmap de Desenvolvimento

#### Fase 1 (MVP - 2 semanas)
- [ ] Estrutura básica HTML/CSS
- [ ] Configuração IndexedDB
- [ ] Funcionalidades de checkin/checkout
- [ ] Lista de voluntários ativos

#### Fase 2 (Melhorias - 1 semana)
- [ ] Dashboard com métricas
- [ ] Gestão de materiais
- [ ] Busca avançada
- [ ] Responsividade mobile

#### Fase 3 (Avançado - 1 semana)
- [ ] Relatórios básicos
- [ ] Export/import dados
- [ ] PWA features
- [ ] Melhorias de UX

#### Fase 4 (Futuras - backlog)
- [ ] Integração com Google Sheets
- [ ] Notificações push
- [ ] Multi-igreja (tenant)
- [ ] App mobile nativo

### 10. Critérios de Aceitação

**Para Checkin:**
- ✅ Voluntário pode ser encontrado em < 3 caracteres
- ✅ Múltiplos materiais podem ser selecionados
- ✅ Confirmação clara do checkin realizado
- ✅ Horário registrado automaticamente

**Para Checkout:**
- ✅ Apenas voluntários ativos aparecem na busca
- ✅ Materiais emprestados são listados corretamente
- ✅ Devolução pode ser confirmada item por item
- ✅ Status é atualizado imediatamente

**Para Dashboard:**
- ✅ Métricas atualizadas em tempo real
- ✅ Lista de voluntários ativos precisa
- ✅ Interface responsiva em tablets
- ✅ Performance adequada com 50+ registros

### 11. Riscos e Mitigações

**Riscos Técnicos:**
- **Limitações IndexedDB:** Testar limites de armazenamento
- **Performance em dispositivos antigos:** Otimizar código JS
- **Perda de dados:** Implementar backup automático

**Riscos de Produto:**
- **Adoção pelos usuários:** Treinamento e documentação
- **Resistência à mudança:** Demonstrar benefícios claros
- **Funcionalidades insuficientes:** Feedback constante dos usuários

### 12. Recursos Necessários

**Desenvolvimento:**
- 1 Desenvolvedor Frontend (40h)
- 1 Designer UI/UX (8h - opcional)

**Infraestrutura:**
- Conta GitHub (gratuita)
- Domínio personalizado (R$ 50/ano - opcional)

**Outros:**
- Dispositivo tablet para testes (existente)
- Feedback de 3-5 coordenadores

### 13. Success Metrics Pós-Lançamento

**Métricas Operacionais (1 mês):**
- 90% dos checkins realizados pelo sistema
- < 5% de materiais não devolvidos
- 95% satisfação dos coordenadores

**Métricas de Adoção (3 meses):**
- 100% dos eventos usando o sistema
- 0 registros em papel
- 2+ relatórios gerados por mês

**Métricas de Impacto (6 meses):**
- 50% redução no tempo de organização pré-evento
- 80% redução em conflitos sobre materiais
- ROI positivo em economia de tempo