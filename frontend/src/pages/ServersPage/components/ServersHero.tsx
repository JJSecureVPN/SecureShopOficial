import { Activity, Globe2 } from "lucide-react";

export function ServersHero() {
  return (
    <section className="relative w-full bg-zinc-900">
      <div className="mt-0 sm:mt-8 lg:mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="px-2 sm:px-0 flex w-full relative min-h-[360px] lg:min-h-[520px] py-4">
            <div className="sm:pl-10 flex flex-col justify-center gap-6 z-[1] lg:justify-start lg:py-8">
              {/* Badge */}
              <div className="self-start">
                <div className="relative rounded-[40px] h-8 flex gap-2 items-center justify-center pt-2 pr-4 pb-2 pl-2 border border-zinc-800 bg-zinc-950">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-normal text-xs tracking-[-0.006em] text-white">Red operativa</span>
                </div>
              </div>

              {/* Title and Description */}
              <div className="flex flex-col gap-6">
                <h1 className="text-[32px] leading-[40px] tracking-[-0.5%] sm:text-[56px] sm:leading-[72px] sm:max-w-[588px] sm:tracking-[-0.06rem] font-semibold text-gray-0">
                  Estado de la red en tiempo real
                </h1>
                <p className="font-normal text-base text-gray-300 xs:max-w-[388px]">
                  Rendimiento y disponibilidad en vivo con una vista limpia y enfocada.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex items-center justify-start gap-4 lg:mt-7">
                {[
                  { icon: Activity, label: "Tiempo real" },
                  { icon: Globe2, label: "Multi-región" },
                ].map((feature) => (
                  <div 
                    key={feature.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300"
                  >
                    <feature.icon className="w-4 h-4 text-orange-400" />
                    <span className="font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block absolute top-0 right-0 backdrop-blur-sm">
              <video autoPlay loop muted playsInline width="690" src="/refine-core-hero.mp4"></video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
