import React from "react";
import { cn } from "@/lib/utils";

/**
 * Composant d'indicateur de chargement cohérent pour toute l'application
 */
export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Taille du spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Texte à afficher sous le spinner
   */
  text?: string;
  
  /**
   * Indication si le spinner est centré
   * @default false
   */
  centered?: boolean;
  
  /**
   * Indication si le spinner doit prendre toute la hauteur disponible
   * @default false
   */
  fullHeight?: boolean;
}

export function Loading({
  size = "md",
  text,
  centered = false,
  fullHeight = false,
  className,
  ...props
}: LoadingProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        fullHeight && "h-full min-h-[200px]",
        centered && "w-full",
        className
      )}
      {...props}
    >
      <div 
        className={cn(
          "animate-spin rounded-full border-t-transparent border-purple-600", 
          sizeMap[size]
        )} 
      />
      {text && (
        <p className="mt-3 text-sm text-gray-500">
          {text}
        </p>
      )}
    </div>
  );
}