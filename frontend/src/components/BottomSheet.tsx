import { ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-neutral-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        } max-h-[80vh] rounded-t-lg overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">{children}</div>
      </div>
    </>
  );
}
