import { createGunzip } from 'zlib';
import { extract, type Headers } from 'tar-stream';
import { Readable } from 'stream';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface RepoFile {
  path: string;
  content: string;
}

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.turbo', 'out',
  'coverage', '.cache', '__pycache__', '.venv', 'venv', '.idea', '.vscode',
  'vendor', '.nuxt', '.output',
]);

const MAX_FILE_SIZE = 512 * 1024; // 512KB per file

export function parseGitHubUrl(url: string): GitHubRepo | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

function shouldSkipPath(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some(p => SKIP_DIRS.has(p));
}

export async function downloadRepoFiles(owner: string, repo: string): Promise<RepoFile[]> {
  // Download tarball via github.com (not the API — no rate limit)
  const tarballUrl = `https://github.com/${owner}/${repo}/archive/HEAD.tar.gz`;
  const res = await fetch(tarballUrl, { redirect: 'follow' });

  if (res.status === 404) throw new Error('REPO_NOT_FOUND');
  if (res.status === 403) throw new Error('PRIVATE_REPO');
  if (!res.ok) throw new Error('FETCH_ERROR');

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<RepoFile[]>((resolve, reject) => {
    const files: RepoFile[] = [];
    const ex = extract();

    ex.on('entry', (header: Headers, stream, next) => {
      const chunks: Buffer[] = [];

      // Strip the top-level directory (e.g., "repo-main/")
      const rawPath = header.name;
      const slashIndex = rawPath.indexOf('/');
      const filePath = slashIndex >= 0 ? rawPath.slice(slashIndex + 1) : rawPath;

      const skip = header.type !== 'file'
        || !filePath
        || shouldSkipPath(filePath)
        || (header.size ?? 0) > MAX_FILE_SIZE;

      stream.on('data', (chunk: Buffer) => {
        if (!skip) chunks.push(chunk);
      });
      stream.on('end', () => {
        if (!skip && chunks.length > 0) {
          const content = Buffer.concat(chunks).toString('utf-8');
          // Skip binary files (files with null bytes in first 8KB)
          if (!content.slice(0, 8192).includes('\0')) {
            files.push({ path: filePath, content });
          }
        }
        next();
      });
      stream.on('error', next);
    });

    ex.on('finish', () => resolve(files));
    ex.on('error', (err) => reject(err));

    const gunzip = createGunzip();
    gunzip.on('error', reject);

    const readable = Readable.from(buffer);
    readable.pipe(gunzip).pipe(ex);
  });
}
