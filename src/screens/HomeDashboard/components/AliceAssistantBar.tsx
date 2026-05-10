import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { Mic, Send, Sparkles, X } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import {
  ALICE_SUGGESTIONS,
  type AIResponse,
  type AliceActionDescriptor,
  type AliceSuggestionKey,
} from "../aliceAssistant";

const MIN_THINKING_MS = 500;
const MAX_THINKING_MS = 800;

export interface AliceAssistantBarHandle {
  focusInput: () => void;
}

export interface AliceAssistantBarProps {
  /** Resolves a free-text input into a single concise response. */
  onSubmit: (input: string) => Promise<AIResponse> | AIResponse;
  /** Resolves a suggestion chip tap. */
  onSuggestion: (key: AliceSuggestionKey) => Promise<AIResponse> | AIResponse;
  /** Receives a CTA tap from the visible response. */
  onResponseAction: (action: AliceActionDescriptor) => void;
  /** Optional proactive opener controlled by the host. */
  proactiveResponse?: AIResponse | null;
  /** Notified about Alice input focus state for proactive throttling. */
  onFocusChange?: (focused: boolean) => void;
  /** Notified when a response becomes / stops being visible. */
  onActiveResponseChange?: (hasResponse: boolean) => void;
  /** Notified when the user dismisses or replaces the proactive opener. */
  onProactiveAcknowledged?: () => void;
}

/**
 * Alice — the salon-floor assistant bar.
 *
 * Renders a compact prompt with an input, a future voice button, a
 * row of suggestion chips, and at most one current response. Keeps
 * a small typing indicator with a 500-800ms delay so even instant
 * local answers feel deliberate rather than mechanical.
 */
