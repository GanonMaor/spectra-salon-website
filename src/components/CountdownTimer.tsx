import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate?: Date;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate, 
  onExpire, 
  className = "" 
}) => {
  // Default to 24 hours from now if no target date provided
  const defaultTarget = targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = defaultTarget.getTime() - now;

      if (distance < 0) {
        setIsExpired(true);
        onExpire && onExpire();
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [defaultTarget, onExpire]);

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
          <p className="font-semibold">This exclusive offer has expired!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg">
        <p className="text-sm font-medium mb-2">⚡ LIMITED TIME OFFER EXPIRES IN:</p>
        <div className="flex justify-center items-center gap-4 text-2xl font-bold">
          <div className="bg-white/20 px-3 py-2 rounded">
            <span className="text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
            <div className="text-xs text-white/80 mt-1">HOURS</div>
          </div>
          <span className="text-white">:</span>
          <div className="bg-white/20 px-3 py-2 rounded">
            <span className="text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <div className="text-xs text-white/80 mt-1">MINS</div>
          </div>
          <span className="text-white">:</span>
          <div className="bg-white/20 px-3 py-2 rounded">
            <span className="text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <div className="text-xs text-white/80 mt-1">SECS</div>
          </div>
        </div>
        <p className="text-sm text-white/90 mt-2">🔥 Only 30 spots available this month!</p>
      </div>
    </div>
  );
}; 