declare module 'agentic-compaction' {
  export function compactFile(filePath: string, content: string): { skeleton: unknown; formatted: string };
  export function compactProject(rootPath: string, options?: Record<string, unknown>): unknown;
  export function estimateTokens(text: string): number;
  export function formatTokenCount(count: number): string;
  export function isBabelParseable(path: string): boolean;
  export function isPythonParseable(path: string): boolean;
}
