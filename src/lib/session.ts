const SESSION_EXPIRES_AT_KEY = 'session_expires_at';

export function setSessionExpiry(expiresInSeconds: number) {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  window.localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(expiresAt));
}

export function getSessionExpiry() {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(SESSION_EXPIRES_AT_KEY);
  if (!value) return null;

  const expiresAt = Number(value);
  if (Number.isNaN(expiresAt)) {
    window.localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
    return null;
  }

  return expiresAt;
}

export function clearSessionExpiry() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
}
