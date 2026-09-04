import { NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/store";
import { AuthResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const authResponse: AuthResponse = await request.json();
    
    const session = getSession(authResponse.thid);
    
    if (!session) {
      console.warn(`[Auth Verify] Session not found: ${authResponse.thid}`);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "pending") {
      return NextResponse.json({ error: "Session already processed" }, { status: 400 });
    }

    // Verify the challenge matches
    if (authResponse.body.challenge !== session.challenge) {
      console.warn(`[Auth Verify] Challenge mismatch for session ${authResponse.thid}`);
      return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });
    }

    // Verify the signature
    // Requirement: If the message is encrypted it MUST be authcrypt(plaintext)
    // For this demo, we use a signed plaintext response (JWS-like)
    // In a real implementation, we would:
    // 1. Resolve the DID (authResponse.body.did)
    // 2. Get the public key
    // 3. Verify the signature over the challenge
    const isValidSignature = verifyMockSignature(authResponse.body.signature, authResponse.body.challenge);

    if (!isValidSignature) {
      console.warn(`[Auth Verify] Invalid signature for session ${authResponse.thid}`);
      updateSession(authResponse.thid, { status: "error" });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Success!
    updateSession(authResponse.thid, { 
      status: "authenticated", 
      did: authResponse.body.did 
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function verifyMockSignature(signature: string, challenge: string): boolean {
  // For demo purposes, we accept a mock signature
  // A real signature would be a JWS or similar
  return signature === `sig-${challenge}`;
}
