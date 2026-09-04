export interface AuthRequest {
  id: string;
  type: "https://lace.io/auth/1.0/request";
  body: {
    challenge: string;
    callback_url: string;
    scope?: string[];
  };
  from: string;
  signature?: string;
}

export interface AuthResponse {
  id: string;
  type: "https://lace.io/auth/1.0/msg";
  thid: string;
  body: {
    challenge: string;
    signature: string;
    did: string;
  };
  from: string;
}

export interface SessionState {
  id: string;
  challenge: string;
  status: "pending" | "authenticated" | "error";
  did?: string;
  expiresAt: number;
}
