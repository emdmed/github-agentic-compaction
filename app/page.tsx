'use client';

import { useState } from 'react';
import RepoInputForm from './components/RepoInputForm';
import CompactionResult from './components/CompactionResult';
import RateLimitDisplay from './components/RateLimitDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Stats {
  files: number;
  rawTokens: number;
  compactedTokens: number;
}

interface RateLimit {
  remaining: number;
  resetTime: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  async function handleSubmit(url: string) {
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setStats(null);

    try {
      const res = await fetch('/api/compact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        if (data.rateLimit) setRateLimit(data.rateLimit);
        return;
      }

      setOutput(data.output);
      setStats(data.stats);
      if (data.rateLimit) setRateLimit(data.rateLimit);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Codebase Compactor for AI Agents</CardTitle>
          <CardDescription>
            Transform any GitHub repository into a compact, token-efficient format for agentic coding tools.
            Reduces token usage while preserving file structure—agents can search and find specific files
            instead of reading entire codebases. Save up to 90% on token costs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RepoInputForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />

          {isLoading && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Compacting repository for agent consumption...
            </div>
          )}

          {output && stats && <CompactionResult output={output} stats={stats} />}
        </CardContent>
      </Card>

      {rateLimit && (
        <footer>
          <RateLimitDisplay remaining={rateLimit.remaining} resetTime={rateLimit.resetTime} />
        </footer>
      )}
    </div>
  );
}
