import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createSession } from "@/lib/store";
import { AuthRequest } from "@/types";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const sessionId = uuidv4();
  const challenge = uuidv4(); // In reality, this should be a cryptographically secure random value
  
  createSession(sessionId, challenge);

  const authRequest: AuthRequest & { signature?: string } = {
    id: sessionId,
    type: "https://lace.io/auth/1.0/request",
    body: {
      challenge,
      callback_url: `${origin}/api/auth/verify`,
      scope: ["did:read", "profile:read"],
    },
    from: "did:web:identus.io:auth-server", // Mock server DID
    signature: "mock-server-signature", // Requirement: If OOB, MUST be signed
  };

  // Create an Out-of-Band (OOB) message
  // For simplicity, we just base64 encode the JSON request
  const oobData = Buffer.from(JSON.stringify(authRequest)).toString("base64");
  const oobUrl = `didcomm://auth?_oob=${oobData}`;

  return NextResponse.json({
    sessionId,
    oobUrl,
    authRequest
  });
}
