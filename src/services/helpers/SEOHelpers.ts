// src/services/helpers/SEOHelpers.ts

import { JSDOM } from "jsdom";
import fetch from "cross-fetch";


type DetailedHeading = { level: string; content: string; order: number };

/**
 * Extract the first <title> tag from HTML content.
 * Handles attributes inside the <title> tag.
 */
export const extractFirstTitleTag = (htmlContent: string): string | null => {
    console.debug("[extractFirstTitleTag] HTML Content Snippet:", htmlContent.slice(0, 500)); // Debug snippet
    // Update regex to handle attributes inside the <title> tag
    const match = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const extractedTitle = match ? match[1].trim() : null;
    console.debug("[extractFirstTitleTag] Extracted Title:", extractedTitle); // Debug extracted title
    return extractedTitle;
};


/**
 * Extract meta description content from HTML content.
 */
export const extractMetaDescription = (htmlContent: string): string | null => {
    console.debug("[extractMetaDescription] HTML Content Snippet:", htmlContent.slice(0, 500));

    // Updated regex to handle multi-line content and robust attribute matching
    const metaRegex = /<meta[^>]+name=["']description["'][^>]*content=(["'])([\s\S]*?)\1|<meta[^>]+content=(["'])([\s\S]*?)\3[^>]*name=["']description["']/i;

    // Match the meta description tag and capture the full content
    const match = htmlContent.match(metaRegex);

    // Extract the description from the correct group and normalize spaces
    const extractedDescription = match
        ? (match[2] || match[4]).replace(/[\s\n\r]+/g, " ").trim() // Replace excessive spaces and line breaks
        : null;

    console.debug("[extractMetaDescription] Extracted Meta Description:", extractedDescription);

    return extractedDescription;
};


/**
 * Analyze heading issues.
 */
export const analyzeHeadingIssues = (headings: DetailedHeading[], title: string | null) => ({
    multipleH1Tags: headings.filter((h) => h.level === "h1").length > 1,
    missingH1Tag: headings.filter((h) => h.level === "h1").length === 0,
    h1MatchesTitle: headings.some(
        (h) => h.level === "h1" && h.content.trim() === (title?.trim() || "")
    ),
    sequence: {
        hasIssues: detectHeadingSequenceIssues(headings),
        skippedLevels: getSkippedHeadingLevels(headings),
    },
    invalidTextLength: getInvalidHeadingTextLengths(headings),
    duplicateHeadings: getDuplicateHeadings(headings),
});


/**
 * Extract all heading tags (h1 to h6) with their details: level, content, and order of occurrence.
 */
export const extractAllHeadingsWithDetails = (htmlContent: string): DetailedHeading[] => {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const headingTags: DetailedHeading[] = [];
    let order = 0;

    try {
        for (let level = 1; level <= 6; level++) {
            const headings = document.querySelectorAll(`h${level}`);
            headings.forEach((heading) => {
                order++;
                headingTags.push({
                    level: `h${level}`,
                    content: heading.textContent?.trim() || "",
                    order,
                });
            });
        }
    } catch (error) {
        console.error("[SEOHelpers] Error extracting headings:", error);
    }

    return headingTags;
};

/**
 * Count heading tag levels.
 */
export const countHeadingTagLevels = (headingTags: DetailedHeading[]) => ({
    h1: headingTags.filter((tag) => tag.level === "h1").length,
    h2: headingTags.filter((tag) => tag.level === "h2").length,
    h3: headingTags.filter((tag) => tag.level === "h3").length,
    h4: headingTags.filter((tag) => tag.level === "h4").length,
    h5: headingTags.filter((tag) => tag.level === "h5").length,
    h6: headingTags.filter((tag) => tag.level === "h6").length,
});

/**
 * Detect heading sequence issues.
 */
export const detectHeadingSequenceIssues = (headings: DetailedHeading[]): boolean => {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    let lastLevelIndex = -1;

    for (const heading of headings) {
        const currentLevelIndex = levels.indexOf(heading.level);
        if (currentLevelIndex > lastLevelIndex + 1) {
            return true;
        }
        lastLevelIndex = currentLevelIndex;
    }

    return false;
};

/**
 * Get skipped heading levels.
 */
export const getSkippedHeadingLevels = (headings: DetailedHeading[]): string[] => {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const presentLevels = new Set(headings.map((heading) => heading.level));
    return levels.filter((level) => !presentLevels.has(level));
};

/**
 * Identify invalid heading text lengths.
 */
export const getInvalidHeadingTextLengths = (headings: DetailedHeading[]) => {
    const tooShort = headings.filter((heading) => heading.content.length < 5).map((h) => h.content);
    const tooLong = headings.filter((heading) => heading.content.length > 70).map((h) => h.content);
    return { tooShort, tooLong };
};

/**
 * Find duplicate headings.
 */
export const getDuplicateHeadings = (headings: DetailedHeading[]): string[] => {
    const headingContents = headings.map((heading) => heading.content);
    return headingContents.filter((content, index, self) => self.indexOf(content) !== index);
};

/**
 * Check if robots.txt is accessible.
 */
