/**
 * RIDGE Banking-Grade Session Inactivity Monitor Hook
 * - Default timeout: 3 minutes (180,000 ms)
 * - Warning toast: 30 seconds before expiration
 * - User events monitored: mousemove, mousedown, keydown, touchstart, scroll
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const DEFAULT_TIMEOUT_MS = 180000; // 3 minutes
const WARNING_THRESHOLD_MS = 30000; // 30 seconds warning

export function useIdleTimeout({
  isAuthenticated = false,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = WARNING_THRESHOLD_MS,
  onTimeout,
}) {
  const [isWarning, setIsWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.round(warningMs / 1000));

  const lastActivityRef = useRef(Date.now());
  const timerCheckIntervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWarning) {
      setIsWarning(false);
      setSecondsRemaining(Math.round(warningMs / 1000));
    }
  }, [isWarning, warningMs]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsWarning(false);
      if (timerCheckIntervalRef.current) clearInterval(timerCheckIntervalRef.current);
      return;
    }

    lastActivityRef.current = Date.now();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      // Throttle activity updates to once every 1 second
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimer();
      }
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    timerCheckIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const timeLeft = timeoutMs - elapsed;

      if (timeLeft <= 0) {
        clearInterval(timerCheckIntervalRef.current);
        setIsWarning(false);
        if (onTimeout) onTimeout();
      } else if (timeLeft <= warningMs) {
        setIsWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(timeLeft / 1000)));
      } else {
        setIsWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (timerCheckIntervalRef.current) clearInterval(timerCheckIntervalRef.current);
    };
  }, [isAuthenticated, timeoutMs, warningMs, onTimeout, resetTimer]);

  return {
    isWarning,
    secondsRemaining,
    resetTimer,
  };
}

export default useIdleTimeout;
