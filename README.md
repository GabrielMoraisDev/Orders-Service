# Sistema de Ordem de Serviço (O.S)

## Visão Geral

Sistema completo de gerenciamento de Ordens de Serviço com backend Django e frontend Next.js.

## 🚀 Quick Start com Docker

Para rodar o projeto completo com Docker:

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 2. Inicie os containers
docker-compose up -d

# 3. Acesse as aplicações
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

**📖 Documentação completa do Docker:** Veja [DOCKER.md](DOCKER.md) para instruções detalhadas.

---

## Documentação Backend

Este documento especifica a estrutura do backend para o sistema de Ordem de Serviço (O.S), incluindo endpoints, relacionamentos de banco de dados e regras de negócio.

## Estrutura do Banco de Dados

### Tabela: users
```sql
- id (PK)
- name (VARCHAR)
- user (VARCHAR UNIQUE)
- password (VARCHAR HASHED)
- permission_group (ENUM: 'admin', 'common')
- sector (ENUM: 'marketing', 'infraestrutura', 'ti', 'manutenção', 'financeiro', 'comercial', 'compras', 'expedição', 'engenharia', 'portaria', 'limpeza', 'rh')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: service_orders
```sql
- id (PK)
- title (VARCHAR)
- description (TEXT)
- resolved (TEXT, NULLABLE) // Descrição da resolução
- start_date (DATE)
- predicted_date (DATE)
- completion_date (DATE, NULLABLE)
- days_delay (INT, CALCULATED)
- priority (ENUM: 'low', 'medium', 'high')
- status (ENUM: 'open', 'closed', 'unresolved')
- from_user_id (FK -> users.id)
- responsible_id (FK -> users.id, NULLABLE)
- rate (INT 1-5, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Relacionamentos

- **users.id** 1:N **service_orders.from_user_id** (Um usuário pode criar várias O.S)
- **users.id** 1:N **service_orders.responsible_id** (Um usuário pode ser responsável por várias O.S)

## Regras de Permissão

### Admin
- CRUD completo em todos os setores
- Pode visualizar e gerenciar todas as O.S do sistema
- Acesso total ao dashboard com dados de todos os setores

### Common
- CRUD apenas no próprio setor
- CREATE em outros setores (pode abrir O.S para outros setores)
- Visualiza apenas O.S relacionadas ao seu setor ou criadas por ele
- Dashboard limitado aos dados do seu setor

## Endpoints da API

### 1. Autenticação

#### POST /auth/login
**Payload:**
```json
{
  "user": "test",
  "password": "123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Rafhael",
  "jwt": "$ghpn%@d&f*gkl",
  "permission_group": "admin",
  "sector": "ti"
}
```

### 2. Ordem de Serviço

#### POST /service-orders
**Descrição:** Criar nova O.S !! Necessário um filtro para datas !!

**Payload:**
```json
{
  "title": "Formatação de computador",
  "description": "Preciso URGENTEMENTE formatar meu computador.",
  "start_date": "2025-01-09",
  "predicted_date": "2025-07-09",
  "priority": "high",
  "status": "open",
  "from_user_id": 1,
  "responsible_id": 3
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Ordem de serviço criada com sucesso"
}
```

**Notas:**
- `predicted_date` deve ser calculada por IA baseada no histórico
- `status` sempre inicia como "open"
- Validar se `responsible_id` existe e tem permissão no setor

#### GET /service-orders/:id
**Descrição:** Buscar O.S específica para conclusão !! Necessário um filtro para datas !!

**Response (200):**
```json
{
  "id": 1,
  "title": "Troca de lâmpada",
  "description": "Solicito a troca de lâmpada do Marketing",
  "start_date": "2025-08-31",
  "predicted_date": "2025-01-09",
  "days_delay": 1,
  "priority": "medium",
  "status": "open",
  "responsible_id": 2
}
```

**Notas:**
- `days_delay` calculado automaticamente: diferença entre data atual e `predicted_date`
- Apenas O.S com `status` "open" podem ser editadas

#### POST /service-orders/:id/complete
**Descrição:** Concluir uma O.S !! Necessário um filtro para datas !!

**Payload:**
```json
{
  "id": 1,
  "title": "Troca de lâmpada",
  "description": "Solicito a troca de lâmpada do Marketing",
  "resolved": "Troca de lâmpada concluída!",
  "start_date": "2025-08-31",
  "predicted_date": "2025-01-09",
  "days_delay": 1,
  "priority": "medium",
  "status": "closed",
  "responsible_id": 2
}
```

**Response (200):**
```json
{
  "message": "Ordem de serviço concluída com sucesso"
}
```

**Notas:**
- `completion_date` deve ser preenchida automaticamente com a data atual
- `status` alterado para "closed"
- Apenas o responsável pode concluir a O.S

#### GET /service-orders/completed
**Descrição:** Listar O.S concluídas para avaliação !! Necessário um filtro para datas !!

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Troca de lâmpada",
    "description": "Solicito a troca de lâmpada do Marketing",
    "start_date": "2025-08-31",
    "predicted_date": "2025-01-09",
    "days_delay": 1,
    "priority": "medium",
    "status": "closed",
    "responsible_id": 2
  }
]
```

#### PATCH /service-orders/:id/rate
**Descrição:** Avaliar O.S concluída

**Payload:**
```json
{
  "id": 1,
  "rate": 5
}
```

**Response (200):**
```json
{
  "message": "Avaliação registrada com sucesso"
}
```

**Notas:**
- `rate` deve ser entre 1 e 5
- Apenas O.S com `status` "closed" podem ser avaliadas
- Apenas o usuário que criou a O.S pode avaliar

### 3. Dashboard

#### GET /dashboard/sector/:sector
**Descrição:** Dados do dashboard por setor

**Response (200):**
```json
{
  "sector": "marketing",
  "total_os": 32,
  "resolved_os": 24,
  "delay_media_days": 4,
  "media_rate": 4.5
}
```

#### GET /dashboard/user/:userId
**Descrição:** Dados do dashboard por usuário

**Response (200):**
```json
{
  "user": 1,
  "total_os": 20,
  "resolved_os": 4,
  "delay_media_days": 15,
  "media_rate": 2
}
```

## Validações e Regras de Negócio

### Validações Gerais
- Todas as datas devem estar no formato YYYY-MM-DD
- `priority` deve ser um dos valores: 'low', 'medium', 'high'
- `status` deve ser um dos valores: 'open', 'closed', 'unresolved'
- `rate` deve ser um número inteiro entre 1 e 5

### Cálculos Automáticos
- `days_delay`: Diferença em dias entre `predicted_date` e data atual (se positivo, está em atraso)
- `delay_media_days`: Média de dias de atraso por setor/usuário
- `media_rate`: Média das avaliações recebidas

### Segurança
- Todas as rotas devem validar o JWT
- Verificar permissões de setor antes de permitir operações
- Senhas devem ser hasheadas no banco
- Logs de auditoria para operações críticas

### Códigos de Status HTTP
- 200: Sucesso
- 201: Criado com sucesso
- 400: Dados inválidos
- 401: Não autorizado
- 403: Sem permissão
- 404: Não encontrado
- 500: Erro interno do servidor

## Observações Importantes

1. A IA para cálculo de `predicted_date` deve considerar:
   - Histórico de conclusão por setor
   - Prioridade da O.S
   - Carga de trabalho atual do responsável

2. O sistema deve manter logs de auditoria para rastreabilidade

3. Implementar paginação nas listagens de O.S

4. Considerar implementar notificações para O.S próximas do prazo
