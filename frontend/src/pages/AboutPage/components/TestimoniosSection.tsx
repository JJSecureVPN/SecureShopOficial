import { Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

const TESTIMONIALS = [
  {
    name: "Carlos Rodríguez",
    rating: 5,
    message: "Sin saldo y pude seguir usando internet. JJSecure me salvó el trabajo.",
    date: "Hace 2 días",
  },
  {
    name: "María González",
    rating: 5,
    message: "Tenía mis gigas congelados y gracias a JJSecure pude estudiar desde casa.",
    date: "Hace 1 semana",
  },
  {
    name: "Luis Martínez",
    rating: 5,
    message: "App ligera, funciona cuando otros no. Nunca más sin conexión.",
    date: "Hace 3 días",
  },
  {
    name: "Jazmin Cardozo",
    rating: 5,
    message: "El soporte responde rápido y la conexión VPN es súper estable.",
    date: "Hace 5 días",
  },
  {
    name: "Roberto Silva",
    rating: 5,
    message: "Excelente VPN regional, entiende las necesidades del mercado latinoamericano.",
    date: "Hace 1 día",
  },
  {
    name: "Ana López",
    rating: 5,
    message: "La mejor inversión que hice para mi negocio. Conexión estable 24/7.",
    date: "Hace 4 días",
  },
];

export function TestimoniosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1280) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = TESTIMONIALS.length - visibleCount;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, TESTIMONIALS.length - visibleCount) : prevIndex - 1
    );
  };

  const visibleTestimonials = TESTIMONIALS.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section id="testimonios" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<MessageSquare className="h-5 w-5" />}
          title="Testimonios"
          subtitle="Feedback directo de la comunidad"
          iconColor="text-amber-500"
        />

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={prevTestimonial}
            disabled={currentIndex === 0 && visibleCount >= TESTIMONIALS.length}
            className="p-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.max(1, TESTIMONIALS.length - visibleCount + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-indigo-400" : "bg-zinc-700"
                }`}
                aria-label={`Ir al grupo de testimonios ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            disabled={currentIndex >= TESTIMONIALS.length - visibleCount}
            className="p-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Testimonials */}
        <div className={`grid gap-4 sm:gap-6 ${visibleCount === 1 ? 'max-w-2xl mx-auto' : visibleCount === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'lg:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto'}`}>
          {visibleTestimonials.map((testimonial, index) => (
            <motion.article 
              key={`${testimonial.name}-${currentIndex}`} 
              className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-400" : "text-zinc-700"}`}
                    fill={i < testimonial.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">"{testimonial.message}"</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-100">{testimonial.name}</span>
                <span className="text-zinc-400">{testimonial.date}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}