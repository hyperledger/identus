import { NextResponse } from "next/server";
import { getSession } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    did: session.did,
  });
}
