import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config';
import { supabaseService } from '../services/supabase.service';

/**
 * Middleware de CORS
 */
const allowedCorsOrigins = (config.cors.origin || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Requests sin header Origin (ej: curl, healthchecks, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    // WebView/Capacitor/file:// SIEMPRE envían Origin: null - permitir siempre para apps móviles
    if (origin === 'null') {
      callback(null, true);
      return;
    }

    if (allowedCorsOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    if (allowedCorsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // No aplicar CORS (sin error)
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Middleware de autenticación con JWT de Supabase
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AuthMiddleware] Verificando token. Header:', authHeader ? 'Presente' : 'Faltante');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AuthMiddleware] Token faltante o formato incorrecto');
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token faltante',
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    console.log('[AuthMiddleware] Token obtenido, longitud:', token.length);
    
    // Validar el token con Supabase
    const client = supabaseService.getClient();
    if (!client) {
      console.error('[AuthMiddleware] Cliente Supabase no disponible');
      return res.status(500).json({
        success: false,
        error: 'Servicio de autenticación no disponible',
      });
    }

    const { data, error } = await client.auth.getUser(token);
    
    if (error) {
      console.log('[AuthMiddleware] Error validando token:', error.message);
    }
    
    if (!data?.user) {
      console.log('[AuthMiddleware] Usuario no encontrado en token');
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token inválido',
      });
    }

    // Agregar el usuario al request
    (req as any).user = data.user;
    (req as any).userId = data.user.id;
    (req as any).supabaseClient = client;
    
    console.log('[AuthMiddleware] ✅ Usuario autenticado:', data.user.id);
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
    });
  }
};

/**
 * Middleware de logging
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const ip = (req.headers["cf-connecting-ip"] as string) || 
             (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || 
             req.ip || 
             req.socket?.remoteAddress || 
             "unknown";

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logLevel = statusCode >= 400 ? '❌' : '✅';

    console.log(
      `${logLevel} [${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - IP: ${ip}`
    );
  });

  next();
};

/**
 * Middleware de manejo de errores
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware de validación de JSON
 */
export const validarJSON = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'JSON inválido en el cuerpo de la solicitud',
    });
    return;
  }
  next(err);
};
