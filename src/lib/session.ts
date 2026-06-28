export interface AppSession {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  token: string;
  expiresAt: number;
}

const STORAGE_KEY = "tirbeo_chat_session";

export function getSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AppSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(session: AppSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function decodeSession(encoded: string): AppSession | null {
  try {
    return JSON.parse(atob(encoded)) as AppSession;
  } catch {
    return null;
  }
}
