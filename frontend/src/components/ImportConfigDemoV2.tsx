import { useEffect, useMemo, useRef, useState } from "react";

const SAMPLE = `{
  // Información del servidor que se seleccionará automáticamente
  "server": {
    // Nombre EXACTO del servidor tal como aparece en la app
    // Debe coincidir al 100% (incluye emojis y símbolos)
    "name": "✅[PREMIUM #1] → PRINCIPAL",

    // Categoría o país del servidor
    // Ejemplos: ARGENTINA, BRASIL, CHILE, GLOBAL
    "category": "ARGENTINA"
  },

  // Datos de acceso del cliente
  "credentials": {
    // Usuario asignado al cliente
    "username": "usuario_cliente",

    // Contraseña del cliente
    "password": "clave_cliente"
  },

  // Conexión automática
  // true  → importa y se conecta solo
  // false → importa todo y el cliente solo toca CONECTAR
  "autoConnect": false
}`;

const JSON_OBJ = {
  server: { name: "✅[PREMIUM #1] → PRINCIPAL", category: "ARGENTINA" },
  credentials: { username: "usuario_cliente", password: "clave_cliente" },
  autoConnect: false,
};

export default function ImportConfigDemoV2() {
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(true);

  const text = useMemo(() => SAMPLE, []);
  const total = text.length;
  const lines = text.slice(0, pos).split("\n");

  useEffect(() => {
    mounted.current = true;
    return () => void (mounted.current = false);
  }, []);

  // typing effect
  useEffect(() => {
    if (!running) return;
    let timeout: number | undefined;
    if (pos < total) {
      timeout = window.setTimeout(() => {
        if (!mounted.current) return;
        setPos((p) => p + (Math.random() > 0.95 ? 2 : 1));
      }, Math.random() * 40 + 10);
    } else {
      // pause then restart
      timeout = window.setTimeout(() => {
        if (!mounted.current) return;
        setPos(0);
      }, 1800);
    }
    return () => clearTimeout(timeout);
  }, [pos, running, total]);

  // scroll to bottom as text grows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // quick scroll, keep a small bottom padding
    el.scrollTop = el.scrollHeight;
  }, [pos]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(JSON_OBJ, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const toggle = () => setRunning((r) => !r);
  const restart = () => {
    setPos(0);
    setRunning(true);
  };

  return (
    <div className="not-prose w-full max-w-3xl mx-auto p-3 sm:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 sm:p-6 shadow-xl border border-zinc-700/40">
        {/* Left: Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-emerald-400 text-xs font-semibold">TUTORIAL</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Importar configuración</h3>
            <p className="text-sm text-zinc-300 mb-4">Pega un JSON válido como el del ejemplo. La app validará, seleccionará el servidor y cargará credenciales automáticamente.</p>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">1</div>
                <div>
                  <div className="text-white font-semibold">Validación automática</div>
                  <div className="text-zinc-400">La app valida el JSON y extrae los datos necesarios.</div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">2</div>
                <div>
                  <div className="text-white font-semibold">Selección de servidor</div>
                  <div className="text-zinc-400">Se selecciona el servidor según el campo <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded text-emerald-400">"name"</code>.</div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">3</div>
                <div>
                  <div className="text-white font-semibold">Credenciales cargadas</div>
                  <div className="text-zinc-400">Usuario y contraseña se cargan en los campos automáticamente.</div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">4</div>
                <div>
                  <div className="text-white font-semibold">Conexión opcional</div>
                  <div className="text-zinc-400">Si <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded text-emerald-400">"autoConnect": true</code>, se conecta automáticamente.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex gap-2 mb-2">
              <span className="text-amber-400 text-lg">⚠️</span>
              <div>
                <div className="text-amber-400 font-semibold text-sm">Importante</div>
                <div className="text-amber-200 text-xs">El campo <code className="font-mono text-xs bg-amber-900/30 px-1 py-0.5 rounded text-amber-300">"name"</code> debe coincidir exactamente con el nombre del servidor en la app.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-zinc-400 font-mono">config.json</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggle} className="rounded bg-zinc-700/50 hover:bg-zinc-700 px-2 py-1 text-xs text-zinc-200">{running ? "⏸" : "▶"}</button>
              <button onClick={restart} className="rounded bg-zinc-700/50 hover:bg-zinc-700 px-2 py-1 text-xs text-zinc-200">↻</button>
              <button onClick={handleCopy} className="rounded bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1 text-xs text-white shadow-sm">{copied ? "✓ Copiado" : "Copiar JSON"}</button>
            </div>
          </div>

          <div className="relative flex-1 rounded-lg bg-[#0f1720] overflow-hidden ring-1 ring-white/5">
            <div ref={scrollRef} className="h-72 sm:h-80 overflow-y-auto px-3 py-3 hide-scrollbar font-mono text-[12px] text-[#d6deeb]">
              {lines.map((l, idx) => {
                const isComment = l.trim().startsWith("//");
                const isCurrent = idx === lines.length - 1;

                if (isComment)
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 text-zinc-600 text-xs text-right select-none">{idx + 1}</div>
                      <div className="text-[#34D399] italic">{l}</div>
                    </div>
                  );

                // basic highlight
                const highlighted = l
                  .replace(/"([^"]+)":/g, '<span style="color:#60A5FA">"$1"</span>:')
                  .replace(/: "([^"]+)"/g, ': <span style="color:#F97316">"$1"</span>')
                  .replace(/: (true|false)/g, ': <span style="color:#22C55E">$1</span>')
                  .replace(/[{}]/g, '<span style="color:#FACC15">$&</span>')
                  .replace(/,/g, '<span style="color:#D4D4D4">,</span>');

                return (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 text-zinc-600 text-xs text-right select-none">{idx + 1}</div>
                    <pre className="m-0 whitespace-pre-wrap flex-1" dangerouslySetInnerHTML={{ __html: highlighted }} />
                    {isCurrent && pos < total && <div className="w-[2px] h-5 bg-white ml-1 animate-blink" />}
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300" style={{ width: `${(pos / total) * 100}%` }} />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .hide-scrollbar::-webkit-scrollbar{width:6px}
        .hide-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:3px}
        .hide-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.12)}
        .animate-blink{animation:blink 1s ease-in-out infinite}
      `}</style>
    </div>
  );
}
