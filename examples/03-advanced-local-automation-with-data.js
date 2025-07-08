import PupiPuppeteerSDK, { Puppeteer } from '../src/index.js';

/**
 * This example demonstrates advanced local automation using the fluent Puppeteer class.
 * 1. Use the chainable API to navigate and extract a list of links from a page.
 * 2. Process the extracted data locally.
 * 3. Loop through the extracted links, navigate to each one, and extract more data (the page title).
 * 4. This showcases a common web scraping pattern: list > detail.
 */
async function advancedLocalAutomation() {
  console.log('🚀 Starting advanced local automation example...');

  const sdk = new PupiPuppeteerSDK(); // Needed for cleanup
  const browser = new Puppeteer(); // Create a single browser instance for the entire task

  try {
    // --- Step 1: Navigate to a list page and extract all links ---
    console.log('➡️ Navigating to link list page and extracting links...');
    const links = await browser
      .go({ url: 'https://httpbin.org/links/10/0' })
      .waitForSelector({ selector: 'a' })
      .evaluate({
        fn: `
          () => {
            const anchors = document.querySelectorAll('a');
            return Array.from(anchors).map(a => a.href);
          }
        `
      })
      .run(); // This executes the queued actions and returns the result of the last one (evaluate)

    console.log(`✅ Extracted ${links.length} links.`);
    console.log(links);

    // --- Step 2: Loop through each link and get its page title ---
    console.log('\n➡️ Processing each link to get its title...');
    const results = [];

    for (const link of links) {
      console.log(`  - Navigating to: ${link}`);
      const title = await browser
        .go({ url: link })
        .evaluate({ fn: '() => document.title' })
        .run();
      
      console.log(`    ✔️ Title: ${title}`);
      results.push({ link, title });
    }

    console.log('\n✅ Finished processing all links!');
    console.log('📊 Final Results:');
    console.table(results);

  } catch (error) {
    console.error('❌ An error occurred during the advanced automation example:', error.message);
    console.error(error.stack);
  } finally {
    // --- Step 3: Clean up ---
    // Ensure all local browser instances are closed.
    await sdk.closeAllInstances();
    console.log('\n🧹 All local browser instances closed.');
  }
}

advancedLocalAutomation();
