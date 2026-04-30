# Integración de la API — App VPN Externa

Guía completa para consumir el backend de **SecureShop VPN** desde aplicaciones externas (Flutter, React Native, Kotlin, Swift, etc.), con el objetivo de mostrar planes y procesar compras **directamente dentro de la app** sin abandonar la aplicación.

---

## Índice

1. [Información General](#1-información-general)
2. [Autenticación y CORS](#2-autenticación-y-cors)
3. [Flujo Recomendado — Compra en App](#3-flujo-recomendado--compra-en-app)
4. [Endpoints — Planes VPN](#4-endpoints--planes-vpn)
5. [Endpoints — Cupones](#5-endpoints--cupones)
6. [Endpoints — Compra](#6-endpoints--compra)
7. [Endpoints — Verificación del Pago](#7-endpoints--verificación-del-pago)
8. [Endpoints — Estado de Cuenta](#8-endpoints--estado-de-cuenta)
9. [Endpoints — Referidos y Saldo](#9-endpoints--referidos-y-saldo)
10. [Ejemplo Completo en Flutter/Dart](#10-ejemplo-completo-en-flutterdart)
11. [Manejo de Errores](#11-manejo-de-errores)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)

---

## 1. Información General

| Campo | Valor |
|---|---|
| **Base URL producción** | `https://shop.jhservices.com.ar/api` |
| **Base URL local** | `http://localhost:3001/api` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticación** | No requerida para endpoints públicos |
| **Rate limiting** | Activo en endpoints de compra y validación |

> Todos los endpoints devuelven la estructura:
> ```json
> { "success": true,  "data": { ... } }
> { "success": false, "error": "mensaje de error" }
> ```

---

## 2. Autenticación y CORS

### CORS
El backend permite requests desde los orígenes configurados. Para tu app VPN, coordina con el administrador para que tu dominio o `*` esté en la lista blanca de CORS.

Para apps móviles (Flutter, React Native) que hacen requests directos al backend desde el dispositivo, el CORS generalmente no aplica porque no hay `Origin` header en requests nativos. Sin embargo, si usas una **WebView**, sí aplica.

### Headers requeridos
```
Content-Type: application/json
Accept: application/json
```

---

## 3. Flujo Recomendado — Compra en App

Hay dos formas de integrar los pagos en la app. Elige según tu caso de uso:

---

### Opción A — WebView de MercadoPago (más simple, recomendada)

El backend devuelve una URL de pago de MercadoPago. La abres en una WebView dentro de la app y detectas la redirección de éxito/fallo.

```
App VPN
  │
  ├─ 1. GET /api/planes          ─→ Mostrar lista de planes
  │
  ├─ 2. POST /api/cupones/validar ─→ (Opcional) Validar cupón
  │
  ├─ 3. POST /api/comprar         ─→ Obtener URL de MercadoPago
  │         └─ Retorna: { preferenceId, pagoId, initPoint }
  │
  ├─ 4. Abrir initPoint en WebView (sin salir de la app)
  │         └─ Detectar redirect a: /api/pago/success o /api/pago/failure
  │
  └─ 5. GET /api/pago/{pagoId}    ─→ Confirmar estado y obtener credenciales
            └─ Retorna: usuario, contraseña, servidor Servex
```

**Ventaja:** No requiere cambios en el backend.  
**Cómo detectar fin del pago:** Intercepta la URL en el WebView. Cuando sea `/pago/success` o `/pago/failure`, cierra el WebView y consulta el estado.

---

### Opción B — Pago con tarjeta nativo (sin WebView)

Usa el **SDK de MercadoPago** en la app para tokenizar la tarjeta del usuario, y envía el token al backend para generar el pago directamente.

> ⚠️ **Requiere agregar un endpoint nuevo en el backend** (`POST /api/comprar-directo`). Ver sección [¿Cómo agregar el endpoint de pago directo?](#cómo-agregar-el-endpoint-de-pago-directo).

```
App VPN
  │
  ├─ 1. GET /api/planes          ─→ Mostrar lista de planes
  │
  ├─ 2. Mostrar formulario de tarjeta (usando MP SDK móvil)
  │         └─ SDK genera: cardToken
  │
  ├─ 3. POST /api/comprar-directo ─→ Backend procesa el pago con el token
  │         Body: { planId, clienteEmail, clienteNombre, cardToken, installments }
  │         Retorna: { success, pagoId, status }
  │
  └─ 4. GET /api/pago/{pagoId}    ─→ Obtener credenciales VPN si fue aprobado
```

**Ventaja:** Experiencia completamente nativa, sin WebView.  
**Desventaja:** Más complejo de implementar, requiere cumplir PCI-DSS.

---

## 4. Endpoints — Planes VPN

### `GET /api/planes`
Lista todos los planes VPN activos con sus precios, incluyendo promociones activas.

**No requiere parámetros.**

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Plan Básico",
      "precio": 1500,
      "precio_promo": 1050,
      "precio_efectivo": 1050,
      "en_promocion": true,
      "dispositivos": 1,
      "dias": 30,
      "descripcion": "1 dispositivo por 30 días",
      "activo": true,
      "orden": 1
    },
    {
      "id": 2,
      "nombre": "Plan Familiar",
      "precio": 2500,
      "precio_promo": null,
      "precio_efectivo": 2500,
      "en_promocion": false,
      "dispositivos": 3,
      "dias": 30,
      "descripcion": "Hasta 3 dispositivos por 30 días",
      "activo": true,
      "orden": 2
    }
  ],
  "source": "supabase"
}
```

**Campos importantes:**
| Campo | Descripción |
|---|---|
| `precio_efectivo` | **Siempre usar este precio** — ya considera si hay promo activa |
| `en_promocion` | `true` si actualmente tiene precio promocional |
| `precio` | Precio base sin promo |
| `precio_promo` | Precio de promo (puede ser `null`) |
| `dispositivos` | Cantidad de dispositivos simultáneos |
| `dias` | Duración del plan en días |

---

### `GET /api/planes/:id`
Obtiene un solo plan por ID.

**Ejemplo:** `GET /api/planes/2`

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Plan Familiar",
    "precio": 2500,
    "precio_efectivo": 2500,
    "en_promocion": false,
    "dispositivos": 3,
    "dias": 30
  }
}
```

---

### `GET /api/promociones/config`
Estado de las promociones activas. Útil para mostrar un banner de "¡Oferta activa!" en la app.

**Respuesta:**
```json
{
  "vpn_activa": true,
  "vpn_descuento_porcentaje": 30,
  "vpn_duracion_horas": 24,
  "vpn_texto": "¡30% OFF por tiempo limitado!",
  "revendedor_activa": false
}
```

---

## 5. Endpoints — Cupones

### `POST /api/cupones/validar`
Valida un código de cupón y calcula el descuento antes de realizar la compra.

**Body:**
```json
{
  "codigo": "VERANO30",
  "planId": 2,
  "precioPlan": 2500,
  "clienteEmail": "usuario@gmail.com"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `codigo` | string | ✅ | Código del cupón ingresado por el usuario |
| `planId` | number | ❌ | ID del plan para validar restricciones por plan |
| `precioPlan` | number | ❌ | Precio para calcular monto de descuento |
| `clienteEmail` | string | ❌ | Email para validar límite de usos por usuario |

**Respuesta exitosa (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "cupon": {
      "id": 5,
      "codigo": "VERANO30",
      "tipo": "porcentaje",
      "valor": 30,
      "activo": true
    },
    "tipo_descuento": "porcentaje",
    "descuento": 750,
    "precio_final": 1750
  }
}
```

**Respuesta fallida (HTTP 400):**
```json
{
  "success": false,
  "error": "Cupón expirado o no válido para este plan"
}
```

---

### `GET /api/cupones/listar`
Lista los cupones públicos activos (para mostrar en la UI como sugerencias).

**Respuesta:**
```json
{
  "success": true,
  "data": [
    { "codigo": "VERANO30", "tipo": "porcentaje", "valor": 30 }
  ]
}
```

---

## 6. Endpoints — Compra

### `POST /api/comprar`
Inicia el proceso de compra de un plan VPN. Devuelve la URL de pago de MercadoPago.

**Body:**
```json
{
  "planId": 2,
  "clienteEmail": "usuario@gmail.com",
  "clienteNombre": "Juan Pérez",
  "codigoCupon": "VERANO30",
  "saldoUsado": 0
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `planId` | number | ✅ | ID del plan a comprar |
| `clienteEmail` | string | ✅ | Email del comprador |
| `clienteNombre` | string | ✅ | Nombre completo del comprador |
| `codigoCupon` | string | ❌ | Código de cupón validado previamente |
| `codigoReferido` | string | ❌ | Código de referido para descuento |
| `saldoUsado` | number | ❌ | Monto de saldo del wallet a descontar |

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "pagoId": "uuid-del-pago",
    "preferenceId": "MP_PREFERENCE_ID",
    "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
    "sandboxInitPoint": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
    "monto": 1750,
    "planNombre": "Plan Familiar"
  }
}
```

**Campos de la respuesta:**
| Campo | Descripción |
|---|---|
| `pagoId` | **Guardar este ID** — lo usarás para verificar el estado después |
| `initPoint` | URL de MercadoPago para **producción** → abrir en WebView |
| `sandboxInitPoint` | URL de MercadoPago para **testing/desarrollo** |

---

### ¿Cómo agregar el endpoint de pago directo?

Si querés implementar la **Opción B** (pago nativo sin WebView), necesitás agregar este endpoint al backend. Aquí está el código a agregar en `backend/src/routes/tienda.routes.ts`:

```typescript
// POST /api/comprar-directo — Pago con token de tarjeta (sin redirect)
router.post('/comprar-directo', async (req, res) => {
  const { planId, clienteEmail, clienteNombre, cardToken, installments = 1 } = req.body;

  // 1. Obtener el plan
  const plan = await getPlanById(planId);
  if (!plan) return res.status(404).json({ success: false, error: 'Plan no encontrado' });

  // 2. Crear el pago directo en MercadoPago usando el token
  const mpPayment = await mercadopago.payment.create({
    transaction_amount: plan.precio_efectivo,
    token: cardToken,
    installments,
    payment_method_id: req.body.paymentMethodId, // ej: "visa"
    payer: { email: clienteEmail },
    description: plan.nombre,
    external_reference: generatedPagoId,
  });

  // 3. Si fue aprobado, crear la cuenta Servex
  if (mpPayment.body.status === 'approved') {
    await crearCuentaServex(plan, clienteEmail, clienteNombre);
  }

  return res.json({ success: true, data: { status: mpPayment.body.status, pagoId: generatedPagoId } });
});
```

> Para la tokenización de tarjetas en Flutter, usa el [SDK de MercadoPago para Flutter](https://github.com/mercadopago/sdk-flutter).

---

## 7. Endpoints — Verificación del Pago

Una vez que el usuario completó el pago (o para polling), usa estos endpoints.

---

### `GET /api/pago/:pagoId`
Consulta el estado de un pago y, si fue aprobado, retorna las credenciales de la cuenta VPN.

**Ejemplo:** `GET /api/pago/uuid-del-pago`

**Respuesta — Pago aprobado con cuenta creada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pago",
    "estado": "aprobado",
    "monto": 1750,
    "plan_nombre": "Plan Familiar",
    "cliente_email": "usuario@gmail.com",
    "cliente_nombre": "Juan Pérez",
    "servex_username": "vpnuser123",
    "servex_password": "pass_generada",
    "servex_expiracion": "2026-04-13T00:00:00Z",
    "servex_dias": 30,
    "servex_connection_limit": 3,
    "created_at": "2026-03-13T10:30:00Z"
  }
}
```

**Respuesta — Pago pendiente:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pago",
    "estado": "pendiente",
    "servex_username": null,
    "servex_password": null
  }
}
```

**Estados posibles del pago:**
| Estado | Significado |
|---|---|
| `pendiente` | Pago en proceso, webhook aún no llegó |
| `aprobado` | Pago confirmado, cuenta VPN creada |
| `rechazado` | Pago rechazado por MP |
| `cancelado` | Compra cancelada |

---

### `POST /api/pago/:pagoId/verificar-ahora`
Fuerza una verificación inmediata contra MercadoPago sin esperar el webhook. Útil como fallback si el usuario volvió a la app pero el webhook tardó.

**Ejemplo:** `POST /api/pago/uuid-del-pago/verificar-ahora`

**No requiere body.**

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pago",
    "estado": "aprobado",
    "servex_username": "vpnuser123",
    "servex_password": "pass_generada"
  },
  "meta": {
    "mercadoPagoStatus": "approved"
  }
}
```

> **Cuándo usarlo:** Después de cerrar el WebView de MercadoPago, llama a este endpoint para obtener el resultado inmediatamente, sin hacer polling.

---

## 8. Endpoints — Estado de Cuenta

### `GET /api/clients/estado/:username`
Obtiene el estado actual de una cuenta VPN (para mostrar en el perfil del usuario dentro de la app).

**Ejemplo:** `GET /api/clients/estado/vpnuser123`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "username": "vpnuser123",
    "tipo": "cliente",
    "estado": "activo",
    "activo": true,
    "diasRestantes": 15,
    "expiracion": "2026-03-28T00:00:00Z",
    "connectionLimit": 3,
    "creditos": null
  }
}
```

**Estados posibles:**
| Estado | Descripción |
|---|---|
| `activo` | Cuenta activa con días disponibles |
| `por_expirar` | Expira en los próximos días (mostrar aviso de renovación) |
| `expirado` | Cuenta expirada |

---

### `GET /api/stats/servidores`
Lista los servidores VPN disponibles con su estado online/offline y carga de usuarios.

**Respuesta:**
```json
{
  "servidores": [
    {
      "id": 1,
      "nombre": "Argentina 1",
      "host": "ar1.vpn.example.com",
      "usuarios_activos": 45,
      "online": true
    }
  ],
  "servidoresOnline": 3,
  "totalUsuarios": 120,
  "ultimaActualizacion": "2026-03-13T10:00:00Z"
}
```

---

## 9. Endpoints — Referidos y Saldo

### `GET /api/referidos/saldo/:email`
Consulta el saldo disponible del wallet de un usuario.

**Ejemplo:** `GET /api/referidos/saldo/usuario@gmail.com`

**Respuesta:**
```json
{
  "saldo": 500,
  "userId": "uuid-del-usuario"
}
```

---

### `GET /api/referidos/validar/:codigo`
Valida un código de referido antes de aplicarlo en la compra.

**Ejemplo:** `GET /api/referidos/validar/REF-ABC123?email=nuevo@gmail.com`

**Respuesta:**
```json
{
  "valido": true,
  "descuento_porcentaje": 10,
  "referidorEmail": "referidor@gmail.com"
}
```

---

### `GET /api/referidos/settings`
Configuración pública del programa de referidos.

**Respuesta:**
```json
{
  "activo": true,
  "porcentaje_recompensa": 5,
  "porcentaje_descuento_referido": 10,
  "mensaje_promocional": "¡Invitá amigos y ganá saldo!"
}
```

---

## 10. Ejemplo Completo en Flutter/Dart

### Modelo de datos

```dart
class PlanVPN {
  final int id;
  final String nombre;
  final double precio;
  final double precioEfectivo;
  final bool enPromocion;
  final int dispositivos;
  final int dias;
  final String? descripcion;

  PlanVPN({
    required this.id,
    required this.nombre,
    required this.precio,
    required this.precioEfectivo,
    required this.enPromocion,
    required this.dispositivos,
    required this.dias,
    this.descripcion,
  });

  factory PlanVPN.fromJson(Map<String, dynamic> json) => PlanVPN(
    id: json['id'],
    nombre: json['nombre'],
    precio: (json['precio'] as num).toDouble(),
    precioEfectivo: (json['precio_efectivo'] as num).toDouble(),
    enPromocion: json['en_promocion'] ?? false,
    dispositivos: json['dispositivos'],
    dias: json['dias'],
    descripcion: json['descripcion'],
  );
}
```

### Servicio de API

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class VPNShopService {
  static const String baseUrl = 'https://shop.jhservices.com.ar/api';

  // ─── Obtener planes ───────────────────────────────────────────────────────

  static Future<List<PlanVPN>> getPlanes() async {
    final res = await http.get(Uri.parse('$baseUrl/planes'));
    final json = jsonDecode(res.body);
    if (json['success'] == true) {
      return (json['data'] as List)
          .map((p) => PlanVPN.fromJson(p))
          .toList();
    }
    throw Exception('Error al obtener planes: ${json['error']}');
  }

  // ─── Validar cupón ────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> validarCupon({
    required String codigo,
    required int planId,
    required double precioPlan,
    required String clienteEmail,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/cupones/validar'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'codigo': codigo,
        'planId': planId,
        'precioPlan': precioPlan,
        'clienteEmail': clienteEmail,
      }),
    );
    final json = jsonDecode(res.body);
    if (res.statusCode == 200 && json['success'] == true) {
      return json['data'];
    }
    throw Exception(json['error'] ?? 'Cupón inválido');
  }

  // ─── Iniciar compra ───────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> iniciarCompra({
    required int planId,
    required String clienteEmail,
    required String clienteNombre,
    String? codigoCupon,
    double saldoUsado = 0,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/comprar'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'planId': planId,
        'clienteEmail': clienteEmail,
        'clienteNombre': clienteNombre,
        if (codigoCupon != null) 'codigoCupon': codigoCupon,
        'saldoUsado': saldoUsado,
      }),
    );
    final json = jsonDecode(res.body);
    if (json['success'] == true) return json['data'];
    throw Exception(json['error'] ?? 'Error al iniciar la compra');
  }

  // ─── Verificar pago (forzado) ─────────────────────────────────────────────

  static Future<Map<String, dynamic>> verificarPago(String pagoId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/pago/$pagoId/verificar-ahora'),
      headers: {'Content-Type': 'application/json'},
    );
    final json = jsonDecode(res.body);
    if (json['success'] == true) return json['data'];
    throw Exception('Error verificando pago');
  }

  // ─── Obtener estado del pago ──────────────────────────────────────────────

  static Future<Map<String, dynamic>> estadoPago(String pagoId) async {
    final res = await http.get(Uri.parse('$baseUrl/pago/$pagoId'));
    final json = jsonDecode(res.body);
    if (json['success'] == true) return json['data'];
    throw Exception('Pago no encontrado');
  }
}
```

### Pantalla de Planes con WebView

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PantallaPlanesVPN extends StatefulWidget {
  final String clienteEmail;
  final String clienteNombre;

  const PantallaPlanesVPN({
    required this.clienteEmail,
    required this.clienteNombre,
    super.key,
  });

  @override
  State<PantallaPlanesVPN> createState() => _PantallaPlanesVPNState();
}

class _PantallaPlanesVPNState extends State<PantallaPlanesVPN> {
  List<PlanVPN> planes = [];
  bool cargando = true;

  @override
  void initState() {
    super.initState();
    _cargarPlanes();
  }

  Future<void> _cargarPlanes() async {
    try {
      final data = await VPNShopService.getPlanes();
      setState(() {
        planes = data;
        cargando = false;
      });
    } catch (e) {
      setState(() => cargando = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _comprarPlan(PlanVPN plan) async {
    try {
      // 1. Crear la preferencia de pago
      final compra = await VPNShopService.iniciarCompra(
        planId: plan.id,
        clienteEmail: widget.clienteEmail,
        clienteNombre: widget.clienteNombre,
      );

      final pagoId = compra['pagoId'] as String;
      final urlPago = compra['initPoint'] as String;

      // 2. Abrir MercadoPago en WebView DENTRO de la app
      if (!mounted) return;
      final resultado = await Navigator.push<String>(
        context,
        MaterialPageRoute(
          builder: (_) => WebViewPago(
            url: urlPago,
            pagoId: pagoId,
          ),
        ),
      );

      // 3. Mostrar resultado
      if (resultado == 'aprobado') {
        _mostrarCuentaVPN(pagoId);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago cancelado o rechazado')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _mostrarCuentaVPN(String pagoId) async {
    final pago = await VPNShopService.estadoPago(pagoId);
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('¡Compra exitosa! 🎉'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Usuario: ${pago['servex_username']}'),
            Text('Contraseña: ${pago['servex_password']}'),
            Text('Expira: ${pago['servex_expiracion']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (cargando) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(title: const Text('Planes VPN')),
      body: ListView.builder(
        itemCount: planes.length,
        itemBuilder: (_, i) {
          final plan = planes[i];
          return Card(
            margin: const EdgeInsets.all(8),
            child: ListTile(
              title: Text(plan.nombre),
              subtitle: Text('${plan.dispositivos} dispositivo(s) · ${plan.dias} días'),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (plan.enPromocion)
                    Text(
                      '\$${plan.precio.toStringAsFixed(0)}',
                      style: const TextStyle(
                        decoration: TextDecoration.lineThrough,
                        fontSize: 11,
                        color: Colors.grey,
                      ),
                    ),
                  Text(
                    '\$${plan.precioEfectivo.toStringAsFixed(0)}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: plan.enPromocion ? Colors.green : Colors.blue,
                    ),
                  ),
                ],
              ),
              onTap: () => _comprarPlan(plan),
            ),
          );
        },
      ),
    );
  }
}

// ─── WebView que intercepta la redirección de MercadoPago ────────────────────

class WebViewPago extends StatefulWidget {
  final String url;
  final String pagoId;

  const WebViewPago({required this.url, required this.pagoId, super.key});

  @override
  State<WebViewPago> createState() => _WebViewPagoState();
}

class _WebViewPagoState extends State<WebViewPago> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (req) {
            // Detectar cuando MP redirige de vuelta al backend
            if (req.url.contains('/api/pago/success') ||
                req.url.contains('/pago/success') ||
                req.url.contains('status=approved')) {
              _verificarYCerrar();
              return NavigationDecision.prevent;
            }
            if (req.url.contains('/api/pago/failure') ||
                req.url.contains('/pago/failure') ||
                req.url.contains('status=rejected')) {
              Navigator.pop(context, 'rechazado');
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  Future<void> _verificarYCerrar() async {
    // Forzar verificación inmediata sin esperar el webhook
    try {
      await VPNShopService.verificarPago(widget.pagoId);
      if (mounted) Navigator.pop(context, 'aprobado');
    } catch (_) {
      if (mounted) Navigator.pop(context, 'aprobado'); // igual avisamos éxito
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Completar Pago'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context, 'cancelado'),
        ),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
```

