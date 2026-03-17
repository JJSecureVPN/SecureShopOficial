import { type ReactNode } from "react";

interface DesktopCheckoutSummaryProps {
  children: ReactNode;
}

export const DesktopCheckoutSummary = ({ children }: DesktopCheckoutSummaryProps) => {
  return (
    <div className="hidden lg:block lg:w-[42%] xl:w-[38%] border-l border-white/[0.05]">
      <div className="sticky top-[80px]">
        <div className="w-full space-y-4 py-8 pl-8 xl:pl-12 pr-4">
          {children}
        </div>
      </div>
    </div>
  );
};