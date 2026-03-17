# Límite de demos (anti-abuso)

Este documento describe las reglas y mecanismos implementados en el backend para evitar que un mismo usuario (o un bot) solicite demos ilimitadas.

## ✅ Reglas actuales

- **Máximo 2 demos por IP** (se cuentan todas las demos creadas en un periodo configurado)
- **Máximo 2 demos por email** (se aplica normalización para **Gmail** para evitar aliasing `+`/`.`)
- El límite se aplica dentro de una **ventana configurable** (por defecto 30 días).

## 🧠 Normalización de emails

Para Gmail se normaliza el email para que:

- `usuario@gmail.com`, `us.uario@gmail.com` y `usuario+bot@gmail.com` se consideren el mismo email.

Esto ayuda a evitar que un atacante cree demos ilimitadas usando alias.

## ⚙️ Configuración (variables de entorno)

Las siguientes variables pueden ajustarse en tu VPS (`.env` o el entorno del servicio):

- `DEMO_MAX_PER_IP` (default: `2`)
- `DEMO_MAX_PER_EMAIL` (default: `2`)
- `DEMO_WINDOW_HOURS` (default: `720` - 30 días; `0` = todas las demos)

## 📌 ¿Dónde se guarda el registro?

- La información de demos se registra en la base de datos SQLite (tabla `demos`).
- Además, cada intento de solicitar demo se registra en:

  - `backend/logs/demo-requests.log`

  El archivo contiene una línea por solicitud con información de IP, email, userId y si se permitió o bloqueó.

## 🛠️ Cómo revisar si una IP/email ya utilizó demos

### Revisar desde SQLite (CLI)

```sh
sqlite3 backend/database/secureshop.db
sqlite> SELECT email, ip_address, created_at, estado FROM demos WHERE email_normalized = 'usuario@gmail.com';
sqlite> SELECT email, ip_address, created_at, estado FROM demos WHERE ip_address = '1.2.3.4';
```

### Revisar el log de intentos

```sh
cat backend/logs/demo-requests.log | tail -n 20
```

## 🔐 Recomendaciones adicionales (para mejorar seguridad)

- Habilitar protección anti-bots (CAPTCHA) en la UI antes de solicitar la demo.
- Limitar la cantidad de solicitudes por IP a nivel de API (rate-limit por IP).
- Considerar exigir un número de teléfono para demos si el abuso persiste.
