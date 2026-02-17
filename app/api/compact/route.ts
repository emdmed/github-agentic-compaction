import { NextRequest, NextResponse } from 'next/server';
import { compactGitHubRepo } from '@/app/lib/compaction';
import { checkRateLimit, incrementRateLimit } from '@/app/lib/rate-limit';
import { parseGitHubUrl } from '@/app/lib/github';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const { allowed, remaining, resetTime } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED', rateLimit: { remaining: 0, resetTime } },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)) } }
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_URL' }, { status: 400 });
  }

  const parsed = parseGitHubUrl(body.url || '');
  if (!parsed) {
    return NextResponse.json({ error: 'Please enter a valid GitHub repository URL', code: 'INVALID_URL' }, { status: 400 });
  }

  try {
    const result = await compactGitHubRepo(parsed.owner, parsed.repo);
    incrementRateLimit(ip);
    const updated = checkRateLimit(ip);

    return NextResponse.json({
      output: result.output,
      stats: result.stats,
      rateLimit: { remaining: updated.remaining, resetTime: updated.resetTime },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    const errorMap: Record<string, { status: number; error: string }> = {
      REPO_NOT_FOUND: { status: 404, error: 'Repository not found. Is it public?' },
      PRIVATE_REPO: { status: 403, error: 'This app only supports public repositories' },
      TOO_MANY_FILES: { status: 413, error: 'Repository has too many parseable files (>700). Try a smaller repo.' },
      FETCH_ERROR: { status: 502, error: 'Failed to fetch repository. Please try again.' },
    };

    const mapped = errorMap[message];
    if (mapped) {
      return NextResponse.json({ error: mapped.error, code: message }, { status: mapped.status });
    }

    return NextResponse.json({ error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
