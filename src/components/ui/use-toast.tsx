import { useCallback } from "react";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string;
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant } = options;
    // Simple fallback: print to console
    if (variant === "destructive") {
      console.error(`[Toast: ${variant}] ${title || ""} - ${description || ""}`);
    } else {
      console.log(`[Toast: ${variant || "default"}] ${title || ""} - ${description || ""}`);
    }
    // You can replace this with a real toast UI later
  }, []);

  return { toast };
}