---

## 11. Manejo de Errores

### Códigos de error HTTP

| HTTP | Significado | Acción recomendada |
|---|---|---|
| `400` | Validación fallida (campos faltantes o inválidos) | Mostrar mensaje al usuario |
| `404` | Plan o pago no encontrado | Verificar IDs |
| `409` | Pago duplicado o cupón ya usado | Informar al usuario |
| `429` | Rate limit superado | Esperar y reintentar |
| `500` | Error interno del servidor | Reintentar, contactar soporte |

### Estructura de error estándar

```json
{
  "success": false,
  "error": "Descripción del error en español",
  "code": "ERROR_CODE_OPCIONAL"
}
```

### Reintentos recomendados

Para la verificación de pago, ante un resultado `pendiente`, se recomienda el siguiente polling:

```dart
Future<Map<String, dynamic>> esperarPagoAprobado(String pagoId) async {
  for (int i = 0; i < 10; i++) {
    await Future.delayed(const Duration(seconds: 3));
    final pago = await VPNShopService.estadoPago(pagoId);
    if (pago['estado'] == 'aprobado') return pago;
    if (pago['estado'] == 'rechazado') throw Exception('Pago rechazado');
  }
  throw Exception('Tiempo de espera agotado. Contactá soporte si tu pago fue exitoso.');
}
```

