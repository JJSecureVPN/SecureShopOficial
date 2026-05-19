# 🔧 Guía de Integración: API de Reparación de Cuentas (Self-Repair)

Esta documentación explica cómo funciona el endpoint de reparación de cuentas y cómo puedes integrarlo directamente en tu aplicación VPN móvil o de escritorio (Android/iOS/PC) para que los usuarios solucionen sus problemas de conexión de manera autónoma con un solo clic.

---

## 📝 Concepto y Funcionamiento Avanzado

Cuando un usuario renueva su suscripción, a veces los nodos del clúster de la VPN tardan en reconocer el cambio de estado debido a retardos de sincronización o de caché local en el proveedor Servex. 

Para resolver esto de una manera **saludable, natural y efectiva** (evitando condiciones de carrera y permitiendo que la base de datos de Servex y los nodos asimilen el cambio de estado), el backend implementa una **Sincronización Profunda y Saludable de 2 Ciclos** con intervalos controlados de **1.5 segundos (1500ms)** por acción:
1. **Solo para Clientes VPN:** El endpoint busca únicamente usuarios globales/finales de la VPN. Las cuentas de reventa (revendedores) están excluidas de este proceso.
2. **Ciclo de Reactivación Saludable (Bucle de 2 pasadas):**
   * **Guardar/Actualizar:** Se realiza una edición de datos sin alterar la contraseña, seguido de una pausa de `1500ms` para consolidación en base de datos.
   * **Suspender:** Se ejecuta el comando de suspensión de la cuenta, seguido de una pausa de `1500ms` para permitir que el clúster expulse al usuario si estuviese conectado.
   * **Activar:** Se reactiva la cuenta, seguido de otra pausa de `1500ms` para asegurar la propagación correcta del estado activo a todos los nodos remotos.
3. **Consolidación Final:** Se ejecuta un guardado final para firmar y sincronizar definitivamente el perfil de conexión.

> [!IMPORTANT]
> **Tiempo de Respuesta:** Debido a que el backend realiza esta sincronización profunda de 2 ciclos con intervalos saludables de 1500ms, **la petición tardará aproximadamente 10 segundos en completarse**. Asegúrate de configurar un timeout adecuado en la aplicación cliente (se recomienda un mínimo de **15 a 20 segundos** en dispositivos móviles para dar margen de seguridad).

---

## 🚀 Endpoint de la API

- **URL**: `https://shop.jhservices.com.ar/api/clients/reparar/:username`
- **Método**: `POST`
- **Parámetros de URL**: 
    - `username`: El nombre de usuario de la cuenta VPN (ej: `juan123`).

### Ejemplo de petición (cURL):
```bash
curl -X POST https://shop.jhservices.com.ar/api/clients/reparar/juan123
```

### Respuestas de la API:

- **✅ 200 OK**: (Operación exitosa)
  ```json
  {
    "success": true,
    "message": "Cuenta reparada y sincronizada con éxito. Intenta conectar ahora, si el error persiste repite esta acción una vez más."
  }
  ```

- **❌ 404 Not Found**: (El usuario no existe o es una cuenta de revendedor)
  ```json
  {
    "success": false,
    "error": "La cuenta 'juan123' no fue encontrada en nuestros registros de VPN"
  }
  ```

- **❌ 400 Bad Request**: (Formato inválido o caracteres no permitidos)
  ```json
  {
    "success": false,
    "error": "El nombre de usuario contiene caracteres no permitidos"
  }
  ```

---

## 📱 Integración en App Móvil

Si quieres añadir un botón de **"Reparar Conexión"** dentro de tu App VPN, aquí tienes ejemplos detallados de cómo implementarlo correctamente manejando los tiempos de espera recomendados:

### Android (Java / OkHttp)
```java
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public void repararCuentaVpn(String username) {
    // IMPORTANTE: Configurar timeout de al menos 10 o 15 segundos
    OkHttpClient client = new OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build();

    String url = "https://shop.jhservices.com.ar/api/clients/reparar/" + username;

    Request request = new Request.Builder()
        .url(url)
        .post(RequestBody.create(null, new byte[0]))
        .build();

    // Mostrar un spinner/cargador visual en la app indicando: "Sincronizando cuenta con el clúster..."
    client.newCall(request).enqueue(new Callback() {
        @Override
        public void onFailure(Call call, IOException e) {
            // Ocultar spinner y mostrar mensaje de error de conexión
        }

        @Override
        public void onResponse(Call call, Response response) throws IOException {
            // Ocultar spinner
            if (response.isSuccessful()) {
                // Éxito: Mostrar el mensaje:
                // "¡Cuenta sincronizada! Intenta conectar ahora. Si persiste, repite la acción."
            } else {
                // Manejar error 404 (cuenta no encontrada) o 400 (usuario inválido)
            }
        }
    });
}
```

### iOS (Swift / URLSession)
```swift
func repararCuentaVpn(username: String) {
    let urlString = "https://shop.jhservices.com.ar/api/clients/reparar/\(username)"
    guard let url = URL(string: urlString) else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    
    // Configurar timeout de 15 segundos
    request.timeoutInterval = 15.0
    
    // Mostrar spinner en la interfaz
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Ocultar spinner en el hilo principal
        DispatchQueue.main.async {
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    // Éxito: Notificar al usuario que intente conectar ahora.
                } else {
                    // Error: Manejar códigos de estado 404 o 400
                }
            }
        }
    }.resume()
}
```

---

## ⚠️ Notas de Seguridad y Mejores Prácticas

1. **Sin Credenciales Sensibles:** El endpoint es seguro y público porque solo sincroniza estados. No requiere ni expone contraseñas, lo que elimina cualquier riesgo de filtración.
2. **Rate Limiting (Control de Peticiones):** Se recomienda agregar en la aplicación un bloqueo de botón temporal para que el usuario no pueda presionar el botón de reparación más de una vez por minuto, evitando así llamadas innecesarias al backend.
3. **Animación de Espera (Spinner):** Como el endpoint toma unos 5 segundos, asegúrate de que el usuario vea un indicador de carga claro para evitar que piense que la aplicación se congeló.

---

*Documentación actualizada para SecureShop VPN - Mayo 2026*
