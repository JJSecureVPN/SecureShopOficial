# 🛡️ SecureShop VPN - Tienda Online de Cuentas VPN y Revendedores

Sistema completo de tienda online para venta de cuentas VPN individuales y planes de revendedores con integración automática de MercadoPago y Servex API.

## 📋 Características Principales

### 👥 Sistema de Clientes (VPN Individual)

- ✅ **Catálogo de Planes VPN**: Planes de 7, 15 y 30 días con diferentes límites de conexión
- 💳 **Pagos con MercadoPago**: Integración completa con webhooks automáticos
- 🔐 **Creación Automática**: Cuentas VPN creadas automáticamente en Servex al confirmar pago
- 👤 **Generación de Usuarios**: Usernames generados desde el nombre del cliente (ej: pepsi + 3 letras + 2 números)
- 📧 **Entrega Inmediata**: Credenciales disponibles inmediatamente tras el pago
- 🎯 **Filtrado de Categorías**: Solo categorías activas (no expiradas) de Servex

### 🏪 Sistema de Revendedores

- 👑 **Programa de Revendedores**: Dos tipos de cuentas (Validez y Créditos)
- 📊 **11 Planes de Créditos**: De 5 a 200 créditos con duraciones de 1 a 5 meses
- 📅 **7 Planes Mensuales**: De 5 a 100 usuarios con renovación mensual (30 días)
- 💰 **Descuentos Escalonados**: Hasta 60% de descuento en planes grandes
- ⏱️ **Duración Configurable**: Cada plan tiene su duración específica en días
- 🔒 **Panel Propio**: Cada revendedor obtiene acceso a su panel de gestión
- 📈 **Control de Usuarios**: Límites configurables según el plan adquirido

### 🛡️ Seguridad y Estabilidad

- 🔒 **Rate Limiting**: Protección contra ataques de fuerza bruta
- 🌐 **CORS Configurado**: Control de acceso desde dominios autorizados
- 🛡️ **Helmet.js**: Headers de seguridad HTTP
- ✅ **Validación con Zod**: Validación de datos de entrada
- 📝 **Logging Completo**: Registro detallado de operaciones
- 🔄 **Reintentos Automáticos**: Manejo de errores y reintentos en API calls

## 🏗️ Estructura del Proyecto

```
secureshop-vpn/
├── backend/              # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/       # Configuración y variables de entorno
│   │   ├── services/
│   │   │   ├── servex.service.ts          # Cliente API Servex
│   │   │   ├── mercadopago.service.ts     # Cliente API MercadoPago
│   │   │   ├── database.service.ts        # Gestión SQLite
│   │   │   ├── tienda.service.ts          # Lógica de clientes VPN
│   │   │   └── tienda-revendedores.service.ts  # Lógica de revendedores
│   │   ├── routes/
│   │   │   ├── tienda.routes.ts           # Endpoints clientes
│   │   │   └── tienda-revendedores.routes.ts   # Endpoints revendedores
│   │   ├── middleware/   # CORS, logging, error handling
│   │   ├── types/        # TypeScript interfaces
│   │   ├── server.ts     # Configuración Express
│   │   └── index.ts      # Entry point
│   ├── database/
│   │   ├── secureshop.db                  # Base de datos SQLite
│   │   ├── crear_tablas_revendedores.sql  # Schema revendedores
│   │   └── actualizar_planes.sql          # Migración planes
│   ├── .env.example      # Ejemplo de variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React 18 + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                 # Navegación con hamburger menu
│   │   │   ├── Footer.tsx                 # Footer con enlaces
│   │   │   ├── CheckoutModal.tsx          # Modal compra clientes
│   │   │   ├── CheckoutModalRevendedor.tsx # Modal compra revendedores
│   │   │   ├── PlanCard.tsx               # Card plan cliente
│   │   │   ├── PlanRevendedorCard.tsx     # Card plan revendedor
│   │   │   ├── Loading.tsx                # Componente carga
│   │   │   └── ErrorMessage.tsx           # Mensajes error
│   │   ├── pages/
│   │   │   ├── HomePage.tsx               # Página principal
│   │   │   ├── PlanesPage.tsx             # Planes clientes
│   │   │   ├── RevendedoresPage.tsx       # Planes revendedores
│   │   │   ├── SuccessPage.tsx            # Confirmación pago
│   │   │   ├── TermsPage.tsx              # Términos y condiciones
│   │   │   └── PrivacyPage.tsx            # Política privacidad
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx            # Hero con botones
│   │   │   ├── AboutSection.tsx           # Sobre nosotros
│   │   │   └── TestimonialsSection.tsx    # Testimonios
│   │   ├── services/
│   │   │   └── api.service.ts             # Cliente API
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript types
│   │   ├── App.tsx                        # Router principal
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Estilos globales
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docs/                 # Documentación
│   ├── DEPLOYMENT.md     # Guía de despliegue en VPS
│   ├── API.md           # Documentación de endpoints
│   └── CONFIGURACION.md  # Configuración paso a paso
│
├── deploy.sh            # Script de despliegue automático
├── update.sh            # Script de actualización
└── README.md            # Este archivo
```

