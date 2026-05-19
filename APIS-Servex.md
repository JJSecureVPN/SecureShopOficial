# 📡 Documentação Oficial da API Servex

Esta documentação detalha todos os endpoints e integrações da API da **Servex.ws**, cobrindo o gerenciamento de clientes, revendedores, categorias e conexões em tempo real via WebSockets.

---

## 🔑 Informações Gerais e Autenticação

*   **URL Base da API:** `https://servex.ws/api`
*   **URL Base do WebSocket:** `wss://front.servex.ws`
*   **Headers Obrigatórios:**
    ```http
    Authorization: Bearer <SUA_API_KEY>
    Content-Type: application/json
    Accept: application/json
    ```

> [!NOTE]
> Dependendo do nível da sua chave de API (**Admin** ou **Revendedor/Reseller**), alguns endpoints ou escopos podem ter acesso restrito. O escopo padrão geralmente é `'meus'` (apenas dados vinculados ao dono da chave).

---

## 👥 Gerenciamento de Clientes (Clients)

Endpoints para criar, listar, atualizar, suspender e renovar contas de usuários VPN e testes rápidos.

### 1. Listar Clientes
`GET /clients`

Retorna uma lista paginada de clientes com filtros de busca avançados.

#### Parâmetros de Query:
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `page` | `integer` | `1` | Número da página para paginação. |
| `limit` | `integer` | `10` | Quantidade de itens por página. |
| `search` | `string` | - | Busca por nome de usuário, UUID ou observação. |
| `status` | `string` | - | Filtra por status: `active`, `expired`, `expires_today`, `expires_soon`, `suspended`. |
| `scope` | `string` | `'meus'` | Escopo da busca: `meus` (padrão), `todos` (Admin), `dos_revendedores` (Revendedor). |
| `resellerId`| `integer` | - | Filtra clientes vinculados a um revendedor específico. |

#### Exemplo de Resposta (HTTP 200):
```json
{
  "clients": [
    {
      "id": 1245,
      "username": "clientevpn12",
      "category_id": 279,
      "connection_limit": 2,
      "expiration_date": "2026-06-19T00:00:00.000Z",
      "type": "user",
      "status": "active",
      "observation": "Cliente Premium",
      "v2ray_uuid": "d3b07384-d113-4956-a5cc-9810f135b546",
      "created_at": "2026-05-19T12:00:00.000Z",
      "owner_id": 42
    }
  ]
}
```

---

### 2. Criar Cliente
`POST /clients`

Cria um novo cliente (conta de usuário definitivo ou conta de teste temporário).

> [!IMPORTANT]
> **Limite de Username:** O nome de usuário (`username`) deve ter no **máximo 12 caracteres** e conter apenas letras minúsculas e números.

#### Corpo da Requisição (JSON):
| Campo | Tipo | Requerido | Descrição |
| :--- | :--- | :--- | :--- |
| `username` | `string` | ✅ | Nome de usuário (máx. 12 caracteres, sem acentos/especiais). |
| `password` | `string` | ✅ | Senha de acesso. |
| `category_id` | `integer`| ✅ | ID da categoria do servidor VPN ao qual o cliente terá acesso. |
| `connection_limit` | `integer`| ✅ | Limite de conexões simultâneas permitidas. |
| `duration` | `integer`| ✅ | Duração do acesso (**dias** se tipo for `user`, **minutos** se tipo for `test`). |
| `type` | `string` | ✅ | Tipo da conta: `'user'` ou `'test'`. |
| `observation` | `string` | ❌ | Observações ou anotações extras sobre o cliente. |
| `v2ray_uuid` | `string` | ❌ | UUID customizado para V2Ray (gerado automaticamente se não enviado). |

#### Exemplo de Envio:
```json
{
  "username": "joao45zfx",
  "password": "senhaSegura123",
  "category_id": 279,
  "connection_limit": 1,
  "duration": 30,
  "type": "user",
  "observation": "Compra via loja automática"
}
```

#### Exemplo de Resposta (HTTP 201):
```json
{
  "message": "Client created successfully",
  "client": {
    "id": 1246,
    "username": "joao45zfx",
    "password": "senhaSegura123",
    "category_id": 279,
    "connection_limit": 1,
    "expiration_date": "2026-06-18T12:45:00.000Z",
    "type": "user",
    "status": "active",
    "observation": "Compra via loja automática",
    "v2ray_uuid": "f2a893c5-9273-4ea2-8b45-64d82f7c001a",
    "created_at": "2026-05-19T12:45:00.000Z"
  }
}
```

---

