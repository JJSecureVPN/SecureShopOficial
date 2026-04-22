import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api.service";
import { mercadoPagoService } from "../../../services/mercadopago.service";
import { CheckoutRenovacionView } from "./CheckoutRenovacionView";
import { SuccessModal } from "../components/SuccessModal";
import type { CompraResponse } from "../../../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutRenovacionContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tipo = (searchParams.get("tipo") as "cliente" | "revendedor") || "cliente";
  const dias = parseInt(searchParams.get("dias") || "0", 10);
  const precio = parseInt(searchParams.get("precio") || "0", 10);
  const busqueda = searchParams.get("busqueda") || "";
  const username = searchParams.get("username") || busqueda;
  const planNombre = searchParams.get("planNombre") || "";
  const connectionActualParam = parseInt(searchParams.get("connectionActual") || "0", 10);
  const nuevoConnectionLimitParam = searchParams.get("nuevoConnectionLimit");
  const connectionDestino = nuevoConnectionLimitParam
    ? parseInt(nuevoConnectionLimitParam, 10)
    : connectionActualParam;
  const tipoRenovacionParam = searchParams.get("tipoRenovacion");
  const tipoRenovacion: "validity" | "credit" =
    tipoRenovacionParam === "credit" || tipoRenovacionParam === "validity"
      ? tipoRenovacionParam
      : "validity";
  const cantidadSeleccionada =
    parseInt(searchParams.get("cantidadSeleccionada") || searchParams.get("cantidad") || "0", 10) ||
    undefined;
  const precioOriginalParam =
    searchParams.get("precioOriginal") ||
    searchParams.get("precioBase") ||
    searchParams.get("precioSinDescuento");
  const descuentoParam = searchParams.get("descuento") || searchParams.get("descuentoAplicado");
  const codigoCupon = searchParams.get("codigoCupon") || undefined;
  const cuponIdParam = searchParams.get("cuponId");
  const cuponId = cuponIdParam ? parseInt(cuponIdParam, 10) : undefined;
  const planIdParam = searchParams.get("planId");
  const planId = planIdParam ? parseInt(planIdParam, 10) : undefined;
  
  const codigoReferido = searchParams.get("codigoReferido");
  const saldoUsado = parseInt(searchParams.get("saldoUsado") || "0", 10);
  const descuentoReferido = parseInt(searchParams.get("descuentoReferido") || "0", 10);
  
  const operacion = (searchParams.get("operacion") || "renovacion") as "renovacion" | "expansion";
  const currentMaxUsers = parseInt(searchParams.get("maxUsers") || "0", 10);
  const precioOriginal = parseInt(precioOriginalParam || "0", 10);
  const precioBase = precioOriginal > 0 ? precioOriginal : precio;
  const descuentoInicial = parseInt(descuentoParam || "0", 10);
  const descuentoFinal = descuentoInicial > 0 ? descuentoInicial : Math.max(0, precioBase - precio);
  const hayDescuento = descuentoFinal > 0;

  // Ahora podemos definir pagoConSaldoCompleto con hayDescuento definido
  const pagoConSaldoCompleto = precio === 0 && (saldoUsado > 0 || descuentoReferido > 0 || hayDescuento);

  const [nombre, setNombre] = useState(searchParams.get("nombre") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [ultimoLinkPago, setUltimoLinkPago] = useState<string | null>(null);
  const [renovacionId, setRenovacionId] = useState<number | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [renovacionExitosa, setRenovacionExitosa] = useState<CompraResponse | null>(null);

  const connectionActual = connectionActualParam || connectionDestino || 1;
  const hayCambioDispositivos =
    tipo === "cliente" && connectionDestino > 0 && connectionDestino !== connectionActual;
  const datosInvalidos = !busqueda || precio < 0 || (operacion !== "expansion" && dias <= 0);

  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;

    const prev = {
      position: (headerEl as HTMLElement).style.position || "",
      top: (headerEl as HTMLElement).style.top || "",
      left: (headerEl as HTMLElement).style.left || "",
      right: (headerEl as HTMLElement).style.right || "",
      zIndex: (headerEl as HTMLElement).style.zIndex || "",
    };

    (headerEl as HTMLElement).style.position = "fixed";
    (headerEl as HTMLElement).style.top = "0";
    (headerEl as HTMLElement).style.left = "0";
    (headerEl as HTMLElement).style.right = "0";
    (headerEl as HTMLElement).style.zIndex = "10001";

    return () => {
      (headerEl as HTMLElement).style.position = prev.position;
      (headerEl as HTMLElement).style.top = prev.top;
      (headerEl as HTMLElement).style.left = prev.left;
      (headerEl as HTMLElement).style.right = prev.right;
      (headerEl as HTMLElement).style.zIndex = prev.zIndex;
    };
  }, []);

  useEffect(() => {
    if (datosInvalidos) {
      setError("No pudimos cargar los datos de la renovación. Vuelve a intentarlo.");
    }
  }, [datosInvalidos]);

  const precioPorDia = useMemo(() => {
    if (dias <= 0) return 0;
    return Math.round(precio / dias);
  }, [precio, dias]);

  const precioPorDiaBase = useMemo(() => {
    if (dias <= 0) return 0;
    return Math.round(precioBase / dias);
  }, [precioBase, dias]);

  const walletEmail = user?.email || email;

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const tituloResumen = planNombre || username || "Renovación";
  const usuariosAAgregar =
    operacion === "expansion" && cantidadSeleccionada && currentMaxUsers
      ? cantidadSeleccionada - currentMaxUsers
      : 0;

  const subtituloResumen =
    tipo === "revendedor"
      ? operacion === "expansion" && usuariosAAgregar > 0
        ? `Expansión de +${usuariosAAgregar} cupos (${currentMaxUsers} → ${cantidadSeleccionada})`
        : cantidadSeleccionada
          ? `${cantidadSeleccionada} ${tipoRenovacion === "credit" ? "créditos" : "cupos"}`
          : `Renovación ${tipoRenovacion}`
      : hayCambioDispositivos
        ? `Upgrade a ${connectionDestino} dispositivos`
        : `${connectionActual} dispositivo${connectionActual > 1 ? "s" : ""}`;

  const createPreference = useCallback(async () => {
    setError("");
    const nombreTrim = nombre.trim();
    const emailTrim = walletEmail.trim();

    if (!nombreTrim) {
      const message = "Ingresa tu nombre";
      setError(message);
      throw new Error(message);
    }

    if (!emailTrim || !emailRegex.test(emailTrim)) {
      const message = "Ingresa un email válido";
      setError(message);
      throw new Error(message);
    }

    const basePayload = {
      busqueda,
      dias,
      clienteNombre: nombreTrim,
      clienteEmail: emailTrim,
    };

    try {
      const response =
        tipo === "revendedor"
          ? await apiService.procesarRenovacionRevendedor({
              ...basePayload,
              tipoRenovacion,
              cantidadSeleccionada,
              precio,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
              operacion,
            })
          : await apiService.procesarRenovacionCliente({
              ...basePayload,
              saldoEmail: walletEmail,
              precio,
              nuevoConnectionLimit: hayCambioDispositivos ? connectionDestino : undefined,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
              codigoReferido: codigoReferido || undefined,
              saldoUsado: saldoUsado > 0 ? saldoUsado : undefined,
            });

      if (!response?.linkPago && !(response as any).procesadoAlInstante) {
        throw new Error("No se recibió el enlace de pago");
      }

      setUltimoLinkPago(response.linkPago);
      if (response.renovacion?.id) {
        setRenovacionId(response.renovacion.id);
      }

      if ((response as any).procesadoAlInstante) {
         return { 
           prefId: "instante", 
           linkPago: "", 
           procesadoAlInstante: true 
         };
      }

      const prefId = new URL(response.linkPago).searchParams.get("pref_id");
      if (!prefId) {
        throw new Error("No se pudo generar el identificador de pago");
      }

      return { 
        prefId, 
        linkPago: response.linkPago, 
        procesadoAlInstante: (response as any).procesadoAlInstante 
      };
    } catch (err: any) {
      const mensaje = err?.mensaje || err?.message || "Error al generar el enlace de pago";
      setError(mensaje);
      throw err;
    }
  }, [
    busqueda,
    cantidadSeleccionada,
    codigoCupon,
    connectionDestino,
    cuponId,
    dias,
    descuentoFinal,
    email,
    hayCambioDispositivos,
    hayDescuento,
    nombre,
    planId,
    precio,
    precioBase,
    tipo,
    tipoRenovacion,
    codigoReferido,
    saldoUsado,
    operacion,
  ]);

  const getPreferenceId = useCallback(async () => {
    const { prefId } = await createPreference();
    return prefId;
  }, [createPreference]);

  const handlePayWithSaldo = async () => {
    setProcessingPayment(true);
    setError("");

    try {
      const nombreTrim = nombre.trim();
      const emailTrim = email.trim();

      if (!nombreTrim) {
        setError("Ingresa tu nombre");
        setProcessingPayment(false);
        return;
      }

      if (!emailTrim || !emailRegex.test(emailTrim)) {
        setError("Ingresa un email válido");
        setProcessingPayment(false);
        return;
      }

      const response = await apiService.procesarRenovacionCliente({
        busqueda,
        dias,
        precio,
        clienteNombre: nombreTrim,
        clienteEmail: emailTrim,
        nuevoConnectionLimit: hayCambioDispositivos ? connectionDestino : undefined,
        precioOriginal: precioBase > 0 ? precioBase : undefined,
        codigoCupon,
        cuponId,
        descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
        planId,
        codigoReferido: codigoReferido || undefined,
        saldoUsado: saldoUsado > 0 ? saldoUsado : undefined,
      });

      if ((response as any).procesadoAlInstante) {
        // Simular respuesta de CompraResponse para el SuccessModal
        const successData: CompraResponse = {
          pago: (response as any).renovacion,
          linkPago: "",
          preferenceId: "",
          pagoConSaldoCompleto: true,
          saldoUsado: saldoUsado,
          codigoReferidoUsado: codigoReferido || undefined,
          cuentaVPN: (response as any).renovacion?.datos_nuevos ? JSON.parse((response as any).renovacion.datos_nuevos) : {
            username: (response as any).renovacion?.servex_username || busqueda,
            password: "Tu contraseña actual",
            expiracion: "Actualizada",
            categoria: planNombre || "VPN"
          }
        };
        
        setRenovacionExitosa(successData);
        setShowSuccessModal(true);
      } else if (response.linkPago) {
        window.location.href = response.linkPago;
      }
    } catch (err: any) {
      setError(err?.mensaje || err?.message || "Error al procesar la renovación");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleFallbackPayment = async () => {
    if (pagoConSaldoCompleto) {
      await handlePayWithSaldo();
      return;
    }

    setProcessingPayment(true);
    try {
      const { linkPago, procesadoAlInstante } = await createPreference();
      
      if (procesadoAlInstante) {
        // Se maneja vía Modal si es por saldo/cupón
        setProcessingPayment(false);
        return;
      }
      
      window.location.href = linkPago;
    } catch {
      // El error ya se maneja en createPreference
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (datosInvalidos || pagoConSaldoCompleto) return;

    let mounted = true;

    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        await mercadoPagoService.createButton("wallet_container_renovacion", getPreferenceId);
        try {
          await mercadoPagoService.createButton("wallet_container_renovacion_mobile", getPreferenceId);
        } catch {
          // ignore if mobile container is missing
        }
        if (mounted) {
          setMpFallbackVisible(false);
        }
      } catch {
        if (mounted) {
          setMpFallbackVisible(true);
        }
      }
    };

    void initMercadoPago();

    return () => {
      mounted = false;
    };
  }, [datosInvalidos, getPreferenceId, pagoConSaldoCompleto]);

  if (datosInvalidos) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-100">No pudimos cargar tu renovación</h1>
          <p className="text-sm text-zinc-400 max-w-sm">
            Vuelve a la página de planes e inicia nuevamente el proceso de renovación.
          </p>
        </div>
        <button
          onClick={() => navigate("/planes")}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <>
      <CheckoutRenovacionView
        nombre={nombre}
        email={email}
        error={error}
        processingPayment={processingPayment}
        mpFallbackVisible={mpFallbackVisible}
        ultimoLinkPago={ultimoLinkPago}
        renovacionId={renovacionId}
        mobileSummaryOpen={mobileSummaryOpen}
        tipo={tipo}
        dias={dias}
        precio={precio}
        username={username}
        planNombre={planNombre}
        connectionActual={connectionActual}
        connectionDestino={connectionDestino}
        tipoRenovacion={tipoRenovacion}
        cantidadSeleccionada={cantidadSeleccionada}
        precioBase={precioBase}
        descuentoFinal={descuentoFinal}
        codigoCupon={codigoCupon}
        hayCambioDispositivos={hayCambioDispositivos}
        hayDescuento={hayDescuento}
        precioPorDia={precioPorDia}
        precioPorDiaBase={precioPorDiaBase}
        tituloResumen={tituloResumen}
        subtituloResumen={subtituloResumen}
        onNombreChange={(value) => {
          setNombre(value);
          setError("");
        }}
        onEmailChange={(value) => {
          setEmail(value);
          setError("");
        }}
        onToggleMobileSummary={() => setMobileSummaryOpen((value) => !value)}
        onFallbackPayment={handleFallbackPayment}
        onBack={() => navigate(-1)}
        operacion={operacion}
        currentMaxUsers={currentMaxUsers}
        usuariosAAgregar={usuariosAAgregar}
        saldoUsado={saldoUsado}
        codigoReferido={codigoReferido}
        descuentoReferido={descuentoReferido}
        pagoConSaldoCompleto={pagoConSaldoCompleto}
        userLoggedIn={!!user?.email}
        onPayWithSaldo={handlePayWithSaldo}
      />

      {showSuccessModal && renovacionExitosa?.cuentaVPN && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/perfil");
          }}
          cuentaVPN={renovacionExitosa.cuentaVPN}
          saldoUsado={renovacionExitosa.saldoUsado || 0}
          codigoReferidoUsado={renovacionExitosa.codigoReferidoUsado}
        />
      )}
    </>
  );
};

export default CheckoutRenovacionContainer;