## 🚀 Instalación Rápida

### Requisitos Previos

- Node.js 18+ y npm
- Cuenta de MercadoPago con Access Token
- API Key de Servex
- Git
- SQLite3

### 1. Clonar y configurar Backend

```bash
cd secureshop-vpn/backend
npm install
cp .env.example .env
nano .env  # Editar con tus credenciales
npm run dev
```

### 2. Configurar Frontend

```bash
cd ../frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`
El backend estará disponible en `http://localhost:4000`

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Servidor
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://shop.jhservices.com.ar

# Servex API
SERVEX_API_KEY=sx_9c57423352279d267f4e93f3b14663c510c1c150fd788ceef393ece76a5f521c
SERVEX_BASE_URL=https://servex.ws/api
SERVEX_TIMEOUT=30000

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-8757932973898001-081011-11b3d5038392a44bcbb684a733b5539d-222490274
MP_PUBLIC_KEY=APP_USR-59bd1954-749b-43c7-9bfc-1c1a5e26a22d
MP_WEBHOOK_URL=https://shop.jhservices.com.ar/api/webhook

# Base de Datos
DATABASE_PATH=./database/secureshop.db

# Seguridad
CORS_ORIGIN=https://shop.jhservices.com.ar
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Estructura de Base de Datos

### Tabla: planes

Almacena los planes para clientes VPN individuales

- `id`: INTEGER PRIMARY KEY
- `nombre`: TEXT (ej: "VPN 7 Días - 2 Conexiones")
- `descripcion`: TEXT
- `precio`: REAL (en ARS)
- `dias`: INTEGER (duración del plan)
- `connection_limit`: INTEGER (límite de conexiones simultáneas)
- `activo`: INTEGER (1/0)
- `fecha_creacion`: DATETIME

### Tabla: pagos

Registra todas las transacciones de clientes

- `id`: TEXT PRIMARY KEY (UUID)
- `plan_id`: INTEGER
- `monto`: REAL
- `estado`: TEXT (pendiente/aprobado/rechazado/cancelado)
- `metodo_pago`: TEXT
- `cliente_email`: TEXT
- `cliente_nombre`: TEXT
- `mp_payment_id`: TEXT
- `mp_preference_id`: TEXT
- `servex_cuenta_id`: INTEGER
- `servex_username`: TEXT (generado del nombre)
- `servex_password`: TEXT
- `servex_categoria`: TEXT
- `servex_expiracion`: TEXT
- `servex_connection_limit`: INTEGER

### Tabla: planes_revendedores

Almacena los planes para revendedores

- `id`: INTEGER PRIMARY KEY
- `nombre`: TEXT (ej: "50 Créditos", "Mensual 10 Usuarios")
- `descripcion`: TEXT
- `precio`: REAL (en ARS)
- `max_users`: INTEGER (créditos o límite usuarios)
- `account_type`: TEXT (validity/credit)
- `dias`: INTEGER (duración de la cuenta del revendedor)
- `activo`: INTEGER (1/0)
- `fecha_creacion`: DATETIME

### Tabla: pagos_revendedores

Registra todas las transacciones de revendedores

