# 🔧 Guía de Integración: API de Reparación de Cuentas (Self-Repair)

Esta documentación explica cómo funciona el endpoint de reparación de cuentas y cómo puedes integrarlo directamente en tu aplicación VPN (Android/iOS/PC) para que los usuarios solucionen sus problemas de conexión con un solo clic.

---

## 📝 Concepto
Cuando un usuario renueva su suscripción, a veces los nodos de la VPN tardan en reconocer el cambio de estado. El "Reparar Cuenta" fuerza una sincronización inmediata con el proveedor Servex (equivalentemente a "Guardar" el cliente en el panel administrativo), asegurando que el estado sea `activo` y el tipo `user`, **sin cambiar la contraseña**.

---

## 🚀 Endpoint de la API

- **URL**: `https://shop.jhservices.com.ar/api/clients/reparar/:username`
- **Método**: `POST`
- **Parámetros de URL**: 
    - `username`: El ID/Usuario de la cuenta VPN (ej: `jhservices`).

### Ejemplo de petición (cURL):
```bash
curl -X POST https://shop.jhservices.com.ar/api/clients/reparar/jhservices
```

### Respuestas:

- **✅ 200 OK**:
  ```json
  {
    "success": true,
    "message": "Cuenta sincronizada correctamente. Intenta conectar ahora."
  }
  ```

- **❌ 404 Not Found**: (El usuario no existe)
  ```json
  {
    "success": false,
    "error": "La cuenta 'jhservices' no fue encontrada en nuestros registros de VPN"
  }
  ```

- **❌ 400 Bad Request**: (Formato inválido o caracteres no permitidos)
  ```json
  {
    "success": false,
    "error": "Nombre de usuario inválido"
  }
  ```

---

## 📱 Integración en App Móvil

Si quieres añadir un botón de **"Reparar Conexión"** dentro de tu App VPN, aquí tienes ejemplos de cómo llamarlo:

### Android (Java/OkHttp)
```java
// Ejemplo básico usando OkHttp
OkHttpClient client = new OkHttpClient();
String username = "usuario_del_usuario";
String url = "https://shop.jhservices.com.ar/api/clients/reparar/" + username;

Request request = new Request.Builder()
    .url(url)
    .post(RequestBody.create(null, new byte[0]))
    .build();

client.newCall(request).enqueue(new Callback() {
    @Override
    public void onResponse(Call call, Response response) throws IOException {
        if (response.isSuccessful()) {
            // Mostrar mensaje de éxito al usuario:
            // "¡Cuenta reparada! Intenta conectar ahora."
        }
    }
});
```

### iOS (Swift/URLSession)
```swift
let username = "usuario_del_usuario"
let url = URL(string: "https://shop.jhservices.com.ar/api/clients/reparar/\(username)")!
var request = URLRequest(url: url)
request.httpMethod = "POST"

URLSession.shared.dataTask(with: request) { data, response, error in
    if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
        // Éxito: Notificar al usuario que ya puede conectar.
    }
}.resume()
```

---

## ⚠️ Notas de Seguridad e Implementación

1. **Sin Contraseñas**: El endpoint es seguro porque solo realiza una "Sincronización de Estado". No requiere ni devuelve contraseñas, por lo que no hay riesgo de filtración de credenciales.
2. **Rate Limiting**: Se recomienda no llamar a este endpoint más de una vez cada 60 segundos por usuario para no saturar la API de Servex.
3. **Feedback Visual**: Siempre muestra un mensaje de "Reparando..." o un spinner mientras se realiza la petición, ya que la comunicación con Servex puede tardar entre 2 y 5 segundos.

---

*Documentación generada para SecureShop VPN - 2026*
