
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ size = "md", text, className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${borderClasses[size]} border-blue-200 border-t-blue-600 ${sizeClasses[size]} mx-auto${text ? ' mb-4' : ''}`}></div>
      {text && <span className="text-slate-600 dark:text-slate-400 font-medium">{text}</span>}
    </div>
  );
};