- `id`: TEXT PRIMARY KEY (UUID)
- `plan_revendedor_id`: INTEGER
- `monto`: REAL
- `estado`: TEXT (pendiente/aprobado/rechazado/cancelado)
- `metodo_pago`: TEXT
- `cliente_email`: TEXT
- `cliente_nombre`: TEXT
- `mp_payment_id`: TEXT
- `mp_preference_id`: TEXT
- `servex_revendedor_id`: INTEGER
- `servex_username`: TEXT (generado del nombre)
- `servex_password`: TEXT
- `servex_max_users`: INTEGER
- `servex_account_type`: TEXT
- `servex_expiracion`: TEXT
- `servex_duracion_dias`: INTEGER (duración que debe asignar a usuarios)

## 📝 Endpoints de la API

### Endpoints de Clientes VPN

| Método | Endpoint        | Descripción                       | Body                                      |
| ------ | --------------- | --------------------------------- | ----------------------------------------- |
| GET    | `/api/planes`   | Lista de planes VPN activos       | -                                         |
| POST   | `/api/comprar`  | Iniciar compra de plan            | `{ planId, clienteEmail, clienteNombre }` |
| GET    | `/api/pago/:id` | Consultar estado de pago          | -                                         |
| POST   | `/api/webhook`  | Webhook de MercadoPago (clientes) | Auto (MP)                                 |

### Endpoints de Revendedores

| Método | Endpoint                     | Descripción                         | Body                                                |
| ------ | ---------------------------- | ----------------------------------- | --------------------------------------------------- |
| GET    | `/api/revendedores/planes`   | Lista de planes de revendedores     | -                                                   |
| POST   | `/api/revendedores/comprar`  | Iniciar compra plan revendedor      | `{ planRevendedorId, clienteEmail, clienteNombre }` |
| GET    | `/api/revendedores/pago/:id` | Consultar estado de pago revendedor | -                                                   |
| POST   | `/api/revendedores/webhook`  | Webhook MercadoPago (revendedores)  | Auto (MP)                                           |

### Endpoints Generales

| Método | Endpoint  | Descripción               |
| ------ | --------- | ------------------------- |
| GET    | `/health` | Health check del servidor |

## 🔄 Flujos de Negocio

### Flujo de Compra - Cliente VPN

1. **Cliente selecciona un plan** en `/planes`
2. **Frontend envía solicitud** → POST `/api/comprar`
   ```json
   {
     "planId": 1,
     "clienteEmail": "cliente@email.com",
     "clienteNombre": "Juan Pérez"
   }
   ```
3. **Backend crea registro en DB** con estado "pendiente"
4. **Backend crea preferencia en MercadoPago** y devuelve link de pago
5. **Cliente es redirigido a MercadoPago** para completar pago
6. **MercadoPago procesa el pago** y envía webhook → POST `/api/webhook`
7. **Backend verifica el pago** en MercadoPago
8. **Backend obtiene categorías activas** de Servex (filtrado por `valid_until`)
9. **Backend genera username** del nombre (ej: "juanpereztab42")
10. **Backend crea cuenta VPN** en Servex con las credenciales
11. **Estado actualizado a "aprobado"** con credenciales guardadas
12. **Cliente redirigido a `/success`** con sus credenciales

### Flujo de Compra - Revendedor

1. **Cliente selecciona plan** en `/revendedores`
2. **Frontend envía solicitud** → POST `/api/revendedores/comprar`
   ```json
   {
     "planRevendedorId": 5,
     "clienteEmail": "revendedor@email.com",
     "clienteNombre": "María González"
   }
   ```
3. **Backend crea registro** con estado "pendiente"
4. **Backend crea preferencia MercadoPago** y devuelve link
5. **Cliente paga en MercadoPago**
6. **Webhook recibido** → POST `/api/revendedores/webhook`
7. **Backend verifica pago** y obtiene plan
8. **Backend genera username** (ej: "mariagonzalezxyz89")
9. **Backend crea cuenta revendedor** en Servex con:
   - `max_users`: Según plan (5-200)
   - `account_type`: validity o credit
   - `expiration_date`: Si es validity, fecha calculada
   - `duration_days`: Guardado en DB para referencia
10. **Credenciales guardadas** en base de datos
11. **Cliente redirigido** a página de éxito

## 🎨 Características del Frontend

### Páginas Principales

