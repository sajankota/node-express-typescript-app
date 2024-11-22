//src/services/linkAnalyzer.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url"; // For checking if links are internal or external

interface LinkAnalysis {
    anchorText: string; // The text inside the <a> tag
    href: string; // The URL of the link
    isInternal: boolean; // Whether the link is internal or external
    nofollow: boolean; // Whether the link has the "nofollow" attribute
}

interface LinkAnalysisResult {
    links: LinkAnalysis[];
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    nofollowLinks: number;
    descriptiveAnchorTextCount: number; // Count of links with descriptive anchor text
    bestPracticesViolations: string[]; // Summary of any best practice violations
}

/**
 * Check if anchor text is descriptive (not generic like "click here").
 */
function isDescriptiveAnchorText(anchorText: string): boolean {
    const genericTerms = ["click here", "read more", "learn more", "details"];
    return !genericTerms.includes(anchorText.toLowerCase().trim());
}

/**
 * Analyze links from the given HTML content.
 */
function analyzeLinks(links: { anchorText: string; href: string; isInternal: boolean; nofollow: boolean }[]) {
    const bestPracticesViolations: string[] = [];
    const descriptiveAnchorTextCount = links.filter(
        (link) =>
            link.anchorText.length > 3 && // Minimum length for descriptive text
            !["click here", "learn more", "read more"].includes(link.anchorText.toLowerCase())
    ).length;

    links.forEach((link) => {
        if (!link.anchorText || link.anchorText.length <= 3) {
            bestPracticesViolations.push(`Non-descriptive anchor text found: '${link.anchorText}' for link: ${link.href}`);
        }
        if (!link.nofollow && !link.isInternal) {
            bestPracticesViolations.push(`External link missing 'nofollow' attribute: ${link.href}`);
        }
    });

    return {
        descriptiveAnchorTextCount,
        bestPracticesViolations,
    };
}
