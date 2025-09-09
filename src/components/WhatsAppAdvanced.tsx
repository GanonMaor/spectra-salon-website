import React, { useState, useEffect } from "react";
import { WhatsAppWidget } from "./WhatsAppWidget";

interface WhatsAppAdvancedProps {
  phoneNumber: string;
  className?: string;
}

export const WhatsAppAdvanced: React.FC<WhatsAppAdvancedProps> = ({
  phoneNumber,
  className = "",
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    // Auto-detect current page and user context
    const page = window.location.pathname;
    setCurrentPage(page);

    // Generate smart message based on page
    const smartMessage = generateSmartMessage(page);
    setCurrentMessage(smartMessage);

    // Try to detect user info from localStorage or context
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.full_name || user.name || "");
      } catch (e) {
        console.log("Could not parse user data");
      }
    }
  }, []);

  const generateSmartMessage = (page: string): string => {
    const baseMessage = `Hi! I'm ${userName ? userName + ", and I am" : ""} interested in Spectra Color Intelligence system.`;

    switch (page) {
      case "/":
        return `${baseMessage} I saw your homepage and would love to learn more about the AI color matching technology.`;

      case "/pricing":
        return `${baseMessage} I would like to discuss pricing options for my salon. Do you have different packages available?`;

      case "/about":
        return `${baseMessage} I read about your company and I am impressed! Can we schedule a demo?`;

      default:
        if (page.includes("admin")) {
          return `Hi! I am having trouble with the admin dashboard. Can you help me?`;
        }
        return `${baseMessage} I am browsing your ${page} page and have some questions. Can you help?`;
    }
  };

  // Smart scheduling suggestions
  const getTimeBasedMessage = (): string => {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());

    if (isWeekend) {
      return `${currentMessage}\n\nI know it's the weekend, but when would be a good time to talk next week?`;
    }

    if (hour < 9) {
      return `${currentMessage}\n\nI am messaging early - when do you usually start responding to inquiries?`;
    }

    if (hour > 17) {
      return `${currentMessage}\n\nI am messaging after hours - should I expect a response tomorrow?`;
    }

    return `${currentMessage}\n\nI am available for a call now if convenient!`;
  };

  // Industry-specific templates
  const industryTemplates = {
    salon: `Hi! I own a hair salon and I am looking for an AI color matching system. Spectra looks perfect for us! Can you tell me about:
• Setup process and training
• Monthly costs and ROI
• Integration with existing workflow
• Support and maintenance

When can we schedule a demo?`,

    distributor: `Hello! I am a beauty product distributor interested in partnering with Spectra. I would like to discuss:
• Wholesale pricing and margins  
• Territory rights and exclusivity
• Marketing support materials
• Training for my sales team

Can we set up a call this week?`,

    chain: `Hi! I represent a salon chain and we are evaluating color intelligence solutions. Spectra caught our attention! We need:
• Multi-location deployment options
• Centralized management and reporting  
• Bulk pricing for 10+ locations
• Enterprise support level

Who should I speak with about enterprise sales?`,

    student: `Hello! I am a cosmetology student and fascinated by Spectra's technology. I am wondering:
• Do you offer educational discounts?
• Training programs or certifications?
• Internship opportunities?
• Student demo access?

Would love to learn more about career opportunities too!`,
  };

  return (
    <div className={className}>
      {/* Main WhatsApp Widget */}
      <WhatsAppWidget
        phoneNumber={phoneNumber}
        message={getTimeBasedMessage()}
        position="bottom-left"
        extraLogFields={{ channel: "whatsapp-advanced" }}
      />

      {/* Quick Action Templates (Hidden by default, can be shown on hover or click) */}
      <div className="fixed bottom-20 left-6 z-30 opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover:opacity-100">
        <div className="bg-white rounded-lg shadow-lg p-3 space-y-2 w-64">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Quick Templates:
          </p>

          {Object.entries(industryTemplates).map(([type, message]) => (
            <button
              key={type}
              onClick={() => {
                const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="block w-full text-left px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded border-l-2 border-green-500 transition-colors"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Owner
            </button>
          ))}

          <button
            onClick={() => {
              const customMessage = prompt("Enter your custom message:");
              if (customMessage) {
                const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(customMessage)}`;
                window.open(whatsappUrl, "_blank");
              }
            }}
            className="block w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 rounded border-l-2 border-blue-500 transition-colors"
          >
            Custom Message
          </button>
        </div>
      </div>
    </div>
  );
};
