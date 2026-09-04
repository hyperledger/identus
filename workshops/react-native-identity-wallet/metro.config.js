const { getDefaultConfig } = require("expo/metro-config");

const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  buffer: require.resolve("buffer"),
  crypto: path.resolve(__dirname, "src/crypto-shim.js"),
  events: require.resolve("events"),
  process: require.resolve("process"),
  stream: require.resolve("stream-browserify"),
  "readable-stream": require.resolve("readable-stream"),
  url: path.resolve(__dirname, "src/url-shim.js"),
};

// Disable package exports enforcement so Metro resolves legacy subpaths
// without flooding Expo Go logs with fallback warnings.
config.resolver.unstable_enablePackageExports = false;

// Include .cjs and .mjs module extensions used by the SDK
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "cjs",
  "mjs",
];

// Allow .wasm assets (Apollo cryptography fallback)
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  "wasm",
];

module.exports = config;
