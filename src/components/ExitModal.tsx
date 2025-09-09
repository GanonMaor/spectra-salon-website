import React from 'react';

type ExitModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { name: string; phoneOrEmail: string }) => void;
};

export default function ExitModal({ open, onClose, onConfirm }: ExitModalProps) {
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
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[min(520px,92vw)] rounded-2xl bg-neutral-950 text-white border border-white/10 p-5">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 rounded-lg border border-white/15 bg-white/5 grid place-items-center"
        >
          ✕
        </button>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Wait! Before you go...</h3>
          <p className="text-white/70 text-sm">
            I've locked the special offer for you for the next 15 minutes. Where should I send it?
          </p>
          <form onSubmit={submit} className="space-y-3">
            <input
              name="name"
              placeholder="Name"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40"
              required
            />
            <input
              name="contact"
              placeholder="Phone / Email"
              inputMode="tel"
              autoComplete="email"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/40"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl px-4 py-2 bg-white text-black text-sm font-medium"
              >
                Save my offer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 border border-white/15 text-white/90 text-sm"
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
