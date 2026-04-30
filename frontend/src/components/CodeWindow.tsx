import { motion } from "framer-motion";

interface CodeWindowProps {
  title: string;
  language: string;
  code: string[];
  className?: string;
  delay?: number;
  activeLine?: number;
}

const CodeWindow = ({
  title,
  language,
  code,
  className = "",
  delay = 0,
  activeLine
}: CodeWindowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`relative w-full bg-[#131417] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col ${className}`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{language}</span>
          <span className="text-[10px] font-mono text-zinc-400">{title}</span>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-6 font-mono text-[13px] leading-relaxed space-y-1.5 min-h-[200px]">
        {code.map((line, i) => (
          <div 
            key={i} 
            className={`flex gap-4 transition-colors duration-300 ${activeLine === i ? "bg-white/5 -mx-6 px-6" : ""}`}
          >
            <span className={`text-zinc-700 w-5 select-none text-right ${activeLine === i ? "text-zinc-500" : ""}`}>{i + 1}</span>
            <div 
              className={`${activeLine === i ? "text-white" : "text-zinc-400"}`}
              dangerouslySetInnerHTML={{ __html: line }} 
            />
          </div>
        ))}
      </div>

      {/* Terminal Footer Detail */}
      <div className="px-5 py-2 border-t border-zinc-800/40 bg-zinc-900/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-tighter">Connection Stable</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">UTF-8</span>
      </div>
    </motion.div>
  );
};

export default CodeWindow;
