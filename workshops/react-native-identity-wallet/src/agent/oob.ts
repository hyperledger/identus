import { Buffer } from "buffer";

/**
 * Normalize a scanned QR payload into raw OOB JSON.
 * Supports raw JSON strings and URLs with `?oob=<base64>` query parameters.
 */
export function decodeOOBOfferPayload(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("QR code payload is empty");
  }

  try {
    const url = new URL(trimmed);
    const oobParam = url.searchParams.get("oob");
    if (oobParam) {
      return Buffer.from(oobParam, "base64").toString("utf-8");
    }
  } catch {
    // Not a URL — treat as raw JSON below.
  }

  return trimmed;
}
