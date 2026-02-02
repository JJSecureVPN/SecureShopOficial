import { cn } from "@/utils/cn";

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
  rotate?: "x" | "y";
}

export default function FlipCard({
  icon,
  title,
  description,
  rotate = "y",
  className,
  ...props
}: FlipCardProps) {
  const rotationClass = {
    x: ["group-hover:[transform:rotateX(180deg)]", "[transform:rotateX(180deg)]"],
    y: ["group-hover:[transform:rotateY(180deg)]", "[transform:rotateY(180deg)]"],
  };
  const self = rotationClass[rotate];

  return (
    <div className={cn("group h-64 w-52 [perspective:1000px]", className)} {...props}>
      <div
        className={cn(
          "relative h-full rounded-2xl transition-all duration-500 [transform-style:preserve-3d]",
          self[0],
        )}
      >
        {/* Front */}
        <div className="absolute h-full w-full [backface-visibility:hidden] bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex-shrink-0 p-3 bg-zinc-800/60 rounded-xl">
            {icon}
          </div>
          <div className="text-zinc-100 font-semibold text-lg">{title}</div>
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute h-full w-full rounded-2xl bg-black/80 p-4 text-slate-200 [backface-visibility:hidden]",
            self[1],
          )}
        >
          <div className="flex min-h-full flex-col gap-2 justify-center">
            <p 
              className="text-base font-medium leading-normal text-gray-100"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}