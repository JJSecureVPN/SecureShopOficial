import { type ReactNode } from "react";

interface DesktopCheckoutSummaryProps {
  children: ReactNode;
}

/**
 * Full-height right column for the checkout summary on desktop.
 * Solid black background to match the PlanesPage summary style.
 */
export const DesktopCheckoutSummary = ({ children }: DesktopCheckoutSummaryProps) => {
  return (
    <div className="hidden lg:flex fixed top-0 right-0 bottom-0 w-[38%] xl:w-[35%] bg-[#0d0d0f] border-l border-white/[0.05] items-center justify-center z-50">
      <div className="w-full max-h-full overflow-y-auto px-8 xl:px-12 py-10 space-y-6">
        {children}
      </div>
    </div>
  );
};