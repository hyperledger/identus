import SDK from "@hyperledger/identus-edge-agent-sdk";

export class ShortFormDIDResolverSample implements SDK.Domain.DIDResolver {
    method: string = "prism"

    async resolve(didString: string): Promise<SDK.Domain.DIDDocument> {
        const url = "http://localhost:8000/cloud-agent/dids/" + didString;
        const response = await fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-gpc": "1"
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        })
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const didDocument = data.didDocument;

        const servicesProperty = new SDK.Domain.Services(
            didDocument.service
        )
        const verificationMethodsProperty = new SDK.Domain.VerificationMethods(
            didDocument.verificationMethod
        )
        const coreProperties: SDK.Domain.DIDDocumentCoreProperty[] = [];
        const authenticate: SDK.Domain.Authentication[] = [];
        const assertion: SDK.Domain.AssertionMethod[] = [];

        for (const verificationMethod of didDocument.verificationMethod) {
            const isAssertion = didDocument.assertionMethod.find((method) => method === verificationMethod.id)
            if (isAssertion) {
                assertion.push(new SDK.Domain.AssertionMethod([isAssertion], [verificationMethod]))
            }
            const isAuthentication = didDocument.authentication.find((method) => method === verificationMethod.id)
            if (isAuthentication) {
                authenticate.push(new SDK.Domain.Authentication([isAuthentication], [verificationMethod]));
            }
        }

        coreProperties.push(...authenticate);
        coreProperties.push(servicesProperty);
        coreProperties.push(verificationMethodsProperty);

        const resolved = new SDK.Domain.DIDDocument(
            SDK.Domain.DID.fromString(didString),
            coreProperties
        );

        return resolved;
    }
}
