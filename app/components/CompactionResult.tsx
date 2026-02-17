'use client';

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
          { label: 'Files', value: formatNumber(stats.files) },
          { label: 'Original tokens', value: formatNumber(stats.rawTokens) },
          { label: 'Compacted tokens', value: formatNumber(stats.compactedTokens) },
          { label: 'Savings', value: `${savings}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="text-lg font-semibold text-card-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handleCopy} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
          Copy to clipboard
        </button>
        <button onClick={handleDownload} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
          Download .md
        </button>
      </div>

      <pre className="max-h-[500px] overflow-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
        {output}
      </pre>
    </div>
  );
}
