'use client';

interface RateLimitDisplayProps {
  remaining: number;
  resetTime: number;
}

export default function RateLimitDisplay({ remaining, resetTime }: RateLimitDisplayProps) {
  const minutesLeft = Math.max(0, Math.ceil((resetTime - Date.now()) / 60000));
  const color = remaining > 20 ? 'text-green-600' : remaining > 5 ? 'text-yellow-600' : 'text-destructive';

  return (
    <p className="text-xs text-muted-foreground">
      <span className={color}>{remaining}/50</span> requests remaining
      {remaining < 50 && ` · Resets in ${minutesLeft}m`}
    </p>
  );
}
