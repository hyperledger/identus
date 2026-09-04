const { Buffer } = require("buffer");
const { sha1 } = require("@noble/hashes/sha1");
const { sha256 } = require("@noble/hashes/sha256");
const { sha512 } = require("@noble/hashes/sha512");

function getGlobalCrypto() {
  if (typeof globalThis.crypto !== "object" || globalThis.crypto == null) {
    globalThis.crypto = {};
  }

  return globalThis.crypto;
}

function normalizeInput(input) {
  if (input == null) {
    return new Uint8Array();
  }

  if (typeof input === "string") {
    return Buffer.from(input, "utf8");
  }

  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (input instanceof Uint8Array) {
    return input;
  }

  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  return Buffer.from(input);
}

function computeDigest(algorithm, value) {
  const normalized = algorithm.toLowerCase();

  switch (normalized) {
    case "sha1":
    case "sha-1":
      return Buffer.from(sha1(value));
    case "sha256":
    case "sha-256":
      return Buffer.from(sha256(value));
    case "sha512":
    case "sha-512":
      return Buffer.from(sha512(value));
    default:
      throw new Error(`Unsupported crypto algorithm in React Native shim: ${algorithm}`);
  }
}

function createHash(algorithm) {
  const chunks = [];

  return {
    update(value, encoding) {
      if (typeof value === "string") {
        chunks.push(Buffer.from(value, encoding || "utf8"));
      } else {
        chunks.push(Buffer.from(normalizeInput(value)));
      }

      return this;
    },
    digest(outputEncoding) {
      const data = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
      const digest = computeDigest(algorithm, data);

      if (!outputEncoding) {
        return digest;
      }

      return digest.toString(outputEncoding);
    },
  };
}

function getRandomValues(array) {
  const crypto = getGlobalCrypto();
  if (typeof crypto.getRandomValues !== "function") {
    throw new Error("crypto.getRandomValues is not available");
  }

  return crypto.getRandomValues(array);
}

function randomBytes(size) {
  const array = new Uint8Array(size);
  getRandomValues(array);
  return Buffer.from(array);
}

const subtleFallback = {
  async digest(algorithm, data) {
    return computeDigest(
      typeof algorithm === "string" ? algorithm : algorithm?.name,
      normalizeInput(data)
    );
  },
};

const crypto = getGlobalCrypto();

if (typeof crypto.getRandomValues !== "function") {
  throw new Error("crypto.getRandomValues must be polyfilled before loading crypto-shim");
}

module.exports = {
  createHash,
  getRandomValues,
  randomBytes,
  subtle: crypto.subtle ?? subtleFallback,
  webcrypto: crypto.subtle ? crypto : { ...crypto, subtle: subtleFallback },
  default: {
    createHash,
    getRandomValues,
    randomBytes,
    subtle: crypto.subtle ?? subtleFallback,
    webcrypto: crypto.subtle ? crypto : { ...crypto, subtle: subtleFallback },
  },
};
