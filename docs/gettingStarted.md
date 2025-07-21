# Getting Started

## Installation

```bash
npm install pupi-sdk
```

## Basic Usage

### 1. Simple Local Automation

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

// A simple automation workflow
const steps = [
  { action: 'navigate', url: 'https://example.com' },
  { action: 'waitForSelector', selector: '//h1' },
  { action: 'screenshot', options: { type: 'png' } }
];

// The SDK creates a browser instance that remains open after execution.
// It's crucial to close it in a `finally` block.
try {
  const { result, instanceId } = await sdk.executeStepsLocally(steps, {
    launchOptions: { headless: false } // Run in non-headless mode
  });

  console.log('Screenshot taken:', Buffer.isBuffer(result));
  console.log(`Browser instance ${instanceId} is open. It will be closed shortly.`);
  
  // Add a small delay to see the browser window
  await new Promise(resolve => setTimeout(resolve, 5000));

} catch (error) {
  console.error('Automation failed:', error);
} finally {
  // Always clean up instances to prevent lingering processes.
  await sdk.closeAllInstances();
  console.log('All instances closed.');
}
```

### 2. Advanced Fluent API

For more complex, chainable automations, you can use the `Puppeteer` class directly.

```javascript
import { Puppeteer } from 'pupi-sdk';

// The Puppeteer class manages its own browser instance automatically.
const browser = new Puppeteer({ 
  launchOptions: { 
    headless: false,
    devtools: true 
  }
});

const result = await browser
  .go({ url: 'https://httpbin.org/forms/post' })
  .waitForDomUpdate({ timeout: 3000 })
  .write({ selector: "//input[@name='custname']", value: 'John Doe' })
  .write({ selector: "//input[@name='custemail']", value: 'john@example.com' })
  .screenshot({ options: { type: 'png' } })
  .run();

console.log('Form automation completed');
```

### 3. AI Integration

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK('https://your-api.com');
sdk.setAccessToken('your-secret-token');

const result = await sdk.sendPromptToAI(
  "Navigate to google.com and search for 'puppeteer'"
);

console.log('AI Response:', result);

const sessionId = result.data.sessionId;
const sessionResult = await sdk.getSessionResult(sessionId);
console.log('Session Result:', sessionResult);
```

## Parallel Execution

Each call to `executeStepsLocally` runs in its own isolated browser instance, making parallel execution simple.

```javascript
const sdk = new PupiPuppeteerSDK();

// These tasks will run in parallel, each in a separate browser.
const googleTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://google.com' },
  { action: 'getBodyContent' }
]);

const facebookTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://facebook.com' },
  { action: 'screenshot' }
]);

const [googleResult, facebookResult] = await Promise.all([
  googleTask,
  facebookTask
]);

console.log('Google content length:', googleResult.result.bodyContent?.length);
console.log('Facebook screenshot taken:', Buffer.isBuffer(facebookResult.result));
```

## Error Handling

```javascript
const sdk = new PupiPuppeteerSDK();

try {
  const steps = [
    { action: 'navigate', url: 'https://example.com' },
    { action: 'click', selector: "document.getElementById('non-existent-button')" } // This will cause an error
  ];
  
  const { result } = await sdk.executeStepsLocally(steps);
  console.log('Success:', result);
  
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Element not found or page could not load in time.');
  } else {
    console.error('An unknown error occurred:', error.message);
  }
} finally {
  // Clean up any stray instances.
  await sdk.closeAllInstances();
}
```

## Configuration

### Browser Launch Options

You can pass Puppeteer launch options directly to the `Puppeteer` class constructor for fine-grained control.

```javascript
import { Puppeteer } from 'pupi-sdk';

const browser = new Puppeteer({
  launchOptions: {
    headless: false,
    devtools: true,
    slowMo: 100, // Slows down Puppeteer operations by 100ms
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  }
});

const result = await browser
  .go({ url: 'https://example.com' })
  .run();
```

## Next Steps

1. **[API Reference](./apiReference.md)** - Detailed descriptions of all methods.
2. **[Step Actions](./stepActions.md)** - A complete list of all available actions.
3. **[Session Management](./sessionManagement.md)** - Details on managing API sessions.
4. **[Examples](../examples/)** - Real-world examples.

## Common Patterns

### Web Scraping

```javascript
const scrapingSteps = [
  { action: 'navigate', url: 'https://news-site.com' },
  { action: 'waitForSelector', selector: "//div[contains(@class, 'article-list')]" },
  { action: 'evaluate', function: `
    Array.from(document.querySelectorAll('.article')).map(article => ({
      title: article.querySelector('h2')?.textContent?.trim(),
      summary: article.querySelector('.summary')?.textContent?.trim(),
      link: article.querySelector('a')?.href,
      date: article.querySelector('.date')?.textContent?.trim()
    }))
  ` }
];

const { result: articles } = await sdk.executeStepsLocally(scrapingSteps);
console.log('Scraped articles:', articles);
```

### Form Testing

```javascript
const formTestSteps = [
  { action: 'navigate', url: 'https://app.com/signup' },
  { action: 'write', selector: "document.getElementById('email')", value: 'test@example.com' },
  { action: 'write', selector: "document.getElementById('password')", value: 'testpass123' },
  { action: 'click', selector: "document.getElementById('terms-checkbox')" },
  { action: 'screenshot', options: { type: 'png' } }, // Before submit
  { action: 'click', selector: "document.getElementById('submit')" },
  { action: 'waitForSelector', selector: "//div[contains(@class, 'success-message')]" },
  { action: 'getText', selector: "//div[contains(@class, 'success-message')]" }
];

const { result } = await sdk.executeStepsLocally(formTestSteps);
console.log('Form submission result:', result);
```
