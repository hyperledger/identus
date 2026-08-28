import { Claim } from "@/types"

export const MEDIATOR_DID = process.env.NEXT_PUBLIC_MEDIATOR_DID || "did:peer:2.Ez6LSr75gLoSwaVHS7MTzcKLXjt9onJMXY9aVEBGWY8ahWPdn.Vz6Mkw5SdxCCxRTfHx1LaGvh2e5JWPWJs7Ek6mjiPXRxqnYHT.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IudHJ1c3QwLmlkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbWVkaWF0b3IudHJ1c3QwLmlkL3dzIiwiYSI6WyJkaWRjb21tL3YyIl19fQ";

export const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY;

export const RESOLVER_URL = process.env.NEXT_PUBLIC_RESOLVER_URL;

export const RareEvoClaims: Claim[] = [
    {
        id: crypto.randomUUID(), name: "handle", value: "", type: "string"
    },
    {
        id: crypto.randomUUID(), name: "event", value: "RareEvo", type: "string"
    }
]

