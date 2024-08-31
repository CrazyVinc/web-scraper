import dotenv from 'dotenv';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';
import url from 'url';

import convertToMilliseconds from './src/convertToMilliseconds.js';

dotenv.config();

const baseUrl = process.env.BASE_URL;
const maxConcurrentRequests = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 5;
const maxDepth = parseInt(process.env.MAX_DEPTH, 10);
const rawForbiddenPatterns = process.env.FORBIDDEN_PATTERNS || '[]';
const forbiddenPatterns = JSON.parse(rawForbiddenPatterns).map(pattern =>  new URL(pattern, baseUrl).href);

const timeout = convertToMilliseconds(process.env.MAX_TIMEOUT);
const visitedUrls = new Set();
let activeRequests = 0;
let pendingUrls = [];
const linksWithUppercaseEnding = [];

let startTime;
let endTime;
let failedPages = 0;

function isForbidden(link) {
    return forbiddenPatterns.some(pattern => link.startsWith(pattern));
}

axiosRetry(axios, {
    retries: parseInt(process.env.RETRIES, 10) || 3,
    retryDelay: (retryCount) => {
        console.log(`Retry attempt #${retryCount}`);
        return retryCount * (5 * 1000);
    },
    retryCondition: (error) => true
});

async function crawl(currentUrl, depth = 0) {
    if (visitedUrls.has(currentUrl) || (maxDepth > 0 && depth > maxDepth)) return;

    visitedUrls.add(currentUrl);
    activeRequests++;

    console.log(`Crawling: ${currentUrl} | Depth: ${depth} | Active Requests: ${activeRequests} | Queue: ${pendingUrls.length}`);

    try {
        const response = await axios.get(currentUrl, { timeout });
        const html = response.data;
        const $ = cheerio.load(html);

        const links = $('a[href]').map((i, link) => url.resolve(baseUrl, $(link).attr('href'))).get();

        console.log(`Found ${links.length} links on ${currentUrl}`);

        for (const link of links) {
            if (/[A-Z]$/.test(link)) linksWithUppercaseEnding.push({ link, foundOn: currentUrl });

            if (link.startsWith(baseUrl) && !visitedUrls.has(link) && !isForbidden(link)) {
                if (maxDepth === 0 || depth + 1 <= maxDepth) {
                    pendingUrls.push({ link, depth: depth + 1 });
                    console.log(`Added ${link} to queue with depth ${depth + 1}`);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to crawl ${currentUrl}: ${error.message}`);
        failedPages++;
    } finally {
        activeRequests--;
        processQueue();
    }
}

function processQueue() {
    while (activeRequests < maxConcurrentRequests && pendingUrls.length > 0) {
        const { link: nextUrl, depth } = pendingUrls.shift();
        crawl(nextUrl, depth);
    }

    if (activeRequests === 0 && pendingUrls.length === 0) {
        endTime = new Date();
        showStats();
    }
}

function showStats() {
    const timeTaken = (endTime - startTime) / 1000;
    const stats = {
        'Total Time (s)': timeTaken,
        'Max Depth': maxDepth === 0 ? 'Unlimited' : maxDepth,
        'Failed Pages': failedPages,
        'Total Pages Scanned': visitedUrls.size,
        'Links with Uppercase Ending': linksWithUppercaseEnding.length
    };

    console.table(stats);

    console.log('Links ending with an uppercase letter and where they were found:');
    linksWithUppercaseEnding.forEach(({ link, foundOn }) => {
        console.log(`Link: ${link} | Found On: ${foundOn}`);
    });
}

startTime = new Date();
crawl(baseUrl, 0).then(() => {
    processQueue();
}).catch(err => {
    console.error(`Crawling failed: ${err.message}`);
});
