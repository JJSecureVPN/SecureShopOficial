import { cn } from "../utils/cn";

export default function BoldCopy({
  text = "FAQ",
  className,
  textClassName,
  backgroundTextClassName,
}: {
  text?: string;
  className?: string;
  textClassName?: string;
  backgroundTextClassName?: string;
}) {
  if (!text?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center bg-background px-2 py-2 md:px-6 md:py-4",
        "font-sans",
        className,
      )}
    >
      <div
        className={cn(
          "text-4xl font-bold uppercase text-zinc-700 transition-all group-hover:opacity-50 md:text-8xl [text-stroke:3px_white]",
          backgroundTextClassName,
        )}
      >
        {text}
      </div>
      <div
        className={cn(
          "text-md absolute font-bold uppercase text-foreground transition-all group-hover:text-4xl md:text-3xl group-hover:md:text-8xl [text-stroke:1px_black]",
          textClassName,
        )}
      >
        {text}
      </div>
    </div>
  );
}