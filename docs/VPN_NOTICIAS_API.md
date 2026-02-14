# API Noticias (App VPN) 🔒📣

Breve guía para que la app VPN consuma noticias específicas (marcadas como `visible_para = 'vpn'`) desde el backend de SecureShop.

---

## Resumen
- Endpoint principal: **GET /api/noticias/vpn**
- Devuelve solo noticias con **estado = 'publicada'** y **visible_para = 'vpn'**, además respeta `mostrar_desde` / `mostrar_hasta`.
- Antes de usarlo: **ejecutar la migración** `supabase/migrations/019_noticias_vpn.sql` en tu proyecto Supabase para habilitar la opción `vpn` y las políticas RLS.

---

## Autenticación & seguridad ✅
Recomendación: proteger el endpoint con uno de estos mecanismos según tu política de seguridad:
- Requerir token JWT (claim específico) y validar en backend.
- Usar una **API key** personalizada (cabecera `x-vpn-api-key: <KEY>`).

Nota: por defecto el endpoint es accesible como público (según RLS/roles). Si quieres que sólo la app VPN consuma estas noticias, añade middleware que valide un token o key antes de permitir el acceso.

---

## GET /api/noticias/vpn
Descripción: lista noticias destinadas a la app VPN.

Query params:
- `categoria` (opcional): slug de la categoría (p. ej. `promociones`).
- `page` (opcional): número de página (default `1`).
- `limit` (opcional): cantidad por página (default `10`, max `50`).

Respuesta (200):
{
  "success": true,
  "data": [ /* array de noticias */ ],
  "count": 123
}

Respuesta de error:
{
  "success": false,
  "error": "Mensaje de error"
}

Comportamiento: el servidor devuelve solo noticias que cumplen:
- `estado = 'publicada'`
- `visible_para = 'vpn'`
- `mostrar_desde <= NOW()` si `mostrar_desde` no es null
- `mostrar_hasta > NOW()` si `mostrar_hasta` no es null

---

## Campos importantes en cada noticia
- `id`, `titulo`, `descripcion`, `contenido_completo`
- `categoria_id`, `categoria_nombre`, `categoria_slug`, `categoria_color`, `categoria_icono`
- `imagen_url`, `imagen_alt`
- `fecha_publicacion`, `fecha_expiracion`, `mostrar_desde`, `mostrar_hasta`
- `prioridad`, `destacada`
- `allow_comentarios` (nota: actualmente los endpoints de comentarios públicos sólo funcionan para `visible_para = 'todos'`)
- `created_at`, `updated_at`
- `total_vistas`, `total_clics`, `total_compartidas` (desde `noticia_stats`)

---

## Ejemplos de consumo

### curl

curl con API key (recomendado):

```
curl -s "https://api.tudominio.com/api/noticias/vpn?categoria=promociones&page=1&limit=10" \
  -H "x-vpn-api-key: YOUR_VPN_API_KEY"
```

### Fetch (JS)

```js
async function fetchNoticiasVPN({ categoria, page = 1, limit = 10, apiKey }) {
  const q = new URLSearchParams();
  if (categoria) q.set('categoria', categoria);
  q.set('page', page);
  q.set('limit', limit);

  const resp = await fetch(`/api/noticias/vpn?${q.toString()}`, {
    headers: {
      'x-vpn-api-key': apiKey,
      'Accept': 'application/json'
    }
  });

  if (!resp.ok) throw new Error('Error consultando noticias');
  const json = await resp.json();
  if (!json.success) throw new Error(json.error || 'Error');
  return json.data;
}
```

### Flutter (http package)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List> fetchNoticiasVPN({String? categoria, int page = 1, int limit = 10, required String apiKey}) async {
  final uri = Uri.parse('https://api.tudominio.com/api/noticias/vpn')
    .replace(queryParameters: {
      if (categoria != null) 'categoria': categoria,
      'page': page.toString(),
      'limit': limit.toString(),
    });

  final resp = await http.get(uri, headers: {
    'x-vpn-api-key': apiKey,
    'Accept': 'application/json',
  });

  if (resp.statusCode != 200) throw Exception('Error al obtener noticias');
  final json = jsonDecode(resp.body);
  if (json['success'] != true) throw Exception(json['error'] ?? 'Error desconocido');
  return json['data'] as List;
}
```

---

## Notas operativas & recomendaciones ⚙️
- **Migración**: ejecutar `supabase/migrations/019_noticias_vpn.sql` antes de usar `visible_para = 'vpn'`.
- **Comentarios**: si quieres comentarios para noticias VPN, hay que adaptar `NoticiasService.obtenerComentariosPublicos` y la política RLS.
- **Caching**: considera cachear respuestas en la app VPN (ETag/Cache-Control) para reducir consultas.
- **Rate limiting**: añade límites por key/IP si la app hace muchas peticiones.
- **Images**: `imagen_url` puede ser URL o data URL; la app debe soportar ambos.

---

## Errores comunes
- 400: parámetros inválidos (p. ej. page/limit no numéricos)
- 404: noticia no encontrada
- 500: error interno del servidor

---

## ¿Quieres que lo asegure por ti? 🔐
Puedo:
- Añadir middleware express que valide `x-vpn-api-key` o JWT antes de devolver noticias.
- Habilitar y documentar un proceso de creación/rotación de API keys.

---

## Ubicación de archivos relevantes
- Ruta backend: `backend/src/routes/noticias.routes.ts` (GET `/api/noticias/vpn`)
- Servicio: `backend/src/services/noticias.service.ts` (`obtenerNoticiasVPN`)
- Migración: `supabase/migrations/019_noticias_vpn.sql`

---

Si quieres, agrego la validación por API key (backend + ejemplo en la app VPN) y actualizo esta doc con las instrucciones de creación/rotación de claves. ¿Lo agrego? ✨