export const isRobotsTxtAccessible = (url: string): boolean => {
    try {
        const robotsTxtUrl = new URL("/robots.txt", url).href;
        return true; // Simulate accessible robots.txt for now
    } catch {
        return false;
    }
};

/**
 * Extract hreflang tags.
 */
export const extractHreflangTags = (htmlContent: string): string[] => {
    const matches = htmlContent.match(/<link[^>]+hreflang=["']([^"']+)["']/gi) || [];
    return matches.map((tag) => {
        const match = tag.match(/hreflang=["']([^"']+)["']/);
        return match ? match[1] : "";
    }).filter(Boolean);
};

/**
 * Check if a canonical tag is present and extract the URL.
 */
export const hasCanonicalTag = (htmlContent: string): { present: boolean; url: string | null } => {
    const match = htmlContent.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    return { present: !!match, url: match ? match[1] : null };
};


/**
 * Check if a noindex tag is present in the HTML content.
 * This function ensures the `meta` tag with `name="robots"` contains the `noindex` directive.
 *
 * @param htmlContent - The HTML content of the webpage as a string.
 * @returns `true` if a noindex tag is found, `false` otherwise.
 */
export const hasNoindexTag = (htmlContent: string): boolean => {
    if (!htmlContent) {
        console.warn("[hasNoindexTag] Empty HTML content provided.");
        return false;
    }

    try {
        // Regular expression to match <meta name="robots" content="...noindex...">
        const noindexMetaRegex = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i;
        return noindexMetaRegex.test(htmlContent);
    } catch (error) {
        console.error("[hasNoindexTag] Error while checking for noindex meta tag:", error);
        return false;
    }
};

/**
 * Check if a noindex header is present in the HTTP headers.
 * This function checks the `X-Robots-Tag` header for the `noindex` directive.
 *
 * @param headers - The HTTP headers of the response as a record.
 * @returns `true` if the `X-Robots-Tag` header contains `noindex`, `false` otherwise.
 */
export const hasNoindexHeader = (headers: Record<string, string | undefined>): boolean => {
    if (!headers || typeof headers !== "object") {
        console.warn("[hasNoindexHeader] Invalid or empty headers provided.");
        return false;
    }

    try {
        const xRobotsTag = headers["x-robots-tag"];
        return xRobotsTag ? /(^|\s)noindex(\s|$)/i.test(xRobotsTag) : false;
    } catch (error) {
        console.error("[hasNoindexHeader] Error while checking for noindex header:", error);
        return false;
    }
};

/**
 * Extract keywords from meta tags.
 */
export const extractKeywords = (htmlContent: string): string[] => {
    const match = htmlContent.match(/<meta[^>]+name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    return match ? match[1].split(",").map((keyword) => keyword.trim()) : [];
};

/**
 * Check if a URL is SEO-friendly.
 */
export const isSeoFriendlyUrl = (url: string): boolean => {
    try {
        // Parse URL and extract pathname
        const { pathname } = new URL(url);

        // SEO-friendly URL regex:
        // - Allows lowercase letters, numbers, hyphens, and slashes
        // - Prevents leading/trailing hyphens or slashes (e.g., `/example-/` is invalid)
        // - Avoids consecutive slashes (e.g., `//`)
        const seoFriendlyRegex = /^(\/[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/;

        // Check if pathname matches the regex
        const isPathValid = seoFriendlyRegex.test(pathname);

        // Ensure pathname length is within a reasonable range
        const isLengthValid = pathname.length >= 3 && pathname.length <= 2048;

        return isPathValid && isLengthValid;
    } catch (error) {
        console.error(`[SEOHelpers] Invalid URL provided: ${url}`, error);
        return false;
    }
};

/**
 * Check if the given URL has a 404 error page.
 * This function handles cases where the server might redirect or fail to return a proper 404 status.
 */
export const has404ErrorPage = async (url: string): Promise<boolean> => {
    try {
        // Perform a GET request to ensure the server doesn't mask 404 with redirects or custom handling
        const response = await fetch(url, { method: "GET", redirect: "manual" });

        // Check the status code
        if (response.status === 404) {
            return true; // Explicitly returned 404
        }

        // If status code is 3xx (redirect) or 200, check the response body for indications of a 404 page
        if (response.status >= 200 && response.status < 400) {
            const text = await response.text();
            return /404/i.test(text) || /page not found/i.test(text);
        }

        // For other status codes (e.g., 500), assume not a valid 404
        return false;
    } catch (error) {
        console.error(`[SEOHelpers] Error checking 404 page for URL: ${url}`, error);
        return false; // Assume no 404 if fetch fails
    }
};


/**
 * Count in-page links.
 */
export const countInPageLinks = (htmlContent: string): number => {
    return (htmlContent.match(/<a\b[^>]*>/gi) || []).length;
};

/**
 * Extract lang tag from HTML.
 */
export const extractLangTag = (htmlContent: string): string | null => {
    const match = htmlContent.match(/<html[^>]+lang=["']([^"']+)["']/i);
    return match ? match[1] : null;
};
