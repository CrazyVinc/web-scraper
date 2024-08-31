## Web Crawler

A simple web crawler created for @RTVRadio079 to ensure their website cache is rebuilt by visiting all URLs after updates. This tool helps to automatically refresh the cache by systematically crawling through the site's pages.

### How It Works

1. **Start Crawling:**
   - The crawler begins at the specified `BASE_URL` (e.g., `https://radio079.nl/`) and initiates the process of visiting each page.

2. **URL Extraction:**
   - It extracts all links from the page and resolves them into absolute URLs to follow.

3. **Configurable Depth and Requests:**
   - **Maximum Depth (`MAX_DEPTH`):** Limits how deep the crawler will go into the site's page hierarchy.
   - **Concurrent Requests (`MAX_CONCURRENT_REQUESTS`):** Controls the number of simultaneous requests to manage server load.

4. **URL Filtering:**
   - **Forbidden Patterns (`FORBIDDEN_PATTERNS`):** Excludes URLs that match specified patterns to avoid crawling irrelevant or restricted pages.

5. **Uppercase Link Detection:**
   - Identifies and logs links that end with an uppercase letter for additional processing or review.

6. **Error Handling:**
   - The crawler retries failed requests up to 10 times with exponential backoff to handle temporary network issues.

7. **Performance Monitoring:**
   - After the crawl, it reports detailed statistics including total time taken, maximum depth reached, number of failed pages, and total pages scanned.

### Usage

1. **Configure:**
   - Set up your `.env` file with the base URL, maximum depth, number of concurrent requests, and forbidden patterns.

2. **Run:**
   - Execute the crawler script to start the process.

3. **Review:**
   - Check the output for detailed statistics and logs to ensure the cache is refreshed as expected.

This crawler is specifically tailored for RTVRadio079 to keep their website cache up-to-date by ensuring all pages are visited after an update.