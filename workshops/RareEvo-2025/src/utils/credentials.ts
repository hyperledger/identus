import SDK from "@hyperledger/identus-sdk";

/**
 * Generates a preview string of credential claims for display purposes
 * @param credential The credential to generate a preview for
 * @returns A string containing a preview of the first few claims
 */
export const getClaimsPreview = (credential: SDK.Domain.Credential): string => {
    if (!credential.claims || credential.claims.length === 0) {
        return 'No claims available';
    }

    const previewItems: string[] = [];

    // Process first claim object
    const firstClaim = credential.claims[0];
    const claimEntries = Object.entries(firstClaim)
        .filter(([key]) => key !== 'id' && key !== 'jti' && key !== 'iat') // Filter out id field

    claimEntries.forEach(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ');
        let displayValue = '';

        if (typeof value === 'string') {
            displayValue = value.length > 15 ? value.substring(0, 15) + '...' : value;
        } else if (typeof value === 'number') {
            displayValue = value.toString();
        } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                displayValue = `[${value.length} items]`;
            } else {
                // Try to extract meaningful data from object
                const obj = value as any;

                // Common patterns in credential claims
                if (obj.value !== undefined) {
                    displayValue = String(obj.value).length > 15 ? String(obj.value).substring(0, 15) + '...' : String(obj.value);
                } else if (obj.data !== undefined) {
                    displayValue = String(obj.data).length > 15 ? String(obj.data).substring(0, 15) + '...' : String(obj.data);
                } else if (obj.content !== undefined) {
                    displayValue = String(obj.content).length > 15 ? String(obj.content).substring(0, 15) + '...' : String(obj.content);
                } else if (obj.text !== undefined) {
                    displayValue = String(obj.text).length > 15 ? String(obj.text).substring(0, 15) + '...' : String(obj.text);
                } else {
                    // If it's a simple object with one key-value pair, use the value
                    const objectKeys = Object.keys(obj);
                    if (objectKeys.length === 1) {
                        const singleValue = obj[objectKeys[0]];
                        displayValue = String(singleValue).length > 15 ? String(singleValue).substring(0, 15) + '...' : String(singleValue);
                    } else if (objectKeys.length > 0) {
                        // Show first property value
                        const firstValue = obj[objectKeys[0]];
                        displayValue = String(firstValue).length > 15 ? String(firstValue).substring(0, 15) + '...' : String(firstValue);
                    } else {
                        displayValue = '[Empty Object]';
                    }
                }
            }
        } else {
            displayValue = String(value);
        }

        previewItems.push(`${displayKey}: ${displayValue}`);
    });

    return previewItems.join(', ');
};