- **HomePage**: Hero section con call-to-action para Clientes y Revendedores
- **PlanesPage**: Catálogo de planes VPN con filtros por duración (7/15/30 días)
- **RevendedoresPage**: Dos categorías (Créditos y Mensuales) con diseño unificado
- **SuccessPage**: Confirmación de pago con credenciales
- **TermsPage** y **PrivacyPage**: Páginas legales

### Componentes Reutilizables

- **Header**: Menu hamburger responsive (desktop y mobile)
- **Footer**: Enlaces a páginas, redes sociales y legal
- **CheckoutModal**: Modal de pago para clientes VPN
- **CheckoutModalRevendedor**: Modal de pago para revendedores
- **Loading**: Componente de carga con spinner
- **ErrorMessage**: Notificaciones de error estilizadas

### Tecnologías Frontend

- **React 18**: Framework principal
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **Lucide React**: Iconos
- **React Router DOM**: Enrutamiento
- **Axios**: Cliente HTTP

## 🛠️ Scripts Disponibles

### Backend

```bash
npm run dev       # Desarrollo con hot reload (ts-node-dev)
npm run build     # Compilar TypeScript a JavaScript
npm start         # Producción (ejecuta dist/index.js)
npm run lint      # ESLint para código TypeScript
npm test          # Ejecutar tests (Jest)
```

### Frontend

```bash
npm run dev       # Servidor desarrollo Vite (puerto 5173)
npm run build     # Build de producción (tsc + vite build)
npm run preview   # Preview del build de producción
npm run lint      # ESLint para React/TypeScript
```

## 🌐 Despliegue en VPS (149.50.148.6)

### Información del Servidor

- **IP**: 149.50.148.6
- **OS**: Ubuntu/Debian
- **Dominio**: shop.jhservices.com.ar
- **Backend**: Puerto 4000 (PM2)
- **Frontend**: Nginx → /home/secureshop/secureshop-vpn/frontend/dist

### Configuración Inicial del Servidor

```bash
# Conectar al VPS
ssh root@149.50.148.6

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx

# Clonar proyecto
cd /home/secureshop
git clone [tu-repositorio] secureshop-vpn
```

### Desplegar Backend

```bash
cd /home/secureshop/secureshop-vpn/backend
npm install
cp .env.example .env
nano .env  # Configurar variables de producción

# Compilar TypeScript
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Autostart al reiniciar
```

### Desplegar Frontend

```bash
cd /home/secureshop/secureshop-vpn/frontend
npm install

# Configurar variable de entorno para API
# En vite.config.ts debe apuntar al backend

npm run build

# Los archivos quedan en dist/
# Nginx los sirve desde /home/secureshop/secureshop-vpn/frontend/dist
```

### Configuración Nginx

Archivo: `/etc/nginx/sites-available/shop.jhservices.com.ar`

Plantilla versionada en el repo: `infra/nginx/shop.jhservices.com.ar.conf`

```nginx
server {
    listen 80;
    server_name shop.jhservices.com.ar;

    # Redirect HTTP to HTTPS (si tienes SSL)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shop.jhservices.com.ar;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/shop.jhservices.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.jhservices.com.ar/privkey.pem;

   # Backend (PM2) - puerto de producción
   set $backend http://127.0.0.1:4001;

   # Límite coherente con Express (10mb)
   client_max_body_size 10m;

   # Health del backend (IMPORTANTE: /health NO está bajo /api)
   location = /health {
      proxy_pass $backend;
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 5s;
      proxy_send_timeout 5s;
   }

   # SSE (stream) - deshabilitar buffering y usar timeouts largos
   location /api/realtime/stream {
      proxy_pass $backend;
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffering off;
      proxy_cache off;
      add_header X-Accel-Buffering no;
      proxy_read_timeout 3600s;
      proxy_send_timeout 3600s;
   }

   # Proxy API requests to backend
   location /api {
      proxy_pass $backend;
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      # Durante un reload, un worker puede responder 503 (draining). Reintentar.
      proxy_next_upstream error timeout http_502 http_503 http_504;
      proxy_next_upstream_tries 3;
      proxy_connect_timeout 5s;
      proxy_send_timeout 60s;
      proxy_read_timeout 60s;
   }

    # Serve frontend static files
    location / {
        root /home/secureshop/secureshop-vpn/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/shop.jhservices.com.ar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Script de Despliegue Automático

Archivo: `deploy.sh` (ya incluido en el proyecto)

```bash
#!/bin/bash
# Desplegar actualizaciones

