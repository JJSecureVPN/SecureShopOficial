import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function AppDownloadSection() {
  return (
    <section id="get-started" className="py-16 sm:py-20 lg:py-24 bg-refine-dark" style={{ scrollMarginTop: '6rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl sm:text-[32px] sm:leading-[40px] font-semibold tracking-normal text-white">
            ¡Empieza ahora!
          </h2>
          <p className="text-base font-normal tracking-[-0.004em] text-zinc-300 sm:max-w-[446px]">
            Elige la versión que mejor se adapte a tus necesidades y comienza a navegar de forma segura.
          </p>
        </motion.div>

        {/* Main Container */}
        <div className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden">
          {/* Desktop SVG Background */}
          <div className="hidden md:block absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1200 208" fill="none" preserveAspectRatio="none">
              <path fill="#27272A" d="M640.76 196.648c2.447 5.3-1.425 11.352-7.263 11.352H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h476.576c37.445 0 71.473 21.772 87.164 55.77l65.02 140.878ZM1200 196c0 6.627-5.37 12-12 12H711.424c-37.445 0-71.473-21.772-87.164-55.77L559.24 11.353C556.793 6.051 560.665 0 566.503 0H1188c6.63 0 12 5.373 12 12v184Z" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-20 h-20 rounded-full text-xl uppercase flex items-center justify-center bg-zinc-900">
              o
            </div>
          </div>

          {/* Two Options Container */}
          <div className="relative flex flex-col md:flex-row gap-1 w-full">
            {/* Left Side - JJSecure Lite */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col gap-6 sm:gap-10 pt-10 pb-20 px-10 bg-zinc-800 md:bg-transparent rounded-tl-[0.75rem] rounded-tr-[0.75rem] md:rounded-tr-[0.75rem] rounded-br-[0.75rem] rounded-bl-[3rem]"
            >
              <div className="text-base lg:text-2xl text-white md:max-w-[318px] lg:max-w-[446px]">
                <div className="text-indigo-500 font-semibold mb-2">JJSecure Lite</div>
                <div>Versión gratuita con todas las</div>
                <div>funciones básicas incluidas.</div>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
                target="_blank"
                rel="noopener noreferrer"
                className="self-start rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 pr-6 pl-3 py-3 flex items-center justify-center gap-2 no-underline transition-colors duration-150 ease-in-out"
              >
                <Play className="w-6 h-6 fill-white" />
                <span className="text-base font-semibold">Descargar Lite</span>
              </a>
            </motion.div>

            {/* Mobile "OR" divider */}
            <div className="md:hidden absolute top-1/2 left-20 -translate-x-1/2 -translate-y-1/2 text-white w-20 h-20 rounded-full text-xl uppercase flex items-center justify-center bg-zinc-900">
              o
            </div>

            {/* Right Side - JJSecure Pro */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col flex-1 pt-20 pb-10 px-10 md:items-end bg-zinc-800 md:bg-transparent rounded-tl-[0.75rem] rounded-tr-[3rem] rounded-br-[0.75rem] rounded-bl-[0.75rem]"
            >
              <div className="md:max-w-[318px] lg:max-w-[446px] flex flex-col gap-6 sm:gap-10">
                <div className="text-base lg:text-2xl text-white lg:max-w-[446px]">
                  <div className="text-indigo-500 font-semibold mb-2">JJSecure Pro</div>
                  <div>Versión premium con velocidad</div>
                  <div>máxima y servidores exclusivos.</div>
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.jjsecure.pro&hl=es_AR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 pr-6 pl-3 py-3 flex items-center justify-center gap-2 no-underline transition-colors duration-150 ease-in-out"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span className="text-base font-semibold">Descargar Pro</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
