Endpoints da API
Clientes

GET
https://servex.ws/api/clients
Admin & Reseller
Retorna uma lista paginada de clientes.

Parâmetros
Parâmetro Tipo Descrição
page integer Número da página. Padrão: 1.
limit integer Número de itens por página. Padrão: 10.
search string Busca por nome de usuário, UUID ou observação.
status string Filtra por status: 'active', 'expired', 'expires_today', 'expires_soon', 'suspended'.
scope string Define o escopo da busca: 'meus' (padrão), 'todos' (admin), 'dos_revendedores' (revendedor).
resellerId integer Filtra clientes de um revendedor específico.

POST
https://servex.ws/api/clients
Admin & Reseller
Cria um novo cliente.

Parâmetros
Parâmetro Tipo Descrição
username string Nome de usuário do cliente.
password string Senha do cliente.
category_id integer ID da categoria do servidor.
connection_limit integer Limite de conexões simultâneas.
duration integer Duração do acesso (em dias para usuários, em minutos para testes).
type string 'user' ou 'test'.
observation string (Opcional) Observações sobre o cliente.
v2ray_uuid string (Opcional) UUID para V2Ray.
owner_id integer (Opcional, Admin) ID do revendedor dono do cliente.

PUT
https://servex.ws/api/clients/{id}
Admin & Reseller
Atualiza os dados de um cliente existente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do cliente (na URL).
... object Os mesmos campos do POST, exceto que são todos opcionais.

DELETE
https://servex.ws/api/clients/{id}
Admin & Reseller
Remove um cliente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do cliente (na URL).

POST
https://servex.ws/api/clients/{id}/renew
Admin & Reseller
Renova a assinatura de um cliente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do cliente (na URL).
days integer Número de dias para adicionar à validade.

PUT
https://servex.ws/api/clients/{id}/suspend
Admin & Reseller
Suspende ou reativa um cliente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do cliente (na URL).
Revendedores

GET
https://servex.ws/api/resellers
Admin & Reseller
Retorna uma lista paginada de revendedores.

Parâmetros
Parâmetro Tipo Descrição
page integer Número da página.
limit integer Número de itens por página.
search string Busca por nome ou usuário.
status string Filtra por status: 'active', 'suspended', 'expired', etc.
scope string Define o escopo: 'meus' (padrão) ou 'todos'.

POST
https://servex.ws/api/resellers
Admin & Reseller
Cria um novo revendedor.

Parâmetros
Parâmetro Tipo Descrição
name string Nome do revendedor.
username string Usuário de login.
password string Senha de login.
max_users integer Limite de usuários (contas de validade) ou quantidade de créditos (contas de crédito).
account_type string 'validity' ou 'credit'.
category_ids array[integer] Array com IDs das categorias permitidas.
expiration_date string (Obrigatório para 'validity') Data de expiração no formato YYYY-MM-DD.
obs string (Opcional) Observações.

PUT
https://servex.ws/api/resellers/{id}
Admin & Reseller
Atualiza um revendedor existente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do revendedor (na URL).
... object Os mesmos campos do POST, todos opcionais.

DELETE
https://servex.ws/api/resellers/{id}
Admin & Reseller
Remove um revendedor e toda a sua hierarquia (sub-revendedores e clientes).

Parâmetros
Parâmetro Tipo Descrição
id integer ID do revendedor (na URL).

POST
https://servex.ws/api/resellers/{id}/renew
Admin & Reseller
Renova um revendedor com conta por validade.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do revendedor (na URL).
days integer Número de dias para adicionar à validade.

PUT
https://servex.ws/api/resellers/{id}/toggle-status
Admin & Reseller
Ativa ou desativa um revendedor e toda a sua hierarquia.

Parâmetros
Parâmetro Tipo Descrição
id integer ID do revendedor (na URL).
Categorias

GET
https://servex.ws/api/categories
Admin & Reseller
Retorna uma lista de categorias. Para revendedores, retorna apenas as categorias às quais ele tem acesso.

POST
https://servex.ws/api/categories
Admin
Cria uma nova categoria.

Parâmetros
Parâmetro Tipo Descrição
name string Nome da categoria.
description string (Opcional) Descrição da categoria.
limiter_active boolean (Opcional) Ativa o limitador de conexões. Padrão: false.

PUT
https://servex.ws/api/categories/{id}
Admin
Atualiza uma categoria existente.

Parâmetros
Parâmetro Tipo Descrição
id integer ID da categoria (na URL).
name string Novo nome da categoria.
description string (Opcional) Nova descrição.
limiter_active boolean (Opcional) Ativa ou desativa o limitador.

DELETE
https://servex.ws/api/categories/{id}
Admin
Remove uma categoria. Só é possível se não houver servidores, clientes ou revendedores vinculados.

Parâmetros
Parâmetro Tipo Descrição
id integer ID da categoria (na URL).
WebSockets API
Para dados em tempo real, utilizamos WebSockets. A autenticação é feita via um token temporário que deve ser obtido no seguinte endpoint:

GET
https://servex.ws/api/auth/sse-token
Admin & Reseller
Retorna um token JWT válido por 24 horas para autenticação em conexões WebSocket. Pode ser chamado com a chave de API.

Exemplo de Resposta
{
"token": "ey...",
"exp": 1678886400
}
Após obter o token, conecte-se ao WebSocket desejado. O URL base para os WebSockets é wss://front.servex.ws.

const ws = new WebSocket(`wss://front.servex.ws/ws/{endpoint}?token=${token}`);
/ws/server-status
Admin
Recebe atualizações em tempo real sobre o status de todos os servidores do admin (CPU, RAM, usuários online, etc.).

/ws/command-updates
Admin
Recebe atualizações sobre o status dos comandos executados nos servidores (instalação, criação de usuário, etc.).

/ws/user-status
Admin & Reseller
Recebe o status (online/offline, contagem de conexão, método) de clientes específicos.

Para receber dados, você deve enviar uma mensagem para o WebSocket especificando para quais usuários deseja monitorar o status.

Mensagem de Filtro
{
"type": "update_filter",
"usernames": ["cliente1", "cliente2", "teste123"]
}
