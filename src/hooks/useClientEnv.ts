import { useEffect, useState } from 'react';

export function useClientEnv() {
  const [ua, setUa] = useState('');
  
  useEffect(() => {
    setUa(navigator.userAgent || '');
  }, []);
  
  const isIG = /Instagram/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  
  return { isIG, isIOS, isAndroid };
}
