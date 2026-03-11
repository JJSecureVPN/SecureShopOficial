import { apiService } from './api.service';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

class MercadoPagoService {
  private static instance: MercadoPagoService;
  private mpInstance: any = null;
  private buttonInstance: any = null;
  private initialized: boolean = false;
  private onSubmitCallback: (() => Promise<string>) | null = null;
  private createdContainers: Set<string> = new Set();
  private creationAttempts: Map<string, number> = new Map();
  private containerCreated: boolean = false;

  private constructor() {
    console.log('[MercadoPagoService] Instancia creada (singleton)');
    this.ensureContainerExists();
  }

  private ensureContainerExists(): void {
    if (this.containerCreated) return;
    
    // El contenedor ya está en CheckoutPage, no creamos uno en el body
    // Solo marcamos que verificamos
    if (document.getElementById('mp-wallet-container-unique')) {
      console.log('[MercadoPagoService] ✅ Contenedor ya existe en el DOM');
      this.containerCreated = true;
    }
  }

  public static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
      console.log('[MercadoPagoService] Nueva instancia singleton creada');
    } else {
      console.log('[MercadoPagoService] Retornando instancia singleton existente');
    }
    return MercadoPagoService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[MercadoPago] Ya está inicializado');
      return;
    }

    try {
      const config = await apiService.obtenerConfigMercadoPago();
      
      // Limpiar cualquier whitespace en la publicKey
      if (config.publicKey) {
        config.publicKey = config.publicKey.trim();
      }

      if (!window.MercadoPago) {
        throw new Error('SDK de MercadoPago no está cargado');
      }
      
      if (!config.publicKey) {
        throw new Error('PublicKey de MercadoPago está vacía');
      }

      // Crear instancia de MercadoPago con error handling mejorado
      try {
        console.log('[MercadoPago] Creando instancia con publicKey:', config.publicKey.substring(0, 20) + '...');
        this.mpInstance = new window.MercadoPago(config.publicKey);
        this.initialized = true;
        console.log('[MercadoPago] ✅ Inicializado correctamente');
      } catch (initError: any) {
        console.error('[MercadoPago] Error crítico al crear instancia:', initError?.message);
        
        // Si el error es solo de telemetría/tracking, intentar nuevamente
        if (initError?.message?.includes('net::ERR_BLOCKED_BY_CLIENT') || 
            initError?.message?.includes('Could not send event') ||
            initError?.type === 'non_critical') {
          console.warn('[MercadoPago] ⚠️ Error no-crítico de telemetría, reintentando...');
          try {
            this.mpInstance = new window.MercadoPago(config.publicKey);
            this.initialized = true;
            console.log('[MercadoPago] ✅ Inicializado correctamente (error de telemetría ignorado)');
          } catch (retryError: any) {
            console.error('[MercadoPago] Error al reintentar:', retryError?.message);
            throw new Error(`MercadoPago initialization failed: ${retryError?.message || 'Unknown error'}`);
          }
        } else if (initError?.message?.includes('whitespaces')) {
          console.error('[MercadoPago] ❌ La publicKey contiene espacios. Revisa la configuración del backend.');
          throw new Error('PublicKey inválida (contiene espacios en blanco). Por favor, contacta al soporte.');
        } else {
          console.error('[MercadoPago] ❌ Error no-identificado:', initError);
          throw new Error(`MercadoPago initialization failed: ${initError?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('[MercadoPago] Error inicializando:', error);
      // No relanzamos el error para que el checkout pueda continuar
      // El error se mostrará cuando intente crear el botón
      this.initialized = false;
    }
  }

  public async createButton(containerId: string, onSubmit: () => Promise<string>): Promise<void> {
    console.log(`[MercadoPago] createButton llamado para container: ${containerId} - Intento #${(this.creationAttempts.get(containerId) || 0) + 1}`);
    console.trace("[MercadoPago] Stack trace de createButton");

    if (!this.initialized) {
      await this.initialize();
    }

    // Si el botón ya existe en este contenedor, NUNCA lo volvemos a crear
    if (this.createdContainers.has(containerId)) {
      console.log(`[MercadoPago] Contenedor ${containerId} ya tiene botón creado, solo actualizando callback`);
      this.onSubmitCallback = onSubmit;
      return;
    }

    // Contar intentos de creación
    const attempts = (this.creationAttempts.get(containerId) || 0) + 1;
    this.creationAttempts.set(containerId, attempts);
    console.log(`[MercadoPago] Intento #${attempts} de crear botón en ${containerId}`);

    if (attempts > 1) {
      console.warn(`[MercadoPago] ⚠️ INTENTO MÚLTIPLE #${attempts} de crear botón en ${containerId} - previniendo creación`);
      this.onSubmitCallback = onSubmit;
      return;
    }

    this.onSubmitCallback = onSubmit;

    try {
      // Verificar que el contenedor existe en el DOM
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error(`[MercadoPago] ❌ Contenedor ${containerId} no existe en el DOM`);
        throw new Error(`Contenedor ${containerId} no encontrado en el DOM`);
      }

      console.log(`[MercadoPago] Contenedor ${containerId} encontrado en DOM, limpiando antes de crear...`);
      
      // Validar que mpInstance está correctamente inicializado
      if (!this.mpInstance) {
        console.error(`[MercadoPago] ❌ MercadoPago no está inicializado. Intenta reinicializar...`);
        throw new Error('MercadoPago no está correctamente inicializado');
      }
      
      // 🔴 CRÍTICO: LIMPIAR el contenedor antes de crear el botón
      // Si no limpiamos, MercadoPago va a agregar un nuevo botón en lugar de reemplazar
      containerElement.innerHTML = '';
      
      console.log(`[MercadoPago] Contenedor limpiado, creando botón...`);

      const bricksBuilder = this.mpInstance.bricks();
      
      if (!bricksBuilder) {
        console.error(`[MercadoPago] ❌ No se pudo crear Bricks builder`);
        throw new Error('Bricks builder no pudo ser creado');
      }

      this.buttonInstance = await bricksBuilder.create('wallet', containerId, {
        initialization: {
          redirectMode: 'self'
        },
        customization: {
          theme: 'default',
          valueProp: 'security_safety',
          customStyle: {
            valuePropColor: 'blue',
            buttonHeight: '44px',
            borderRadius: '6px',
            verticalPadding: '0px',
            horizontalPadding: '0px',
          }
        },
        callbacks: {
          onReady: () => {
            console.log(`[MercadoPago] ✅ Botón listo en ${containerId}`);
            // Asegurar que el botón llene el contenedor sin rebasar
            const container = document.getElementById(containerId);
            if (container) {
              container.style.minHeight = '44px';
              container.style.height = 'auto';
              // Forzar que los elementos internos sean responsivos
              const allElements = container.querySelectorAll('*');
              allElements.forEach((el: any) => {
                el.style.maxWidth = '100%';
                el.style.boxSizing = 'border-box';
              });
            }
          },
          onError: (error: any) => {
            console.error(`[MercadoPago] ❌ Error en botón (${containerId}):`, error);
          },
          onSubmit: async () => {
            console.log('[MercadoPago] onSubmit llamado');
            if (this.onSubmitCallback) {
              const preferenceId = await this.onSubmitCallback();
              console.log('[MercadoPago] PreferenceId obtenido:', preferenceId);
              return preferenceId;
            }
          }
        }
      });

      // Marcar este contenedor como ya creado
      this.createdContainers.add(containerId);
      console.log(`[MercadoPago] ✅ Botón creado exitosamente en ${containerId}`);
    } catch (error) {
      console.error(`[MercadoPago] ❌ Error creando botón en ${containerId}:`, error);
      this.buttonInstance = null;
      this.createdContainers.delete(containerId);
      throw error;
    }
  }

  public updateCallback(onSubmit: () => Promise<string>): void {
    console.log('[MercadoPago] Actualizando callback');
    this.onSubmitCallback = onSubmit;
  }

  public destroy(): void {
    if (this.buttonInstance) {
      try {
        this.buttonInstance.unmount();
        this.buttonInstance = null;
        this.createdContainers.clear();
        this.creationAttempts.clear();
        console.log('[MercadoPago] Botón destruido');
      } catch (error) {
        console.warn('[MercadoPago] Error destruyendo botón:', error);
      }
    }
  }

  public isButtonCreated(): boolean {
    return this.buttonInstance !== null;
  }

  public getDebugInfo(): object {
    return {
      initialized: this.initialized,
      buttonCreated: this.buttonInstance !== null,
      createdContainers: Array.from(this.createdContainers),
      creationAttempts: Object.fromEntries(this.creationAttempts),
    };
  }

  public async createButtonWithPreference(containerId: string, preferenceId: string): Promise<void> {
    console.log(`[MercadoPago] createButtonWithPreference llamado con preferenceId: ${preferenceId}`);

    if (!this.initialized) {
      console.log('[MercadoPago] No inicializado, intentando inicializar...');
      await this.initialize();
    }

    if (!this.mpInstance) {
      throw new Error('MercadoPago no está inicializado correctamente');
    }

    try {
      // Verificar que el contenedor existe en el DOM
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error(`[MercadoPago] ❌ Contenedor ${containerId} no existe en el DOM`);
        throw new Error(`Contenedor ${containerId} no encontrado en el DOM`);
      }

      console.log(`[MercadoPago] Contenedor ${containerId} encontrado, limpiando...`);
      
      // Limpiar el contenedor
      containerElement.innerHTML = '';
      
      console.log(`[MercadoPago] Creando botón wallet con preferenceId: ${preferenceId}...`);

      const bricksBuilder = this.mpInstance.bricks();

      if (!bricksBuilder) {
        throw new Error('Bricks builder no pudo ser creado');
      }

      this.buttonInstance = await bricksBuilder.create('wallet', containerId, {
        initialization: {
          preferenceId: preferenceId,
          redirectMode: 'self'
        },
        customization: {
          theme: 'default',
          valueProp: 'security_safety',
          customStyle: {
            valuePropColor: 'blue',
            buttonHeight: '44px',
            borderRadius: '6px',
            verticalPadding: '0px',
            horizontalPadding: '0px',
          }
        },
        callbacks: {
          onReady: () => {
            console.log(`[MercadoPago] ✅ Botón wallet listo con preferenceId`);
          },
          onError: (error: any) => {
            console.error(`[MercadoPago] ❌ Error en botón wallet:`, error);
          },
          onSubmit: async () => {
            console.log('[MercadoPago] Botón wallet - onSubmit llamado');
          }
        }
      });

      this.createdContainers.add(containerId);
      console.log(`[MercadoPago] ✅ Botón wallet creado exitosamente`);
    } catch (error) {
      console.error(`[MercadoPago] ❌ Error creando botón wallet:`, error);
      this.buttonInstance = null;
      this.createdContainers.delete(containerId);
      throw error;
    }
  }
}

export const mercadoPagoService = MercadoPagoService.getInstance();
