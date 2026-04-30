import { ReactNode, useEffect, useRef } from "react";

/**
 * Two-column layout with a sticky sidebar.
 *
 * Handles the CSS quirks that break `position: sticky`:
 * - Uses `align-items: start` so the aside doesn't stretch to the row height.
 * - Keeps glow effects inside an overflow-hidden wrapper.
 * - Avoids Framer-Motion transforms on the grid / aside (transforms create a
 *   new containing-block that limits the sticky scroll range).
 *
 * On mobile the aside renders below the main content.
 */
interface StickyLayoutProps {
  /** Content for the left (scrollable) column */
  children: ReactNode;
  /** Content rendered inside the sticky sidebar */
  aside: ReactNode;
  /** Optional className for the outer wrapper */
  className?: string;
}

export default function StickyLayout({
  children,
  aside,
  className = "",
}: StickyLayoutProps) {
  const asideRef = useRef<HTMLElement>(null);

  // Guardrail: if a parent ever sets overflow:hidden we log a warning in dev.
  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV !== "production" && asideRef.current) {
      let el: HTMLElement | null = asideRef.current.parentElement;
      while (el && el !== document.documentElement) {
        const style = getComputedStyle(el);
        const hasStickyBlockingTransform =
          style.transform !== "none" ||
          style.perspective !== "none" ||
          style.filter !== "none" ||
          style.backdropFilter !== "none" ||
          style.contain.includes("paint") ||
          style.contain.includes("layout") ||
          style.willChange.includes("transform");

        if (
          style.overflow === "hidden" ||
          style.overflowY === "hidden"
        ) {
          console.warn(
            "[StickyLayout] ancestor has overflow:hidden which breaks sticky:",
            el
          );
        }

        if (hasStickyBlockingTransform) {
          console.warn(
            "[StickyLayout] ancestor has transform/filter/contain that can break sticky:",
            {
              element: el,
              transform: style.transform,
              perspective: style.perspective,
              filter: style.filter,
              backdropFilter: style.backdropFilter,
              contain: style.contain,
              willChange: style.willChange,
            }
          );
        }

        el = el.parentElement;
      }
    }
  }, []);

  return (
    <div
      className={`flex flex-col gap-10 lg:flex-row lg:items-start ${className}`}
    >
      {/* Left column — scrollable content */}
      <div className="space-y-6 lg:flex-1 lg:min-w-0">{children}</div>

      {/* Right column — sticky sidebar */}
      <aside
        ref={asideRef}
        className="mt-8 lg:mt-0 lg:w-[420px] lg:flex-none lg:sticky lg:top-[80px] lg:self-start"
      >
        {aside}
      </aside>
    </div>
  );
}