const AliceAssistantBar = forwardRef<AliceAssistantBarHandle, AliceAssistantBarProps>(
  function AliceAssistantBar(
    {
      onSubmit,
      onSuggestion,
      onResponseAction,
      proactiveResponse,
      onFocusChange,
      onActiveResponseChange,
      onProactiveAcknowledged,
    },
    ref,
  ) {
    const { isDark } = useSiteTheme();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [draft, setDraft] = useState("");
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    // Surface proactive opener as the current response while it lasts.
    const [showingProactive, setShowingProactive] = useState(false);
    useEffect(() => {
      if (proactiveResponse && !response) {
        setResponse(proactiveResponse);
        setShowingProactive(true);
      }
    }, [proactiveResponse, response]);

    // Tell the host about visible-response transitions.
    useEffect(() => {
      onActiveResponseChange?.(Boolean(response));
    }, [response, onActiveResponseChange]);

    useImperativeHandle(ref, () => ({
      focusInput: () => inputRef.current?.focus(),
    }), []);

    const acknowledgeProactiveIfNeeded = useCallback(() => {
      if (showingProactive) {
        setShowingProactive(false);
        onProactiveAcknowledged?.();
      }
    }, [showingProactive, onProactiveAcknowledged]);

    const runWithThinking = useCallback(
      async (factory: () => Promise<AIResponse> | AIResponse) => {
        setIsThinking(true);
        const startedAt = Date.now();
        const minDelay = MIN_THINKING_MS + Math.floor(
          Math.random() * (MAX_THINKING_MS - MIN_THINKING_MS),
        );
        try {
          const result = await Promise.resolve(factory());
          const elapsed = Date.now() - startedAt;
          if (elapsed < minDelay) {
            await delay(minDelay - elapsed);
          }
          setResponse(result);
        } finally {
          setIsThinking(false);
        }
      },
      [],
    );

    const handleSubmit = useCallback(
      async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || isThinking) return;
        acknowledgeProactiveIfNeeded();
        setDraft("");
        await runWithThinking(() => onSubmit(trimmed));
      },
      [draft, isThinking, runWithThinking, onSubmit, acknowledgeProactiveIfNeeded],
    );

    const handleSuggestion = useCallback(
      async (key: AliceSuggestionKey) => {
        if (isThinking) return;
        acknowledgeProactiveIfNeeded();
        await runWithThinking(() => onSuggestion(key));
      },
      [isThinking, runWithThinking, onSuggestion, acknowledgeProactiveIfNeeded],
    );

    const handleAction = useCallback(
      (action: AliceActionDescriptor) => {
        if (action.actionKey === "alice.dismiss") {
          setResponse(null);
          acknowledgeProactiveIfNeeded();
          return;
        }
        onResponseAction(action);
        acknowledgeProactiveIfNeeded();
      },
      [onResponseAction, acknowledgeProactiveIfNeeded],
    );

    const handleClearResponse = useCallback(() => {
      setResponse(null);
      acknowledgeProactiveIfNeeded();
    }, [acknowledgeProactiveIfNeeded]);

    const baseSurface = isDark
      ? "border-white/[0.10] bg-black/[0.40]"
      : "border-black/[0.06] bg-white/[0.85]";
    const inputSurface = isDark
      ? "bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/40"
      : "bg-black/[0.03] border-black/[0.05] text-[#1A1A1A] placeholder:text-black/40";
    const chipSurface = isDark
      ? "border-white/[0.08] bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
      : "border-black/[0.05] bg-black/[0.02] text-black/70 hover:bg-black/[0.05]";

    return (
      <section
        aria-label="Alice assistant"
        className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-4 ${baseSurface}`}
        style={{
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center gap-3">
          <AliceAvatar isDark={isDark} active={isThinking} />
          <div className="min-w-0 flex-1">
            <p
              className={`text-[12px] font-semibold ${
                isDark ? "text-white" : "text-[#1A1A1A]"
              }`}
            >
              Alice
            </p>
            <p
              className={`text-[11px] leading-tight ${
                isDark ? "text-white/55" : "text-black/55"
              }`}
            >
              Hi — need help with today&apos;s schedule, inventory, or revenue?
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`mt-3 flex items-center gap-2 rounded-full border px-3 py-2 ${inputSurface}`}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            placeholder="Ask Alice..."
            className="flex-1 bg-transparent outline-none text-[13px]"
            aria-label="Ask Alice"
            disabled={isThinking}
          />
          <button
            type="button"
            title="Voice (coming soon)"
            aria-label="Voice (coming soon)"
            disabled
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-not-allowed ${
              isDark ? "text-white/30" : "text-black/25"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            aria-label="Send to Alice"
            disabled={!draft.trim() || isThinking}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? "bg-white text-[#1A1A1A] hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
                : "bg-[#1A1A1A] text-white hover:bg-black/85 disabled:bg-black/15 disabled:text-white/70"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {ALICE_SUGGESTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => handleSuggestion(s.key)}
              disabled={isThinking}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${chipSurface} disabled:opacity-50`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {(isThinking || response) && (
          <div
            className={`mt-3 rounded-xl border px-3 py-3 ${
              isDark
                ? "border-white/[0.08] bg-white/[0.03]"
                : "border-black/[0.05] bg-black/[0.02]"
            }`}
            role="status"
            aria-live="polite"
          >
            {isThinking && !response && (
              <ThinkingIndicator isDark={isDark} />
            )}
            {response && (
              <div className="flex items-start gap-3">
                <Sparkles
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isDark ? "text-violet-300" : "text-violet-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] leading-snug ${
                      isDark ? "text-white" : "text-[#1A1A1A]"
                    }`}
                  >
                    {response.message}
                  </p>
                  {response.confirmation && (
                    <p
                      className={`mt-1 text-[11px] leading-snug ${
                        isDark ? "text-white/55" : "text-black/55"
                      }`}
                    >
                      {response.confirmation}
                    </p>
                  )}
                  {response.actions && response.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {response.actions.map((a) => (
                        <button
                          key={`${a.actionKey}-${a.label}`}
                          type="button"
                          onClick={() => handleAction(a)}
                          className={
                            a.primary
                              ? `inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                                  isDark
                                    ? "bg-white text-[#1A1A1A] hover:bg-white/90"
                                    : "bg-[#1A1A1A] text-white hover:bg-black/85"
                                }`
                              : `inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                                  isDark
                                    ? "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]"
                                    : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08]"
                                }`
                          }
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={handleClearResponse}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isDark
                      ? "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                      : "text-black/35 hover:text-black/70 hover:bg-black/[0.04]"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    );
  },
);

const AliceAvatar: React.FC<{ isDark: boolean; active: boolean }> = ({
  isDark,
  active,
}) => (
  <div
    className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
      isDark ? "bg-violet-500/20" : "bg-violet-500/15"
    }`}
    aria-hidden
  >
    <Sparkles
      className={`w-4 h-4 ${isDark ? "text-violet-200" : "text-violet-600"}`}
    />
    {active && (
      <span
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"
        style={{ boxShadow: "0 0 0 2px var(--bt-pulse-ring, #ffffff)" }}
      />
    )}
  </div>
);

const ThinkingIndicator: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="flex items-center gap-1.5" aria-label="Alice is thinking">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          isDark ? "bg-white/55" : "bg-black/40"
        }`}
        style={{
          animation: "alice-bounce 1.2s infinite ease-in-out",
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes alice-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40% { transform: translateY(-3px); opacity: 1; }
      }
    `}</style>
  </div>
);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default AliceAssistantBar;