> Alternativamente, usa `POST /api/pago/:id/verificar-ahora` una sola vez en lugar de polling. Es más eficiente.

---

## 12. Preguntas Frecuentes

**¿Puedo mostrar los planes sin que el usuario esté logueado?**  
Sí. `GET /api/planes` es completamente público.

**¿Cómo evito que MercadoPago abra el navegador externo?**  
Abrí `initPoint` en un `WebView` nativo de la app (ver código de ejemplo). Así el usuario nunca abandona la app.

**¿Cómo sé cuándo el usuario terminó de pagar?**  
Interceptá la URL en el `NavigationDelegate` del WebView. Cuando la URL contenga `/pago/success` o `status=approved`, cerrá el WebView y llamá a `POST /api/pago/:id/verificar-ahora`.

**¿Qué pasa si el usuario cierra la app antes de que llegue el webhook?**  
Guardá el `pagoId` localmente (SharedPreferences). Cuando el usuario reabra la app, verificá el estado con `GET /api/pago/:pagoId`. Si está `aprobado`, mostrá las credenciales.

**¿Es seguro enviar el email y nombre en la compra?**  
Sí, pero siempre usá HTTPS. Nunca loguees datos de tarjeta ni información sensible en el cliente.

**¿Puedo probar en sandbox de MercadoPago?**  
Sí. El backend tiene configuración para sandbox. Usá `sandboxInitPoint` en lugar de `initPoint` durante el desarrollo. Consultá al administrador del backend para activar el modo sandbox.

**¿Cómo renuevo una cuenta existente desde la app?**  
Usá `POST /api/renovacion/buscar` para encontrar la cuenta por email, luego `POST /api/renovacion/cliente` para generar la preferencia de pago de renovación. El flujo es idéntico al de compra.

---

*Documentación generada para el proyecto SecureShop VPN — Última actualización: marzo 2026*
