# API de Detección de Oferta 2x1 — SecureShop VPN

## Descripción

Esta API permite a aplicaciones externas (como el APK del VPN) detectar si la oferta **2x1 (doble de dispositivos)** está activa en la tienda. Esto facilita mostrar avisos promocionales dentro de la app sin necesidad de hardcodear estados.

---

## Endpoints

### 1. Estado 2x1 (Simplificado)

**Uso recomendado para la app VPN.** Respuesta mínima, ideal para chequeos rápidos.

```
GET https://shop.jhservices.com.ar/api/config/2x1-status
```

#### Respuesta

```json
// Activa
{ "active": true }

// Inactiva
{ "active": false }
```

| Campo    | Tipo    | Descripción                          |
|----------|---------|--------------------------------------|
| `active` | boolean | `true` si la oferta 2x1 está activa |

---

### 2. Estado Completo de Promociones

Devuelve toda la configuración de promociones, incluyendo descuentos porcentuales, tiempos y estado del 2x1.

```
GET https://shop.jhservices.com.ar/api/config/promo-status
```

#### Respuesta

```json
{
  "promo_config": {
    "activa": true,
    "activada_en": "2026-03-27T10:00:00.000Z",
    "duracion_horas": 24,
    "auto_desactivar": true,
    "descuento_porcentaje": 20,
    "solo_nuevos": false,
    "solo_renovaciones": false,
    "vpn_2x1_activa": true,
    "vpn_2x1_activada_en": "2026-03-27T10:00:00.000Z",
    "vpn_2x1_duracion_horas": 24
  }
}
```

| Campo                      | Tipo    | Descripción                                      |
|----------------------------|---------|--------------------------------------------------|
| `activa`                   | boolean | Si hay descuento porcentual activo               |
| `descuento_porcentaje`     | number  | Porcentaje de descuento global                   |
| `vpn_2x1_activa`           | boolean | Si la oferta 2x1 (doble dispositivos) está activa|
| `vpn_2x1_activada_en`      | string  | Timestamp ISO de cuándo se activó                |
| `vpn_2x1_duracion_horas`   | number  | Duración configurada en horas                    |

---

## Ejemplos de Integración

### Kotlin (Android)

```kotlin
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

suspend fun is2x1Active(): Boolean {
    return try {
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("https://shop.jhservices.com.ar/api/config/2x1-status")
            .get()
            .build()
        
        val response = client.newCall(request).execute()
        val json = JSONObject(response.body?.string() ?: "{}")
        json.optBoolean("active", false)
    } catch (e: Exception) {
        false // Si falla la conexión, asumir inactiva
    }
}
```

### Java (Android)

```java
public void check2x1(Callback callback) {
    OkHttpClient client = new OkHttpClient();
    Request request = new Request.Builder()
        .url("https://shop.jhservices.com.ar/api/config/2x1-status")
        .get()
        .build();

    client.newCall(request).enqueue(new okhttp3.Callback() {
        @Override
        public void onResponse(Call call, Response response) throws IOException {
            JSONObject json = new JSONObject(response.body().string());
            boolean active = json.optBoolean("active", false);
            callback.onResult(active);
        }

        @Override
        public void onFailure(Call call, IOException e) {
            callback.onResult(false);
        }
    });
}
```

### JavaScript / React Native

```javascript
async function check2x1() {
  try {
    const res = await fetch('https://shop.jhservices.com.ar/api/config/2x1-status');
    const data = await res.json();
    return data.active === true;
  } catch {
    return false;
  }
}
```

---

## Recomendaciones

- **Frecuencia de consulta**: Consultar al abrir la app y cada 5-10 minutos como máximo.
- **Cache**: Cachear el resultado localmente por al menos 60 segundos para no sobrecargar la API.
- **Fallback**: Si la API no responde, asumir `active: false` y no mostrar ningún aviso.
- **No requiere autenticación**: El endpoint es público, no necesita API key ni token.

---

## Flujo Sugerido en la App

```
App se abre
  → GET /api/config/2x1-status
  → Si active == true:
      → Mostrar banner/aviso: "¡OFERTA 2x1! Doble de dispositivos en todos los planes"
      → Botón "Ver Ofertas" → Abrir https://shop.jhservices.com.ar/planes
  → Si active == false:
      → No mostrar nada
```
