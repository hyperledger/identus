import { SessionState } from "@/types";

// In-memory store for demo purposes
// Use globalThis to persist the store across HMR reloads in development
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, SessionState> | undefined;
};

const sessions = globalForSessions.sessions ?? new Map<string, SessionState>();

if (process.env.NODE_ENV !== "production") {
  globalForSessions.sessions = sessions;
}

export function createSession(id: string, challenge: string): SessionState {
  const session: SessionState = {
    id,
    challenge,
    status: "pending",
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): SessionState | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<SessionState>): void {
  const session = sessions.get(id);
  if (session) {
    sessions.set(id, { ...session, ...updates });
  }
}

export function clearExpiredSessions(): void {
  const now = Date.now();
  sessions.forEach((session, id) => {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  });
}
