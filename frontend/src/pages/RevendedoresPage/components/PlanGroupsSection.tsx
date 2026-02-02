import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { BodyText, SectionTitle } from "../../../components/Typography";
import SystemCard from "./SystemCard";
import PlanCard from "./PlanCard";

interface PlanGroupsSectionProps {
  groups: PlanGroup[];
  onConfirmarCompra: (plan: PlanRevendedor) => void;
  initialGroupId?: string;
}

type ConfirmingPlan = { planId: number; groupId: string } | null;

export default function PlanGroupsSection({
  groups,
  onConfirmarCompra,
  initialGroupId,
}: PlanGroupsSectionProps) {

  const [confirmingPlan, setConfirmingPlan] = useState<ConfirmingPlan>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(initialGroupId ?? null);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroup(initialGroupId);
    }
  }, [initialGroupId]);

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
    setSelectedGroup(null);
    setConfirmingPlan(null);
    navigate('/revendedores');
  };

  const selectedGroupData = selectedGroup ? groups.find(g => g.id === selectedGroup) : null;

  return (
    <div className="bg-refine-dark py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header con botón de volver si hay grupo seleccionado */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a selección de sistemas
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!selectedGroup ? (
            // Vista de selección de sistemas
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-12">
                <SectionTitle className="mb-4 text-white">
                  Elige tu sistema de reventa
                </SectionTitle>
                <BodyText className="text-zinc-400 max-w-2xl mx-auto">
                  Dos sistemas diferentes diseñados para adaptarse a tus necesidades de reventa.
                  Elige el que mejor se ajuste a tu estrategia de negocio.
                </BodyText>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {groups.map((group) => (
                  <SystemCard
                    key={group.id}
                    group={group}
                    onSelect={handleSelectGroup}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            // Vista de planes del grupo seleccionado
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8 sm:mb-10">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 ${selectedGroupData?.accent} ${selectedGroupData?.accentText} text-xs font-semibold`}>
                  {selectedGroupData?.icon}
                  {selectedGroupData?.title}
                </div>

                <SectionTitle className="mb-3 text-white">
                  Planes Disponibles
                </SectionTitle>
                <BodyText className="text-sm sm:text-base max-w-3xl mx-auto text-zinc-400">
                  {selectedGroupData?.shortDescription}
                </BodyText>

                {selectedGroupData?.recommended && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-400">
                      <Sparkles className="h-4 w-4" />
                      Más elegido por revendedores
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {selectedGroupData?.items.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    group={selectedGroupData}
                    isConfirming={
                      confirmingPlan?.planId === plan.id &&
                      confirmingPlan?.groupId === selectedGroupData.id
                    }
                    onToggleConfirm={() => handleToggleConfirm(plan.id, selectedGroupData.id)}
                    onConfirmarCompra={handleConfirm}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>





      </div>
    </div>
  );
}