### 3. Atualizar Cliente
`PUT /clients/{id}`

Atualiza os dados de um cliente existente. Todos os campos do corpo da requisição são opcionais.

#### Parâmetros de Path:
*   `id` (`integer`, obrigatório): ID interno do cliente.

#### Corpo da Requisição (JSON):
*   Mesmos campos do `POST /clients` (todos opcionais).

#### Exemplo de Resposta (HTTP 200):
```json
{
  "message": "Client updated successfully",
  "client": {
    "id": 1246,
    "username": "joao45zfx",
    "connection_limit": 3,
    "status": "active"
  }
}
```

---

### 4. Renovar Cliente
`POST /clients/{id}/renew`

Adiciona dias adicionais à validade de um cliente existente.

#### Parâmetros de Path:
*   `id` (`integer`, obrigatório): ID do cliente.

#### Corpo da Requisição (JSON):
| Campo | Tipo | Requerido | Descrição |
| :--- | :--- | :--- | :--- |
| `days` | `integer` | ✅ | Quantidade de dias de validade a serem adicionados. |

#### Exemplo de Envio:
```json
{
  "days": 30
}
```

#### Exemplo de Resposta (HTTP 200):
```json
{
  "message": "Client renewed successfully",
  "expiration_date": "2026-07-18T12:45:00.000Z"
}
```

---

### 5. Suspender / Reativar Cliente
`PUT /clients/{id}/suspend`

Altera o estado de suspensão de um cliente. Funciona como um **toggle** (se estiver ativo, suspende; se suspenso, reativa).

#### Parâmetros de Path:
*   `id` (`integer`, obrigatório): ID do cliente.

#### Exemplo de Resposta (HTTP 200):
```json
{
  "message": "Client status toggled successfully",
  "status": "suspended"
}
```

---

### 6. Remover Cliente
`DELETE /clients/{id}`

Exclui permanentemente uma conta de cliente.

#### Parâmetros de Path:
*   `id` (`integer`, obrigatório): ID do cliente.

#### Exemplo de Resposta (HTTP 200):
```json
{
  "message": "Client deleted successfully"
}
```

---

## 💼 Gerenciamento de Revendedores (Resellers)

Endpoints para gerenciar contas de sub-revenda. As contas podem ser controladas por **validade** (tempo de expiração) ou por **créditos**.

### 1. Listar Revendedores
`GET /resellers`

Retorna uma lista paginada de revendedores cadastrados.

#### Parâmetros de Query:
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `page` | `integer` | `1` | Número da página. |
| `limit` | `integer` | `50` | Limite de itens por página. |
| `search` | `string` | - | Busca por nome ou nome de usuário. |
| `status` | `string` | - | Filtra por status: `active`, `suspended`, `expired`. |
| `scope` | `string` | `'meus'` | Define o escopo: `'meus'` ou `'todos'` (Admin). |

---

### 2. Criar Revendedor
`POST /resellers`

Cria um novo revendedor sob sua hierarquia.

> [!WARNING]
> **Tipo de Conta:** Revendedores podem ter contas do tipo `validity` (expira em uma data fixa, consome contas por limites) ou `credit` (consome créditos ao criar contas de clientes).

#### Corpo da Requisição (JSON):
| Campo | Tipo | Requerido | Descrição |
| :--- | :--- | :--- | :--- |
| `name` | `string` | ✅ | Nome visual do revendedor (ex: "Revenda Sul"). |
| `username` | `string` | ✅ | Usuário de login (máx. 12 caracteres). |
| `password` | `string` | ✅ | Senha de login del revendedor. |
| `max_users` | `integer`| ✅ | Limite de usuários (para `validity`) ou quantidade de créditos (para `credit`). |
| `account_type`| `string` | ✅ | Tipo da conta: `'validity'` ou `'credit'`. |
| `category_ids`| `array[int]`| ✅ | Array com IDs das categorias de servidores que o revendedor pode gerenciar. |
| `expiration_date`| `string` | ✅ (se `validity`) | Data de expiração no formato `YYYY-MM-DD`. |
| `obs` | `string` | ❌ | Observações. |

#### Exemplo de Envio:
```json
{
  "name": "Pedro Revendas",
  "username": "pedrovpn",
  "password": "senhaSuperSegura99",
  "max_users": 50,
  "account_type": "validity",
  "category_ids": [279],
  "expiration_date": "2026-12-31",
  "obs": "Cadastro via central externa"
}
```

