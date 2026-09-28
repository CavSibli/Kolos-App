/**
 * Validates post-login redirect targets.
 * Only same-origin relative paths under /app or /admin are allowed.
 */
export function safeNext(
  raw: string | null | undefined,
  fallback = '/app',
): string {
  if (!raw) {
    return fallback;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith('/')) {
    return fallback;
  }
  if (decoded.startsWith('//') || decoded.includes('://')) {
    return fallback;
  }
  if (!(decoded.startsWith('/app') || decoded.startsWith('/admin'))) {
    return fallback;
  }

  return decoded;
}

export function loginPathWithNext(nextPath: string): string {
  const safe = safeNext(nextPath);
  if (safe === '/app') {
    return '/login';
  }
  return `/login?next=${encodeURIComponent(safe)}`;
}
