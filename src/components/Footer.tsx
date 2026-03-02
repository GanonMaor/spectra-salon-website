import React from "react";

export const Footer: React.FC = () => (
  <footer className="border-t py-8" style={{ background: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.06)" }}>
    <div className="max-w-6xl mx-auto px-4 text-center">
      <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>© 2024 Spectra. All rights reserved.</p>
      <p className="mt-2">
        <a
          href="https://wa.me/972504322680"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline transition-colors"
          style={{ color: "rgba(0,0,0,0.45)" }}
        >
          Chat on WhatsApp
        </a>
      </p>
    </div>
  </footer>
);
