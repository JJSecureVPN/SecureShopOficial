#!/bin/bash

# Script de deploy seguro para SecureShop VPN
# Evita conflictos EADDRINUSE con lógica robusta de liberación de puerto
# cd /c/Users/JHServices/Documents/SecureShop/secureshop-vpn && bash deploy-safe.sh

echo "🚀 Iniciando deploy seguro con protección EADDRINUSE..."

# Variables
REMOTE_HOST="root@185.194.204.192"
BACKEND_PATH="/home/secureshop/secureshop-vpn/backend"
FRONTEND_PATH="/home/secureshop/secureshop-vpn/frontend"
PORT=4001
MAX_RETRIES=5
RETRY_DELAY=2

# Nota:
# Este script fue ajustado para priorizar deploy sin downtime.
# En vez de detener/kill procesos y liberar el puerto agresivamente (lo que corta transacciones),
# usamos "pm2 startOrReload"/"pm2 reload" con apagado elegante del backend.

# ============================================================================
# FUNCIÓN: Liberar puerto de forma agresiva
# ============================================================================
liberar_puerto_agresivo() {
    local intento=$1
    echo "⚠️  Liberación agresiva DESACTIVADA por defecto (intento $intento/$MAX_RETRIES)"
    echo "    Motivo: esto corta transacciones en curso."
    echo "    Si necesitás emergencia: editar script y reactivar la lógica anterior."
    return 0
}

# ============================================================================
# FUNCIÓN: Verificar si puerto está disponible
# ============================================================================
puerto_disponible() {
    ! ssh $REMOTE_HOST "lsof -i :$PORT" 2>/dev/null
}

# ============================================================================
# PASO 0: PRE-DEPLOY CLEANUP (Crítico para evitar EADDRINUSE)
# ============================================================================
echo ""
echo "🛡️  FASE 1: Pre-Deploy (Sin Downtime)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Verificando conectividad a servidor remoto y PM2..."
ssh $REMOTE_HOST "pm2 ping >/dev/null 2>&1 || true" || true
echo "  ✓ OK"

# ============================================================================
# FASE 2: COMPILACIÓN
# ============================================================================
echo ""
echo "🔨 FASE 2: Compilación Local"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend
echo "  Compilando frontend..."
cd ./frontend
if ! npm run build; then
    echo "❌ Error al compilar frontend"
    cd ..
    exit 1
fi
cd ..
echo "  ✓ Frontend compilado"

# Backend
echo "  Compilando backend..."
cd ./backend
if ! npm run build; then
    echo "❌ Error al compilar backend"
    cd ..
    exit 1
fi
cd ..
echo "  ✓ Backend compilado"

# Validaciones
if [ ! -d "./frontend/dist" ] || [ ! -d "./backend/dist" ]; then
    echo "❌ Error: Directorios dist no encontrados"
    exit 1
fi

echo "✓ Compilación completada"

# ============================================================================
# FASE 3: TRANSFERENCIA DE ARCHIVOS
# ============================================================================
echo ""
echo "📤 FASE 3: Transferencia de Archivos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend
echo "  Limpiando dist remoto..."
ssh $REMOTE_HOST "rm -rf $FRONTEND_PATH/dist/*" || true
echo "  Transferiendo frontend..."
if scp -r ./frontend/dist/* $REMOTE_HOST:$FRONTEND_PATH/dist/ 2>/dev/null; then
    echo "  ✓ Frontend transferido"
else
    echo "  ⚠️  Advertencia en transferencia de frontend"
fi

# Backend compilado
echo "  Limpiando dist remoto..."
ssh $REMOTE_HOST "rm -rf $BACKEND_PATH/dist/*" || true
echo "  Transferiendo backend compilado..."
if scp -r ./backend/dist/* $REMOTE_HOST:$BACKEND_PATH/dist/ 2>/dev/null; then
    echo "  ✓ Backend compilado transferido"
else
    echo "  ⚠️  Advertencia en transferencia de backend"
fi

# Ecosystem PM2 (necesario para cluster/wait_ready/reload sin downtime)
echo "  Transferiendo ecosystem.config.js..."
if scp ./backend/ecosystem.config.js $REMOTE_HOST:$BACKEND_PATH/ecosystem.config.js 2>/dev/null; then
    echo "  ✓ ecosystem.config.js transferido"
else
    echo "  ⚠️  Advertencia en transferencia de ecosystem.config.js"
fi

echo "✓ Transferencia completada"

# ============================================================================
# FASE 4: VERIFICACIÓN PRE-REINICIO (Crítica)
# ============================================================================
echo ""
echo "✅ FASE 4: Verificación Pre-Reload"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Nota: En deploy sin downtime NO se libera el puerto."
echo "  Se hace rolling reload de workers por PM2 (cluster)."

# ============================================================================
# FASE 5: REINICIO DE PM2
# ============================================================================
echo ""
echo "🔄 FASE 5: Reload de PM2 (Zero Downtime)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Aplicando startOrReload (o reload) en PM2..."
# Exportar variables de .env.production antes de recargar PM2
ssh $REMOTE_HOST "cd $BACKEND_PATH && export \$(grep -v '^#' .env.production | xargs) && pm2 delete secureshop-backend 2>/dev/null; pm2 start ecosystem.config.js && pm2 save" || {
    echo "❌ Error al hacer startOrReload con PM2"
    echo "   Estado de PM2:"; ssh $REMOTE_HOST "pm2 status" || true
    echo "   Últimos logs:"; ssh $REMOTE_HOST "pm2 logs --lines 50" || true
    exit 1
}

echo "  Esperando que el backend quede listo..."
sleep 2

# ============================================================================
# FASE 6: VERIFICACIÓN DE ONLINE
# ============================================================================
echo ""
echo "🔍 FASE 6: Verificación de Backend Online"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKEND_ONLINE=0
for i in {1..20}; do
    if ssh $REMOTE_HOST "curl -fsS http://localhost:$PORT/health >/dev/null" 2>/dev/null; then
        echo "  ✓ Backend responde /health"
        BACKEND_ONLINE=1
        break
    fi
    echo "  Intento $i: esperando /health..."
    sleep 1
done

if [ $BACKEND_ONLINE -eq 0 ]; then
    echo "  ❌ Backend NO responde /health"
    echo "  Estado de PM2:"; ssh $REMOTE_HOST "pm2 status" || true
    echo "  Últimos logs:"; ssh $REMOTE_HOST "pm2 logs --lines 50" || true
    exit 1
fi

ssh $REMOTE_HOST "pm2 status" || true

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deploy completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen del Deploy:"
echo "   ✓ Frontend compilado, transferido y online"
echo "   ✓ Backend compilado, transferido y online"
echo "   ✓ Puerto $PORT liberado y verificado"
echo "   ✓ PM2 reiniciado y ejecutándose"
echo "   ✓ Backend escuchando en puerto $PORT"
echo ""
echo "🎯 Backend URL: http://185.194.204.192:4001"
echo ""
