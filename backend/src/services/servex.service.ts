import axios, { AxiosInstance } from "axios";
import {
  ClienteServex,
  ClienteCreado,
  CategoriaServex,
  ServexApiConfig,
  ServexClienteResponse,
  RevendedorServex,
  RevendedorCreado,
  ServexRevendedorResponse,
} from "../types";

export class ServexService {
  private client: AxiosInstance;
  private clientesCache: { key: string; data: any[]; timestamp: number } | null = null;
  private clientesCachePromise: { key: string; promise: Promise<any[]> } | null = null;
  private readonly CLIENTES_CACHE_TTL = 60 * 1000; // 60s
  private readonly debugLogging: boolean;

  constructor(config: ServexApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.debugLogging = (process.env.NODE_ENV || "development") !== "production";

    // Interceptor para logging y manejo de errores
    this.client.interceptors.response.use(
      (response) => {
        if (this.debugLogging) {
          console.log(
            `[Servex] ✅ ${response.config.method?.toUpperCase()} ${
              response.config.url
            } - ${response.status}`
          );
        }
        return response;
      },
      (error) => {
        console.error(
          `[Servex] ❌ Error: ${error.response?.data?.message || error.message}`
        );
        throw error;
      }
    );
  }

  /**
   * Crea un nuevo cliente en Servex
   */
  async crearCliente(clienteData: ClienteServex): Promise<ClienteCreado> {
    try {
      console.log("[Servex] Creando cliente:", clienteData.username);
      console.log(
        "[Servex] Datos del cliente:",
        JSON.stringify(clienteData, null, 2)
      );
      const response = await this.client.post<ServexClienteResponse>(
        "/clients",
        clienteData
      );
      console.log(
        "[Servex] Respuesta de creación:",
        JSON.stringify(response.data, null, 2)
      );
      // La API de Servex devuelve { message: "...", client: {...} }
      return response.data.client;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      const detalles = error.response?.data
        ? JSON.stringify(error.response.data)
        : "";
      console.error("[Servex] Error detallado:", detalles);
      throw new Error(`Error creando cliente en Servex: ${mensaje}`);
    }
  }

