import fs from "fs";
import path from "path";
import { z } from "zod";
import { Plan } from "../types";

// Esquemas de validación con Zod
const PlanOverrideSchema = z.object({
  precio: z.number().optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
  dias: z.number().optional(),
  connection_limit: z.number().optional(),
});

const PromoConfigSchema = z.object({
  activa: z.boolean(),
  activada_en: z.string().nullable().optional(),
  duracion_horas: z.number(),
  auto_desactivar: z.boolean(),
  descuento_porcentaje: z.number().optional().default(20),
  solo_nuevos: z.boolean().optional().default(false),
  solo_renovaciones: z.boolean().optional().default(false),
});

const HeroConfigSchema = z.object({
  titulo: z.string().optional(),
  descripcion: z.string().optional(),
  promocion: z
    .object({
      habilitada: z.boolean().optional(),
      texto: z.string().optional(),
      borderColor: z.string().optional(),
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
      iconColor: z.string().optional(),
      shadowColor: z.string().optional(),
      comentario: z.string().optional(),
    })
    .optional(),
});

const ConfigPlanesSchema = z.object({
  enabled: z.boolean().default(true),
  version: z.string().optional(),
  ultima_actualizacion: z.string().optional(),
  moneda: z.string().default("ARS"),
  notas: z.string().optional(),
  hero: HeroConfigSchema.optional(),
  planes_disponibles: z.record(z.string(), z.string()).optional(),
  precios_normales: z.record(z.string(), z.number()).optional(),
  overrides: z
    .record(z.string(), z.union([PlanOverrideSchema, z.string()]))
    .optional(),
  promo_config: PromoConfigSchema.optional(),
});

interface PlanOverride {
  precio?: number;
  descripcion?: string;
  activo?: boolean;
  dias?: number;
  connection_limit?: number;
}

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  auto_desactivar: boolean;
  descuento_porcentaje?: number;
  solo_nuevos?: boolean;
  solo_renovaciones?: boolean;
}

interface OverrideOptions {
  forNewCustomers?: boolean;
  forRenewal?: boolean;
}

interface ConfigPlanes {
  enabled?: boolean;
  version?: string;
  ultima_actualizacion?: string;
  moneda?: string;
  notas?: string;
  hero?: {
    titulo?: string;
    descripcion?: string;
    promocion?: {
      habilitada?: boolean;
      texto?: string;
      estilo?: string;
      textColor?: string;
      bgColor?: string;
      comentario?: string;
    };
  };
  planes_disponibles?: {
    [planId: string]: string;
  };
  precios_normales?: {
    [planId: string]: number;
  };
  overrides?: {
    [planId: string]: PlanOverride | string;
  };
  promo_config?: PromoConfig;
}

export class ConfigService {
  private configPath: string;
  private revendedoresConfigPath: string;
  private noticiasConfigPath: string;
  private cache: ConfigPlanes | null = null;
  private cacheTime: number = 0;
  private cacheExpire: number = 60000; // 60 segundos
  private revendedoresCache: any | null = null;
  private revendedoresCacheTime: number = 0;
  private noticiasCache: any | null = null;
  private noticiasCacheTime: number = 0;

