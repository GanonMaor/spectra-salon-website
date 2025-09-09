import { useEffect, useState } from 'react';

export function useBackIntercept() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const push = () => history.pushState(null, '', location.href);
    push(); // First back will return here
    
    const onPop = () => {
      setOpen(true);
      push();
    };
    
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return { exitOpen: open, setExitOpen: setOpen };
}
