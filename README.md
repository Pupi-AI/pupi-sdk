# Pupi Puppeteer SDK

Node.js-based browser automation SDK. Execute AI-generated automation steps locally and integrate seamlessly with the Pupi AI API.

## ✨ Features

- **🏠 Local Execution**: Run automation steps directly on your computer
- **🤖 AI Integration**: Seamless integration with Pupi AI API
- **🎯 Automatic Session Management**: Browser instances are managed automatically
- **🔍 Element Detection**: Powerful element detection system (React, Vue, Angular supported)
- **⚡ Fluent API**: Chainable methods for easy usage
- **🛡️ Stealth Mode**: Anti-detection features

## 📦 Installation

```bash
npm install pupi-sdk
```

## 🚀 Quick Start

### Simple Local Automation

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

const steps = [
  { action: 'navigate', url: 'https://example.com' },
  { action: 'waitForSelector', selector: "//h1" },
  { action: 'screenshot', options: { type: 'png' } }
];

// SDK automatically creates and manages browser instances
const result = await sdk.executeStepsLocally(steps);
await sdk.closeAllInstances(); // Clean up all remaining instances
```

### Advanced Fluent API

```javascript
import { Puppeteer } from 'pupi-sdk';

// No need to specify IDs, SDK manages automatically
const result = await new Puppeteer()
  .go({ url: 'https://example.com' })
  .waitForSelector({ selector: "//h1" })
  .screenshot({ options: { fullPage: true } })
  .run();
```

## 📚 Documentation

- **[🚀 Getting Started](./docs/gettingStarted.md)** - Beginner's guide and basic usage
- **[📖 API Reference](./docs/apiReference.md)** - Detailed descriptions of all methods
- **[⚡ Step Actions](./docs/stepActions.md)** - List of all available actions
- **[🎯 Session Management](./docs/sessionManagement.md)** - Session management and best practices

## 💡 Basic Examples

### Parallel Local Automation

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

// Each `executeStepsLocally` call runs in its own isolated browser instance
const googleTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://google.com' },
  { action: 'screenshot' }
]);

const githubTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://github.com' },
  { action: 'getBodyContent' }
]);

// Parallel execution
const [googleResult, githubResult] = await Promise.all([
  googleTask,
  githubTask
]);
```

### AI Integration

```javascript
const sdk = new PupiPuppeteerSDK('https://your-pupi-api.com');
sdk.setAccessToken('your-access-token-here');

// You can send prompts in any language
const result = await sdk.sendPromptToAI(
  "Go to Google and search for 'puppeteer tutorial'"
);

// Check session results
const sessionId = result.data.sessionId;
const sessionResult = await sdk.getSessionResult(sessionId);
```

### Form Automation

```javascript
const formSteps = [
  { action: 'navigate', url: 'https://example.com/form' },
  { action: 'write', selector: "document.getElementById('email')", value: 'test@example.com' },
  { action: 'write', selector: "document.getElementById('password')", value: 'secure123' },
  { action: 'select', selector: "document.getElementById('country')", values: ['turkey'] },
  { action: 'click', selector: "//button[@type='submit']" },
  { action: 'waitForNavigation' },
  { action: 'getText', selector: "//div[contains(@class, 'success-message')]" }
];

const result = await sdk.executeStepsLocally(formSteps);
```

## API Reference

### PupiPuppeteerSDK

Main SDK class for managing automation execution.

#### Methods

- `setAccessToken(token)` - Set the access token for API requests.
- `executeStepsLocally(steps)` - Execute comprehensive steps locally.
- `sendPromptToAI(prompt, options)` - Send prompt to AI for automation.
- `getSessionResult(sessionId)` - Get results of an API session.
- `closeSession(sessionId)` - Close an API session.
- `getActiveSessions()` - Get all active sessions from the API.
- `closeAllSessions()` - Close all active sessions on the API server.
- `setApiBaseUrl(baseUrl)` - Set API base URL.
- `closeAllInstances()` - Close all local browser instances.

### Puppeteer Class

Advanced browser automation class with fluent API.

