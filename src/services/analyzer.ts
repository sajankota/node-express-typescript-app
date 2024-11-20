// src/services/analyzer.ts

import readingTime from "reading-time";
import Sentiment from "sentiment";
import { stopwords } from "../constants/stopwords";

const sentiment = new Sentiment();

/**
 * Generate n-grams (phrases of n words)
 */
export function generateNGrams(words: string[], n: number): string[] {
    const nGrams: string[] = [];
    for (let i = 0; i <= words.length - n; i++) {
        const nGram = words.slice(i, i + n).join(" ");
        nGrams.push(nGram);
    }
    return nGrams;
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(wordFrequencies: Record<string, number>, totalWords: number) {
    const density: Record<string, string> = {};
    Object.entries(wordFrequencies).forEach(([word, count]) => {
        density[word] = ((count / totalWords) * 100).toFixed(2) + "%";
    });
    return density;
}

/**
 * Analyze the content of the text
 */
export function analyzeContent(text: string) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const wordCount = words.length;

    // Count word frequencies (excluding stopwords)
    const wordFrequencies: Record<string, number> = {};
    words.forEach((word) => {
        if (!stopwords.includes(word)) {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        }
    });

    // Generate n-grams
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

    // Calculate keyword density
    const keywordDensity = calculateKeywordDensity(wordFrequencies, wordCount);

    // Sentiment analysis
    const sentimentResult = sentiment.analyze(text);

    // Reading time
    const readingStats = readingTime(text);

    return {
        wordCount,
        wordFrequencies,
        nGramCounts,
        keywordDensity,
        sentiment: sentimentResult,
        readingTime: readingStats.text,
    };
}