  constructor() {
    // Buscar config.json de planes en diferentes ubicaciones posibles
    const posiblesPaths = [
      path.join(process.cwd(), "public", "config", "planes.config.json"),
      path.join(process.cwd(), "config", "planes.config.json"),
      path.join(process.cwd(), "planes.config.json"),
      path.join(__dirname, "..", "..", "config", "planes.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "planes.config.json"
      ),
    ];

    this.configPath = posiblesPaths[0];

    // Buscar revendedores.config.json
    const posiblesRevendedoresPaths = [
      path.join(process.cwd(), "public", "config", "revendedores.config.json"),
      path.join(process.cwd(), "config", "revendedores.config.json"),
      path.join(process.cwd(), "revendedores.config.json"),
      path.join(__dirname, "..", "..", "config", "revendedores.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "revendedores.config.json"
      ),
    ];

    this.revendedoresConfigPath = posiblesRevendedoresPaths[0];

    // Buscar noticias.config.json
    const posiblesNoticiasPaths = [
      path.join(process.cwd(), "public", "config", "noticias.config.json"),
      path.join(process.cwd(), "config", "noticias.config.json"),
      path.join(process.cwd(), "noticias.config.json"),
      path.join(__dirname, "..", "..", "config", "noticias.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "noticias.config.json"
      ),
    ];

    this.noticiasConfigPath = posiblesNoticiasPaths[0];

    console.log("[ConfigService] 🔍 Buscando configuración de planes...");
    for (const p of posiblesPaths) {
      if (fs.existsSync(p)) {
        this.configPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de planes encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.configPath)) {
      console.log("[ConfigService] ⚠️ No se encontró planes.config.json");
      console.log("[ConfigService] 📁 Se espera en:", this.configPath);
    }

    console.log("[ConfigService] 🔍 Buscando configuración de revendedores...");
    for (const p of posiblesRevendedoresPaths) {
      if (fs.existsSync(p)) {
        this.revendedoresConfigPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de revendedores encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.revendedoresConfigPath)) {
      console.log(
        "[ConfigService] ℹ️ No se encontró revendedores.config.json (opcional)"
      );
    }

    console.log("[ConfigService] 🔍 Buscando configuración de noticias...");
    for (const p of posiblesNoticiasPaths) {
      if (fs.existsSync(p)) {
        this.noticiasConfigPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de noticias encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.noticiasConfigPath)) {
      console.log(
        "[ConfigService] ℹ️ No se encontró noticias.config.json (opcional)"
      );
    }
  }

