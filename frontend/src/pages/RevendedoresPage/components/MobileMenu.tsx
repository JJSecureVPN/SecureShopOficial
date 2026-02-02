import { ChevronDown } from "lucide-react";
import BottomSheet from "../../../components/BottomSheet";
import { MobileSection } from "../types";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  sections: MobileSection[];
  activeSection: string;
  onSelectGroup: (section: MobileSection) => void;
  onSelectPlan: (section: MobileSection) => void;
  onSelectSection: (section: MobileSection) => void;
};

export function MobileMenu({
  isOpen,
  onClose,
  sections,
  activeSection,
  onSelectGroup,
  onSelectPlan,
  onSelectSection,
}: MobileMenuProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Navegación"
      subtitle="Secciones"
    >
      <div className="space-y-1">
        {sections.map((section) => {
          if (section.isGroup) {
            return (
              <button
                key={section.id}
                onClick={() => onSelectGroup(section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-orange-500/20 text-orange-300"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {section.icon}
                <div className="flex-1 text-left">
                  <div>{section.label}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    section.isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            );
          }

          if (section.isPlan && section.planId) {
            return (
              <button
                key={section.id}
                onClick={() => onSelectPlan(section)}
                className={`w-full flex items-center gap-3 px-4 py-3 ml-6 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-orange-500/20 text-orange-300"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {section.icon}
                <div className="text-left">
                  <div>{section.label}</div>
                </div>
              </button>
            );
          }

          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-orange-500/20 text-orange-300"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {section.icon}
              <div className="text-left">
                <div>{section.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
