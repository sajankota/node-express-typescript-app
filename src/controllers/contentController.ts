// src/controllers/contentController.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import ContentModel from "../models/ContentModel"; // Mongoose model
import readingTime from "reading-time"; // For calculating estimated reading time
import Sentiment from "sentiment"; // Sentiment analysis

const sentiment = new Sentiment();

// Hardcoded list of stopwords
const stopwords = [
    "and", "the", "of", "in", "a", "to", "is", "for", "with", "on", "that", "by",
    "this", "it", "at", "from", "as", "are", "an", "be", "or", "we", "was", "which",
    "has", "can", "if", "their", "all", "will", "one", "also", "not", "have",
    "other", "but", "our", "more", "its", "these", "you", "your", "new", "after",
    "us", "no", "any", "during", "do", "he", "she", "up", "about", "such", "out",
    "than", "into", "who", "most", "so", "s", "her", "him", "his", "my", "me",
    "they", "them", "what", "get", "like", "just", "make", "people", "time",
    "when", "how", "want", "may", "see", "even", "because", "use", "where",
    "why", "help", "much", "way", "look", "day", "think", "know",
];

/**
 * Generate n-grams (phrases of n words)
 */
function generateNGrams(words: string[], n: number): string[] {
    const nGrams: string[] = [];
    for (let i = 0; i <= words.length - n; i++) {
        const nGram = words.slice(i, i + n).join(" ");
        nGrams.push(nGram);
    }
    return nGrams;
}

/**
 * Analyze the content of the text and include n-grams
 */
function analyzeContent(text: string) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const wordCount = words.length;

    // Count word frequencies (excluding stopwords)
    const wordFrequencies: Record<string, number> = {};
    words.forEach((word) => {
        if (!stopwords.includes(word)) {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        }
    });

    // Generate n-grams (2-word, 3-word, 4-word)
    const nGramCounts: Record<string, Record<string, number>> = {
        "2-word": {},
        "3-word": {},
        "4-word": {},
    };

    [2, 3, 4].forEach((n) => {
        const nGrams = generateNGrams(words, n);
        nGrams.forEach((phrase) => {
            if (!phrase.split(" ").some((word) => stopwords.includes(word))) {
                nGramCounts[`${n}-word`][phrase] = (nGramCounts[`${n}-word`][phrase] || 0) + 1;
            }
        });
    });

    // Sentiment analysis
    const sentimentResult = sentiment.analyze(text);

    // Reading time
    const readingStats = readingTime(text);

    return {
        wordCount,
        wordFrequencies,
        nGramCounts,
        sentiment: sentimentResult,
        readingTime: readingStats.text,
    };
}

/**
 * Scrape and analyze the content of a given URL
 */
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
        const counts: Record<string, number> = { p: 0, li: 0, div: 0 };

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

        // Categorize content into introduction, mainContent, listItems, footerContent
        const content: {
            introduction: string[];
            mainContent: string[];
            listItems: string[];
            footerContent: string[];
        } = {
            introduction: [],
            mainContent: [],
            listItems: [],
            footerContent: [],
        };

        // Extract introduction (typically from the first few <p> tags)
        $("p").slice(0, 3).each((_, el) => {
            content.introduction.push($(el).text().trim());
        });

        // Extract mainContent (remaining <p> tags)
        $("p").slice(3).each((_, el) => {
            content.mainContent.push($(el).text().trim());
        });

        // Extract listItems (<li> tags)
        $("li").each((_, el) => {
            content.listItems.push($(el).text().trim());
        });

        // Extract footerContent (typically from <footer> or last <div> tags)
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

/**
 * Endpoint to scrape and analyze content
 */
export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    try {
        const { tags, counts, analysis, content } = await scrapeContent(url);

        // Save to the database
        const contentRecord = new ContentModel({ url, tags, counts, analysis, content });
        await contentRecord.save();

        // Response
        res.status(200).json({
            message: "Content extracted successfully",
            data: { tags, counts, analysis, content },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to scrape and analyze content." });
    }
};
