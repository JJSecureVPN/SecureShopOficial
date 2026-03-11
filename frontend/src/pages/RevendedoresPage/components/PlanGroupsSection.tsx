import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Check,
  Zap,
  RefreshCw,
  Users,
  Clock,
  DollarSign,
  Maximize,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import PlanCard from "./PlanCard";

const getFeatureIcon = (iconName: string) => {
  switch (iconName) {
    case "zap":
      return <Zap className="w-4 h-4" />;
    case "refresh-cw":
      return <RefreshCw className="w-4 h-4" />;
    case "users":
      return <Users className="w-4 h-4" />;
    case "clock":
      return <Clock className="w-4 h-4" />;
    case "dollar-sign":
      return <DollarSign className="w-4 h-4" />;
    case "maximize":
      return <Maximize className="w-4 h-4" />;
    default:
      return <Check className="w-4 h-4" />;
  }
};

interface PlanGroupsSectionProps {
  groups: PlanGroup[];
  onConfirmarCompra: (plan: PlanRevendedor) => void;
  initialGroupId?: string;
}

type ConfirmingPlan = { planId: number; groupId: string } | null;

// Minimal stagger for list items
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function PlanGroupsSection({
  groups,
  onConfirmarCompra,
  initialGroupId,
}: PlanGroupsSectionProps) {
  const [confirmingPlan, setConfirmingPlan] = useState<ConfirmingPlan>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(initialGroupId ?? null);
  const navigate = useNavigate();

  const hasOnlyOneGroup = groups.length === 1;
  const defaultGroupId = hasOnlyOneGroup ? groups[0].id : null;

  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroup(initialGroupId);
    } else if (hasOnlyOneGroup && !selectedGroup) {
      setSelectedGroup(defaultGroupId);
    }
  }, [initialGroupId, hasOnlyOneGroup, defaultGroupId, selectedGroup]);

  const handleToggleConfirm = (planId: number, groupId: string) => {
    setConfirmingPlan((current) =>
      current?.planId === planId && current?.groupId === groupId
        ? null
        : { planId, groupId }
    );
  };

  const handleConfirm = (plan: PlanRevendedor) => {
    onConfirmarCompra(plan);
    setConfirmingPlan(null);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    navigate(`/revendedores/${groupId}`);
  };

  const handleBackToSelection = () => {
    if (hasOnlyOneGroup) return;
    setSelectedGroup(null);
    setConfirmingPlan(null);
    navigate("/revendedores");
  };

  const selectedGroupData = selectedGroup
    ? groups.find((g) => g.id === selectedGroup)
    : null;

  const isCreditsGroup = selectedGroup === "creditos";
  const selectedGroupId = selectedGroupData?.id ?? "";
  const selectedGroupFeatures = selectedGroupData?.keyFeatures ?? [];

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-6xl">

        <AnimatePresence mode="wait">

          {/* ── Vista selección de sistema ── */}
          {!selectedGroup && !hasOnlyOneGroup ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="mb-10 sm:mb-14">
                <p className="text-[11px] font-medium tracking-widest uppercase text-zinc-600 mb-3">
                  Reventa
                </p>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-3">
                  Elige tu sistema
                </h1>
                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                  Dos modelos diseñados para distintas estrategias de negocio.
                </p>
              </div>

              {/* System cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {groups.map((group) => {
                  return (
                    <motion.button
                      key={group.id}
                      variants={itemVariants}
                      onClick={() => handleSelectGroup(group.id)}
                      id={`plan-${group.id}`}
                      className="w-full text-left rounded-2xl border bg-zinc-950/50 p-5 sm:p-6
                        transition-colors duration-150 group border-white/[0.10] hover:border-white/[0.16]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Dot + label */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-orange-400" />
                            <span className="text-xs font-semibold tracking-wide uppercase text-orange-300">
                              {group.id === "creditos" ? "Créditos" : "Cupos"}
                            </span>
                          </div>
                          <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                            {group.title}
                          </h2>
                          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                            {group.mainDescription}
                          </p>

                          {/* Plan count */}
                          <p className="text-xs text-zinc-600 mt-3">
                            {group.items.length} planes disponibles
                          </p>

                          {/* Highlights */}
                          {group.keyFeatures?.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {group.keyFeatures.slice(0, 3).map((feature, idx) => (
                                <div key={`${group.id}-k-${idx}`} className="flex items-start gap-2.5">
                                  <div className="mt-0.5 p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/15 text-orange-300">
                                    {getFeatureIcon(feature.icon)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-200 leading-snug">
                                      {feature.title}
                                    </p>
                                    <p className="text-xs text-zinc-500 leading-snug line-clamp-2">
                                      {feature.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 shrink-0 mt-1 text-orange-300 group-hover:translate-x-0.5" />
                      </div>

                      {/* Recommended badge */}
                      {group.recommended && (
                        <div className="mt-4 pt-4 border-t border-white/[0.05]">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                            <Sparkles className="w-3 h-3" />
                            Más elegido por revendedores
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>

          ) : (

            /* ── Vista planes del grupo ── */
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div id={selectedGroupData ? `plan-${selectedGroupData.id}` : undefined} />

              {/* Back button */}
              {!hasOnlyOneGroup && (
                <button
                  onClick={handleBackToSelection}
                  className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-150 mb-8 sm:mb-10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              )}

              {/* Group header */}
              <div className="mb-8 sm:mb-10">
                <p className="text-[11px] font-medium tracking-widest uppercase text-zinc-600 mb-3">
                  {isCreditsGroup ? "Créditos" : "Cupos mensuales"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-tight mb-3">
                  {selectedGroupData?.title}
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                  {selectedGroupData?.mainDescription}
                </p>

                {selectedGroupData?.recommended && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    Más elegido por revendedores
                  </div>
                )}

                {selectedGroupFeatures.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {selectedGroupFeatures.slice(0, 4).map((feature, idx) => (
                      <div
                        key={`${selectedGroupId}-feature-${idx}`}
                        className="rounded-2xl bg-zinc-950/40 border border-white/[0.08] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/15 text-orange-300 shrink-0">
                            {getFeatureIcon(feature.icon)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white leading-snug">
                              {feature.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 leading-snug">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Plan grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {selectedGroupData?.items.map((plan) => (
                  <motion.div key={plan.id} variants={itemVariants}>
                    <PlanCard
                      plan={plan}
                      group={selectedGroupData}
                      isConfirming={
                        confirmingPlan?.planId === plan.id &&
                        confirmingPlan?.groupId === selectedGroupData.id
                      }
                      onToggleConfirm={() => handleToggleConfirm(plan.id, selectedGroupData.id)}
                      onConfirmarCompra={handleConfirm}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

          )}
        </AnimatePresence>

      </div>
    </section>
  );
}