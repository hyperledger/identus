/**
 * Web platform polyfills.
 * Modern browsers provide URL, crypto.subtle, and getRandomValues natively.
 * Only Buffer needs an explicit shim when targeting web.
 *
 * Metro automatically uses polyfills.native.ts on iOS/Android, so this
 * file runs ONLY in the web build.
 */
import { Buffer } from "buffer";
if (typeof globalThis.Buffer === "undefined") {
  // @ts-ignore
  globalThis.Buffer = Buffer;
}
