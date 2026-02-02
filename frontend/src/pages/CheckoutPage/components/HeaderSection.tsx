import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { CHECKOUT_SECTIONS } from "../constants";

export const HeaderSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-4">
        <ShoppingBag className="w-4 h-4" />
        Checkout seguro
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-zinc-100 mb-3">
        {CHECKOUT_SECTIONS.PERSONAL_INFO}
      </h1>
      <p className="text-base sm:text-lg text-zinc-400">
        {CHECKOUT_SECTIONS.PERSONAL_INFO_DESC}
      </p>
    </motion.div>
  );
};