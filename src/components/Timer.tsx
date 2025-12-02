import { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isPaused?: boolean;
  showWarning?: boolean; // Show warning when time is low
  warningThreshold?: number; // seconds remaining to show warning
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({
  initialTime,
  onTimeUp,
  isPaused = false,
  showWarning = true,
  warningThreshold = 10,
  size = 'md',
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [hasTriggeredTimeUp, setHasTriggeredTimeUp] = useState(false);

  useEffect(() => {
    setTimeRemaining(initialTime);
    setHasTriggeredTimeUp(false);
  }, [initialTime]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && !hasTriggeredTimeUp) {
      setHasTriggeredTimeUp(true);
      onTimeUp();
    }
  }, [timeRemaining, hasTriggeredTimeUp, onTimeUp]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isWarning = showWarning && timeRemaining <= warningThreshold && timeRemaining > 0;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  const percentage = (timeRemaining / initialTime) * 100;

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div
      className={`relative inline-flex items-center gap-2 rounded-lg font-mono font-medium transition-all duration-300 ${
        sizeClasses[size]
      } ${
        isCritical
          ? 'bg-error/20 text-error animate-pulse'
          : isWarning
          ? 'bg-warning/20 text-warning'
          : 'bg-bg-tertiary text-text-primary'
      }`}
    >
      {/* Timer Icon */}
      <svg
        className={`w-4 h-4 ${isCritical ? 'animate-bounce' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Time Display */}
      <span>{formatTime(timeRemaining)}</span>

      {/* Progress Ring (for small/medium sizes) */}
      {size !== 'lg' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-bg-primary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isCritical ? 'bg-error' : isWarning ? 'bg-warning' : 'bg-accent'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Circular timer variant for more visual impact
interface CircularTimerProps extends Omit<TimerProps, 'size'> {
  radius?: number;
}

export function CircularTimer({
  initialTime,
  onTimeUp,
  isPaused = false,
  showWarning = true,
  warningThreshold = 10,
  radius = 40,
}: CircularTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [hasTriggeredTimeUp, setHasTriggeredTimeUp] = useState(false);

  useEffect(() => {
    setTimeRemaining(initialTime);
    setHasTriggeredTimeUp(false);
  }, [initialTime]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && !hasTriggeredTimeUp) {
      setHasTriggeredTimeUp(true);
      onTimeUp();
    }
  }, [timeRemaining, hasTriggeredTimeUp, onTimeUp]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}`;
  }, []);

  const isWarning = showWarning && timeRemaining <= warningThreshold && timeRemaining > 0;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  const percentage = (timeRemaining / initialTime) * 100;

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const strokeColor = isCritical
    ? 'var(--color-error)'
    : isWarning
    ? 'var(--color-warning)'
    : 'var(--color-accent)';

  const size = radius * 2 + 16;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        isCritical ? 'animate-pulse' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        className="absolute transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-tertiary)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Time text */}
      <span
        className={`font-mono font-bold ${
          isCritical
            ? 'text-error'
            : isWarning
            ? 'text-warning'
            : 'text-text-primary'
        }`}
        style={{ fontSize: radius * 0.5 }}
      >
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}

