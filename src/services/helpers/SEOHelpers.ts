// src/services/helpers/SEOHelpers.ts

import { JSDOM } from "jsdom";

type DetailedHeading = { level: string; content: string; order: number };

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
 * Check if a noindex tag is present.
 */
export const hasNoindexTag = (htmlContent: string): boolean => {
    return /<meta[^>]+name=["']robots["'][^>]*content=["'].*noindex.*["']/i.test(htmlContent);
};

/**
 * Check if a noindex header is present.
 */
export const hasNoindexHeader = (headers: Record<string, string | undefined>): boolean => {
    const xRobotsTag = headers["x-robots-tag"];
    return xRobotsTag ? /noindex/i.test(xRobotsTag) : false;
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
        const path = new URL(url).pathname;
        return /^[a-z0-9-\/]+$/.test(path);
    } catch {
        return false;
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
