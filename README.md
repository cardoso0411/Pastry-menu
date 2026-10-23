# 🥟 Pastry Menu

### Cardápio Digital e Gestão Inteligente

**Modernizando o atendimento de estabelecimentos alimentícios por meio da tecnologia.**

---

## 📌 Sobre o Projeto

O **Pastry Menu** é uma plataforma de cardápio digital projetada para modernizar o atendimento em estabelecimentos alimentícios, com foco inicial em uma pastelaria.

A solução busca facilitar a consulta de produtos, preços, imagens e descrições, além de apoiar a organização do atendimento e dos pedidos.

O projeto tem como princípios a praticidade, a usabilidade e a eficiência operacional.

## 🎯 Objetivos

- **Digitalizar o cardápio:** facilitar a consulta aos produtos e suas informações.
- **Melhorar a experiência do cliente:** oferecer uma interface intuitiva e acessível.
- **Organizar o atendimento:** apoiar o fluxo de pedidos do estabelecimento.
- **Facilitar a gestão:** estabelecer uma base para o gerenciamento de produtos e informações.

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia | Finalidade                                |
| ---------- | ----------------------------------------- |
| React      | Construção da interface.                  |
| TypeScript | Tipagem estática e organização do código. |
| Vite       | Ambiente de desenvolvimento e compilação. |
| Axios      | Requisições HTTP.                         |

### Backend

| Tecnologia | Finalidade                              |
| ---------- | --------------------------------------- |
| Node.js    | Ambiente de execução JavaScript.        |
| Express    | Desenvolvimento de APIs.                |
| MySQL2     | Conexão com banco de dados MySQL.       |
| dotenv     | Gerenciamento de variáveis de ambiente. |

### Ferramentas de Desenvolvimento

- **Git:** controle de versão.
- **GitHub:** hospedagem e gerenciamento do código-fonte.
- **Visual Studio Code:** edição e análise do código.

## 🏗️ Estrutura do Projeto
```
Pastry-menu/
├── Backend/
│ ├── src/
│ ├── database/
│ ├── backend.env.example
│
├── Frontend/
│ ├── src/
│ │ ├── App.tsx
│ │ ├── index.css
│ │ ├── main.tsx
│ │ └── vite-env.d.ts
│ ├── index.html
│ ├── package.json
│ ├── tsconfig.json
│ ├── tsconfig.app.json
│ ├── tsconfig.node.json
│ └── vite.config.ts
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```
## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js compatível com as dependências do projeto.
- npm.
- MySQL para os endpoints da API.

### 1. Clonar o repositório

git clone https://github.com/cardoso0411/Pastry-menu.git

### 2. Acessar a pasta do projeto

cd Pastry-menu

### 3. Instalar as dependências

npm install

O npm instala as dependências da raiz, de `Backend` e de `Frontend` pelos workspaces.

### 4. Configurar o backend

Copie `Backend/backend.env.example` para `Backend/backend.env` e ajuste as credenciais do MySQL e `PEDIDO_TOKEN_SECRET`. Crie o banco `pastry_menu` e execute `Backend/database/schema.sql` nele. O backend precisa acessar esse banco para iniciar.

### 5. Iniciar frontend e backend

npm run dev

O `concurrently` inicia a API na porta 3001 e o Vite na porta indicada no terminal (normalmente 5173). Execute o comando na raiz do projeto. O frontend encaminha `/api` para o backend. Para iniciar cada serviço separadamente, use `npm run dev:backend` ou `npm run dev:frontend`.

## 🗺️ Futuras Melhorias

### 🟢 Curto Prazo — Funcionalidades Essenciais

- [ ] Finalizar e validar o backend.
- [ ] Integrar o banco de dados MySQL.
- [ ] Implementar o gerenciamento de produtos.
- [ ] Implementar o registro e o acompanhamento de pedidos.
- [ ] Separar as áreas pública e administrativa.
- [ ] Validar formulários e tratar erros.

### 🟡 Médio Prazo — Segurança e Qualidade

- [ ] Implementar autenticação e controle de permissões.
- [ ] Criar testes automatizados.
- [ ] Documentar a API.
- [ ] Aprimorar acessibilidade e responsividade.
- [ ] Avaliar a utilização de Docker e GitHub Actions.

### 🔵 Longo Prazo — Gestão e Expansão

- [ ] Implementar controle de estoque.
- [ ] Desenvolver relatórios e indicadores de vendas.
- [ ] Avaliar a impressão e as notificações de pedidos.
- [ ] Melhorar monitoramento e desempenho.
- [ ] Avaliar integrações com serviços externos.

> As melhorias representam objetivos futuros e poderão ser ajustadas conforme as prioridades e o escopo do projeto.

## 🤝 Contribuição

As contribuições devem priorizar a organização do código, a clareza das alterações e a qualidade da aplicação.

1. Discuta mudanças relevantes com a equipe.
2. Desenvolva as alterações em uma branch apropriada.
3. Teste as modificações.
4. Descreva as alterações realizadas em um Pull Request.

## Desenvolvedores

- Bruno Cardoso
- Wilciano Nascimento
- Victor Hernandez
- Gustavo Oliveira

---

<div align="center">

**Pastry Menu**

_Praticidade no atendimento. Organização na gestão. Tecnologia a favor da experiência do cliente._

</div>
