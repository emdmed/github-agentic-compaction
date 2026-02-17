'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RepoInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

const EXAMPLES = [
  'https://github.com/vercel/next-learn',
  'https://github.com/sindresorhus/slugify',
];

export default function RepoInputForm({ onSubmit, isLoading, error }: RepoInputFormProps) {
  const [url, setUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex gap-3">
        <Input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={isLoading}
          required
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? 'Compacting...' : 'Compact'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Try example repos: {EXAMPLES.map((ex, i) => (
          <span key={ex}>
            {i > 0 && ', '}
            <button
              type="button"
              onClick={() => setUrl(ex)}
              className="underline hover:text-foreground"
            >
              {ex.replace('https://github.com/', '')}
            </button>
          </span>
        ))}
      </p>
    </form>
  );
}