#### Navigation Methods
- `go({ url, options })` - Navigate to URL
- `reload({ options })` - Reload current page
- `goBack({ options })` - Go back in history
- `goForward({ options })` - Go forward in history

#### Interaction Methods
- `click({ selector, options })` - Click element
- `write({ selector, value, options })` - Type text
- `press({ key, options })` - Press keyboard key
- `hover({ selector })` - Hover over element
- `focus({ selector })` - Focus element
- `select({ selector, values })` - Select options
- `uploadFile({ selector, filePaths })` - Upload files

#### Waiting Methods
- `waitForSelector({ selector, options })` - Wait for element
- `waitForNavigation({ options })` - Wait for navigation
- `waitForFunction({ fn, options, args })` - Wait for custom function
- `sleep({ duration })` - Wait for specific duration

#### Data Extraction Methods
- `getBodyContent()` - Get body HTML with interactive elements
- `getText({ selector })` - Get element text
- `getAttribute({ selector, attribute })` - Get element attribute
- `getValue({ selector })` - Get input value
- `getCookies({ urls })` - Get cookies
- `getClickableElements()` - Get all clickable elements
- `getWriteableElements()` - Get all writable elements

#### Browser Methods
- `screenshot({ options })` - Take screenshot
- `pdf({ options })` - Generate PDF
- `setViewport({ viewport })` - Set viewport size
- `setUserAgent({ userAgent })` - Set user agent
- `setCookies({ cookies })` - Set cookies
- `deleteCookies({ cookies })` - Delete cookies

## Step Format

Steps support comprehensive browser automation actions:

```javascript
{
  action: 'navigate' | 'click' | 'type' | 'write' | 'press' | 'hover' | 
          'focus' | 'select' | 'clearInput' | 'uploadFile' | 'wait' | 
          'sleep' | 'waitForSelector' | 'waitForNavigation' | 
          'waitForFunction' | 'waitForDomUpdate' | 'screenshot' | 'pdf' | 
          'setViewport' | 'setUserAgent' | 'setCookies' | 'deleteCookies' | 
          'bringToFront' | 'evaluate' | 'getBodyContent' | 
          'getHtml' | 'getText' | 'getAttribute' | 'getValue' | 'getCookies' | 
          'getClickableElements' | 'getWriteableElements',

  // Navigation properties
  url?: string,                    // for navigate, go
  
  // Interaction properties  
  selector?: string,               // for element-based actions. MUST be a JSPath or XPath string (e.g., "document.getElementById('my-id')" or "//button[@data-testid='submit']").
  value?: string,                  // for type, write
  key?: string,                    // for press
  values?: string[],               // for select
  filePaths?: string[],            // for uploadFile
  
  // Waiting properties
  duration?: number,               // for sleep (milliseconds)
  timeout?: number,                // for various wait actions
  navigation?: boolean,            // for wait with navigation
  function?: string,               // for waitForFunction, evaluate
  args?: any[],                    // for function arguments
  
  // Browser manipulation
  viewport?: { width: number, height: number }, // for setViewport
  userAgent?: string,              // for setUserAgent
  cookies?: CookieParam[],         // for setCookies, deleteCookies
  
  // Data extraction
  attribute?: string,              // for getAttribute
  urls?: string[],                 // for getCookies
  
  // General options
  options?: object                 // for various actions
}
```

## Browser Configuration

You can configure browser launch options:

```javascript
import { Puppeteer } from 'pupi-sdk';

const browser = new Puppeteer({
  launchOptions: {
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-web-security'],
    defaultViewport: { width: 1920, height: 1080 }
  }
});

await browser.go({ url: 'https://example.com' }).run();
```

## Error Handling

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';
const sdk = new PupiPuppeteerSDK();

try {
  const result = await sdk.executeStepsLocally(steps);
  console.log('Success:', result);
} catch (error) {
  console.error('Automation failed:', error);
  
  if (error.name === 'TimeoutError') {
    console.log('Element not found or page load timeout');
  }
} finally {
  await sdk.closeAllInstances(); // Always cleanup
}
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/pupi-ai/pupi-sdk/issues)
- **Documentation**: [/docs directory](./docs/)
- **Examples**: [/examples directory](./examples/)
