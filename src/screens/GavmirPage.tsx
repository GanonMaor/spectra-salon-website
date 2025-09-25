import React from "react";

export default function GavmirPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-6xl px-4 py-10">
        <img
          src="/inventory.png"
          alt="Inventory"
          className="w-full h-auto object-contain rounded-2xl shadow-xl"
          loading="eager"
        />
      </div>
    </div>
  );
}
