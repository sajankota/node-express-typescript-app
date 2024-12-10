// src/services/helpers/SecurityHelpers.ts


/**
 * Security Helpers to analyze security-related aspects of HTML and URLs.
 */

/**
 * Check if the URL uses HTTPS.
 * - Handles edge cases where the URL might be malformed or undefined.
 * - Logs detailed errors for debugging.
 * 
 * @param url - The URL string to check.
 * @returns `true` if the URL uses HTTPS, otherwise `false`.
 */
export const isHttpsEnabled = (url: string): boolean => {
    if (!url || typeof url !== "string") {
        console.error(`[SecurityHelpers] Invalid input: URL is not a valid string. Received: ${url}`);
        return false; // Return false for empty or invalid input
    }

    try {
        const parsedUrl = new URL(url.trim()); // Trim whitespace to handle poorly formatted URLs
        const isHttps = parsedUrl.protocol === "https:";

        // Optional: Log a warning for HTTP URLs
        if (!isHttps) {
            console.warn(`[SecurityHelpers] URL is not using HTTPS: ${url}`);
        }

        return isHttps;
    } catch (error) {
        console.error(`[SecurityHelpers] Failed to parse URL: ${url}`, error);
        return false; // Return false for malformed URLs
    }
};


/**
 * Detect mixed content (HTTP and HTTPS) on the page.
 * - Handles edge cases like empty or invalid HTML content.
 * - Efficiently checks for mixed HTTP and HTTPS links with early exit optimization.
 *
 * @param htmlContent - The HTML content of the page as a string.
 * @returns `true` if mixed content is detected, otherwise `false`.
 */
export const hasMixedContent = (htmlContent: string): boolean => {
    // Validate the input
    if (!htmlContent || typeof htmlContent !== "string") {
        console.error("[MixedContentChecker] Invalid HTML content provided.");
        return false; // Return false for empty or invalid input
    }

    // Optimize for performance: Use one regex to detect both HTTP and HTTPS
    const mixedContentRegex = /(http:\/\/)|(https:\/\/)/gi;

    // Flags to track HTTP and HTTPS links
    let httpLinksFound = false;
    let httpsLinksFound = false;

    // Check for mixed content using regex and early exit
    for (const match of htmlContent.matchAll(mixedContentRegex)) {
        if (match[1]) httpLinksFound = true; // Found an HTTP link
        if (match[2]) httpsLinksFound = true; // Found an HTTPS link

        // If both are found, we have mixed content - exit early
        if (httpLinksFound && httpsLinksFound) {
            return true;
        }
    }

    // Mixed content exists only if both HTTP and HTTPS links are found
    return false;
};


/**
 * Check if the server signature is hidden.
 * - Examines common headers where server signature information might be exposed.
 * - Handles edge cases gracefully.
 *
 * @param serverHeaders - A record of HTTP response headers (key-value pairs).
 * @returns `true` if the server signature is hidden, otherwise `false`.
 */
export const isServerSignatureHidden = (serverHeaders?: Record<string, string | undefined>): boolean => {
    // Return `true` if no headers are provided, assuming no signature is exposed.
    if (!serverHeaders || typeof serverHeaders !== "object") {
        console.warn("[SecurityHelpers] No server headers provided. Assuming server signature is hidden.");
        return true;
    }

    // List of headers commonly associated with server signature exposure
    const signatureHeaders = ["server", "x-powered-by", "via"];

    // Check for the presence of any signature-related headers
    const exposedHeaders = signatureHeaders.filter((header) => serverHeaders[header]);

    if (exposedHeaders.length > 0) {
        console.warn(`[SecurityHelpers] Server signature detected in headers: ${exposedHeaders.join(", ")}`);
        return false; // Signature detected
    }

    // If none of the signature headers are found, assume the signature is hidden
    return true;
};


/**
 * Check if HTTP Strict Transport Security (HSTS) is enabled.
 * - Validates the presence of the "strict-transport-security" header in server response headers.
 * - Handles edge cases like empty or malformed headers.
 *
 * @param serverHeaders - A record of HTTP response headers (key-value pairs).
 * @returns `true` if HSTS is enabled, otherwise `false`.
 */
export const isHstsEnabled = (serverHeaders?: Record<string, string | undefined>): boolean => {
    // Return false if no headers are provided or if the headers are not an object
    if (!serverHeaders || typeof serverHeaders !== "object") {
        console.warn("[SecurityHelpers] No server headers provided. Assuming HSTS is not enabled.");
        return false;
    }

    // Check for the "strict-transport-security" header
    const hstsHeader = serverHeaders["strict-transport-security"];
    if (hstsHeader) {
        // Log the exact header value for debugging purposes
        console.info(`[SecurityHelpers] HSTS is enabled with the following directive: "${hstsHeader}"`);
        return true;
    }

    // If the header is not present, assume HSTS is disabled
    console.warn("[SecurityHelpers] HSTS is not enabled. 'strict-transport-security' header not found.");
    return false;
};

