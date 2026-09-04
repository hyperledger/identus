// A lightweight shim for the Node.js 'url' module to satisfy compile-time bundling for React Native.
module.exports = {
  pathToFileURL: (path) => {
    return { href: "" };
  },
  URL: typeof globalThis !== "undefined" ? globalThis.URL : undefined,
};
