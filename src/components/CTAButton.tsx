import { Button } from "./ui/button";

interface CTAButtonProps {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
  showWhatsApp?: boolean;
  whatsAppUrl?: string;
}

export const CTAButton = ({ 
  children, 
  size = "default", 
  onClick, 
  className,
  showWhatsApp = false,
  whatsAppUrl = "https://wa.me/972504322680?text=Hi! I'm interested in starting a free trial"
}: CTAButtonProps) => {
  return (
    <Button
      size={size}
      onClick={onClick}
      className={`bg-gradient-to-r from-[#d4c4a8] to-[#c8b896] hover:from-[#c8b896] hover:to-[#b8906b] text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${className || ''}`}
    >
      {children}
    </Button>
  );
}; 