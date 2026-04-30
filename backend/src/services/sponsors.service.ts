import { DatabaseService } from "./database.service";
import {
  Sponsor,
  CrearSponsorInput,
  ActualizarSponsorInput,
} from "../types";

export class SponsorsService {
  constructor(private readonly database: DatabaseService) {}

  listar(): Sponsor[] {
    return this.database.obtenerSponsors();
  }

  crear(input: CrearSponsorInput): Sponsor {
    const payload = this.normalizarCrear(input);
    this.validarCrear(payload);
    return this.database.crearSponsor(payload);
  }

  actualizar(id: number, input: ActualizarSponsorInput): Sponsor {
    const payload = this.normalizarActualizar(input);
    this.validarActualizar(payload);
    const actualizado = this.database.actualizarSponsor(id, payload);
    if (!actualizado) {
      throw new Error("Sponsor no encontrado");
    }
    return actualizado;
  }

  eliminar(id: number): void {
    this.database.eliminarSponsor(id);
  }

  private normalizarCrear(input: CrearSponsorInput): CrearSponsorInput {
    return {
      ...input,
      name: input.name.trim(),
      role: input.role.trim(),
      message: input.message.trim(),
      avatarInitials: input.avatarInitials.trim().toUpperCase().slice(0, 2),
      avatarClass: input.avatarClass.trim(),
      avatarUrl: input.avatarUrl?.trim() || undefined,
      link: input.link?.trim() || undefined,
      highlight: Boolean(input.highlight),
      order: input.order ?? Date.now(),
    };
  }

  private normalizarActualizar(
    input: ActualizarSponsorInput,
  ): ActualizarSponsorInput {
    const payload: ActualizarSponsorInput = { ...input };
    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }
    if (payload.role !== undefined) {
      payload.role = payload.role.trim();
    }
    if (payload.message !== undefined) {
      payload.message = payload.message.trim();
    }
    if (payload.avatarInitials !== undefined) {
      payload.avatarInitials = payload.avatarInitials
        .trim()
        .toUpperCase()
        .slice(0, 2);
    }
    if (payload.avatarClass !== undefined) {
      payload.avatarClass = payload.avatarClass.trim();
    }
    if (payload.avatarUrl !== undefined) {
      payload.avatarUrl = payload.avatarUrl.trim() || undefined;
    }
    if (payload.link !== undefined) {
      payload.link = payload.link.trim() || undefined;
    }
    if (payload.highlight !== undefined) {
      payload.highlight = Boolean(payload.highlight);
    }
    return payload;
  }

  private validarCrear(input: CrearSponsorInput): void {
    if (!input.name) {
      throw new Error("El nombre es obligatorio");
    }
    if (!input.role) {
      throw new Error("El rol es obligatorio");
    }
    if (!input.message) {
      throw new Error("El mensaje es obligatorio");
    }
    if (!input.avatarClass) {
      throw new Error("La clase del avatar es obligatoria");
    }
    if (!this.categoriaValida(input.category)) {
      throw new Error("Categoría inválida");
    }
    if (!input.avatarInitials) {
      input.avatarInitials = this.generarIniciales(input.name);
    }
    if (!input.avatarInitials && !input.avatarUrl) {
      throw new Error("Debes proporcionar iniciales o un logo");
    }
  }

  private validarActualizar(input: ActualizarSponsorInput): void {
    if (input.category !== undefined && !this.categoriaValida(input.category)) {
      throw new Error("Categoría inválida");
    }
    if (
      input.avatarInitials !== undefined &&
      !input.avatarInitials &&
      !input.avatarUrl
    ) {
      throw new Error("Debes proporcionar iniciales o un logo");
    }
  }

  private categoriaValida(category: string | undefined): boolean {
    return category === "empresa" || category === "persona";
  }

  private generarIniciales(nombre: string): string {
    if (!nombre) {
      return "";
    }
    const partes = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (partes.length === 0) {
      return "";
    }
    const iniciales = partes.map((parte) => parte[0]!.toUpperCase()).join("");
    return iniciales.slice(0, 2);
  }
}
