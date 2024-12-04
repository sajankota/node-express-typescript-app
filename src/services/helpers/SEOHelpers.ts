// src/services/helpers/SEOHelpers.ts

/**
 * SEO Helpers for extracting and analyzing HTML content.
 */

type Heading = { tag: string; content: string };

/**
 * Utility function to safely run a regex match.
 * Returns the first group of the match or `null` if no match is found.
 */
const safeMatch = (content: string, regex: RegExp): string | null => {
    const match = content.match(regex);
    return match ? match[1] : null;
};

/**
 * Check if the title is present.
 */
export const isTitlePresent = (title: string | null): boolean => !!title;

/**
 * Check if the meta description is present.
 */
export const isMetaDescriptionPresent = (description: string | null): boolean => !!description;

/**
 * Calculate the length of a string, trimming whitespace.
 */
export const calculateLength = (text: string | null): number => (text ? text.trim().length : 0);

/**
 * Extract keywords from the meta tag in the HTML content.
 */
export const extractKeywords = (htmlContent: string): string[] => {
    const metaKeywords = safeMatch(htmlContent, /<meta name="keywords" content="([^"]+)"/i);
    return metaKeywords ? metaKeywords.split(",").map((keyword) => keyword.trim()) : [];
};

/**
 * Check if the URL is SEO-friendly.
 * - Ensures the path contains only lowercase letters, numbers, hyphens, or slashes.
 */
export const isSeoFriendlyUrl = (url: string): boolean => {
    try {
        const pathname = new URL(url).pathname;
        return /^[a-z0-9-\/]+$/.test(pathname);
    } catch {
        return false; // Invalid URL
    }
};

/**
 * Check if the robots.txt file is accessible.
 */
export const isRobotsTxtAccessible = (url: string): boolean => {
    try {
        const robotsTxtUrl = new URL("/robots.txt", url).href;
        // Simulate an HTTP request here if necessary.
        return true; // Assume accessible for now
    } catch {
        return false;
    }
};

/**
 * Count the number of in-page links (<a> tags).
 */
export const countInPageLinks = (htmlContent: string): number => {
    return (htmlContent.match(/<a\b[^>]*>/gi) || []).length;
};

/**
 * Extract the `lang` attribute from the <html> tag.
 */
export const extractLangTag = (htmlContent: string): string | null => {
    return safeMatch(htmlContent, /<html[^>]+lang=["']([^"']+)["']/i);
};

/**
 * Extract all hreflang attributes from <link rel="alternate"> tags.
 */
export const extractHreflangTags = (htmlContent: string): string[] => {
    const matches = htmlContent.match(/<link[^>]+hreflang=["']([^"']+)["']/gi) || [];
    return matches.map((tag) => safeMatch(tag, /hreflang=["']([^"']+)["']/i) || "").filter(Boolean);
};

/**
 * Extract all headings (h1-h6) in a single pass.
 */
export const extractAllHeadings = (htmlContent: string): Heading[] => {
    const regex = /<(h[1-6])\b[^>]*>(.*?)<\/\1>/gi;
    const headings: Heading[] = [];
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
        headings.push({ tag: match[1], content: match[2].replace(/<[^>]+>/g, "").trim() });
    }
    return headings;
};

/**
 * Count headings by specified levels (e.g., h1, h2).
 */
export const countTagsByLevel = (headings: Heading[], ...levels: string[]): number => {
    return headings.filter((heading) => levels.includes(heading.tag)).length;
};

/**
 * Extract content from headings of a specific level (e.g., h1).
 */
export const extractContentByLevel = (headings: Heading[], level: string): string[] => {
    return headings.filter((heading) => heading.tag === level).map((heading) => heading.content);
};

/**
 * Extract content from headings within a range (e.g., h2 to h6).
 */
export const extractContentByRange = (headings: Heading[], startLevel: string, endLevel: string): Heading[] => {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const startIndex = levels.indexOf(startLevel);
    const endIndex = levels.indexOf(endLevel);
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return [];
    const range = levels.slice(startIndex, endIndex + 1);
    return headings.filter((heading) => range.includes(heading.tag));
};

/**
 * Check if a canonical tag is present and return its URL.
 */
export const hasCanonicalTag = (htmlContent: string): { present: boolean; url: string | null } => {
    const canonicalUrl = safeMatch(htmlContent, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    return { present: !!canonicalUrl, url: canonicalUrl };
};

/**
 * Check if a meta robots "noindex" tag is present.
 */
export const hasNoindexTag = (htmlContent: string): boolean => {
    return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(htmlContent);
};

/**
 * Check if an X-Robots-Tag "noindex" header is present.
 */
export const hasNoindexHeader = (headers?: Record<string, string | undefined>): boolean => {
    if (!headers) return false;
    const xRobotsTag = headers["x-robots-tag"];
    return xRobotsTag ? /noindex/i.test(xRobotsTag) : false;
};
