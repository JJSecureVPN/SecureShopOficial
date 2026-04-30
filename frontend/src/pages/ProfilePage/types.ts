import { EstadoCuenta } from '../../services/api.service';

// Estado de cuenta expandido por compra
export interface EstadoCuentaMap {
  [username: string]: {
    loading: boolean;
    data: EstadoCuenta | null;
    error: string | null;
    expanded: boolean;
    repaired?: boolean;
  };
}
