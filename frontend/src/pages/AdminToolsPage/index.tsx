import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiService } from "../../services/api.service";
import {
  Cupon,
  Sponsor,
  CrearSponsorPayload,
  ActualizarSponsorPayload,
} from "../../types";
import {
  OverviewSection,
  CuponesForm,
  CuponesList,
  DeleteCuponModal,
  NoticiasManagementSection,
  DescuentosGlobalesSection,
  SponsorsSection,
  PlanesSection,
  ReferidosSection,
  TicketsSoporteSection,
  AdminSidebar,
} from "./components";
import type { AdminSection } from "./components";
import { CuponFormState, PromoConfig, HeroPromoConfig } from "./types";
import AdminHelpCenter from "../AdminHelpCenter";

interface AdminToolsPageProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (value: boolean) => void;
}

const INITIAL_CUPON_FORM: CuponFormState = {
  codigo: "",
  tipo: "porcentaje",
  valor: "",
  limite_uso: "",
  fecha_expiracion: "",
  oculto: false,
  planes_aplicables: [],
};

const FEEDBACK_TIMEOUT = 3000;

// eslint-disable-next-line no-empty-pattern
export default function AdminToolsPage({ }: AdminToolsPageProps) {
  // Estado de navegación
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  // Estado de sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [sponsorsSuccess, setSponsorsSuccess] = useState<string | null>(null);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

  // Estado de cupones
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [cuponForm, setCuponForm] = useState<CuponFormState>(INITIAL_CUPON_FORM);
  const [loadingCupones, setLoadingCupones] = useState(true);
  const [cuponSuccess, setCuponSuccess] = useState<string | null>(null);
  const [cuponError, setCuponError] = useState<string | null>(null);
  const [cuponToDelete, setCuponToDelete] = useState<Cupon | null>(null);
  const [isDeletingCupon, setIsDeletingCupon] = useState(false);
  const [isRefreshingCupones, setIsRefreshingCupones] = useState(false);

  // Estado de noticias (manejado por NoticiasManagementSection)
  const [noticiasSuccess, setNoticiasSuccess] = useState<string | null>(null);

  // Estado de promociones - Planes normales
  const [promoConfigPlanes, setPromoConfigPlanes] = useState<PromoConfig | null>(null);
  const [heroPromoPlanes, setHeroPromoPlanes] = useState<HeroPromoConfig | null>(null);
  const [durationInputPlanes, setDurationInputPlanes] = useState("");
  const [discountPercentagePlanes, setDiscountPercentagePlanes] = useState("20");
  const [promoScopePlanes, setPromoScopePlanes] = useState<"todos" | "solo_nuevos" | "solo_renovaciones">("todos");

  // Estado de promociones - Revendedores
  const [promoConfigRevendedores, setPromoConfigRevendedores] = useState<PromoConfig | null>(null);
  const [heroPromoRevendedores, setHeroPromoRevendedores] = useState<HeroPromoConfig | null>(null);
  const [durationInputRevendedores, setDurationInputRevendedores] = useState("");
  const [discountPercentageRevendedores, setDiscountPercentageRevendedores] = useState("20");
  const [promoScopeRevendedores, setPromoScopeRevendedores] = useState<"todos" | "solo_nuevos" | "solo_renovaciones">("todos");

  // Estado oferta 2x1
  const [is2x1Active, setIs2x1Active] = useState(false);
  const [durationInput2x1, setDurationInput2x1] = useState("24");
  const [autoDesactivar2x1, setAutoDesactivar2x1] = useState(true);

  // Estado compartido de promociones
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isLoadingPromo, setIsLoadingPromo] = useState(true);
  const [isSavingPromo, setIsSavingPromo] = useState(false);

  // Cargar cupones
  const loadCupones = async () => {
    try {
      setLoadingCupones(true);
      const data = await apiService.listarCupones();
      setCupones(data);
    } catch (error) {
      console.error("Error al cargar cupones:", error);
      setCuponError("Error al cargar cupones");
    } finally {
      setLoadingCupones(false);
    }
  };

  // Nota: carga de noticias ahora se maneja en NoticiasManagementSection

  // Cargar configuraciones de promo
  const loadPromoConfigs = async () => {
    try {
      setIsLoadingPromo(true);
      const [planesConfig, revendedoresConfig, heroPlanes, heroRevendedores] = await Promise.all([
        apiService.obtenerPromoStatus().catch(() => null),
        apiService.obtenerPromoStatusRevendedores().catch(() => null),
        apiService.obtenerConfigHero().catch(() => null),
        apiService.obtenerConfigHeroRevendedores().catch(() => null),
      ]);

      // obtenerPromoStatus() ya devuelve promo_config directamente (desenvuelto)
      setPromoConfigPlanes(planesConfig || null);
      setPromoConfigRevendedores(revendedoresConfig || null);
      
      // Cargar estado 2x1 (planesConfig YA es el objeto promo_config)
      if (planesConfig) {
        setIs2x1Active(planesConfig.vpn_2x1_activa || false);
        setDurationInput2x1(planesConfig.vpn_2x1_duracion_horas?.toString() || "24");
        setAutoDesactivar2x1(planesConfig.vpn_2x1_auto_desactivar ?? true);
      } else {
        setIs2x1Active(false);
        setDurationInput2x1("24");
        setAutoDesactivar2x1(true);
      }
      
      // Determinar el scope basado en la config actual
      if (planesConfig?.solo_nuevos) {
        setPromoScopePlanes("solo_nuevos");
      } else if (planesConfig?.solo_renovaciones) {
        setPromoScopePlanes("solo_renovaciones");
      } else {
        setPromoScopePlanes("todos");
      }
      
      if (revendedoresConfig?.solo_nuevos) {
        setPromoScopeRevendedores("solo_nuevos");
      } else if (revendedoresConfig?.solo_renovaciones) {
        setPromoScopeRevendedores("solo_renovaciones");
      } else {
        setPromoScopeRevendedores("todos");
      }

      // Cargar la configuración del hero
      if (heroPlanes?.promocion) {
        setHeroPromoPlanes({
          habilitada: heroPlanes.promocion.habilitada,
          texto: heroPlanes.promocion.texto,
          textColor: heroPlanes.promocion.textColor,
          bgColor: heroPlanes.promocion.bgColor,
          borderColor: heroPlanes.promocion.borderColor,
          iconColor: heroPlanes.promocion.iconColor,
          shadowColor: heroPlanes.promocion.shadowColor,
        });
      }

      if (heroRevendedores?.promocion) {
        setHeroPromoRevendedores({
          habilitada: heroRevendedores.promocion.habilitada,
          texto: heroRevendedores.promocion.texto,
          textColor: heroRevendedores.promocion.textColor,
          bgColor: heroRevendedores.promocion.bgColor,
          borderColor: heroRevendedores.promocion.borderColor,
          iconColor: heroRevendedores.promocion.iconColor,
          shadowColor: heroRevendedores.promocion.shadowColor,
        });
      }
    } catch (error) {
      console.error("Error al cargar configuraciones de promo:", error);
      setPromoError("Error al cargar descuentos globales");
    } finally {
      setIsLoadingPromo(false);
    }
  };

  const sortSponsors = (items: Sponsor[]) =>
    [...items].sort((a, b) => {
      if (a.highlight === b.highlight) {
        if (a.order === b.order) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (a.order ?? 0) - (b.order ?? 0);
      }
      return a.highlight ? -1 : 1;
    });

  const loadSponsors = async () => {
    try {
      setSponsorsLoading(true);
      const data = await apiService.obtenerSponsors();
      setSponsors(sortSponsors(data));
      setSponsorsError(null);
    } catch (error) {
      console.error("Error al cargar sponsors:", error);
      setSponsorsError(error instanceof Error ? error.message : "Error al cargar sponsors");
    } finally {
      setSponsorsLoading(false);
    }
  };

  // Efectos de carga inicial
  useEffect(() => {
    loadCupones();
    loadPromoConfigs();
    loadSponsors();
  }, []);

  // Efectos de limpieza de mensajes
  useEffect(() => {
    if (cuponSuccess) {
      const timer = setTimeout(() => setCuponSuccess(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [cuponSuccess]);

  useEffect(() => {
    if (cuponError) {
      const timer = setTimeout(() => setCuponError(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [cuponError]);

  useEffect(() => {
    if (sponsorsSuccess) {
      const timer = setTimeout(() => setSponsorsSuccess(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [sponsorsSuccess]);

  useEffect(() => {
    if (sponsorsError) {
      const timer = setTimeout(() => setSponsorsError(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [sponsorsError]);

  useEffect(() => {
    if (noticiasSuccess) {
      const timer = setTimeout(() => setNoticiasSuccess(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [noticiasSuccess]);

  useEffect(() => {
    if (promoSuccess) {
      const timer = setTimeout(() => setPromoSuccess(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [promoSuccess]);

  useEffect(() => {
    if (promoError) {
      const timer = setTimeout(() => setPromoError(null), FEEDBACK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [promoError]);

  // Handlers para cupones
  const handleCrearCupon = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Convertir fecha_expiracion a ISO si existe
      let fechaExpiracionISO: string | undefined = undefined;
      if (cuponForm.fecha_expiracion) {
        const fecha = new Date(cuponForm.fecha_expiracion);
        if (!isNaN(fecha.getTime())) {
          fechaExpiracionISO = fecha.toISOString();
        }
      }

      // Parsear planes_aplicables
      let planesAplicables: number[] | undefined = undefined;
      if (cuponForm.planes_aplicables && (cuponForm.planes_aplicables as any[]).length > 0) {
        planesAplicables = (cuponForm.planes_aplicables as any[])
          .map(p => typeof p === 'string' ? parseInt(p) : p)
          .filter(p => !isNaN(p));
      }

      await apiService.crearCupon({
        codigo: cuponForm.codigo,
        tipo: cuponForm.tipo as "porcentaje" | "monto_fijo",
        valor: parseFloat(cuponForm.valor),
        limite_uso: cuponForm.limite_uso ? parseInt(cuponForm.limite_uso) : undefined,
        fecha_expiracion: fechaExpiracionISO,
        oculto: cuponForm.oculto,
        planes_aplicables: planesAplicables,
      });

      setCuponSuccess("Cupón creado exitosamente");
      setCuponForm(INITIAL_CUPON_FORM);
      loadCupones();
    } catch (error) {
      console.error("Error al crear cupón:", error);
      setCuponError(error instanceof Error ? error.message : "Error al crear cupón");
    }
  };

  const handleInputChange = (field: keyof CuponFormState, value: any) => {
    let finalValue = value;
    
    // Si es planes_aplicables, parsear string separado por comas
    if (field === 'planes_aplicables' && typeof value === 'string') {
      finalValue = value
        .split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => p !== '');
    }
    
    setCuponForm((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  const handleDesactivarCupon = async (id: number) => {
    try {
      await apiService.desactivarCupon(id);
      setCuponSuccess("Cupón desactivado");
      loadCupones();
    } catch (error) {
      console.error("Error al desactivar cupón:", error);
      setCuponError("Error al desactivar cupón");
    }
  };

  const handleDeleteCupon = async (id: number) => {
    try {
      setIsDeletingCupon(true);
      await apiService.eliminarCupon(id);
      setCuponSuccess("Cupón eliminado");
      setCuponToDelete(null);
      loadCupones();
    } catch (error) {
      console.error("Error al eliminar cupón:", error);
      setCuponError("Error al eliminar cupón");
    } finally {
      setIsDeletingCupon(false);
    }
  };

  const handleRefreshCupones = async () => {
    setIsRefreshingCupones(true);
    await loadCupones();
    setIsRefreshingCupones(false);
  };

  // Handlers para noticias
  // Handlers para noticias (legacy - no se usan con nuevo sistema)
  // const handleGuardarNoticias = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!noticiasConfig) return;
  //
  //   try {
  //     setIsSavingNoticias(true);
  //     await apiService.guardarNoticiasConfig(noticiasConfig);
  //     setNoticiasSuccess("Configuración de avisos guardada");
  //   } catch (error) {
  //     console.error("Error al guardar noticias:", error);
  //     setNoticiasError("Error al guardar configuración");
  //   } finally {
  //     setIsSavingNoticias(false);
  //   }
  // };
  //
  // const handleNoticiasToggle = (key: string) => {
  //   setNoticiasConfig((prev) => {
  //     if (!prev) return prev;
  //     if (key === "aviso.habilitado") {
  //       return {
  //         ...prev,
  //         aviso: { ...prev.aviso, habilitado: !prev.aviso?.habilitado },
  //       };
  //     }
  //     return prev;
  //   });
  // };
  //
  // const handleNoticiasAvisoFieldChange = (field: string, value: any) => {
  //   setNoticiasConfig((prev) => {
  //     if (!prev) return prev;
  //     return { ...prev, aviso: { ...prev.aviso, [field]: value } };
  //   });
  // };

  // Handlers para promo
  const handleActivatePromo = async (tipo: "planes" | "revendedores") => {
    try {
      setIsSavingPromo(true);
      const duracion = tipo === "planes" ? parseInt(durationInputPlanes) : parseInt(durationInputRevendedores);
      const descuento = tipo === "planes" ? parseInt(discountPercentagePlanes) : parseInt(discountPercentageRevendedores);
      const scope = tipo === "planes" ? promoScopePlanes : promoScopeRevendedores;
      
      const soloNuevos = scope === "solo_nuevos";
      const soloRenovaciones = scope === "solo_renovaciones";

      await apiService.activarPromo(duracion || 24, tipo, descuento, soloNuevos, soloRenovaciones);

      const scopeLabel = scope === "todos" ? "todos" : scope === "solo_nuevos" ? "solo nuevas cuentas" : "solo renovaciones";
      setPromoSuccess(`Descuento global de ${descuento}% en ${tipo} activado (${scopeLabel})`);
      await loadPromoConfigs();
    } catch (error) {
      console.error("Error al activar promoción:", error);
      setPromoError("Error al activar descuento");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleDeactivatePromo = async (tipo: "planes" | "revendedores") => {
    try {
      setIsSavingPromo(true);
      await apiService.desactivarPromo(tipo);
      setPromoSuccess(`Descuento global de ${tipo} desactivado`);
      await loadPromoConfigs();
    } catch (error) {
      console.error("Error al desactivar promoción:", error);
      setPromoError("Error al desactivar descuento");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleGuardarTextoHero = async (tipo: "planes" | "revendedores") => {
    try {
      setIsSavingPromo(true);
      const heroPromo = tipo === "planes" ? heroPromoPlanes : heroPromoRevendedores;

      if (heroPromo) {
        await apiService.guardarConfigHero(heroPromo, tipo);
      }

      setPromoSuccess("Texto de promoción guardado");
      // Notificar a otras páginas que se actualizó la configuración
      // pero no recargar en AdminTools para mantener el estado de edición
      window.dispatchEvent(new Event("hero-config-saved"));
    } catch (error) {
      console.error("Error al guardar texto de promoción:", error);
      setPromoError("Error al guardar texto");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleToggle2x1 = async () => {
    try {
      setIsSavingPromo(true);
      setPromoSuccess(null);
      setPromoError(null);

      if (is2x1Active) {
        await apiService.desactivar2x1();
        setIs2x1Active(false);
        setPromoSuccess("Oferta 2x1 desactivada");
      } else {
        await apiService.activar2x1(parseInt(durationInput2x1), autoDesactivar2x1);
        setIs2x1Active(true);
        setPromoSuccess("Oferta 2x1 activada correccamente");
      }
      
      // Recargar config para sincronizar
      await loadPromoConfigs();
    } catch (error) {
      console.error("Error al gestionar oferta 2x1:", error);
      setPromoError("Error al cambiar estado de oferta 2x1");
    } finally {
      setIsSavingPromo(false);
    }
  };

  // Handlers para sponsors
  const handleCreateSponsor = async (payload: CrearSponsorPayload) => {
    try {
      setSponsorsError(null);
      const nuevo = await apiService.crearSponsor(payload);
      setSponsors((prev) => sortSponsors([...prev, nuevo]));
      setSponsorsSuccess("Sponsor agregado exitosamente");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear sponsor";
      setSponsorsError(message);
      throw error;
    }
  };

  const handleDeleteSponsor = async (sponsorId: number) => {
    try {
      setSponsorsError(null);
      await apiService.eliminarSponsor(sponsorId);
      setSponsors((prev) => prev.filter((s) => s.id !== sponsorId));
      setSponsorsSuccess("Sponsor eliminado");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar sponsor";
      setSponsorsError(message);
      throw error;
    }
  };

  const handleUpdateSponsor = async (
    sponsorId: number,
    payload: ActualizarSponsorPayload,
  ) => {
    try {
      setSponsorsError(null);
      const actualizado = await apiService.actualizarSponsor(sponsorId, payload);
      setSponsors((prev) =>
        sortSponsors(prev.map((s) => (s.id === sponsorId ? actualizado : s)))
      );
      setSponsorsSuccess("Sponsor actualizado");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar sponsor";
      setSponsorsError(message);
      throw error;
    }
  };

  // Formateador de números
  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  }, []);

  // Renderizar contenido de la sección activa
  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection
            cupones={cupones}
            loadingCupones={loadingCupones}
            isRefreshingCupones={isRefreshingCupones}
            numberFormatter={numberFormatter}
            onRefreshCupones={handleRefreshCupones}
          />
        );

      case "planes":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PlanesSection tipo="normales" />
            <PlanesSection tipo="revendedores" />
          </div>
        );

      case "sponsors":
        return (
          <SponsorsSection
            sponsors={sponsors}
            loading={sponsorsLoading}
            onCreate={handleCreateSponsor}
            onDelete={handleDeleteSponsor}
            onUpdate={handleUpdateSponsor}
            success={sponsorsSuccess}
            error={sponsorsError}
          />
        );

      case "cupones":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CuponesForm
              cuponForm={cuponForm}
              isCreatingCupon={false}
              cuponSuccess={cuponSuccess}
              cuponError={cuponError}
              onInputChange={handleInputChange}
              onSubmit={handleCrearCupon}
            />
            <CuponesList
              cupones={cupones}
              loading={loadingCupones}
              onDesactivar={handleDesactivarCupon}
              onDelete={(cupon: Cupon) => setCuponToDelete(cupon)}
            />
          </div>
        );

      case "noticias":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <NoticiasManagementSection
              onSuccess={(msg) => {
                setNoticiasSuccess(msg);
                setTimeout(() => setNoticiasSuccess(null), FEEDBACK_TIMEOUT);
              }}
              onError={(_err) => {
                // El error se muestra en el componente
              }}
            />
            {noticiasSuccess && (
              <div className="mt-6 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] text-emerald-400 text-sm font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {noticiasSuccess}
              </div>
            )}
          </div>
        );

      case "descuentos":
        return (
          <DescuentosGlobalesSection
            promoConfigPlanes={promoConfigPlanes}
            promoConfigRevendedores={promoConfigRevendedores}
            heroPromoPlanes={heroPromoPlanes}
            heroPromoRevendedores={heroPromoRevendedores}
            promoSuccess={promoSuccess}
            promoError={promoError}
            isLoadingPromo={isLoadingPromo}
            isSavingPromo={isSavingPromo}
            durationInputPlanes={durationInputPlanes}
            durationInputRevendedores={durationInputRevendedores}
            discountPercentagePlanes={discountPercentagePlanes}
            discountPercentageRevendedores={discountPercentageRevendedores}
            onSetDurationInputPlanes={setDurationInputPlanes}
            onSetDurationInputRevendedores={setDurationInputRevendedores}
            onSetDiscountPercentagePlanes={setDiscountPercentagePlanes}
            onSetDiscountPercentageRevendedores={setDiscountPercentageRevendedores}
            promoScopePlanes={promoScopePlanes}
            promoScopeRevendedores={promoScopeRevendedores}
            onSetPromoScopePlanes={setPromoScopePlanes}
            onSetPromoScopeRevendedores={setPromoScopeRevendedores}
            onActivatePromo={handleActivatePromo}
            onDeactivatePromo={handleDeactivatePromo}
            onSetHeroPromoPlanes={setHeroPromoPlanes}
            onSetHeroPromoRevendedores={setHeroPromoRevendedores}
            onGuardarTextoHero={handleGuardarTextoHero}
            is2x1Active={is2x1Active}
            onToggle2x1={handleToggle2x1}
            durationInput2x1={durationInput2x1}
            onSetDurationInput2x1={setDurationInput2x1}
            autoDesactivar2x1={autoDesactivar2x1}
            onSetAutoDesactivar2x1={setAutoDesactivar2x1}
          />
        );

      case "referidos":
        return <ReferidosSection />;

      case "tickets":
        return <TicketsSoporteSection />;

      case "tutorials":
        return <AdminHelpCenter />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30">

      {/* ── Ambient background (fixed, behind everything) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/[0.03] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/[0.05] blur-[140px] rounded-full animate-pulse" />
      </div>

      {/* ── Fixed sidebar — lives outside document flow ── */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* ── Main content: on desktop offset by sidebar width (w-72 = 18rem) ── */}
      <div className="relative z-10 lg:ml-72 pt-14 lg:pt-0 min-h-screen flex flex-col">
        
        {/* Content scroll wrapper */}
        <main className="flex-1 px-6 sm:px-10 py-10">

          {/* Section header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-1 rounded-full bg-orange-500" />
              <div className="w-3 h-1 rounded-full bg-zinc-800" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-1">
              AdminTools / {activeSection}
            </p>
          </div>

          {/* Active section content */}
          <div className="pb-20">
            {renderSectionContent()}
          </div>

        </main>
      </div>

      {/* ── Delete Coupon Modal ── */}
      <DeleteCuponModal
        cuponToDelete={cuponToDelete}
        isDeletingCupon={isDeletingCupon}
        onConfirmDelete={() => {
          if (cuponToDelete) {
            handleDeleteCupon(cuponToDelete.id);
          }
        }}
        onCancel={() => setCuponToDelete(null)}
      />
    </div>
  );
}

export type { AdminToolsPageProps };
