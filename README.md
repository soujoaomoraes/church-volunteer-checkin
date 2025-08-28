# Sistema de Check-in/Checkout de Voluntários - Paz Church

Este projeto é um sistema web para o controle de check-in e checkout de voluntários e o gerenciamento de materiais (crachás, rádios, etc.) para a Igreja Paz Church. A aplicação foi projetada para funcionar 100% offline e é construída com tecnologias web gratuitas.

## Tecnologias Principais

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Banco de Dados:** IndexedDB (nativo do navegador)
- **Hospedagem:** GitHub Pages
- **Ambiente de Dev:** Node.js para servidor local e gerenciamento de pacotes.

## Configuração do Ambiente de Desenvolvimento

Para configurar o ambiente de desenvolvimento local, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_REPOSITORIO]
    cd church-volunteer-checkin
    ```

2.  **Instale as dependências:**
    O projeto usa o `npm` para gerenciar pacotes de desenvolvimento (atualmente, apenas para o servidor local). Execute o comando na raiz do projeto:
    ```bash
    npm install
    ```

## Executando o Servidor Local

Para visualizar e testar a aplicação, inicie o servidor local. Este comando utiliza o pacote `serve` para hospedar os arquivos do projeto.

```bash
npm start
```

Após a execução, o servidor estará disponível em `http://localhost:3000` (ou em outra porta, se a 3000 estiver ocupada).

## Executando os Testes

O projeto possui uma suíte de testes unitários para garantir a qualidade e o funcionamento do core do sistema.

1.  Certifique-se de que o servidor local esteja rodando (`npm start`).
2.  Abra o seguinte arquivo no seu navegador:
    [http://localhost:3000/assets/js/tests/test-runner.html](http://localhost:3000/assets/js/tests/test-runner.html)

Os resultados dos testes serão exibidos na página e detalhados no console do desenvolvedor (F12).

## Estrutura do Projeto

```
church-volunteer-checkin/
├── assets/                # Arquivos públicos (CSS, JS, imagens)
│   ├── css/               # Estilos
│   └── js/                # Scripts
│       ├── components/    # Componentes de UI (futuro)
│       ├── services/      # Lógica de negócio (ex: VolunteerService)
│       ├── utils/         # Funções auxiliares, validação, etc.
│       └── tests/         # Testes unitários e executor
├── .docs/                 # Documentação detalhada do projeto
├── node_modules/          # Dependências de desenvolvimento
├── index.html             # Ponto de entrada da aplicação
├── package.json           # Definições do projeto Node.js
└── README.md              # Este arquivo
```

## Documentação Detalhada

Para um entendimento aprofundado da arquitetura, requisitos e decisões de design, consulte a documentação na pasta `.docs/`.
