import { useState, useRef, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { ContactIcon } from "./Icons";
import { HeaderDropdown } from "./HeaderDropdown";

const WhatsAppIcon = () => (
  <img src="/whatsapp-color.svg" alt="WhatsApp" className="w-8 h-8" />
);

const InstagramIcon = () => (
  <img src="/instagram-2016-logo-svgrepo-com.svg" alt="Instagram" className="w-8 h-8" />
);

const TelegramIcon = () => (
  <img src="/telegramicon.svg" alt="Telegram" className="w-8 h-8" />
);

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contactOptions = [
    {
      name: "WhatsApp",
      href: "https://wa.me/5493812531123",
      icon: <WhatsAppIcon />,
      description: "Chat directo",
    },
    {
      name: "Telegram",
      href: "https://t.me/JHServices",
      icon: <TelegramIcon />,
      description: "Respuesta rápida",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/jjsecure.vpn/",
      icon: <InstagramIcon />,
      description: "Síguenos",
    },
  ];

  return (
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
          isOpen
            ? "bg-orange-500/20 text-orange-400"
            : "bg-transparent text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
        }`}
        aria-label="Contacto"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ContactIcon className="w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      <HeaderDropdown
        isOpen={isOpen}
        width="w-72 md:w-80"
        align="center"
        title="Contáctanos"
        icon={<ContactIcon className="w-4 h-4" />}
        onClose={() => setIsOpen(false)}
      >
        <div className="px-2 pt-2">
          <p className="text-xs text-zinc-400 px-3 pb-2">Elige tu canal preferido</p>
          {contactOptions.map((option) => (
            <a
              key={option.name}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-zinc-700/50"
            >
              {option.name === "Instagram" || option.name === "WhatsApp" || option.name === "Telegram" ? (
                <div className="group-hover:scale-110 transition-transform">
                  {option.icon}
                </div>
              ) : (
                <div className="p-1.5 bg-zinc-700 rounded-lg group-hover:scale-110 transition-transform">
                  {option.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{option.name}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{option.description}</p>
              </div>
            </a>
          ))}
        </div>
      </HeaderDropdown>
    </div>
  );
}