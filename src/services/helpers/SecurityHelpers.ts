// src/services/helpers/SecurityHelpers.ts

/**
 * Security Helpers to analyze security-related aspects of HTML and URLs.
 */

/**
 * Check if the URL uses HTTPS.
 * - Handles edge cases where the URL might be malformed.
 */
export const isHttpsEnabled = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:";
    } catch (error) {
        console.error(`[SecurityHelpers] Invalid URL provided: ${url}`, error);
        return false; // Default to false for invalid URLs
    }
};

/**
 * Detect mixed content (HTTP and HTTPS) on the page.
 * - Efficiently uses regex once and avoids unnecessary computation.
 */
export const hasMixedContent = (htmlContent: string): boolean => {
    const httpRegex = /http:\/\//gi;
    const httpsRegex = /https:\/\//gi;

    const httpLinksFound = httpRegex.test(htmlContent); // Detect any HTTP links
    const httpsLinksFound = httpsRegex.test(htmlContent); // Detect any HTTPS links

    // Mixed content exists if both HTTP and HTTPS links are found
    return httpLinksFound && httpsLinksFound;
};

/**
 * Check if the server signature is hidden.
 * - Takes in server headers and checks for signature-revealing headers.
 */
export const isServerSignatureHidden = (serverHeaders?: Record<string, string | undefined>): boolean => {
    if (!serverHeaders) return true; // Assume hidden if no headers are provided

    // Common headers where server signature might leak
    const potentialSignatureHeaders = ["server", "x-powered-by"];
    for (const header of potentialSignatureHeaders) {
        if (serverHeaders[header]) {
            console.warn(`[SecurityHelpers] Server signature detected in header: ${header}`);
            return false;
        }
    }

    return true; // No signature found
};

/**
 * Check if HTTP Strict Transport Security (HSTS) is enabled.
 * - Looks for the "strict-transport-security" header in server response headers.
 */
export const isHstsEnabled = (serverHeaders?: Record<string, string | undefined>): boolean => {
    if (!serverHeaders) return false; // Assume disabled if no headers are provided

    const hstsHeader = serverHeaders["strict-transport-security"];
    if (hstsHeader) {
        console.info("[SecurityHelpers] HSTS is enabled:", hstsHeader);
        return true;
    }

    console.warn("[SecurityHelpers] HSTS is not enabled.");
    return false;
};
