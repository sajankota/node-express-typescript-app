// src/services/scraper.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { analyzeContent } from "./analyzer";

export async function scrapeContent(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        console.log(`[Debug] Fetching URL: ${url}`);
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(response.data);
        console.log(`[Debug] Successfully loaded HTML for ${url}`);

        // Extract tags and combined text
        let combinedText = "";
        const tags: { tag: string; text: string }[] = [];
        const counts: Record<string, number> = { p: 0, li: 0, div: 0, img: 0 };

        // Extract text and analyze structural tags
        const content: {
            headings: Record<string, string[]>;
            introduction: string[];
            mainContent: string[];
            listItems: string[];
            footerContent: string[];
            imageAltTexts: string[];
            links: { internal: string[]; external: string[] };
        } = {
            headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
            introduction: [],
            mainContent: [],
            listItems: [],
            footerContent: [],
            imageAltTexts: [],
            links: { internal: [], external: [] },
        };

        // Extract headings
        ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((heading) => {
            $(heading).each((_, el) => {
                content.headings[heading].push($(el).text().trim());
            });
        });

        // Extract text by tags
        ["p", "li", "div"].forEach((tag) => {
            $(tag).each((_, el) => {
                const text = $(el).text().trim();
                if (text) {
                    combinedText += ` ${text}`;
                    tags.push({ tag, text });
                    counts[tag] = (counts[tag] || 0) + 1;
                }
            });
        });

        // Extract image alt texts
        $("img").each((_, el) => {
            const altText = $(el).attr("alt");
            if (altText) {
                content.imageAltTexts.push(altText.trim());
            }
            counts.img++;
        });

        // Extract links
        $("a").each((_, el) => {
            const href = $(el).attr("href");
            if (href) {
                if (href.startsWith("/") || href.startsWith(url)) {
                    content.links.internal.push(href);
                } else {
                    content.links.external.push(href);
                }
            }
        });

        // Categorize content into introduction, mainContent, listItems, footerContent
        $("p").slice(0, 3).each((_, el) => {
            content.introduction.push($(el).text().trim());
        });

        $("p").slice(3).each((_, el) => {
            content.mainContent.push($(el).text().trim());
        });

        $("li").each((_, el) => {
            content.listItems.push($(el).text().trim());
        });

        $("footer, div").slice(-3).each((_, el) => {
            content.footerContent.push($(el).text().trim());
        });

        // Analyze combined text
        const analysis = analyzeContent(combinedText);

        return { tags, counts, combinedText, analysis, content };
    } catch (error) {
        console.error(`[Error] Failed to scrape content for ${url}:`, error);
        throw new Error("Failed to scrape the URL.");
    }
}