#### Exemplo de Resposta (HTTP 201):
```json
{
  "message": "Reseller created successfully",
  "reseller": {
    "id": 84,
    "name": "Pedro Revendas",
    "username": "pedrovpn",
    "max_users": 50,
    "account_type": "validity",
    "expiration_date": "2026-12-31T00:00:00.000Z",
    "category_ids": [279],
    "status": "active",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

---

### 3. Actualizar Revendedor
`PUT /resellers/{id}`

Atualiza os dados de um revendedor. Todos os campos são opcionais.

> [!CAUTION]
> **Fix de Senha:** Nunca envie a senha criptografada retornada por outras consultas. Só envie o campo `password` se for realmente alterá-la. A senha fornecida deve ter no máximo 25 caracteres.

#### Exemplo de Envio:
```json
{
  "name": "Pedro Revendas Atualizado",
  "max_users": 100
}
```

---

### 4. Renovar Revendedor
`POST /resellers/{id}/renew`

Renova a validade de um revendedor (somente para contas do tipo `validity`).

#### Corpo da Requisição (JSON):
```json
{
  "days": 30
}
```

---

### 5. Ativar / Desativar Revendedor
`PUT /resellers/{id}/toggle-status`

Ativa ou suspende um revendedor e **toda a sua hierarquia vinculada** (sub-revendedores e clientes). Funciona como um toggle.

#### Exemplo de Resposta (HTTP 200):
```json
{
  "message": "Reseller status toggled successfully",
  "status": "suspended"
}
```

---

### 6. Remover Revendedor
`DELETE /resellers/{id}`

Exclui permanentemente um revendedor, além de toda a sua hierarquia de sub-revendas e clientes associados.

---

## 🏷️ Gerenciamento de Categorias (Categories)

Categorias agrupam servidores e definem o acesso dos clientes e revendedores.

### 1. Listar Categorias
`GET /categories`

Retorna as categorias de servidores ativas às quais você tem acesso.

#### Exemplo de Resposta (HTTP 200):
```json
[
  {
    "id": 279,
    "name": "JJSecure VP-N",
    "description": "Categoria Principal de Servidores Premium",
    "limiter_active": true,
    "valid_until": "2026-10-15T18:30:00.000Z"
  }
]
```

---

### 2. Criar Categoria (Admin apenas)
`POST /categories`

#### Corpo da Requisição:
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "limiter_active": true
}
```

---

### 3. Atualizar Categoria (Admin apenas)
`PUT /categories/{id}`

---

### 4. Remover Categoria (Admin apenas)
`DELETE /categories/{id}`

> [!NOTE]
> Só é possível remover uma categoria que não possua servidores, clientes ou revendedores vinculados.

---

## 🔌 API de WebSockets (Tempo Real)

Para monitoramento de status de conexões, estatísticas de servidores e comandos em tempo real.

### 1. Obter Token de Acesso
`GET /auth/sse-token`

Gera um token JWT temporário para autenticação no servidor de WebSockets. O token é válido por **24 horas**.

#### Headers:
```http
Authorization: Bearer <SUA_API_KEY>
```

#### Resposta de Exemplo (HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "exp": 1678886400
}
```

---

### 2. Conexão com o WebSocket

*   **URL Base:** `wss://front.servex.ws`
*   **Protocolo de Conexão:**
    ```javascript
    const token = "SEU_SSE_TOKEN";
    const endpoint = "user-status"; // Exemplo
    const ws = new WebSocket(`wss://front.servex.ws/ws/${endpoint}?token=${token}`);
    ```

---

### 3. Endpoints de WebSocket Disponíveis

#### A. `/ws/user-status` (Admin & Revendedor)
Recebe o status em tempo real (online/offline, contagem de conexões, tempo de atividade e método de conexão) de clientes específicos.

Após conectar, você **deve enviar uma mensagem de filtro** especificando quais usuários deseja rastrear:

##### Mensagem de Filtro (JSON):
```json
{
  "type": "update_filter",
  "usernames": ["clienteA", "clienteB", "usuarioTeste"]
}
```

##### Exemplo de Evento Recebido:
```json
{
  "username": "clienteA",
  "status": "online",
  "connections": 1,
  "method": "SSH-Direct",
  "uptime": "02h 45m"
}
```

#### B. `/ws/server-status` (Admin apenas)
Recebe atualizações contínuas sobre o status de hardware e conexões de todos os servidores do painel (uso de CPU, uso de RAM, usuários conectados, largura de banda).

#### C. `/ws/command-updates` (Admin apenas)
Recebe o progresso e logs em tempo real dos comandos que estão sendo executados nos servidores (instalações do sistema, atualizações, sincronizações, etc.).
