import { useCallback, useEffect, useRef, useState } from 'react';

export function useBackIntercept() {
  const [open, setOpen] = useState(false);
  const bypassOnceRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const push = () => history.pushState(null, '', location.href);
    push(); // First back will return here
    
    const onPop = () => {
      if (bypassOnceRef.current) {
        bypassOnceRef.current = false;
        return;
      }
      setOpen(true);
      push();
    };
    
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const continueBack = useCallback(() => {
    if (typeof window === 'undefined') return;
    bypassOnceRef.current = true;
    setOpen(false);
    window.history.back();
  }, []);

  return { exitOpen: open, setExitOpen: setOpen, continueBack };
}
