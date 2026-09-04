export const MEDIATOR_DID =
  process.env.EXPO_PUBLIC_MEDIATOR_DID ??
  "did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ";

export const CLOUD_AGENT_URL =
  process.env.EXPO_PUBLIC_CLOUD_AGENT_URL ?? "http://localhost:8085";

export const RESOLVER_URL = process.env.EXPO_PUBLIC_RESOLVER_URL;

export const STORAGE_KEYS = {
  MNEMONICS: "identus.mnemonics",
} as const;
