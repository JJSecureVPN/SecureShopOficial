import { Router, Request, Response } from 'express';
import { ServexService } from '../services/servex.service';
import { ServexPollingService } from '../services/servex-polling.service';
import { ApiResponse } from '../types';

export function crearRutasClientes(
  servexService: ServexService,
  pollingService?: ServexPollingService
): Router {
  const router = Router();

  /**
   * GET /api/clients
   * Obtiene la lista de clientes con filtros opcionales
   */
  router.get('/clients', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        scope = 'meus',
        resellerId
      } = req.query;

      // Convertir parámetros a tipos correctos
      const params = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        status: status as string,
        scope: scope as string,
        resellerId: resellerId ? parseInt(resellerId as string, 10) : undefined
      };

      console.log('[Rutas Clientes] Parámetros:', params);

      const puedeUsarSnapshot = Boolean(
        pollingService &&
          params.page === 1 &&
          !params.search &&
          !params.status &&
          !params.resellerId &&
          (params.scope === 'meus' || !params.scope)
      );

      if (puedeUsarSnapshot) {
        const snapshot = pollingService!.getSnapshot();
        if (snapshot) {
          const clientesSnapshot = snapshot.clients.slice(0, params.limit);
          const response: ApiResponse = {
            success: true,
            data: clientesSnapshot,
            meta: {
              source: 'snapshot',
              fetchedAt: snapshot.fetchedAt.toISOString(),
            },
          };

          res.json(response);
          return;
        }
      }

      const clientes = await servexService.obtenerClientes(params, {
        forceRefresh: puedeUsarSnapshot,
      });

      const response: ApiResponse = {
        success: true,
        data: clientes,
        meta: {
          source: puedeUsarSnapshot ? 'servex-refresh' : 'servex',
          fetchedAt: new Date().toISOString(),
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas Clientes] Error obteniendo clientes:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo clientes',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/clients/estado/:username
   * Obtiene el estado actual de una cuenta desde Servex
   * Usado por usuarios para ver días restantes, conexiones, etc.
   * Busca primero en clientes, luego en revendedores
   */
  router.get('/clients/estado/:username', async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      if (!username || username.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: 'Username inválido'
        } as ApiResponse);
        return;
      }

      console.log(`[Clientes] Consultando estado de cuenta: ${username}`);
      
      // Primero buscar en clientes
      let cuenta = await servexService.buscarClientePorUsername(username.trim());
      let esRevendedor = false;
      
      // Si no se encuentra en clientes, buscar en revendedores
      if (!cuenta) {
        console.log(`[Clientes] No encontrado en clientes, buscando en revendedores...`);
        cuenta = await servexService.buscarRevendedorPorUsername(username.trim());
        esRevendedor = cuenta !== null;
      }
      
      if (!cuenta) {
        res.status(404).json({
          success: false,
          error: 'Cuenta no encontrada'
        } as ApiResponse);
        return;
      }

      // Calcular días restantes
      let diasRestantes = 0;
      let estadoCuenta = 'activo';
      const ahora = new Date();
      
      if (cuenta.expiration_date) {
        const expiracion = new Date(cuenta.expiration_date);
        const diffMs = expiracion.getTime() - ahora.getTime();
        diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (diasRestantes <= 0) {
          estadoCuenta = 'expirado';
          diasRestantes = 0;
        } else if (diasRestantes <= 3) {
          estadoCuenta = 'por_expirar';
        }
      }

      // Si no es revendedor por búsqueda, verificar por max_users
      if (!esRevendedor) {
        esRevendedor = cuenta.max_users && cuenta.max_users > 1;
      }

      // Log para debug de campos de revendedor
      if (esRevendedor) {
        console.log(`[Clientes] Datos revendedor ${username}:`, JSON.stringify(cuenta, null, 2));
      }

      // Determinar tipo de cuenta de revendedor: 'credit' o 'validity'
      const tipoRevendedor = cuenta.account_type || 'validity';
      // Para cuentas de validez: usedUsers o userCount son los usuarios creados por el revendedor
      const usuariosCreados = cuenta.usedUsers || cuenta.userCount || cuenta.clients_count || cuenta.total_clients || 0;

      const estadoInfo = {
        username: cuenta.username,
        tipo: esRevendedor ? 'revendedor' : 'cliente',
        estado: estadoCuenta,
        activo: cuenta.is_active !== false,
        diasRestantes,
        fechaExpiracion: cuenta.expiration_date,
        // Datos específicos
        ...(esRevendedor ? {
          // Distinguir entre cuenta de crédito y validez
          tipoRevendedor: tipoRevendedor,
          ...(tipoRevendedor === 'credit' ? {
            // Cuenta de crédito: solo muestra créditos disponibles
            creditos: cuenta.max_users || 0
          } : {
            // Cuenta de validez: muestra usuarios actuales / máximos
            maxUsuarios: cuenta.max_users || 0,
            usuariosActuales: usuariosCreados
          })
        } : {
          // connection_limit es el campo real de Servex para límite de conexiones
          conexionesMaximas: cuenta.connection_limit || cuenta.max_connections || 1,
          online: cuenta.is_online || false
        }),
        // Fechas
        fechaCreacion: cuenta.created_at,
        ultimaConexion: cuenta.last_connection
      };

      res.json({
        success: true,
        data: estadoInfo
      } as ApiResponse);

    } catch (error: any) {
      console.error('[Clientes] Error consultando estado:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error consultando estado de cuenta'
      } as ApiResponse);
    }
  });

  /**
   * POST /api/clients/reparar/:username
   * Forza una resincronización de la cuenta en Servex (Guardar sin cambios)
   * Útil cuando el usuario renovó pero no le conecta la cuenta.
   */
  router.post('/clients/reparar/:username', async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
      if (!username || username.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: 'Nombre de usuario inválido'
        } as ApiResponse);
        return;
      }

      // Validar caracteres básicos (alfanumérico, guiones, puntos)
      const usernameRegex = /^[a-zA-Z0-9.\-_:]+$/; // Permitimos : por si acaso, pero lo normal es alfanumérico
      if (!usernameRegex.test(username.trim())) {
        res.status(400).json({
          success: false,
          error: 'El nombre de usuario contiene caracteres no permitidos'
        } as ApiResponse);
        return;
      }

      console.log(`[Clientes] 🔧 Iniciando reparación/sincronización para: ${username}`);

      // 1. Buscar el cliente/revendedor actual
      let cuenta: any = null;
      let esRevendedor = false;

      try {
        cuenta = await servexService.buscarClientePorUsername(username.trim());
      } catch (err: any) {
        console.warn(`[Clientes] ⚠️ Error buscando cliente (posible no existe): ${err.message}`);
      }

      if (!cuenta) {
        try {
          cuenta = await servexService.buscarRevendedorPorUsername(username.trim());
          esRevendedor = cuenta !== null;
        } catch (err: any) {
          console.warn(`[Clientes] ⚠️ Error buscando revendedor: ${err.message}`);
        }
      }

      if (!cuenta) {
        console.log(`[Clientes] ❌ Cuenta no encontrada en Servex: ${username}`);
        res.status(404).json({
          success: false,
          error: `La cuenta "${username}" no fue encontrada en nuestros registros de VPN`
        } as ApiResponse);
        return;
      }

      // 2. Ejecutar la sincronización (Guardar sin cambios con type: user)
      if (esRevendedor) {
        await servexService.actualizarRevendedor(cuenta.id, {
          name: cuenta.name,
          username: cuenta.username,
          max_users: cuenta.max_users,
          account_type: cuenta.account_type || 'validity',
          expiration_date: cuenta.expiration_date
        }, cuenta.username);
      } else {
        const payload: any = {
          username: cuenta.username,
          category_id: cuenta.category_id,
          connection_limit: cuenta.connection_limit || 1,
          type: 'user', 
          ...(cuenta.observation && { observation: cuenta.observation }),
          ...(cuenta.v2ray_uuid && { v2ray_uuid: cuenta.v2ray_uuid })
        };
        await servexService.actualizarCliente(cuenta.id, payload);
      }

      console.log(`[Clientes] ✅ Sincronización completada para: ${username}`);

      res.json({
        success: true,
        message: 'Cuenta sincronizada correctamente. Intenta conectar ahora.'
      } as ApiResponse);

    } catch (error: any) {
      console.error('[Clientes] ❌ Error fatal reparando cuenta:', error);
      res.status(500).json({
        success: false,
        error: `Error interno al intentar reparar la cuenta: ${error.message}`
      } as ApiResponse);
    }
  });

  return router;
}