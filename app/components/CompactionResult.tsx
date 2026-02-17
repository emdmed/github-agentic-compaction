'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CompactionResultProps {
  output: string;
  stats: {
    files: number;
    rawTokens: number;
    compactedTokens: number;
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function CompactionResult({ output, stats }: CompactionResultProps) {
  const savings = stats.rawTokens > 0
    ? Math.round((1 - stats.compactedTokens / stats.rawTokens) * 100)
    : 0;

  function handleCopy() {
    navigator.clipboard.writeText(output);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compacted-codebase.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Files Indexed', value: formatNumber(stats.files) },
          { label: 'Original Tokens', value: formatNumber(stats.rawTokens) },
          { label: 'Agent Tokens', value: formatNumber(stats.compactedTokens) },
          { label: 'Token Savings', value: `${savings}%` },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <Badge variant="outline" className="mb-1 text-lg font-semibold">
                {value}
              </Badge>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Your agent can now search this compact index to find relevant files instead of reading the entire codebase.
          Paste the output into your agentic coding tool&apos;s context.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          Copy to clipboard
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          Download .md
        </Button>
      </div>

      <pre className="max-h-[500px] overflow-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
        {output}
      </pre>
    </div>
  );
}
