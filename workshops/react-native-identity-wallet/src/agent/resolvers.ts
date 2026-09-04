import SDK from "@hyperledger/identus-sdk";
import { CLOUD_AGENT_URL, RESOLVER_URL } from "@/config";

type DidDocumentJson = {
  id?: string;
  service?: unknown[];
  verificationMethod?: unknown[];
  authentication?: unknown[];
  assertionMethod?: unknown[];
};

export function didDocumentFromJson(
  didString: string,
  didDocument: DidDocumentJson
): SDK.Domain.DIDDocument {
  const servicesProperty = new SDK.Domain.DIDDocument.Services(
    (didDocument.service ?? []) as SDK.Domain.DIDDocument.Service[]
  );
  const verificationMethodsProperty = new SDK.Domain.DIDDocument.VerificationMethods(
    (didDocument.verificationMethod ?? []) as SDK.Domain.DIDDocument.VerificationMethod[]
  );
  const coreProperties: SDK.Domain.DIDDocument.CoreProperty[] = [
    servicesProperty,
    verificationMethodsProperty,
  ];

  const verificationMethods =
    (didDocument.verificationMethod ?? []) as SDK.Domain.DIDDocument.VerificationMethod[];

  for (const verificationMethod of verificationMethods) {
    const methodId = verificationMethod.id;

    if (didDocument.assertionMethod?.find((entry) => entry === methodId)) {
      coreProperties.push(
        new SDK.Domain.DIDDocument.AssertionMethod([methodId], [verificationMethod])
      );
    }

    if (didDocument.authentication?.find((entry) => entry === methodId)) {
      coreProperties.push(
        new SDK.Domain.DIDDocument.Authentication([methodId], [verificationMethod])
      );
    }
  }

  return new SDK.Domain.DIDDocument(SDK.Domain.DID.fromString(didString), coreProperties);
}

/**
 * Resolves short-form PRISM DIDs through a local Identus Cloud Agent instance.
 */
export class CloudAgentPrismResolver extends SDK.Domain.DIDResolver {
  method = "prism";

  constructor(_apollo: SDK.Apollo) {
    super();
  }

  async resolve(didString: string): Promise<SDK.Domain.DIDDocument> {
    const base = CLOUD_AGENT_URL.replace(/\/$/, "");
    const response = await fetch(`${base}/cloud-agent/dids/${encodeURIComponent(didString)}`, {
      headers: { accept: "application/json" },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Cloud Agent DID resolution failed (${response.status})`);
    }

    const data = (await response.json()) as { didDocument: DidDocumentJson };
    return didDocumentFromJson(didString, data.didDocument);
  }
}

/**
 * Resolves PRISM DIDs through a Universal Resolver–compatible HTTP endpoint.
 */
export class UniversalPrismResolver extends SDK.Domain.DIDResolver {
  method = "prism";

  constructor(
    _apollo: SDK.Apollo,
    private readonly resolverUrl: string
  ) {
    super();
  }

  async resolve(didString: string): Promise<SDK.Domain.DIDDocument> {
    const base = this.resolverUrl.replace(/\/$/, "");
    const response = await fetch(
      `${base}/1.0/identifiers/${encodeURIComponent(didString)}`,
      {
        headers: { accept: "application/json" },
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Universal Resolver failed (${response.status})`);
    }

    const data = (await response.json()) as { didDocument?: DidDocumentJson };
    if (!data.didDocument) {
      throw new Error("Universal Resolver response did not include a DID document");
    }

    return didDocumentFromJson(didString, data.didDocument);
  }
}

/** Build Castor extra resolvers from environment configuration. */
export function buildExtraResolvers(
  _apollo: SDK.Apollo
): ConstructorParameters<typeof SDK.Castor>[1] {
  const resolvers: Array<new (apollo: SDK.Apollo) => SDK.Domain.DIDResolver> = [];

  if (RESOLVER_URL) {
    class ConfiguredUniversalResolver extends UniversalPrismResolver {
      constructor(apolloInstance: SDK.Apollo) {
        super(apolloInstance, RESOLVER_URL!);
      }
    }
    resolvers.push(ConfiguredUniversalResolver);
  } else if (CLOUD_AGENT_URL) {
    resolvers.push(CloudAgentPrismResolver);
  }

  return resolvers as ConstructorParameters<typeof SDK.Castor>[1];
}
