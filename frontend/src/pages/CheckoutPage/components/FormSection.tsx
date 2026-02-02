import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutForm, { CheckoutFormRef } from "../../../components/CheckoutForm";

interface FormSectionProps {
  error: string;
  formRef: React.RefObject<CheckoutFormRef>;
  planId: number;
  planPrecio: number;
  onCuponChange: (descuento: number) => void;
  onEmailChange?: (email: string) => void;
  userEmail?: string;
}

export const FormSection = ({ 
  error, 
  formRef, 
  planId, 
  planPrecio, 
  onCuponChange,
  onEmailChange,
  userEmail
}: FormSectionProps) => {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-200">Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm p-6">
        <CheckoutForm
          ref={formRef}
          planId={planId}
          planPrecio={planPrecio}
          loading={false}
          onCuponChange={onCuponChange}
          onEmailChange={onEmailChange}
          userEmail={userEmail}
        />
      </div>
    </motion.div>
  );
};