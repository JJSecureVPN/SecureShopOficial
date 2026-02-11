# Alertas (Email) - SecureShop Backend

Se añadió un servicio de alertas por email (`AlertService`) que enviará notificaciones cuando:
- Servex devuelva 401 (Unauthorized)
- Servex devuelva errores 5xx
- Se detecten N respuestas 429 consecutivas (configurable)

Variables de entorno disponibles:

- ALERTS_ENABLED: `true|false` (por defecto `true`)
- ALERT_EMAILS: lista separada por comas con emails de destino (ej: `ops@ejemplo.com, devs@ejemplo.com`)
- ALERT_FROM_NAME: nombre que aparecerá en el `From` del email (por defecto `SecureShop Monitor`)
- SERVEX_ALERT_CONSECUTIVE_429_THRESHOLD: número de 429 consecutivos para disparar alerta (por defecto `3`)

Requisitos SMTP (si ALERTS_ENABLED=true y ALERT_EMAILS configurado):
- SMTP_HOST
- SMTP_PORT (opcional, por defecto 587)
- SMTP_USER
- SMTP_PASS
- EMAIL_FROM (opcional, si no se usa, se usa SMTP_USER)

Notas:
- El sistema solo enviará alertas si `ALERTS_ENABLED` está activado y hay direcciones en `ALERT_EMAILS`.
- Se recomienda configurar un email de soporte en `SUPPORT_NOTIFY_EMAIL`/`ADMIN_EMAIL` y propagarlo a `ALERT_EMAILS`.

Ejemplo de `.env.production`:

SERVEX_ALERT_CONSECUTIVE_429_THRESHOLD=3
ALERTS_ENABLED=true
ALERT_EMAILS=ops@ejemplo.com
ALERT_FROM_NAME="SecureShop Monitor"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jjsecurevpn@gmail.com
SMTP_PASS=xxxxxx
EMAIL_FROM=jjsecurevpn@gmail.com
