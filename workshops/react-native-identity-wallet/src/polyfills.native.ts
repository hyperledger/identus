/**
 * Native platform polyfills (iOS + Android only).
 * Metro automatically picks this file over polyfills.ts on native targets.
 *
 * Import order is critical — random values must come before everything else.
 */

// 1. Secure random values from the OS CSPRNG
import "react-native-get-random-values";

// 2. WHATWG URL / URLSearchParams
import "react-native-url-polyfill/auto";

// 3. Buffer global
import { Buffer } from "buffer";
if (typeof global.Buffer === "undefined") {
  // @ts-ignore
  global.Buffer = Buffer;
}

// 4. process global
import process from "process";
if (typeof global.process === "undefined") {
  // @ts-ignore
  global.process = process;
}

// 5. Ensure a crypto object exists. Expo Go provides getRandomValues through
//    react-native-get-random-values above; deeper crypto APIs are provided via
//    the Metro "crypto" shim instead of a native JSI module.
if (typeof global.crypto === "undefined") {
  // @ts-ignore
  global.crypto = {};
}

// 6. Hermes in Expo Go does not provide WebAssembly. Some generated Identus
//    vendor code still probes for this global, so expose a harmless stub
//    instead of crashing on property access.
if (typeof global.WebAssembly === "undefined") {
  // @ts-ignore
  global.WebAssembly = {
    instantiate() {
      throw new Error("WebAssembly is not available in Expo Go");
    },
    instantiateStreaming() {
      throw new Error("WebAssembly is not available in Expo Go");
    },
    compile() {
      throw new Error("WebAssembly is not available in Expo Go");
    },
    compileStreaming() {
      throw new Error("WebAssembly is not available in Expo Go");
    },
  };
}
