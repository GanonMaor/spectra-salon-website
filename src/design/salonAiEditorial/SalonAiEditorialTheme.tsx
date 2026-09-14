import React from "react";
import "./salonAiEditorialTheme.css";

type ThemeElement = "div" | "main" | "section" | "article";

export interface SalonAiEditorialThemeProps extends React.HTMLAttributes<HTMLElement> {
  as?: ThemeElement;
}

/**
 * Scopes the Salon AI editorial tokens and shared primitives to any subtree.
 *
 * @example
 * <SalonAiEditorialTheme as="main">
 *   <h1 className="sai-display sai-display--hero">A smarter salon.</h1>
 * </SalonAiEditorialTheme>
 */
export const SalonAiEditorialTheme: React.FC<SalonAiEditorialThemeProps> = ({
  as = "div",
  className = "",
  children,
  ...props
}) =>
  React.createElement(
    as,
    {
      ...props,
      className: `salon-ai-editorial-theme ${className}`.trim(),
    },
    children,
  );

export default SalonAiEditorialTheme;
