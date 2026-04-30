import Database from "better-sqlite3";
import { config } from "../config";
import { configService } from "./config.service";

export class PreciosSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = config.database.path;
  }

  /**
   * Sincroniza los precios en la base de datos con los valores de `precios_normales`
   * definidos en `planes.config.json`. Devuelve el número de filas actualizadas.
   */
  sincronizarPreciosDesdeConfig(force: boolean = false): {
    updated: number;
    details: Array<{ id: string; from?: number; to: number }>;
  } {
    const cfg = configService.leerConfigPlanes();
    const precios = cfg.precios_normales || {};
    const planesDisponibles = cfg.planes_disponibles || {};

    // Si no hay precios normales definidos, nada que hacer
    if (Object.keys(precios).length === 0) {
      return { updated: 0, details: [] };
    }

    // Protección: no sincronizar mientras una promo esté activa,
    // a menos que se fuerce explícitamente (force === true).
    if (cfg.promo_config && cfg.promo_config.activa && !force) {
      console.info(
        "precios-sync: promo activa, se omite la sincronización (usar force=true para forzar)"
      );
      return { updated: 0, details: [] };
    }

    const db = new Database(this.dbPath);
    try {
      db.pragma("journal_mode = WAL");
      const updateStmt = db.prepare(
        "UPDATE planes SET precio = ? WHERE id = ?"
      );
      const insertStmt = db.prepare(
        "INSERT OR IGNORE INTO planes (id, nombre, descripcion, dias, precio, activo, connection_limit) VALUES (?, ?, ?, ?, ?, 1, ?)"
      );
      const selectStmt = db.prepare("SELECT precio FROM planes WHERE id = ?");

      const details: Array<{ id: string; from?: number; to: number }> = [];
      let updated = 0;

      const tx = db.transaction(() => {
        for (const [id, precio] of Object.entries(precios)) {
          const idNum = parseInt(id, 10);
          const nombre = planesDisponibles[id] || `Plan ${id}`;

          // Parsear nombre para extraer dias y connection_limit
          const diasMatch = nombre.match(/(\d+)\s*d[ií]a/);
          const dias = diasMatch ? parseInt(diasMatch[1]) : 1;

          const connMatch = nombre.match(/(\d+)\s*dispositivo/);
          const connection_limit = connMatch ? parseInt(connMatch[1]) : 1;

          const descripcion = `${connection_limit} dispositivo${
            connection_limit > 1 ? "s" : ""
          } - ${dias} día${dias > 1 ? "s" : ""}`;

          const row = selectStmt.get(idNum) as any;
          const from = row ? Number(row.precio) : undefined;

          if (from === undefined) {
            // Plan no existe, insertarlo
            insertStmt.run(
              idNum,
              nombre,
              descripcion,
              dias,
              precio,
              connection_limit
            );
            updated++;
            details.push({ id, to: Number(precio) });
          } else if (Number(from) !== Number(precio)) {
            // Plan existe, actualizar precio
            updateStmt.run(precio, idNum);
            updated++;
            details.push({ id, from, to: Number(precio) });
          }
        }

        // Desactivar planes que ya no están en el config
        const deactivateStmt = db.prepare(
          "UPDATE planes SET activo = 0 WHERE id NOT IN (" +
            Object.keys(precios).join(",") +
            ") AND activo = 1"
        );
        const deactivated = deactivateStmt.run().changes;
        if (deactivated > 0) {
          updated += deactivated;
          console.log(
            `precios-sync: desactivados ${deactivated} planes obsoletos`
          );
        }
      });

      tx();

      return { updated, details };
    } finally {
      try {
        db.close();
      } catch (err) {
        // ignore
      }
    }
  }

  /**
   * Sincroniza los precios de revendedores en la base de datos con los valores de `precios_normales`
   * definidos en `revendedores.config.json`. Devuelve el número de filas actualizadas.
   */
  sincronizarPreciosRevendedoresDesdeConfig(force: boolean = false): {
    updated: number;
    details: Array<{ id: string; from?: number; to: number }>;
  } {
    const cfg = configService.leerConfigRevendedores();
    const precios = cfg.precios_normales || {};
    const planesCredit = cfg.planes_credit || {};
    const planesValidity = cfg.planes_validity || {};

    // Si no hay precios normales definidos, nada que hacer
    if (Object.keys(precios).length === 0) {
      return { updated: 0, details: [] };
    }

    // Protección: no sincronizar mientras una promo esté activa,
    // a menos que se fuerce explícitamente (force === true).
    if (cfg.promo_config && cfg.promo_config.activa && !force) {
      console.info(
        "precios-sync-revendedores: promo activa, se omite la sincronización (usar force=true para forzar)"
      );
      return { updated: 0, details: [] };
    }

    const db = new Database(this.dbPath);
    try {
      db.pragma("journal_mode = WAL");
      const updateStmt = db.prepare(
        "UPDATE planes_revendedores SET precio = ?, nombre = ?, descripcion = ?, account_type = ?, max_users = ?, dias = ? WHERE id = ?"
      );
      const insertStmt = db.prepare(
        "INSERT OR IGNORE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
      );
      const selectStmt = db.prepare(
        "SELECT precio, nombre FROM planes_revendedores WHERE id = ?"
      );

      const details: Array<{ id: string; from?: number; to: number }> = [];
      let updated = 0;

      const tx = db.transaction(() => {
        for (const [id, precio] of Object.entries(precios)) {
          const idNum = parseInt(id, 10);

          // Determinar tipo de cuenta y datos
          let nombre: string;
          let descripcion: string;
          let max_users: number;
          let account_type: string;
          let dias: number | null = null;

          if (idNum >= 1 && idNum <= 11) {
            // Créditos
            account_type = "credit";
            nombre = planesCredit[id] || `Plan ${id}`;
            const creditMatch = nombre.match(/(\d+)\s*crédito/);
            max_users = creditMatch ? parseInt(creditMatch[1]) : idNum * 10;
            descripcion = nombre;
          } else {
            // Validez
            account_type = "validity";
            nombre = planesValidity[id] || `Plan ${id}`;
            const userMatch = nombre.match(/(\d+)\s*Usuario/);
            max_users = userMatch ? parseInt(userMatch[1]) : 10;
            dias = 30; // Asumimos 30 días para validez
            descripcion = nombre;
          }

          const row = selectStmt.get(idNum) as any;
          const from = row ? Number(row.precio) : undefined;
          const nombreActual = row ? row.nombre : undefined;

          if (from === undefined) {
            // Plan no existe, insertarlo
            insertStmt.run(
              idNum,
              nombre,
              descripcion,
              precio,
              max_users,
              account_type,
              dias
            );
            updated++;
            details.push({ id, to: Number(precio) });
          } else if (Number(from) !== Number(precio) || nombreActual !== nombre) {
            // Plan existe, actualizar precio, nombre, descripción y tipo de cuenta
            updateStmt.run(precio, nombre, descripcion, account_type, max_users, dias, idNum);
            updated++;
            details.push({ id, from, to: Number(precio) });
          }
        }

        // Desactivar planes que ya no están en el config
        const deactivateStmt = db.prepare(
          "UPDATE planes_revendedores SET activo = 0 WHERE id NOT IN (" +
            Object.keys(precios).join(",") +
            ") AND activo = 1"
        );
        const deactivated = deactivateStmt.run().changes;
        if (deactivated > 0) {
          updated += deactivated;
          console.log(
            `precios-sync-revendedores: desactivados ${deactivated} planes obsoletos`
          );
        }
      });

      tx();

      return { updated, details };
    } finally {
      try {
        db.close();
      } catch (err) {
        // ignore
      }
    }
  }
}

export const preciosSyncService = new PreciosSyncService();
