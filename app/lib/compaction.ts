import { compactFile, estimateTokens, isBabelParseable, isPythonParseable } from 'agentic-compaction';
import { downloadRepoFiles } from './github';

const MAX_FILES = 200;

export interface CompactionResult {
  output: string;
  stats: {
    files: number;
    rawTokens: number;
    compactedTokens: number;
  };
}

function isParseable(path: string): boolean {
  return isBabelParseable(path) || isPythonParseable(path);
}

export async function compactGitHubRepo(owner: string, repo: string): Promise<CompactionResult> {
  const allFiles = await downloadRepoFiles(owner, repo);
  const parseableFiles = allFiles.filter(f => isParseable(f.path));

  if (parseableFiles.length > MAX_FILES) {
    throw new Error('TOO_MANY_FILES');
  }

  const lines: string[] = [];
  let rawTokens = 0;
  let compactedTokens = 0;
  let filesProcessed = 0;

  for (const file of parseableFiles) {
    rawTokens += estimateTokens(file.content);
    const result = compactFile(file.path, file.content);
    if (result.formatted) {
      lines.push(`## ${file.path}`);
      lines.push(result.formatted);
      lines.push('');
      compactedTokens += estimateTokens(result.formatted);
      filesProcessed++;
    }
  }

  return {
    output: lines.join('\n'),
    stats: {
      files: filesProcessed,
      rawTokens,
      compactedTokens,
    },
  };
}
