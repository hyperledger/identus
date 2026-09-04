import SDK from "@hyperledger/identus-sdk";
import { MEDIATOR_DID } from "@/config";
import { buildExtraResolvers } from "@/agent/resolvers";
import { decodeOOBOfferPayload } from "@/agent/oob";
import { parseMnemonicPhrase } from "@/agent/validation";
import { InMemoryPlutoStore } from "@/storage/InMemoryPlutoStore";
import { AsyncStoragePlutoStore } from "@/storage/AsyncStoragePlutoStore";

export type AgentState = SDK.Domain.Startable.State;
export const AgentState = SDK.Domain.Startable.State;

const USE_PERSISTENT_STORAGE =
  process.env.EXPO_PUBLIC_PERSISTENT_STORAGE !== "false";

async function createPlutoStore(apollo: SDK.Apollo): Promise<{
  store: SDK.Pluto.Store;
  pluto: SDK.Pluto;
}> {
  const store = USE_PERSISTENT_STORAGE
    ? new AsyncStoragePlutoStore()
    : new InMemoryPlutoStore();

  await store.start?.();

  const pluto = new SDK.Pluto(store, apollo);
  return { store, pluto };
}

/**
 * Create and start an Identus agent.
 *
 * Storage defaults to AsyncStorage-backed Pluto for persistence across restarts.
 * Set EXPO_PUBLIC_PERSISTENT_STORAGE=false to use in-memory storage (demos only).
 */
export async function createAgent(seed?: SDK.Domain.Seed): Promise<{
  agent: SDK.Agent;
  apollo: SDK.Apollo;
  pluto: SDK.Pluto;
  store: SDK.Pluto.Store;
  startError: unknown | null;
}> {
  const apollo = new SDK.Apollo();
  const { store, pluto } = await createPlutoStore(apollo);
  const castor = new SDK.Castor(apollo, buildExtraResolvers(apollo));

  const resolvedSeed = seed ?? apollo.createRandomSeed().seed;

  const agent = await SDK.Agent.initialize({
    apollo,
    castor,
    mediatorDID: SDK.Domain.DID.fromString(MEDIATOR_DID),
    pluto,
    seed: resolvedSeed,
  });

  let startError: unknown | null = null;
  try {
    await agent.start();
  } catch (error) {
    startError = error;
  }

  return { agent, apollo, pluto, store, startError };
}

/**
 * Create a new random seed and return both the seed and its BIP39 mnemonic
 * words for backup. The mnemonic must be shown to the user and stored securely.
 */
export function generateSeed(apollo: SDK.Apollo): {
  seed: SDK.Domain.Seed;
  mnemonics: string[];
} {
  return apollo.createRandomSeed();
}

/**
 * Reconstruct a seed from a BIP39 mnemonic phrase (for wallet recovery).
 */
export function seedFromMnemonics(
  apollo: SDK.Apollo,
  mnemonics: string[]
): SDK.Domain.Seed {
  return apollo.createSeed(mnemonics as SDK.Domain.MnemonicWordList);
}

export { parseMnemonicPhrase, decodeOOBOfferPayload };

/**
 * Create a new PRISM DID for the wallet.
 */
export async function createPrismDID(
  agent: SDK.Agent,
  alias: string
): Promise<SDK.Domain.DID> {
  const task = new SDK.Tasks.CreatePrismDID({
    authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
    services: [],
    alias,
  });
  return agent.runTask(task);
}

/**
 * Parse an OOB (Out-of-Band) credential offer JSON string and return a
 * CredentialOffer message ready to be accepted by the holder agent.
 */
export function parseOOBOffer(
  oobJson: string,
  holderPeerDID: SDK.Domain.DID
): SDK.Domain.Message {
  const message = SDK.Domain.Message.fromJson(oobJson);
  const attachment = message.attachments.at(0)?.payload;
  if (!attachment) {
    throw new Error("OOB offer has no attachments");
  }
  return SDK.Domain.Message.fromJson({
    ...attachment,
    from: message.from,
    to: holderPeerDID,
  });
}

/**
 * Accept a credential offer: request the credential and send the request
 * message to the issuer via the mediator.
 */
export async function acceptCredentialOffer(
  agent: SDK.Agent,
  rawInput: string
): Promise<void> {
  const oobJson = decodeOOBOfferPayload(rawInput);
  const peerDID = await agent.createNewPeerDID();
  const credentialOffer = parseOOBOffer(oobJson, peerDID);
  const credentialOfferMessage = SDK.OfferCredential.fromMessage(credentialOffer);
  const requestCredential = await agent.handle(
    credentialOfferMessage.makeMessage()
  );
  await agent.send(requestCredential.makeMessage());
}

/**
 * Respond to a presentation request with the first credential that matches.
 */
export async function acceptPresentationRequest(
  agent: SDK.Agent,
  requestMessage: SDK.Domain.Message,
  credential: SDK.Domain.Credential
): Promise<void> {
  const requestPresentation = SDK.RequestPresentation.fromMessage(requestMessage);
  const task = new SDK.Tasks.CreatePresentation({
    request: requestPresentation,
    credential,
  });
  const presentation = await agent.runTask(task);
  await agent.send(presentation.makeMessage());
}
