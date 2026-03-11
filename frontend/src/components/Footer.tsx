import { MessageCircle, Instagram, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full">
      {/* Main Footer */}
      <div className="border-t border-zinc-700 bg-zinc-800">
        <div className="grid grid-cols-1 max-w-7xl mx-auto">
          {/* Logo & Badge Section */}
          <div className="px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
            <Link className="hover:no-underline text-white flex items-center" to="/">
              <img src="/INTERNET ILIMITADO.avif" alt="SecureShop VPN" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Links Grid */}
          <div className="px-4 sm:px-8 lg:px-12 py-6 lg:pb-12 flex flex-row flex-wrap items-start justify-start gap-6">
            {/* Company Info - Desktop Only */}
            <div className="hidden lg:flex max-w-[282px] w-full">
              <div className="py-6 lg:py-0 flex flex-col gap-4 lg:max-w-[224px]">
                <div className="font-semibold text-sm leading-6 text-white">SecureShop Inc.</div>
                <div className="font-normal text-sm leading-5 text-zinc-400">Buenos Aires, Argentina</div>
                <a href="mailto:jjsecurevpn@gmail.com" className="font-normal text-sm leading-5 text-zinc-400 hover:text-zinc-200 hover:no-underline">
                  jjsecurevpn@gmail.com
                </a>
              </div>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4 min-w-[152px]">
              <div className="text-sm leading-6 font-semibold text-white">Recursos</div>
              <div className="flex flex-col gap-2">
                <Link to="/ayuda" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Documentación
                </Link>
                <Link to="/noticias" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Blog
                </Link>
                <Link to="/estado" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Estado del Sistema
                </Link>
              </div>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-4 min-w-[152px]">
              <div className="text-sm leading-6 font-semibold text-white">Producto</div>
              <div className="flex flex-col gap-2">
                <Link to="/planes" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Planes
                </Link>
                <Link to="/servidores" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Servidores
                </Link>
                <Link to="/revendedores" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Revendedores
                </Link>
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4 min-w-[152px]">
              <div className="text-sm leading-6 font-semibold text-white">Empresa</div>
              <div className="flex flex-col gap-2">
                <Link to="/sobre-nosotros" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Nosotros
                </Link>
                <Link to="/sponsors" className="text-sm leading-5 hover:no-underline text-zinc-400 hover:text-zinc-200">
                  Sponsors
                </Link>
              </div>
            </div>

            {/* Social - Desktop Only */}
            <div className="hidden lg:flex ml-auto">
              <div className="py-6 lg:py-0 flex flex-col">
                <div className="flex flex-col gap-4">
                  <div className="text-sm leading-6 font-semibold text-white lg:text-right">Únete</div>
                  <div className="flex items-center gap-8 lg:gap-4 justify-start">
                    <a href="https://t.me/+rAuU1_uHGZthMWZh" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                      <Send className="w-8 h-8 lg:w-6 lg:h-6" />
                    </a>
                    <a href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                      <MessageCircle className="w-8 h-8 lg:w-6 lg:h-6" />
                    </a>
                    <a href="https://www.instagram.com/jjsecure.vpn/" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                      <Instagram className="w-8 h-8 lg:w-6 lg:h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info & Social - Mobile */}
          <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 sm:gap-8 lg:hidden">
            <div className="py-6 lg:py-0 flex flex-col gap-4 lg:max-w-[224px]">
              <div className="font-semibold text-sm leading-6 text-white">SecureShop Inc.</div>
              <div className="font-normal text-sm leading-5 text-zinc-400">Buenos Aires, Argentina</div>
              <a href="mailto:jjsecurevpn@gmail.com" className="font-normal text-sm leading-5 text-zinc-400 hover:text-zinc-200 hover:no-underline">
                jjsecurevpn@gmail.com
              </a>
            </div>
            <div className="py-6 lg:py-0 flex flex-col sm:items-end">
              <div className="flex flex-col gap-4">
                <div className="text-sm leading-6 font-semibold text-white lg:text-right">Únete</div>
                <div className="flex items-center gap-8 lg:gap-4 justify-start">
                  
                  <a href="https://t.me/+rAuU1_uHGZthMWZh" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                    <Send className="w-8 h-8 lg:w-6 lg:h-6" />
                  </a>
                  <a href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                    <MessageCircle className="w-8 h-8 lg:w-6 lg:h-6" />
                  </a>
                  <a href="https://www.instagram.com/jjsecure.vpn/" target="_blank" rel="noopener" className="text-zinc-400 hover:text-zinc-200 hover:no-underline">
                    <Instagram className="w-8 h-8 lg:w-6 lg:h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-700 bg-zinc-900">
        <div className="py-6 sm:py-8 lg:py-6 px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-start">
            <Link to="/terminos" className="min-w-[180px] text-sm leading-5 font-normal text-zinc-400 hover:no-underline hover:text-zinc-200">
              Términos &amp; Condiciones
            </Link>
            <Link to="/privacidad" className="min-w-[180px] text-sm leading-5 font-normal text-zinc-400 hover:no-underline hover:text-zinc-200">
              Política de Privacidad
            </Link>
          </div>
          <div className="text-left md:text-right text-sm pr-6 sm:pr-0 leading-5 text-white font-normal">
            © 2026, SecureShop desde Argentina para el mundo
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 text-red-400 inline leading-5">
              <path fill="currentColor" fillRule="evenodd" d="M4.85 2.5a3.25 3.25 0 0 0-2.53 5.29.8.8 0 0 1 .046.063.551.551 0 0 0 .062.077l5.175 5.4a.55.55 0 0 0 .794 0l5.175-5.4a.548.548 0 0 0 .062-.077.798.798 0 0 1 .046-.063 3.25 3.25 0 0 0-5.058-4.083.8.8 0 0 1-1.244 0A3.242 3.242 0 0 0 4.85 2.5ZM0 5.75a4.85 4.85 0 0 1 8-3.688 4.85 4.85 0 0 1 6.947 6.706 2.158 2.158 0 0 1-.22.27l-5.175 5.4a2.15 2.15 0 0 1-3.104 0l-5.175-5.4a2.152 2.152 0 0 1-.22-.27A4.833 4.833 0 0 1 0 5.75Z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;