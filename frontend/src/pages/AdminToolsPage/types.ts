import { Cupon, NoticiaConfig } from "../../types";

export interface CuponFormState {
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: string;
  limite_uso: string;
  fecha_expiracion: string;
  oculto: boolean;
  planes_aplicables: string[];
}

export interface AdminToolsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export interface PromoConfig {
  activa: boolean;
  activada_en?: string | null;
  duracion_horas: number;
  auto_desactivar: boolean;
  solo_nuevos?: boolean;
  solo_renovaciones?: boolean;
}

export interface HeroPromoConfig {
  habilitada: boolean;
  texto: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
  shadowColor?: string;
}

export interface AdminToolsState {
  // Cupones
  cupones: Cupon[];
  loadingCupones: boolean;
  isRefreshingCupones: boolean;
  cuponForm: CuponFormState;
  cuponError: string | null;
  cuponSuccess: string | null;
  isCreatingCupon: boolean;
  cuponToDelete: Cupon | null;
  isDeletingCupon: boolean;

  // Noticias
  noticiasConfig: NoticiaConfig | null;
  noticiasError: string | null;
  noticiasSuccess: string | null;
  isSavingNoticias: boolean;

  // Promociones
  promoConfigPlanes: PromoConfig | null;
  promoConfigRevendedores: PromoConfig | null;
  heroPromoPlanes: HeroPromoConfig | null;
  heroPromoRevendedores: HeroPromoConfig | null;
  promoError: string | null;
  promoSuccess: string | null;
  isLoadingPromo: boolean;
  isSavingPromo: boolean;
  durationInputPlanes: string;
  durationInputRevendedores: string;

  // UI
  activeSection: string;
}

export interface AdminToolsActions {
  setCupones: (cupones: Cupon[]) => void;
  setLoadingCupones: (loading: boolean) => void;
  setIsRefreshingCupones: (refreshing: boolean) => void;
  setCuponForm: (form: CuponFormState) => void;
  setCuponError: (error: string | null) => void;
  setCuponSuccess: (success: string | null) => void;
  setIsCreatingCupon: (creating: boolean) => void;
  setCuponToDelete: (cupon: Cupon | null) => void;
  setIsDeletingCupon: (deleting: boolean) => void;
  setNoticiasConfig: (config: NoticiaConfig | null) => void;
  setNoticiasError: (error: string | null) => void;
  setNoticiasSuccess: (success: string | null) => void;
  setIsSavingNoticias: (saving: boolean) => void;
  setPromoConfigPlanes: (config: PromoConfig | null) => void;
  setPromoConfigRevendedores: (config: PromoConfig | null) => void;
  setHeroPromoPlanes: (config: HeroPromoConfig | null) => void;
  setHeroPromoRevendedores: (config: HeroPromoConfig | null) => void;
  setPromoError: (error: string | null) => void;
  setPromoSuccess: (success: string | null) => void;
  setIsLoadingPromo: (loading: boolean) => void;
  setIsSavingPromo: (saving: boolean) => void;
  setDurationInputPlanes: (duration: string) => void;
  setDurationInputRevendedores: (duration: string) => void;
  setActiveSection: (section: string) => void;
}
