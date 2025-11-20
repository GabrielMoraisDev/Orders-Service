# Orders Manager - Frontend

Frontend desenvolvido em Next.js com TypeScript e Tailwind CSS para o sistema de gerenciamento de ordens de serviço.

## 🚀 Características

- **Next.js 15** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **Heroicons** para ícones
- **Autenticação JWT** com refresh tokens
- **Server Components** e **Client Components**
- **Design responsivo** e moderno
- **Interface profissional** com cores sérias

## 📋 Funcionalidades

### Autenticação
- Login com JWT
- Refresh automático de tokens
- Proteção de rotas
- Contexto de autenticação

### Dashboard
- Visão geral das ordens
- Estatísticas em tempo real
- Cards informativos
- Ordens recentes

### Gerenciamento de Ordens
- **CRUD completo**:
  - Criar nova ordem
  - Listar todas as ordens
  - Visualizar detalhes
  - Editar ordem existente
  - Excluir ordem

### Filtros e Busca
- Busca por texto (título/descrição)
- Filtro por status
- Filtro por prioridade
- Filtro por data de início
- Paginação

### Interface
- Layout responsivo com sidebar
- Componentes reutilizáveis
- Estados de loading
- Tratamento de erros
- Badges para status e prioridade
- Indicadores de atraso

## 🛠️ Tecnologias

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Heroicons**

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse http://localhost:3000

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

Certifique-se de que o backend Django esteja rodando em `http://localhost:8000`.

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── dashboard/         # Dashboard principal
│   ├── login/            # Página de login
│   ├── orders/           # Gestão de ordens
│   │   ├── new/         # Nova ordem
│   │   └── [id]/        # Detalhes e edição
│   └── reports/         # Relatórios
├── components/           # Componentes reutilizáveis
│   ├── auth/            # Componentes de autenticação
│   ├── dashboard/       # Componentes do dashboard
│   ├── layout/          # Layout e navegação
│   ├── orders/          # Componentes de ordens
│   └── ui/              # Componentes de interface
├── contexts/            # Contextos React
├── lib/                 # Utilitários e configurações
│   ├── api.ts          # Funções da API
│   ├── config.ts       # Configurações
│   ├── types.ts        # Tipos TypeScript
│   └── utils.ts        # Utilitários
└── public/             # Arquivos estáticos
```

## 🎨 Design System

### Cores Principais
- **Slate**: Tons de cinza para interface profissional
- **Blue**: Para elementos interativos
- **Green**: Para status positivos
- **Red**: Para alertas e status negativos
- **Yellow**: Para warnings e prioridade média

### Componentes

#### Badges
- **StatusBadge**: Para status das ordens
- **PriorityBadge**: Para prioridade das ordens

#### Layout
- **Sidebar**: Navegação lateral responsiva
- **PageHeader**: Cabeçalho das páginas
- **Card**: Container para conteúdo

#### Formulários
- **Button**: Botão com variantes
- **ServiceOrderForm**: Formulário completo de ordem

#### Dados
- **OrdersTable**: Tabela de ordens
- **Pagination**: Navegação entre páginas
- **StatsCards**: Cards de estatísticas

## 🔐 Autenticação

O sistema usa JWT tokens com refresh automático:

1. Login retorna `access` e `refresh` tokens
2. Access token é usado nas requisições
3. Refresh automático quando access expira
4. Logout limpa tokens do localStorage

## 📱 Responsividade

O design é totalmente responsivo:

- **Mobile**: Menu hambúrguer, layout empilhado
- **Tablet**: Sidebar colapsível, grids adaptáveis  
- **Desktop**: Sidebar fixa, layout completo

## 🔄 Estados da Aplicação

### Loading States
- Spinners durante carregamento
- Skeleton para tabelas
- Botões com loading

### Error States
- Mensagens de erro claras
- Botões para retry
- Fallbacks graceful

### Empty States
- Ilustrações para listas vazias
- Call-to-actions
- Mensagens orientativas

## 🎯 Próximos Passos

- [ ] Implementar notificações em tempo real
- [ ] Adicionar upload de arquivos
- [ ] Criar relatórios com gráficos
- [ ] Implementar filtros avançados
- [ ] Adicionar exports (PDF, Excel)
- [ ] Sistema de comentários
- [ ] Histórico de alterações
- [ ] Configurações de usuário
