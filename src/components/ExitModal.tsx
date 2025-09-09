import React, { useEffect } from 'react';

type ExitModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { name: string; phoneOrEmail: string }) => void;
};

export default function ExitModal({ open, onClose, onConfirm }: ExitModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onConfirm({
      name: String(fd.get('name') || ''),
      phoneOrEmail: String(fd.get('contact') || ''),
    });
  }

  return (
    <div 
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div 
        className="relative w-[min(520px,92vw)] rounded-2xl bg-neutral-950 text-white border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 rounded-xl border border-white/15 bg-white/5 grid place-items-center hover:bg-white/10 transition-all duration-150"
        >
          ✕
        </button>
        <div className="space-y-3">
          <h3 id="exit-modal-title" className="text-lg font-semibold">Wait! Before you go...</h3>
          <p className="text-white/70 text-sm">
            I've locked the special offer for you for the next 15 minutes. Where should I send it?
          </p>
          <form onSubmit={submit} className="space-y-3">
            <input
              name="name"
              placeholder="Name"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all duration-150"
              required
              autoFocus
            />
            <input
              name="contact"
              placeholder="Phone / Email"
              inputMode="tel"
              autoComplete="email"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all duration-150"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl px-4 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-150"
              >
                Save my offer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 border border-white/15 text-white/90 text-sm hover:bg-white/10 transition-all duration-150"
              >
                Continue to Instagram
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
