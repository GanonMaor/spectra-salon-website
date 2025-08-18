import React from "react";

export const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-8">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <p className="text-gray-400">© 2024 Spectra. All rights reserved.</p>
      <p className="mt-2">
        <a
          href="https://wa.me/972504322680"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-gray-300 hover:text-white"
        >
          Chat on WhatsApp
        </a>
      </p>
    </div>
  </footer>
);
