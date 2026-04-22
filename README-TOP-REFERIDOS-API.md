# Integración de la API: Top Referidos (Salón de la Fama)

Esta guía documenta cómo consumir la API del sistema para obtener el Top Global de Referidos desde tu aplicación externa (por ejemplo, tu AppVPN en Android/iOS o cualquier otro cliente), para recrear el "Salón de la Fama".

---

## 📍 Endpoint Principal

Actualmente, el ranking de referidos se lee desde el endpoint de usuarios con saldo, y se ordena en el cliente.

- **Método:** `GET`
- **Ruta:** `/api/referidos/admin/usuarios-saldo`
- **Query Params:** `?limit=20` (Se recomienda pedir un poco más del límite visible, por si hay usuarios empatados o excluidos).

**Ejemplo de URL Completa:**  
`https://tu-dominio.com/api/referidos/admin/usuarios-saldo?limit=20`
*(Nota: Asegúrate de reemplazar `tu-dominio.com` por la URL o la IP pública con puerto donde corre tu backend, ej: `http://185.194.204.192:4001`)*

---

## 📥 Estructura de la Respuesta (JSON)

El endpoint devolverá un Array (`[]`) con los usuarios del sistema que tienen la propiedad de ganancias/saldo. Cada objeto tiene la siguiente estructura:

```json
[
  {
    "id": "e3b0c442-989b-464c-8650-123456789abc",
    "email": "usuario@email.com",
    "nombre": "Nombre de Usuario",
    "saldo": 1500,
    "total_earned": 5000,
    "referral_code": "SECURE-XYZ123",
    "created_at": "2024-03-20T10:00:00Z"
  },
  ...
]
```

---

## 🛠️ Procesamiento Lógico (Código en tu App)

En tu AppVPN, una vez recibes esta lista, debes procesarla con la siguiente lógica para mostrar el Top 5 exacto tal cual está armado en el panel web:

1. **Ordenar por total ganado o referidos:**  
   El backend envía una lista de usuarios. Debes ordenar el array en base a la propiedad `total_earned` de mayor a menor (Descendente).  
   *Nota: `total_earned` es el reflejo de cuánto éxito ha tenido como referidor independientemente de si ya gastó su "saldo" o no.*

2. **Cortar la lista (El Top 5):**  
   Extraes únicamente los primeros 5 puestos del listado ya ordenado.

3. **Ocultamiento de privacidad (Opcional pero Recomendado):**  
   En la web, si el usuario no especificó su `nombre`, usamos la primera parte de su `email` cortando todo lo demás (lo que hay antes del `@`).  

### Ejemplo en Java / Kotlin (Android)
Si estás haciendo tu App en Android con Kotlin, la lógica de parseo una vez obtienes tu lista `val usuarios` sería:
```kotlin
val top5Referidos = usuarios
    .sortedByDescending { it.total_earned ?: 0 }
    .take(5)

top5Referidos.forEachIndexed { index, referidor ->
    val nombreAMostrar = if (!referidor.nombre.isNullOrEmpty()) {
        referidor.nombre
    } else {
        referidor.email.substringBefore("@")
    }
    
    val rank = index + 1
    println("Puesto #$rank: $nombreAMostrar")
}
```

### Ejemplo en Javascript / Dart (Flutter)
```dart
usuarios.sort((a, b) => b.total_earned.compareTo(a.total_earned));
var top5 = usuarios.take(5).toList();

for (var i = 0; i < top5.length; i++) {
  var user = top5[i];
  var nombreMostrar = user.nombre ?? user.email.split('@')[0];
  print('Posición #${i + 1}: $nombreMostrar');
}
```

---

## 🏆 Conceptos de "Niveles/Rangos"

Si deseas imitar de forma idéntica la interfaz y el diseño del Salón de la Fama que creamos para la Web, puedes añadir estos "Rangos" basándote en la posición matemática (del índice 0 al índice 4) del Top:

- **Posición #1** (Índice 0): "Leyenda de la Red"
- **Posición #2** (Índice 1): "Master Conector"
- **Posición #3** (Índice 2): "Ninja Expandor"
- **Posición #4** (Índice 3): "Influencer Élite"
- **Posición #5** (Índice 4): "Embajador Premium"
- *(Resto)*: "Promotor Activo"