# Backend
cd /home/secureshop/secureshop-vpn/backend
git pull
npm install
npm run build
pm2 restart secureshop-backend

# Frontend
cd ../frontend
npm install
npm run build
# Los archivos ya están en dist/, Nginx los sirve automáticamente

echo "✅ Despliegue completado"
```

## 🚀 Deploy de Dists a VPS

Para subir las builds compiladas (dists) directamente a la VPS sin necesidad de compilar en el servidor:

### Información de la VPS

- **Usuario**: root
- **Host**: 149.50.148.6
- **Ruta**: /home/secureshop/secureshop-vpn

### Pasos para Deploy

1. **Build del Backend**:

   ```bash
   cd backend
   npm run build
   ```

2. **Build del Frontend**:

   ```bash
   cd ../frontend
   npm run build
   ```

3. **Subir Backend Dist**:

   ```bash
   scp -r ./backend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/
   ```

4. **Subir Frontend Dist**:
   ```bash
   scp -r ./frontend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/frontend/
   ```

### Reinicio en VPS (opcional)

Después de subir los dists, conectar por SSH y reiniciar servicios:

```bash
ssh root@149.50.148.6
cd /home/secureshop/secureshop-vpn
pm2 restart all
```

## 📄 Licencia

````

Uso:
```bash
chmod +x deploy.sh
./deploy.sh
````

## 📊 Planes Actuales

### Planes VPN Clientes

| Plan         | Duración | Conexiones | Precio |
| ------------ | -------- | ---------- | ------ |
| VPN Básico   | 7 días   | 2          | $1.500 |
| VPN Estándar | 15 días  | 2          | $2.500 |
| VPN Premium  | 30 días  | 2          | $4.000 |
| VPN Plus     | 30 días  | 4          | $6.000 |

### Planes Revendedores - Créditos

| Plan         | Créditos | Duración Cuenta    | Precio   | Descuento |
| ------------ | -------- | ------------------ | -------- | --------- |
| 5 Créditos   | 5        | 30 días (1 mes)    | $12.000  | -         |
| 10 Créditos  | 10       | 60 días (2 meses)  | $20.000  | 17%       |
| 20 Créditos  | 20       | 90 días (3 meses)  | $36.000  | 25%       |
| 30 Créditos  | 30       | 120 días (4 meses) | $51.000  | 29%       |
| 40 Créditos  | 40       | 150 días (5 meses) | $64.000  | 33%       |
| 50 Créditos  | 50       | 150 días (5 meses) | $75.000  | 38%       |
| 60 Créditos  | 60       | 150 días (5 meses) | $84.000  | 42%       |
| 80 Créditos  | 80       | 150 días (5 meses) | $104.000 | 46%       |
| 100 Créditos | 100      | 150 días (5 meses) | $110.000 | 54%       |
| 150 Créditos | 150      | 150 días (5 meses) | $150.000 | 58%       |
| 200 Créditos | 200      | 150 días (5 meses) | $190.000 | 60%       |

### Planes Revendedores - Mensuales (Validez)

| Plan                 | Usuarios | Duración | Precio Mensual | Costo/Usuario |
| -------------------- | -------- | -------- | -------------- | ------------- |
| Mensual 5 Usuarios   | 5        | 30 días  | $10.000        | $2.000        |
| Mensual 10 Usuarios  | 10       | 30 días  | $18.000        | $1.800        |
| Mensual 20 Usuarios  | 20       | 30 días  | $32.000        | $1.600        |
| Mensual 30 Usuarios  | 30       | 30 días  | $42.000        | $1.400        |
| Mensual 50 Usuarios  | 50       | 30 días  | $60.000        | $1.200        |
| Mensual 75 Usuarios  | 75       | 30 días  | $78.000        | $1.040        |
| Mensual 100 Usuarios | 100      | 30 días  | $90.000        | $900          |

## 🐛 Debugging y Monitoreo

### Ver Logs en Producción

```bash
# Logs de PM2
pm2 logs secureshop-backend
pm2 logs secureshop-backend --lines 100

# Monitoreo en tiempo real
pm2 monit

# Estado de procesos
pm2 status
pm2 list

# Reiniciar si hay problemas
pm2 restart secureshop-backend
```

