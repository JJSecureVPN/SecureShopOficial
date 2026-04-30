# 🗄️ Supabase - SecureShop VPN

Este directorio contiene las migraciones y configuración de Supabase para el proyecto.

## 📁 Estructura

```
supabase/
├── migrations/
│   ├── 001_initial_setup.sql      # Tablas principales
│   ├── 002_rls_policies.sql       # Políticas de seguridad
│   ├── 003_triggers_functions.sql # Triggers y funciones
│   └── 004_referrals_future.sql   # Sistema de referidos (futuro)
├── seed.sql                       # Datos iniciales (opcional)
└── README.md                      # Este archivo
```

## 🚀 Instalación Inicial

### 1. Ejecutar las migraciones en orden

Ve al SQL Editor de Supabase y ejecuta cada archivo en orden:

1. `001_initial_setup.sql` - Crea las tablas
2. `002_rls_policies.sql` - Configura la seguridad
3. `003_triggers_functions.sql` - Crea automatizaciones

Luego, según features habilitadas:

4. `005_referrals_wallet.sql` - Referidos + wallet/saldo
5. `006_fix_referrals_email.sql` - Referidos por email (compras sin cuenta)
6. `007_live_chat.sql` - Chat en vivo (Realtime)
7. `008_fix_chat_avatar.sql` - Ajustes de avatar/compat
8. `009_noticias_system.sql` - Noticias
9. `010_noticias_comentarios.sql` - Comentarios de noticias
10. `011_support_tickets.sql` - Tickets de soporte
11. `012_status_page.sql` - Status page (incidentes)
12. `013_help_center_faq.sql` - Centro de ayuda / FAQ

### 2. O ejecutar todo de una vez

Puedes concatenar los 3 primeros archivos y ejecutarlos juntos.

## ⚙️ Configuración Requerida

### URL Configuration

En **Authentication > URL Configuration**:

- **Site URL**: `https://shop.jhservices.com.ar`
- **Redirect URLs**:
  - `https://shop.jhservices.com.ar`
  - `https://shop.jhservices.com.ar/perfil`
  - `http://localhost:3000` (desarrollo)

### Variables de Entorno

**Frontend (.env)**:
```env
VITE_SUPABASE_URL=https://yvxtlepjcpogiqgrzlpx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

**Backend (.env)**:
```env
SUPABASE_URL=https://yvxtlepjcpogiqgrzlpx.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_xxx
```

## 📊 Tablas

### profiles
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID del usuario (de auth.users) |
| email | TEXT | Email del usuario |
| nombre | TEXT | Nombre del usuario |
| telefono | TEXT | Teléfono (opcional) |
| avatar_url | TEXT | URL del avatar |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última actualización |

### purchase_history
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID único de la compra |
| user_id | UUID | ID del usuario |
| tipo | TEXT | plan, renovacion, revendedor |
| plan_nombre | TEXT | Nombre del plan comprado |
| monto | DECIMAL | Monto pagado |
| estado | TEXT | Estado del pago |
| servex_username | TEXT | Usuario VPN |
| servex_password | TEXT | Contraseña VPN |
| servex_expiracion | TIMESTAMPTZ | Fecha de expiración |
| mp_payment_id | TEXT | ID de pago MercadoPago |
| created_at | TIMESTAMPTZ | Fecha de compra |

## 🔒 Seguridad (RLS)

- Los usuarios solo pueden ver/editar **su propio perfil**
- Los usuarios solo pueden ver **sus propias compras**
- El backend usa `service_role` key que bypasea RLS

### Nuevas (MVP profesional)

#### Soporte (Tickets)
- `support_tickets`
- `support_ticket_messages`

#### Status Page
- `status_components`
- `status_incidents`
- `status_incident_components`
- `status_incident_updates`

#### Centro de Ayuda
- `help_categories`
- `help_articles`

## 🔮 Futuro

El archivo `004_referrals_future.sql` contiene el esquema para:
- Sistema de referidos ("Invita y gana")
- Códigos de referido únicos
- Tracking de recompensas

**No ejecutar hasta que se implemente en el código.**
