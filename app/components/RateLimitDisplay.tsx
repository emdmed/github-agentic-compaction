'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RateLimitDisplayProps {
  remaining: number;
  resetTime: number;
}

export default function RateLimitDisplay({ remaining, resetTime }: RateLimitDisplayProps) {
  const color = remaining > 20 ? 'default' : remaining > 5 ? 'secondary' : 'destructive';

  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">
          <Badge variant={color as 'default' | 'secondary' | 'destructive'}>{remaining}/50</Badge>
          {' '}requests remaining
          {remaining < 50 && ` · Resets at ${new Date(resetTime).toLocaleTimeString()}`}
        </p>
      </CardContent>
    </Card>
  );
}
