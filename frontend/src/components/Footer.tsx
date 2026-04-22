import { MessageCircle, Instagram, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="w-full bg-[#060606]">
      {/* Main Footer */}
      <div className="border-t border-zinc-800/50">
        <div className="grid grid-cols-1 max-w-7xl mx-auto">
          {/* Logo & Badge Section */}
          <div className="px-4 sm:px-8 lg:px-12 py-8 flex items-center justify-between">
            <Link className="hover:no-underline text-white flex items-center" to="/">
              <img src="/INTERNET ILIMITADO.avif" alt="SecureShop VPN" className="h-8 w-auto mix-blend-screen opacity-80 hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Links Grid */}
          <div className="px-4 sm:px-8 lg:px-12 py-6 lg:pb-12 flex flex-row flex-wrap items-start justify-start gap-12 sm:gap-24 font-title">
            {/* Company Info - Desktop Only */}
            <div className="hidden lg:flex max-w-[282px] w-full">
              <div className="py-6 lg:py-0 flex flex-col gap-4 lg:max-w-[224px]">
                <div className="font-bold text-sm leading-6 text-white tracking-tight uppercase">SecureShop Inc.</div>
                <div className="font-normal text-sm leading-5 text-zinc-500 font-mono">Buenos Aires, Argentina</div>
                <a href="mailto:jjsecurevpn@gmail.com" className="font-normal text-sm leading-5 text-zinc-500 hover:text-white transition-colors font-mono">
                  jjsecurevpn@gmail.com
                </a>
              </div>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4 min-w-[120px]">
              <div className="text-xs leading-6 font-bold text-zinc-600 uppercase tracking-widest">Recursos</div>
              <div className="flex flex-col gap-2">
                <Link to="/ayuda" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Documentación
                </Link>
                <Link to="/noticias" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link to="/estado" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Estado
                </Link>
              </div>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-4 min-w-[120px]">
              <div className="text-xs leading-6 font-bold text-zinc-600 uppercase tracking-widest">Producto</div>
              <div className="flex flex-col gap-2">
                <Link to="/planes" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Planes
                </Link>
                <Link to="/revendedores" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Revendedores
                </Link>
                <Link to="/donaciones" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-white transition-colors">
                  Donar
                </Link>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-4 min-w-[120px]">
              <div className="text-xs leading-6 font-bold text-zinc-600 uppercase tracking-widest">Social</div>
              <div className="flex items-center gap-4">
                <a href="https://t.me/+rAuU1_uHGZthMWZh" target="_blank" rel="noopener" className="text-zinc-500 hover:text-white transition-colors">
                  <Send className="w-5 h-5" />
                </a>
                <a href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja" target="_blank" rel="noopener" className="text-zinc-500 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/jjsecure.vpn/" target="_blank" rel="noopener" className="text-zinc-500 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900">
        <div className="py-8 px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-8 items-start justify-start font-mono text-[10px] uppercase tracking-tighter">
            <Link to="/terminos" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              Términos &amp; Condiciones
            </Link>
            <Link to="/privacidad" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              Privacidad
            </Link>
          </div>
          <div className="text-left md:text-right text-[10px] text-zinc-600 font-mono uppercase tracking-tight">
            © 2026 SecureShop · Buenos Aires, Argentina
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2 inline-block text-zinc-800"
            >
              VPN_SECURE_ACTIVE
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;