### Consultar Base de Datos

```bash
# Conectar a SQLite
sqlite3 /home/secureshop/secureshop-vpn/backend/database/secureshop.db

# Ver tablas
.tables

# Ver planes de clientes
SELECT * FROM planes;

# Ver planes de revendedores
SELECT nombre, dias, max_users, account_type, precio FROM planes_revendedores;

# Ver últimos pagos
SELECT id, cliente_nombre, estado, monto FROM pagos ORDER BY fecha_creacion DESC LIMIT 10;

# Ver pagos aprobados
SELECT * FROM pagos WHERE estado = 'aprobado';

# Ver revendedores creados
SELECT cliente_nombre, servex_username, servex_max_users, servex_account_type
FROM pagos_revendedores
WHERE estado = 'aprobado';

# Salir
.quit
```

### Verificar Servex API

```bash
# Desde el servidor o local
curl -H "Authorization: Bearer sx_..." https://servex.ws/api/categories
```

### Verificar MercadoPago

```bash
# Ver webhook configurado en:
https://www.mercadopago.com.ar/developers/panel/webhooks
```

## 🔒 Seguridad

### Checklist de Seguridad Implementado

- ✅ **HTTPS**: Certificado SSL de Let's Encrypt
- ✅ **Variables de Entorno**: Credenciales nunca en código
- ✅ **Rate Limiting**: 100 requests por 15 minutos
- ✅ **CORS**: Solo dominios autorizados
- ✅ **Helmet.js**: Headers HTTP seguros
- ✅ **Validación de Entrada**: Zod schemas
- ✅ **Logging**: Winston para registro de errores
- ✅ **SQL Injection**: Prepared statements en SQLite
- ✅ **XSS Prevention**: React auto-escaping
- ✅ **CSRF**: Tokens en formularios críticos

### Mejoras de Seguridad Futuras

- [ ] Autenticación JWT para panel de administración
- [ ] 2FA para acceso a revendedores
- [ ] Webhooks firmados de MercadoPago
- [ ] Backup automático de base de datos
- [ ] Monitoreo de intrusiones (fail2ban)
- [ ] WAF (Web Application Firewall)

## 🚦 Solución de Problemas

### Error: "No hay categorías activas disponibles"

**Causa**: Todas las categorías en Servex están expiradas
**Solución**:

```bash
# Ver categorías disponibles
curl -H "Authorization: Bearer [API_KEY]" https://servex.ws/api/categories

# Verificar campo valid_until de cada categoría
# Contactar a Servex para renovar categorías expiradas
```

### Error: "Payment not found" en webhook

**Causa**: MercadoPago envió webhook antes de crear el pago en DB
**Solución**: El sistema reintenta automáticamente. Verificar logs:

```bash
pm2 logs secureshop-backend | grep "Pago no encontrado"
```

### Frontend no carga después de deployment

**Causa**: Archivos no copiados correctamente a dist/
**Solución**:

```bash
cd /home/secureshop/secureshop-vpn/frontend
npm run build
ls -la dist/  # Verificar que existan archivos
```

### Backend no inicia con PM2

**Causa**: Error en variables de entorno o dependencias
**Solución**:

```bash
pm2 logs secureshop-backend --err
cd /home/secureshop/secureshop-vpn/backend
npm install
pm2 restart secureshop-backend
```

## 📚 Recursos Adicionales

- [Documentación Servex API](https://servex.ws/docs)
- [Documentación MercadoPago](https://www.mercadopago.com.ar/developers)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PM2 Documentation](https://pm2.keymetrics.io)
- [Nginx Configuration](https://nginx.org/en/docs)

## 🤝 Soporte y Contacto

Para problemas técnicos:

1. Revisar logs: `pm2 logs secureshop-backend`
2. Verificar estado: `pm2 status`
3. Comprobar base de datos
4. Verificar conectividad con APIs externas

Contacto:

- Telegram: @JHServicesAR
- WhatsApp: +54 9 11 XXXX-XXXX
- Email: soporte@jhservices.com.ar

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025 SecureShop

---

**Desarrollado con ❤️ por JHServices**

Última actualización: Octubre 2025