  /**
   * Obtiene la lista de categorías disponibles
   */
  async obtenerCategorias(): Promise<CategoriaServex[]> {
    try {
      const response = await this.client.get<CategoriaServex[]>("/categories");
      console.log(
        "[Servex] Categorías obtenidas:",
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.message;
      throw new Error(`Error obteniendo categorías de Servex: ${mensaje}`);
    }
  }

  /**
   * Obtiene solo las categorías activas (no expiradas)
   */
  async obtenerCategoriasActivas(): Promise<CategoriaServex[]> {
    try {
      const categorias = await this.obtenerCategorias();
      const ahora = new Date();

      // Filtrar categorías que NO estén expiradas
      const categoriasActivas = categorias.filter((categoria) => {
        // Si no tiene fecha de expiración, se considera activa
        if (!categoria.valid_until) {
          return true;
        }

        // Convertir fecha de expiración a objeto Date
        const fechaExpiracion = new Date(categoria.valid_until);

        // La categoría está activa si la fecha de expiración es en el futuro
        const esActiva = fechaExpiracion > ahora;

        if (!esActiva) {
          console.log(
            `[Servex] ⚠️ Categoría ${categoria.id} (${categoria.name}) expiró el ${categoria.valid_until}`
          );
        }

        return esActiva;
      });

      console.log(
        `[Servex] Categorías totales: ${categorias.length}, Activas: ${categoriasActivas.length}`
      );

      if (categoriasActivas.length === 0) {
        console.warn("[Servex] ⚠️ No hay categorías activas disponibles");
        throw new Error(
          "No hay categorías activas disponibles en Servex. Por favor contacte al administrador."
        );
      }

      return categoriasActivas;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.message;
      throw new Error(
        `Error obteniendo categorías activas de Servex: ${mensaje}`
      );
    }
  }

  /**
   * Crea un nuevo revendedor en Servex
   */
  async crearRevendedor(
    revendedorData: RevendedorServex
  ): Promise<RevendedorCreado> {
    try {
      console.log("[Servex] Creando revendedor:", revendedorData.username);
      console.log(
        "[Servex] Datos del revendedor:",
        JSON.stringify(revendedorData, null, 2)
      );
      const response = await this.client.post<ServexRevendedorResponse>(
        "/resellers",
        revendedorData
      );
      console.log(
        "[Servex] Respuesta de creación:",
        JSON.stringify(response.data, null, 2)
      );

      // Si Servex devuelve el objeto reseller directamente, usarlo
      if (response.data.reseller && response.data.reseller.id) {
        console.log(
          "[Servex] ✅ Revendedor creado con ID:",
          response.data.reseller.id
        );
        return response.data.reseller;
      }

      // Si no devuelve el objeto, buscar por username para obtener el ID
      console.warn(
        "[Servex] ⚠️ La API no devolvió el objeto reseller, buscando por username..."
      );

      // Buscar el revendedor recién creado (reintentar 3 veces)
      for (let intento = 1; intento <= 3; intento++) {
        try {
          // Esperar antes de reintentar (más tiempo en reintentos posteriores)
          const delay = intento === 1 ? 500 : 1000 * intento;
          await new Promise((resolve) => setTimeout(resolve, delay));

          console.log(
            `[Servex] Intento ${intento} de búsqueda del revendedor por username: ${revendedorData.username}`
          );
          const searchResponse = await this.client.get("/resellers", {
            params: {
              search: revendedorData.username,
              scope: "todos",
              limit: 10,
            },
          });

          // Intentar parse con ambas claves posibles (resellers o data)
          const lista = searchResponse.data?.resellers || searchResponse.data?.data || [];
          console.log(
            `[Servex] Búsqueda intento ${intento}: ${lista.length} revendedores encontrados`
          );

          if (lista.length > 0) {
            const revendedor = lista.find((r: any) => (r.username || "").toLowerCase() === (revendedorData.username || "").toLowerCase()) || lista[0];
            
            if (revendedor && revendedor.id) {
              console.log(
                "[Servex] ✅ Revendedor encontrado con ID:",
                revendedor.id
              );
              return {
                id: revendedor.id,
                name: revendedor.name || revendedorData.name,
                username: revendedor.username,
                max_users: revendedor.max_users,
                account_type: revendedor.account_type,
                expiration_date: revendedor.expiration_date,
                category_ids:
                  revendedor.category_ids || revendedorData.category_ids,
                status: revendedor.status || "active",
                created_at: revendedor.created_at || new Date().toISOString(),
                obs: revendedor.obs,
              };
            }
          }
        } catch (searchError: any) {
          console.error(
            `[Servex] ❌ Intento ${intento} fallido, error:`,
            searchError.message
          );
          if (intento === 3) {
            console.error(
              "[Servex] ❌ Error completo después de 3 intentos:",
              JSON.stringify(searchError.response?.data || searchError, null, 2)
            );
          }
        }
      }

      // NO retornar ID temporal: lanzar error en su lugar
      const errorMsg = `No se pudo obtener el ID del revendedor ${revendedorData.username} después de 3 reintentos. El revendedor fue creado en Servex pero no se puede recuperar su ID. Por favor, contacte al administrador.`;
      console.error("[Servex] ❌", errorMsg);
      throw new Error(errorMsg);
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      const detalles = error.response?.data
        ? JSON.stringify(error.response.data)
        : "";
      console.error("[Servex] Error detallado:", detalles);
      throw new Error(`Error creando revendedor en Servex: ${mensaje}`);
    }
  }

  /**
   * Genera credenciales aleatorias para un cliente basadas en el nombre
   */
  generarCredenciales(nombreCliente?: string): {
    username: string;
    password: string;
  } {
    const password = this.generarPasswordSeguro();

    // Si no hay nombre, usar el método anterior
    if (!nombreCliente || nombreCliente.trim().length === 0) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 7);
      const username = `vpn${timestamp}${random}`;
      return { username, password };
    }

