import React from 'react';

type Props = {
  label?: string;
  cta?: string;
  onClick: () => void;
};

export default function StickyOfferBar({ 
  label = 'Special Offer', 
  cta = 'Get it now', 
  onClick 
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-screen-sm">
        <div className="m-3 rounded-2xl bg-neutral-900/90 backdrop-blur border border-white/10 p-4 flex items-center justify-between">
          <span className="text-white/90 text-sm">{label}</span>
          <button
            onClick={onClick}
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white text-black hover:opacity-90 transition-all duration-300"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
