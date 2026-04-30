import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Cargando...",
  size = "md",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center min-h-screen bg-neutral-950"
    : "flex flex-col items-center justify-center py-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className={`${sizeClasses[size]} text-neutral-400 animate-spin`}
        />
        {message && (
          <p className="text-neutral-400 text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;
