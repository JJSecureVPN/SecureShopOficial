import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
}

export function MountainHero() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Crear partículas de confetti
    const newParticles: Particle[] = [];
    const colors = [
      '#FF6B6B', // rojo
      '#FFD93D', // amarillo
      '#6BCF7F', // verde
      '#4ECDC4', // cyan
      '#45B7D1', // azul
      '#A78BFA', // morado
      '#EC4899', // rosa
    ];

    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: 50 + Math.random() * 30, // Concentrado alrededor del centro-derecha
        y: 30 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#1a1d29] dark:bg-[#1a1d29]" style={{ minHeight: '500px' }}>
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1d29] via-[#1e2230] to-[#232838]" />
      
      {/* Montañas - Capa trasera (cloud-500) */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ height: '60%' }}
        width="5120" 
        height="456" 
        fill="none" 
        viewBox="0 0 5120 456" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill="#14161f"
          style={{ fill: 'rgb(var(--color-cloud-500))' }}
          d="M2467 198C2478.93 198 2508.5 148.5 2692.3 167C2855.77 183.454 2890 275.92 2940.45 271C2978.5 267.29 3025.5 66.1073 3208.04 55.5002C3364.5 46.408 3407.37 123 3419.5 123.5C3431.63 124 3448.89 83.0002 3564.32 83.0002C3728 83.0002 3767.67 198.501 3779.08 198C3790.5 197.5 3808 45.0002 4044.68 45.0002C4238.5 45.0002 4245.32 120.5 4256.5 116.5C4267.69 112.5 4277 13.5002 4417.9 13.5002C4567 13.5002 4590.74 115.5 4608.5 116.5C4626.26 117.5 4640.5 13.5007 4795 13.5004C4946 13.5002 4954.43 76.5003 4970.51 76.5003C4986.6 76.5003 4983 8.5 5077 8.5C5147.13 8.5 5148.62 62.7657 5148.14 74.3437C5148.08 75.8075 5148 77.2344 5148 78.6994V360V361.5C5148 383.592 5130.09 401.5 5108 401.5H9C-13.0914 401.5 -31 383.592 -31 361.5V133.5V76.0021V76.0002C-31 75.9604 -30.9925 -7.80104e-05 24 0C103.747 0.000113126 132.617 67.9717 143.069 117.186C148.413 142.347 172.927 161.481 197.99 155.7L478.5 91C598.5 64.5 646 110.5 659 110.5C672 110.5 714 31 856 33.5C998 36 996.5 76 1008.5 73.5C1020.5 71 1014.28 28.0329 1174.5 31C1309.5 33.5 1298.5 110.5 1327.5 110.5C1366.31 110.5 1378.25 109.457 1388 110.5C1406.69 112.5 1429.5 27 1615 27C1743.74 27 1771.09 161.183 1855.16 167C1930.28 172.198 1914.5 85 2032.05 90.0002C2108.93 93.2702 2132.33 148 2146.16 148C2160 148 2184 81.6655 2318.08 102.5C2440.5 121.524 2455.07 198 2467 198Z"
        />
      </svg>

      {/* Montañas - Capa frontal (cloud-300) */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ height: '60%' }}
        width="5120" 
        height="456" 
        fill="none" 
        viewBox="0 0 5120 456" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill="#232838"
          style={{ fill: 'rgb(var(--color-cloud-300))' }}
          d="M2617 234C2496.99 229.765 2429.72 276.108 2400.53 303.732C2388.43 315.177 2372.83 323.5 2356.18 323.5H2135.62C2111.05 323.5 2089.95 305.704 2082.79 282.198C2061.56 212.504 2001.53 78.3592 1852.75 71.0003C1691 63 1645 185 1622 186.5C1599 188 1587 88.5 1368.5 88.5C1211 88.5 1180 157.5 1158.4 161.5C1136.8 165.501 1074.33 111 931 129.5C787.671 148 789.676 214.5 770 214C750.324 213.5 736.5 129.5 535.029 142.5C416.863 150.125 382.163 211.07 373.669 260.166C368.141 292.123 343.421 323.5 310.99 323.5H280.024C249.079 323.5 225.052 295.503 224.331 264.567C222.732 195.98 200.305 92 79 92C17.4738 92 3.47982 128.37 0.653094 139.38C0.122368 141.447 0 143.571 0 145.705V398C0 412.36 11.6404 424 25.9998 424H5100C5127.61 424 5150 401.615 5150 374V365V181.851C5150 149.381 5119.54 125.514 5087.89 132.773C5054.67 140.392 5019.02 148.008 5011.31 147.5C4996.11 146.501 4966.41 99.9071 4859.43 95.5003C4731 90.2096 4684 213.5 4663 213.5H4531.84C4513.48 213.5 4496.63 203.435 4485.66 188.715C4451.8 143.286 4365.08 52.9127 4220.67 71.0003C4061 91.0002 4023.5 150.5 4006.5 150.5C3989.5 150.5 3925.6 96.5092 3797.5 100.5C3637 105.5 3599 235.5 3589 231.5C3563.12 221.148 3430.32 192.596 3405.38 180.145C3382.96 168.954 3354.61 161.5 3318.87 161.5C3175.43 161.5 3129.73 224 3116.87 224C3104 224 3073.62 179.5 2953.5 179.5C2782 179.5 2771.92 286 2756 284.5C2740.08 283 2721.1 237.674 2617 234Z"
        />
      </svg>

      {/* Confetti/Partículas animadas */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-4 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: [0, -50, -100, -150],
            x: [0, Math.random() * 40 - 20],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Personaje/Ilustración - Placeholder */}
      <div className="absolute right-[10%] bottom-[20%] z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative"
        >
          {/* Círculo de fondo */}
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Emoji o ícono */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🚀
          </div>
        </motion.div>
      </div>

      {/* Contenido del Hero */}
      <div className="relative z-20 px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md 
                       bg-pink-500/10 backdrop-blur-sm
                       text-pink-400
                       text-sm font-medium mb-8"
          >
            ARTICLES AND TUTORIALS
          </motion.div>
        </div>
      </div>
    </div>
  );
}