    // Limpiar el nombre: solo letras y convertir a minúsculas
    const nombreLimpio = nombreCliente
      .trim()
      .toLowerCase()
      .normalize("NFD") // Descomponer acentos
      .replace(/[\u0300-\u036f]/g, "") // Eliminar marcas diacríticas
      .replace(/[^a-z0-9]/g, ""); // Letras y números (sin caracteres especiales)

    // Si después de limpiar no queda nada, usar método anterior
    if (nombreLimpio.length === 0) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 7);
      const username = `vpn${timestamp}${random}`;
      return { username, password };
    }

    // IMPORTANTE: Servex requiere máximo 12 caracteres para username
    // El máximo disponible es: 12 - 2 (números) = 10 caracteres del nombre
    // Para garantizar variación, usamos máximo 7 caracteres del nombre + 2 números + 3 caracteres aleatorios
    // Total: 7 + 2 + 3 = 12 caracteres exactos
    
    const nombreTruncado = nombreLimpio.substring(0, 7).toLowerCase();
    
    // Generar 2 números aleatorios (10-99)
    const numerosAleatorios = Math.floor(Math.random() * 90) + 10;

    // Generar 3 caracteres aleatorios (letras o números)
    const charsAleatorios = "abcdefghijklmnopqrstuvwxyz0123456789";
    let sufijo = "";
    for (let i = 0; i < 3; i++) {
      sufijo += charsAleatorios.charAt(
        Math.floor(Math.random() * charsAleatorios.length)
      );
    }

    // Formato: NombreTruncado (7) + Números (2) + SufijoAleatorio (3) = 12 caracteres máximo
    const username = `${nombreTruncado}${numerosAleatorios}${sufijo}`;

    // Validación de seguridad: asegurarse de que no exceda 12 caracteres
    if (username.length > 12) {
      console.warn(`[Servex] ⚠️ Username '${username}' excede 12 caracteres, truncando...`);
      return { username: username.substring(0, 12), password };
    }

    return { username, password };
  }

  /**
   * Genera credenciales para un revendedor basadas en el nombre del cliente
   */
  generarCredencialesRevendedor(nombreCliente?: string): {
    username: string;
    password: string;
    name: string;
  } {
    const password = this.generarPasswordSeguro();

    const baseNormalizada = nombreCliente
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "") || "";

    const prefijo = "r";
    const nombreTruncado = baseNormalizada.substring(0, 5);
    const numerosAleatorios = Math.floor(Math.random() * 90) + 10;
    const charsAleatorios = "abcdefghijklmnopqrstuvwxyz0123456789";
    let sufijo = "";
    for (let i = 0; i < 3; i++) {
      sufijo += charsAleatorios.charAt(
        Math.floor(Math.random() * charsAleatorios.length)
      );
    }

    let username = `${prefijo}${nombreTruncado}${numerosAleatorios}${sufijo}`;

    if (baseNormalizada.length === 0) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 7);
      username = `r${timestamp}${random}`.substring(0, 12);
    }

    if (username.length > 12) {
      console.warn(
        `[Servex] ⚠️ Username revendedor '${username}' excede 12 caracteres, truncando...`
      );
      username = username.substring(0, 12);
    }

    const name = this.normalizarNombreVisibleRevendedor(nombreCliente);

    return { username, password, name };
  }

  private normalizarNombreVisibleRevendedor(nombreCliente?: string): string {
    const MAX_LEN = 12;
    const FALLBACK = "Revendedor";

    if (!nombreCliente || nombreCliente.trim().length === 0) {
      return FALLBACK.substring(0, MAX_LEN);
    }

    const sinDiacriticos = nombreCliente
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!sinDiacriticos) {
      return FALLBACK.substring(0, MAX_LEN);
    }

    let compacto = sinDiacriticos.replace(/\s+/g, "");

    if (!compacto) {
      compacto = FALLBACK;
    }

    let base = compacto.substring(0, MAX_LEN).toLowerCase();

    if (base.length < 3) {
      base = (base + FALLBACK.toLowerCase()).substring(0, Math.max(3, base.length));
    }

    if (/^[0-9]/.test(base)) {
      base = `rev${base}`.substring(0, MAX_LEN);
    }

    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  /**
   * Genera una contraseña segura (solo letras y números)
   */
  private generarPasswordSeguro(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Busca un cliente en Servex por ID usando el listado
   */
  async buscarClientePorId(clienteId: number): Promise<any> {
    try {
      console.log(`[Servex] Buscando cliente por ID: ${clienteId}`);
      // Usar el endpoint de listado pero no hay forma directa de buscar por ID
      // Necesitamos obtener el cliente de otra forma, por username
      const response = await this.client.get("/clients", {
        params: {
          scope: "meus",
          limit: 100,
        },
      });

      const clientes = response.data?.clients || [];
      const cliente = clientes.find((c: any) => c.id === clienteId);

      if (cliente) {
        console.log("[Servex] ✅ Cliente encontrado por ID");
        return cliente;
      }

      console.error("[Servex] Cliente no encontrado con ID:", clienteId);
      throw new Error("Cliente no encontrado");
    } catch (error: any) {
      console.error("[Servex] Error buscando cliente por ID:", error.message);
      throw error;
    }
  }

  /**
   * Busca un cliente en Servex por username
   */
  async buscarClientePorUsername(username: string): Promise<any> {
    try {
      console.log(`[Servex] Buscando cliente: ${username}`);

      // IMPORTANTE: Según docs de Servex, scope determina qué clientes ves:
      // - 'meus' (default): Solo clientes creados por TI
      // - 'todos': TODOS los clientes (requiere API key de ADMIN)
      // - 'dos_revendedores': Clientes de tus revendedores

      // Primero probar sin parámetros (usará defaults)
      console.log("[Servex] Intentando con scope default (meus)...");
      const responseDefault = await this.client.get("/clients", {
        params: {
          limit: 100,
        },
      });

      console.log(
        "[Servex] Respuesta con scope default:",
        JSON.stringify(responseDefault.data, null, 2)
      );
      const clientesDefault = responseDefault.data?.clients || [];
      console.log(
        `[Servex] Total de clientes con scope default: ${clientesDefault.length}`
      );

      // Intentar con scope='todos' (solo funciona si la API key es de admin)
      console.log("[Servex] Intentando con scope=todos (requiere admin)...");
      try {
        const responseTodos = await this.client.get("/clients", {
          params: {
            scope: "todos",
            limit: 100,
          },
        });

        console.log(
          "[Servex] Respuesta con scope=todos:",
          JSON.stringify(responseTodos.data, null, 2)
        );
        const clientesTodos = responseTodos.data?.clients || [];
        console.log(
          `[Servex] Total de clientes con scope=todos: ${clientesTodos.length}`
        );

        // Buscar en la lista con scope=todos (comparación case-insensitive)
        const clienteEnTodos = clientesTodos.find(
          (c: any) => (c.username || "").toLowerCase() === username.toLowerCase()
        );
        if (clienteEnTodos) {
          console.log(
            "[Servex] ✅ Cliente encontrado con scope=todos:",
            clienteEnTodos.username
          );
          return clienteEnTodos;
        }
      } catch (errorTodos: any) {
        console.warn(
          "[Servex] ⚠️ scope=todos falló (API key no es admin):",
          errorTodos.message
        );
      }

      // Buscar con parámetro search en scope default
      console.log(
        `[Servex] Buscando con search="${username}" en scope default...`
      );
      const response = await this.client.get("/clients", {
        params: {
          search: username,
          limit: 100,
        },
      });

      console.log(
        "[Servex] Respuesta con search:",
        JSON.stringify(response.data, null, 2)
      );
      const clientes = response.data?.clients || [];
      console.log(
        `[Servex] Encontrados ${clientes.length} clientes con búsqueda`
      );

      // Buscar coincidencia exacta (case-insensitive)
      const clienteExacto = clientes.find((c: any) => (c.username || "").toLowerCase() === username.toLowerCase());
      if (clienteExacto) {
        console.log(
          "[Servex] ✅ Cliente encontrado con search:",
          clienteExacto.username
        );
        return clienteExacto;
      }

      console.log("[Servex] ❌ Cliente no encontrado en ningún scope");
      console.log(
        "[Servex] 💡 Verifica: ¿Tu SERVEX_API_KEY es de Admin o Revendedor?"
      );
      console.log(
        "[Servex] 💡 Si es de Revendedor, solo verás clientes que ESE revendedor creó"
      );
      return null;
    } catch (error: any) {
      console.error("[Servex] Error buscando cliente:", error.message);
      throw error;
    }
  }

  /**
   * Busca un revendedor en Servex por username
   */
  async buscarRevendedorPorUsername(username: string): Promise<any> {
    try {
      console.log(`[Servex] Buscando revendedor: ${username}`);
      const response = await this.client.get("/resellers", {
        params: {
          search: username,
          scope: "todos",
          limit: 50,
        },
      });

      const revendedores = response.data?.resellers || [];
      console.log(`[Servex] Encontrados ${revendedores.length} revendedores`);

      // Buscar coincidencia exacta (case-insensitive)
      const revendedorExacto = revendedores.find(
        (r: any) => (r.username || "").toLowerCase() === username.toLowerCase()
      );
      if (revendedorExacto) {
        console.log(
          "[Servex] Revendedor encontrado:",
          revendedorExacto.username
        );
        return revendedorExacto;
      }

      console.log("[Servex] Revendedor no encontrado con username exacto");
      return null;
    } catch (error: any) {
      console.error("[Servex] Error buscando revendedor:", error.message);
      throw error;
    }
  }

  /**
   * Renueva un cliente VPN agregando días
   */
  async renovarCliente(clienteId: number, dias: number): Promise<any> {
    try {
      console.log(
        `[Servex] Renovando cliente ID ${clienteId} por ${dias} días`
      );
      const response = await this.client.post(`/clients/${clienteId}/renew`, {
        days: dias,
      });
      console.log("[Servex] Cliente renovado exitosamente");
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("[Servex] Error renovando cliente:", mensaje);
      throw new Error(`Error renovando cliente en Servex: ${mensaje}`);
    }
  }

  /**
   * Renueva un revendedor agregando días (solo para cuentas de validez)
   */
  async renovarRevendedor(revendedorId: number, dias: number): Promise<any> {
    try {
      console.log(
        `[Servex] Renovando revendedor ID ${revendedorId} por ${dias} días`
      );
      const response = await this.client.post(
        `/resellers/${revendedorId}/renew`,
        { days: dias }
      );
      console.log(
        `[Servex] ✅ POST /resellers/${revendedorId}/renew - ${response.status}`
      );
      console.log(
        "[Servex] Respuesta de renovación:",
        JSON.stringify(response.data)
      );
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("[Servex] Error renovando revendedor:", mensaje);
      throw new Error(`Error renovando revendedor en Servex: ${mensaje}`);
    }
  }

  /**
   * Actualiza un cliente existente (para upgrades)
   * IMPORTANTE: El payload debe incluir TODOS los campos obligatorios:
   * username, password, category_id, connection_limit, type
   */
  async actualizarCliente(
    clienteId: number,
    datos: Partial<ClienteServex>
  ): Promise<any> {
    try {
      console.log(`[Servex] Actualizando cliente ID ${clienteId}`);
      console.log("[Servex] Payload:", JSON.stringify(datos));

      const response = await this.client.put(`/clients/${clienteId}`, datos);
      console.log(`[Servex] ✅ PUT /clients/${clienteId} - ${response.status}`);
      console.log("[Servex] Respuesta:", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("[Servex] ❌ Error actualizando cliente:", mensaje);
      if (error.response?.data) {
        console.error(
          "[Servex] Detalles del error:",
          JSON.stringify(error.response.data)
        );
      }
      throw new Error(`Error actualizando cliente en Servex: ${mensaje}`);
    }
  }

  /**
   * Actualiza un revendedor existente (para upgrades)
   */
  async actualizarRevendedor(
    revendedorId: number,
    datos: Partial<RevendedorServex>,
    username?: string
  ): Promise<any> {
    try {
      console.log(
        `[Servex] Actualizando revendedor ID ${revendedorId} con datos:`,
        JSON.stringify(datos)
      );

      // Obtener revendedor actual (necesitamos buscar por username o listar todos)
      let revendedorActual: any = null;

      if (username) {
        // Buscar por username
        revendedorActual = await this.buscarRevendedorPorUsername(username);
      } else {
        // Listar y buscar por ID
        const response = await this.client.get("/resellers", {
          params: {
            scope: "todos",
            limit: 100,
          },
        });
        const revendedores = response.data?.resellers || [];
        revendedorActual = revendedores.find((r: any) => r.id === revendedorId);
      }

      if (!revendedorActual) {
        throw new Error("Revendedor no encontrado");
      }

      console.log(
        "[Servex] Revendedor actual:",
        JSON.stringify(revendedorActual)
      );

      // Si el revendedor no tiene categorías, usar categorías por defecto
      let categoryIds = revendedorActual.category_ids;
      if (!categoryIds || categoryIds.length === 0) {
        console.log(
          "[Servex] ⚠️ Revendedor sin categorías, usando categorías por defecto..."
        );
        // Usar variable de entorno o valor por defecto (279 = "JJSecure VP-N")
        const defaultCategories = process.env.DEFAULT_CATEGORY_IDS || "279";
        categoryIds = defaultCategories
          .split(",")
          .map((id) => parseInt(id.trim()));
        console.log(
          `[Servex] ✅ Usando categorías por defecto: ${categoryIds.join(", ")}`
        );
      }

      // Construir payload completo con todos los campos obligatorios
      // Si el password es muy largo (hash), truncar a 25 caracteres
      let password = datos.password || revendedorActual.password;
      if (password && password.length > 25) {
        console.log(
          "[Servex] ⚠️ Password demasiado largo, truncando de",
          password.length,
          "a 25 caracteres"
        );
        password = password.substring(0, 25);
      }

      const payload = {
        name: datos.name || revendedorActual.name,
        username: datos.username || revendedorActual.username,
        password: password,
        max_users:
          datos.max_users !== undefined
            ? datos.max_users
            : revendedorActual.max_users,
        account_type: datos.account_type || revendedorActual.account_type,
        ...(categoryIds &&
          categoryIds.length > 0 && { category_ids: categoryIds }),
        ...(revendedorActual.observation && {
          observation: revendedorActual.observation,
        }),
        // Si se proporciona expiration_date en datos, incluirlo (obligatorio para validity)
        ...(datos.expiration_date && {
          expiration_date: datos.expiration_date,
        }),
      };

      console.log(
        "[Servex] Payload completo para actualizar:",
        JSON.stringify(payload)
      );

      const updateResponse = await this.client.put(
        `/resellers/${revendedorId}`,
        payload
      );
      console.log("[Servex] ✅ Revendedor actualizado exitosamente");
      return updateResponse.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("[Servex] ❌ Error actualizando revendedor:", mensaje);
      if (error.response?.data) {
        console.error(
          "[Servex] Detalles del error:",
          JSON.stringify(error.response.data)
        );
      }
      throw new Error(`Error actualizando revendedor en Servex: ${mensaje}`);
    }
  }

  /**
   * Obtiene la lista de clientes con filtros opcionales
   */
  async obtenerClientes(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      scope?: string;
      resellerId?: number;
    },
    options: { forceRefresh?: boolean } = {}
  ): Promise<any[]> {
    const normalizedParams = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      search: params?.search,
      status: params?.status,
      scope: params?.scope ?? "meus",
      resellerId: params?.resellerId,
    };

    const forceRefresh = options.forceRefresh ?? false;

    const hasFilters = Boolean(
      normalizedParams.search ||
        normalizedParams.status ||
        normalizedParams.resellerId
    );

    const shouldCache = !hasFilters && normalizedParams.page === 1;
    const cacheKey = shouldCache
      ? JSON.stringify({
          page: normalizedParams.page,
          limit: normalizedParams.limit,
          scope: normalizedParams.scope,
        })
      : "";

    const now = Date.now();

    if (
      shouldCache &&
      !forceRefresh &&
      this.clientesCache &&
      this.clientesCache.key === cacheKey &&
      now - this.clientesCache.timestamp < this.CLIENTES_CACHE_TTL
    ) {
      if (this.debugLogging) {
        console.log("[Servex] Clientes desde cache local", cacheKey);
      }
      return this.clientesCache.data;
    }

    if (
      shouldCache &&
      !forceRefresh &&
      this.clientesCachePromise &&
      this.clientesCachePromise.key === cacheKey
    ) {
      if (this.debugLogging) {
        console.log("[Servex] Esperando promesa de clientes en curso", cacheKey);
      }
      return this.clientesCachePromise.promise;
    }

    const fetchClientes = async () => {
      if (this.debugLogging) {
        console.log(
          "[Servex] Obteniendo lista de clientes con parámetros:",
          normalizedParams
        );
      }

      const response = await this.client.get("/clients", {
        params: normalizedParams,
      });

      if (this.debugLogging) {
        console.log(
          "[Servex] Respuesta de clientes:",
          JSON.stringify(response.data, null, 2)
        );
      }
      const clientes = response.data?.clients || [];

      if (this.debugLogging) {
        console.log(`[Servex] ✅ Obtenidos ${clientes.length} clientes`);
      }
      return clientes;
    };

    try {
      if (shouldCache) {
        const promise = fetchClientes()
          .then((clientes) => {
            this.clientesCache = {
              key: cacheKey,
              data: clientes,
              timestamp: Date.now(),
            };
            return clientes;
          })
          .finally(() => {
            if (
              this.clientesCachePromise &&
              this.clientesCachePromise.key === cacheKey
            ) {
              this.clientesCachePromise = null;
            }
          });

        if (!forceRefresh) {
          this.clientesCachePromise = { key: cacheKey, promise };
        }
        return await promise;
      }

      return await fetchClientes();
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      if (
        shouldCache &&
        this.clientesCache &&
        this.clientesCache.key === cacheKey
      ) {
        console.warn(
          "[Servex] ⚠️ Usando cache de clientes por error en Servex:",
          mensaje
        );
        return this.clientesCache.data;
      }
      console.error("[Servex] Error obteniendo clientes:", mensaje);
      throw new Error(`Error obteniendo clientes de Servex: ${mensaje}`);
    }
  }

  /**
   * Obtiene el conteo total de revendedores activos
   */
  async obtenerConteoRevendedores(): Promise<number> {
    try {
      console.log("[Servex] Obteniendo conteo de revendedores");

      // Hacer una petición con límite alto para obtener todos los revendedores
      const response = await this.client.get("/resellers", {
        params: {
          scope: "todos",
          limit: 10000, // Límite alto para obtener todos
        },
      });

      const revendedores = response.data?.resellers || [];
      const conteo = revendedores.length;

      console.log(`[Servex] ✅ Conteo de revendedores obtenido: ${conteo}`);
      return conteo;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error(
        "[Servex] Error obteniendo conteo de revendedores:",
        mensaje
      );
      throw new Error(
        `Error obteniendo conteo de revendedores de Servex: ${mensaje}`
      );
    }
  }
}
