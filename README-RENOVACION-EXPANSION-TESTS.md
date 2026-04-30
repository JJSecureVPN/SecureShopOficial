# Pruebas manuales de Renovación/Expansión (Revendedor)

Este README describe el flujo que se hizo y cómo replicar para verificar y forzar aprobaciones.

## 1. Preparación

1. Asegurarse de tener acceso SSH al VPS (host real): `root@185.194.204.192`.
2. El backend corre en `http://localhost:4001` dentro del VPS.
3. Los endpoints principales son:
   - `POST /api/renovacion/buscar` (busca usuario/revendedor)
   - `POST /api/renovacion/revendedor` (crear renovacion/expansion)
   - `GET /api/renovacion/status/:id` (obtener estado)
   - `POST /api/renovacion/admin/forzar/:id` (forzar confirmacion manual)

## 2. Flujo para prueba de renovación/expansión (manual)

### 2.1 Buscar revendedor

```bash
ssh root@185.194.204.192 \
  'curl -s -X POST "http://localhost:4001/api/renovacion/buscar" \
    -H "Content-Type: application/json" \
    -d "{\"busqueda\":\"jhservicess\"}" | jq'
```

- Verificar `datos.servex_account_type` y `datos.max_users`.

### 2.2 Crear operación (renovación o expansión)

Ejemplo renovación:

```bash
ssh root@185.194.204.192 \
  'curl -s -X POST "http://localhost:4001/api/renovacion/revendedor" \
    -H "Content-Type: application/json" \
    -d "{\"busqueda\":\"jhservicess\",\"dias\":30,\"clienteEmail\":\"qa@example.com\",\"clienteNombre\":\"QA Test\",\"tipoRenovacion\":\"validity\",\"cantidadSeleccionada\":10,\"operacion\":\"renovacion\"}" | jq'
```

Ejemplo expansión:

```bash
ssh root@185.194.204.192 \
  'curl -s -X POST "http://localhost:4001/api/renovacion/revendedor" \
    -H "Content-Type: application/json" \
    -d "{\"busqueda\":\"jhservicess\",\"dias\":30,\"clienteEmail\":\"qa@example.com\",\"clienteNombre\":\"QA Test\",\"tipoRenovacion\":\"validity\",\"cantidadSeleccionada\":15,\"operacion\":\"expansion\"}" | jq'
```

- Anotar `renovacion.id` (ej. 69, 71) del JSON.

## 3. Verificar estado

```bash
ssh root@185.194.204.192 \
  'curl -s "http://localhost:4001/api/renovacion/status/ID" | jq'
```

- `estado` puede ser `pendiente`, luego `aprobado`.

## 4. Forzar confirmación (cuando hay problema o para pruebas QA)

```bash
ssh root@185.194.204.192 \
  'curl -s -X POST "http://localhost:4001/api/renovacion/admin/forzar/ID" | jq'
```

- Re-validate status

```bash
ssh root@185.194.204.192 \
  'curl -s "http://localhost:4001/api/renovacion/status/ID" | jq'
```

## 5. Verificar logs PM2 (debug)

```bash
ssh root@185.194.204.192 \
  'pm2 logs secureshop-backend --lines 120 --nostream | grep -i "renovacion\|jhvservicess\|ID"'
```

## 6. Verificar datos finales en Servex

Usar endpoint:
- `GET /api/clients/estado/jhservicess`

Debes ver:
- `expiration_date` actualizado
- `max_users` (según tipo `validity`, debe mantenerse o ajustarse si es expansion)
- `usuario cansado` etc.

## 7. Notas de problemas conocidos

- Si las operaciones dicen `No se encontró un plan para tipo=validity, cantidad=X`, significa que la tabla de planes en Supabase no incluye ese `max_users` y se usa default.
- En expansión el backend usa cálculo prorrateado con plan adicional y debería producir `monto` correcto.
- Si `estado = pendiente` luego de `forzar` o no actualiza, usar verificar logs y endpoint admin.

## 8. Cómo corregir si no se agregan usuarios

- Revisar `renovacion.service.ts` seccion `procesarRenovacionRevendedor` para que en `tipoRenovacion === 'validity' && operacion === 'expansion'` actualice `max_users` a `cantidad`.
- También validar que `buscarCliente` obtiene datos `max_users` desde Servex.
- Ejecutar `forzar` y confirmar en `/api/clients/estado/jhservicess`.