  /**
   * Lee la configuración del archivo JSON (con caché)
   */
  private leerConfig(): ConfigPlanes {
    const ahora = Date.now();

    // Si el caché no ha expirado, devolverlo
    // Si el archivo en disco cambió desde que guardamos el caché, invalidarlo
    try {
      if (fs.existsSync(this.configPath)) {
        const stats = fs.statSync(this.configPath);
        const mtimeMs = Math.floor(stats.mtimeMs || 0);
        if (this.cache && mtimeMs > this.cacheTime) {
          // Archivo actualizado externamente, invalidar caché
          this.cache = null;
          this.cacheTime = 0;
        }
      }
    } catch (err: any) {
      // Ignorar errores de stat y continuar con lógica de caché
    }

    if (this.cache && ahora - this.cacheTime < this.cacheExpire) {
      return this.cache;
    }

    try {
      if (!fs.existsSync(this.configPath)) {
        console.log(
          "[ConfigService] ℹ️ Archivo de config no existe, usando valores por defecto"
        );
        return { enabled: false };
      }

      const contenido = fs.readFileSync(this.configPath, "utf-8");
      const dataParseada = JSON.parse(contenido);

      // Validar con Zod
      const configValidada = ConfigPlanesSchema.parse(dataParseada);

      // Transformar para coincidir con la interfaz
      const config: ConfigPlanes = {
        ...configValidada,
        promo_config: configValidada.promo_config
          ? {
              ...configValidada.promo_config,
              activada_en: configValidada.promo_config.activada_en ?? null,
            }
          : undefined,
      };

      // Validaciones adicionales de consistencia
      this.validarConsistenciaConfig(config);

      // Actualizar caché
      this.cache = config;
      this.cacheTime = ahora;

      console.log(
        "[ConfigService] ✅ Configuración cargada y validada correctamente"
      );
      return config;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error(
          "[ConfigService] ❌ Error de validación en config:",
          error.errors
        );
        console.error(
          "[ConfigService] 📄 Revisa el archivo planes.config.json"
        );
      } else {
        console.error(
          "[ConfigService] ❌ Error leyendo config:",
          error.message
        );
      }
      // En caso de error, devolver configuración segura por defecto
      return { enabled: false };
    }
  }

  /**
   * Aplica overrides de configuración a un plan
   * Los overrides solo se aplican si la promoción está activa
   */
  aceptarOverridesAlPlan(plan: Plan, options?: OverrideOptions): Plan {
    const config = this.leerConfig();

    if (!config.enabled) {
      return plan;
    }

    const promoDisponible = this.shouldApplyPromo(config.promo_config, options);

    // Verificar si la promoción está activa y válida
    if (!promoDisponible) {
      // Si la promo no está activa, usar precios normales
      if (config.precios_normales) {
        const precioNormal = config.precios_normales[plan.id.toString()];
        if (precioNormal !== undefined) {
          return { ...plan, precio: precioNormal };
        }
      }
      return plan;
    }

    // Validar configuración de promoción antes de aplicar
    const validacionPromo = this.validarConfigPromocion();
    if (!validacionPromo.valido) {
      console.error(
        "[ConfigService] ❌ Configuración de promoción inválida, usando precios normales:"
      );
      validacionPromo.errores.forEach((error) => console.error(`  - ${error}`));

      // Fallback a precios normales
      if (config.precios_normales) {
        const precioNormal = config.precios_normales[plan.id.toString()];
        if (precioNormal !== undefined) {
          return { ...plan, precio: precioNormal };
        }
      }
      return plan;
    }

    // La promo está activa y válida, aplicar overrides
    const override = config.overrides?.[plan.id.toString()];
    if (!override) {
      return plan;
    }

    console.log(
      `[ConfigService] 🔄 Aplicando override al plan ${plan.id}:`,
      override
    );

    // Aplicar overrides (solo si es un objeto, no un comentario string)
    if (typeof override === "string") {
      return plan; // Es un comentario, no aplicar
    }

    return {
      ...plan,
      precio: override.precio !== undefined ? override.precio : plan.precio,
      descripcion:
        override.descripcion !== undefined
          ? override.descripcion
          : plan.descripcion,
      activo: override.activo !== undefined ? override.activo : plan.activo,
      dias: override.dias !== undefined ? override.dias : plan.dias,
      connection_limit:
        override.connection_limit !== undefined
          ? override.connection_limit
          : plan.connection_limit,
    };
  }

  /**
   * Aplica overrides a una lista de planes
   */
  aceptarOverridesAListaPlanes(
    planes: Plan[],
    options?: OverrideOptions
  ): Plan[] {
    // Limpiar caché para forzar lectura del archivo actualizado
    this.cache = null;
    this.cacheTime = 0;

    const config = this.leerConfigPlanes();

    if (!config.enabled) {
      console.log("[DEBUG] Config not enabled, returning original planes");
      return planes;
    }

    const promoDisponible = this.shouldApplyPromo(
      config.promo_config,
      options
    );

    // Verificar si la promoción está activa
    if (!promoDisponible) {
      console.log(
        "[DEBUG] Promo not active for this contexto, using DB prices"
      );
      // Si la promo no está activa, NO modificar precios, usar los de DB
      if (config.precios_normales) {
        return planes.map((plan) => {
          const precioNormal = config.precios_normales?.[plan.id.toString()];
          if (precioNormal !== undefined) {
            return { ...plan, precio: precioNormal };
          }
          return plan;
        });
      }
      return planes;
    }

    // Validar configuración de promoción antes de aplicar
    const validacionPromo = this.validarConfigPromocion();
    if (!validacionPromo.valido) {
      console.error(
        "[ConfigService] ❌ Configuración de promoción inválida, usando precios normales:"
      );
      validacionPromo.errores.forEach((error) => console.error(`  - ${error}`));

      // Fallback a precios normales
      if (config.precios_normales) {
        return planes.map((plan) => {
          const precioNormal = config.precios_normales?.[plan.id.toString()];
          if (precioNormal !== undefined) {
            return { ...plan, precio: precioNormal };
          }
          return plan;
        });
      }
      return planes;
    }

    // La promo está activa y válida, reutilizar la lógica por plan
    return planes.map((plan) =>
      this.aceptarOverridesAlPlan(plan, options)
    );
  }

  /**
   * Obtiene información de la configuración (para debugging)
   */
  obtenerInfoConfig(): {
    habilitada: boolean;
    archivo: string;
    existe: boolean;
    version?: string;
    ultimaActualizacion?: string;
    planesConOverride: number;
  } {
    const config = this.leerConfig();

    return {
      habilitada: config.enabled ?? false,
      archivo: this.configPath,
      existe: fs.existsSync(this.configPath),
      version: config.version,
      ultimaActualizacion: config.ultima_actualizacion,
      planesConOverride: Object.keys(config.overrides || {}).length,
    };
  }

  /**
   * Limpia el caché (útil después de actualizar el archivo)
   */
  limpiarCache(): void {
    this.cache = null;
    this.cacheTime = 0;
    this.revendedoresCache = null;
    this.revendedoresCacheTime = 0;
    this.noticiasCache = null;
    this.noticiasCacheTime = 0;
    console.log("[ConfigService] 🔄 Caché limpiado (planes y revendedores)");
  }

  /**
   * Crea un archivo de configuración por defecto
   */
  crearConfigPorDefecto(): void {
    const directorio = path.dirname(this.configPath);

    // Crear directorio si no existe
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
      console.log("[ConfigService] 📁 Directorio creado:", directorio);
    }

    const configDefault: ConfigPlanes = {
      enabled: false,
      version: "1.0.0",
      ultima_actualizacion: new Date().toISOString(),
      overrides: {
        // Ejemplo - cambiar precio del plan ID 1 a $4.99
        // "1": { "precio": 4.99 },
        // Ejemplo - cambiar múltiples parámetros del plan ID 2
        // "2": { "precio": 8.99, "descripcion": "Plan Premium Actualizado" },
      },
    };

    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(configDefault, null, 2),
        "utf-8"
      );
      console.log(
        "[ConfigService] ✅ Configuración por defecto creada en:",
        this.configPath
      );
    } catch (error: any) {
      console.error("[ConfigService] ❌ Error creando config:", error.message);
    }
  }

  /**
   * Obtiene la configuración del hero (promociones, título, etc)
   */
  obtenerConfigHero(): any {
    const config = this.leerConfig();

    // Obtener el estado actual de la promo
    const promoActiva = config.promo_config?.activa || false;
    const heroPromocion = config.hero?.promocion || {
      habilitada: false,
      texto: "",
      estilo: "from-red-500 to-pink-500",
      textColor: "text-white",
      bgColor: "bg-gradient-to-r from-red-600 to-pink-600",
    };

    // Si hay promo activa en promo_config, activarla en el hero
    if (promoActiva) {
      return {
        titulo: config.hero?.titulo || "Conecta sin Límites",
        descripcion:
          config.hero?.descripcion ||
          "Planes flexibles y velocidad premium para tu estilo de vida digital",
        promocion: {
          habilitada: true,
          texto: heroPromocion.texto || "¡Promoción especial activa!",
          estilo: heroPromocion.estilo || "from-red-500 to-pink-500",
          textColor: heroPromocion.textColor || "text-white",
          bgColor: heroPromocion.bgColor || "bg-gradient-to-r from-red-600 to-pink-600",
        },
      };
    }

    return {
      titulo: config.hero?.titulo || "Conecta sin Límites",
      descripcion:
        config.hero?.descripcion ||
        "Planes flexibles y velocidad premium para tu estilo de vida digital",
      promocion: heroPromocion,
    };
  }

  /**
   * Lee la configuración de revendedores (con caché)
   * Ahora es público para permitir acceso desde rutas
   */
  leerConfigRevendedores(): any {
    const ahora = Date.now();

    // Si el fichero en disco cambió desde que guardamos el caché, invalidarlo
    try {
      if (fs.existsSync(this.revendedoresConfigPath)) {
        const stats = fs.statSync(this.revendedoresConfigPath);
        const mtimeMs = Math.floor(stats.mtimeMs || 0);
        if (this.revendedoresCache && mtimeMs > this.revendedoresCacheTime) {
          this.revendedoresCache = null;
          this.revendedoresCacheTime = 0;
        }
      }
    } catch (err: any) {
      // Ignorar errores de stat
    }

    // Si el caché no ha expirado, devolverlo
    if (
      this.revendedoresCache &&
      ahora - this.revendedoresCacheTime < this.cacheExpire
    ) {
      return this.revendedoresCache;
    }

    try {
      if (!fs.existsSync(this.revendedoresConfigPath)) {
        console.log(
          "[ConfigService] ℹ️ Archivo de config revendedores no existe"
        );
        return { enabled: false };
      }

      const contenido = fs.readFileSync(this.revendedoresConfigPath, "utf-8");
      const config: any = JSON.parse(contenido);

      // Actualizar caché
      this.revendedoresCache = config;
      this.revendedoresCacheTime = ahora;

      return config;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error leyendo config revendedores:",
        error.message
      );
      return { enabled: false };
    }
  }

  /**
   * Guarda la configuración de revendedores en disco
   */
  guardarConfigRevendedores(config: any): void {
    try {
      const contenido = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.revendedoresConfigPath, contenido, "utf-8");
      console.log(
        "[ConfigService] ✅ Config revendedores guardada en:",
        this.revendedoresConfigPath
      );

      // Invalidar caché para que se relean los datos
      this.revendedoresCache = null;
      this.revendedoresCacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config revendedores:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Aplica overrides de configuración a un plan de revendedor
   * Los overrides solo se aplican si la promoción está activa
   */
  aceptarOverridesAlPlanRevendedor(
    plan: any,
    options?: OverrideOptions
  ): any {
    const config = this.leerConfigRevendedores();

    if (!config.enabled) {
      return plan;
    }

    const promoDisponible = this.shouldApplyPromo(
      config.promo_config,
      options
    );

    // Verificar si la promoción está activa
    if (!promoDisponible) {
      // Si la promo NO está activa, usar precios_normales del config
      if (config.precios_normales) {
        const precioNormal = config.precios_normales[plan.id.toString()];
        if (precioNormal !== undefined) {
          return { ...plan, precio: precioNormal };
        }
      }
      return plan;
    }

    // La promo está activa, intentar aplicar overrides o precios normales del config
    const override = config.overrides?.[plan.id.toString()];
    if (
      override &&
      typeof override === "object" &&
      override.precio !== undefined
    ) {
      return { ...plan, precio: override.precio };
    }

    // Si no hay override pero promo activa, usar precios normales del config
    if (config.precios_normales) {
      const precioNormal = config.precios_normales[plan.id.toString()];
      if (precioNormal !== undefined) {
        return { ...plan, precio: precioNormal };
      }
    }

    return plan;
  }

  /**
   * Aplica overrides a una lista de planes de revendedor
   */
  aceptarOverridesAListaPlanesRevendedor(
    planes: any[],
    options?: OverrideOptions
  ): any[] {
    const config = this.leerConfigRevendedores();

    if (!config.enabled) {
      return planes;
    }

    return planes.map((plan) =>
      this.aceptarOverridesAlPlanRevendedor(plan, options)
    );
  }

  /**
   * Obtiene la configuración del hero para revendedores
   */
  obtenerConfigHeroRevendedores(): any {
    const configRevendedores = this.leerConfigRevendedores();

    // La promoción de revendedores es independiente de la global
    const heroPromocion = configRevendedores.hero?.promocion || {
      habilitada: false,
      texto: "",
      estilo: "from-purple-500 to-pink-500",
      textColor: "text-white",
      bgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
    };

    return {
      titulo: configRevendedores.hero?.titulo || "Sé Revendedor VPN",
      descripcion:
        configRevendedores.hero?.descripcion ||
        "Gana dinero vendiendo acceso VPN premium a tus clientes",
      promocion: heroPromocion,
    };
  }

  /**
   * Lee la configuración completa de planes
   */
  leerConfigPlanes(): ConfigPlanes {
    return this.leerConfig();
  }

  /**
   * Guarda la configuración de planes en el archivo JSON
   */
  guardarConfigPlanes(config: ConfigPlanes): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        "utf-8"
      );
      console.log("[ConfigService] ✅ Configuración de planes guardada");
      // Limpiar caché para forzar lectura del archivo actualizado
      this.cache = null;
      this.cacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config planes:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Lee la configuración de noticias (con caché)
   * Ahora es público para permitir acceso desde rutas
   */
  leerConfigNoticias(): any {
    const ahora = Date.now();

    // Si el caché no ha expirado, devolverlo
    if (
      this.noticiasCache &&
      ahora - this.noticiasCacheTime < this.cacheExpire
    ) {
      return this.noticiasCache;
    }

    try {
      if (!fs.existsSync(this.noticiasConfigPath)) {
        console.log("[ConfigService] ℹ️ Archivo de config noticias no existe");
        return { enabled: false, noticias: [] };
      }

      const contenido = fs.readFileSync(this.noticiasConfigPath, "utf-8");
      const config: any = JSON.parse(contenido);

      // Actualizar caché
      this.noticiasCache = config;
      this.noticiasCacheTime = ahora;

      return config;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error leyendo config noticias:",
        error.message
      );
      return { enabled: false, noticias: [] };
    }
  }

  /**
   * Guarda la configuración de noticias en disco
   */
  guardarConfigNoticias(config: any): void {
    try {
      const contenido = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.noticiasConfigPath, contenido, "utf-8");
      console.log(
        "[ConfigService] ✅ Config noticias guardada en:",
        this.noticiasConfigPath
      );

      // Invalidar caché para que se relean los datos
      this.noticiasCache = null;
      this.noticiasCacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config noticias:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtiene la configuración de noticias
   */
  obtenerNoticiasActivas(): any {
    const config = this.leerConfigNoticias();

    if (!config.enabled) {
      return null;
    }

    return config;
  }

  /**
   * Valida la consistencia interna de la configuración
   */
  private validarConsistenciaConfig(config: ConfigPlanes): void {
    const errores: string[] = [];

    // Verificar que los planes disponibles tengan precios normales
    if (config.planes_disponibles && config.precios_normales) {
      const planesIds = Object.keys(config.planes_disponibles);
      const preciosIds = Object.keys(config.precios_normales);

      const planesSinPrecio = planesIds.filter(
        (id) => !preciosIds.includes(id)
      );
      if (planesSinPrecio.length > 0) {
        errores.push(`Planes sin precio normal: ${planesSinPrecio.join(", ")}`);
      }

      const preciosSinPlan = preciosIds.filter((id) => !planesIds.includes(id));
      if (preciosSinPlan.length > 0) {
        errores.push(
          `Precios normales sin plan correspondiente: ${preciosSinPlan.join(
            ", "
          )}`
        );
      }
    }

    // Verificar que los overrides sean para planes existentes
    if (config.overrides && config.planes_disponibles) {
      const overrideIds = Object.keys(config.overrides)
        .filter((id) => !id.startsWith('_')); // Ignorar comentarios (claves que empiezan con _)
      const planesIds = Object.keys(config.planes_disponibles);

      const overridesInvalidos = overrideIds.filter(
        (id) => !planesIds.includes(id)
      );
      if (overridesInvalidos.length > 0) {
        console.warn(
          `[ConfigService] ⚠️ Overrides para planes no existentes: ${overridesInvalidos.join(
            ", "
          )}`
        );
        // No es un error fatal, solo una advertencia
      }
    }

    // Verificar configuración de promoción
    if (config.promo_config?.activa && !config.overrides) {
      errores.push("Promoción activa pero no hay overrides definidos");
    }

    if (errores.length > 0) {
      console.error("[ConfigService] ❌ Errores de consistencia en config:");
      errores.forEach((error) => console.error(`  - ${error}`));
      throw new Error(`Configuración inconsistente: ${errores.join("; ")}`);
    }
  }

  /**
   * Valida la configuración de promociones
   */
  validarConfigPromocion(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];
    const config = this.leerConfig();

    if (!config.enabled) {
      return { valido: true, errores: [] }; // Si config deshabilitada, no validar
    }

    if (config.promo_config?.activa) {
      // Verificar que haya overrides definidos
      if (!config.overrides || Object.keys(config.overrides).length === 0) {
        errores.push(
          "Promoción activa pero no hay overrides de precio definidos"
        );
      }

      // Verificar que los overrides tengan precios válidos
      if (config.overrides) {
        Object.entries(config.overrides).forEach(([id, override]) => {
          if (
            typeof override === "object" &&
            override !== null &&
            override.precio !== undefined &&
            (override.precio < 0 || !Number.isFinite(override.precio))
          ) {
            errores.push(
              `Override para plan ${id} tiene precio inválido: ${override.precio}`
            );
          }
        });
      }

      // Verificar duración de la promoción
      if (
        config.promo_config.duracion_horas <= 0 ||
        config.promo_config.duracion_horas > 24 * 30
      ) {
        errores.push(
          `Duración de promoción inválida: ${config.promo_config.duracion_horas} horas`
        );
      }

      // Verificar fecha de activación si existe
      if (config.promo_config.activada_en) {
        const fechaActivacion = new Date(config.promo_config.activada_en);
        if (isNaN(fechaActivacion.getTime())) {
          errores.push(
            `Fecha de activación inválida: ${config.promo_config.activada_en}`
          );
        } else {
          const ahora = new Date();
          const tiempoTranscurrido =
            ahora.getTime() - fechaActivacion.getTime();
          const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);

          if (
            config.promo_config.auto_desactivar &&
            horasTranscurridas > config.promo_config.duracion_horas
          ) {
            console.warn(
              `[ConfigService] ⚠️ Promoción expirada (${horasTranscurridas.toFixed(
                1
              )}h > ${config.promo_config.duracion_horas}h)`
            );
            // Podríamos auto-desactivar aquí, pero por ahora solo advertir
          }
        }
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  /**
   * Verifica la consistencia entre la configuración y la base de datos
   */
  verificarConsistenciaConDB(databaseService: any): void {
    try {
      const config = this.leerConfig();
      if (!config.enabled) {
        console.log(
          "[ConfigService] ⚠️ Config deshabilitada, saltando verificación con DB"
        );
        return;
      }

      const planesDB: Plan[] = databaseService.obtenerPlanes();
      const planesConfig = config.planes_disponibles || {};

      console.log(
        `[ConfigService] 🔍 Verificando consistencia: ${
          planesDB.length
        } planes en DB, ${Object.keys(planesConfig).length} en config`
      );

      // Verificar que todos los planes activos en DB estén en config
      const planesFaltantesEnConfig = planesDB
        .filter((plan: Plan) => plan.activo)
        .filter((plan: Plan) => !planesConfig[plan.id.toString()]);

      if (planesFaltantesEnConfig.length > 0) {
        console.warn(
          "[ConfigService] ⚠️ Planes activos en DB pero no en config:"
        );
        planesFaltantesEnConfig.forEach((plan: Plan) => {
          console.warn(`  - Plan ${plan.id}: ${plan.nombre}`);
        });
      }

      // Verificar que todos los planes en config existan en DB
      const planesFaltantesEnDB = Object.keys(planesConfig).filter(
        (id) => !planesDB.find((plan: Plan) => plan.id.toString() === id)
      );

      if (planesFaltantesEnDB.length > 0) {
        console.warn("[ConfigService] ⚠️ Planes en config pero no en DB:");
        planesFaltantesEnDB.forEach((id) => {
          console.warn(`  - Plan ${id}: ${planesConfig[id]}`);
        });
      }

      if (
        planesFaltantesEnConfig.length === 0 &&
        planesFaltantesEnDB.length === 0
      ) {
        console.log(
          "[ConfigService] ✅ Consistencia entre config y DB verificada"
        );
      }
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error verificando consistencia con DB:",
        error.message
      );
    }
  }

  private shouldApplyPromo(
    promoConfig?: { activa?: boolean; solo_nuevos?: boolean | null; solo_renovaciones?: boolean | null },
    options?: OverrideOptions
  ): boolean {
    if (!promoConfig?.activa) {
      return false;
    }

    // Si es solo para nuevos clientes y NO es un cliente nuevo, no aplicar
    if (promoConfig.solo_nuevos && !options?.forNewCustomers) {
      return false;
    }

    // Si es solo para renovaciones y NO es una renovación, no aplicar
    if (promoConfig.solo_renovaciones && !options?.forRenewal) {
      return false;
    }

    return true;
  }
}

export const configService = new ConfigService();
