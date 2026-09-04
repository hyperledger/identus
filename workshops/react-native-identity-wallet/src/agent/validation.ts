const BIP39_WORD_COUNT = 24;

/** Normalize user input into a 24-word BIP39 mnemonic array. */
export function parseMnemonicPhrase(input: string): string[] {
  const words = input
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length !== BIP39_WORD_COUNT) {
    throw new Error(`Recovery phrase must contain exactly ${BIP39_WORD_COUNT} words`);
  }

  return words;
}
