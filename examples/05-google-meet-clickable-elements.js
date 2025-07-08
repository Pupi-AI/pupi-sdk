import PupiPuppeteerSDK, { Puppeteer } from '../src/index.js';

/**
 * This example demonstrates navigating to a Google Meet link and extracting clickable elements.
 * 1. Use the fluent Puppeteer class for local automation.
 * 2. Navigate to a specific Google Meet URL.
 * 3. Wait for the page to load, as it's a complex web application.
 * 4. Extract all clickable elements using getClickableElements.
 * 5. Log the results to the console.
 */
async function googleMeetClickableElementsExample() {
  console.log('🚀 Starting Google Meet clickable elements example...');

  const sdk = new PupiPuppeteerSDK(); // Needed for cleanup
  const browser = new Puppeteer({
    launchOptions: {
      headless: false, // Run in non-headless mode to observe the browser
    }
  });

  try {
    // --- Step 1: Navigate to Google Meet and wait for it to load ---
    console.log('➡️ Navigating to Google Meet...');
    const clickableElements = await browser
      .go({ url: 'https://meet.google.com/tbz-zoic-kam' })
      .sleep({ duration: 10000 }) // Wait for 10 seconds for the page to load fully
      .getClickableElements()
      .run();

    console.log(`✅ Extracted ${clickableElements.length} clickable elements.`);
    console.log('📊 Clickable Elements:');
    console.log(JSON.stringify(clickableElements, null, 2));

  } catch (error) {
    console.error('❌ An error occurred during the Google Meet example:', error.message);
    console.error(error.stack);
  } finally {
    // --- Step 2: Clean up ---
    await sdk.closeAllInstances();
    console.log('\n🧹 All local browser instances closed.');
  }
}

googleMeetClickableElementsExample();
