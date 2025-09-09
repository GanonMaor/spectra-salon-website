import React from 'react';
import { useClientEnv } from '../hooks/useClientEnv';

export default function InAppOpenBanner() {
  const { isIG } = useClientEnv();
  
  // Only show for Instagram users
  if (!isIG) return null;
  
  const url = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40">
      <div className="mx-auto max-w-screen-sm">
        <div className="mx-3 rounded-2xl bg-neutral-900/90 backdrop-blur border border-white/10 px-4 py-3 flex items-center justify-between">
          <span className="text-white/80 text-sm">For faster checkout, open in browser</span>
          <button
            onClick={() => window.open(url, '_blank')}
            className="text-white/90 text-xs border border-white/20 rounded-lg px-3 py-1 hover:bg-white/10"
          >
            Open in Browser
          </button>
        </div>
      </div>
    </div>
  );
}
