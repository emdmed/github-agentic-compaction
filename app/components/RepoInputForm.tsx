'use client';

import { useState } from 'react';

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
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Compacting...' : 'Compact'}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Try: {EXAMPLES.map((ex, i) => (
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
