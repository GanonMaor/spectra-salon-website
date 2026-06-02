import React from "react";
import { SALON, TYPE } from "../tokens";

interface EyebrowProps {
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Small uppercase label that sits above a headline. */
export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  align = "center",
  className = "",
}) => (
  <div
    className={`flex items-center gap-2 ${
      align === "center" ? "justify-center" : "justify-start"
    } ${className}`}
  >
    <span
      className="rounded-full"
      style={{ width: 6, height: 6, background: SALON.rose }}
    />
    <span
      className="font-medium uppercase"
      style={{
        fontSize: TYPE.eyebrow,
        letterSpacing: "0.24em",
        color: SALON.copper,
      }}
    >
      {children}
    </span>
  </div>
);
