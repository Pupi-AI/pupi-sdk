# API Reference

## PupiPuppeteerSDK Class

Main SDK class used for browser automation and AI integration.

### Constructor

```javascript
new PupiPuppeteerSDK(apiBaseUrl?: string)
```

**Parameters:**
- `apiBaseUrl` (string, optional): Base URL for the Pupi AI API. Default: `'https://api.pupiai.com'`

**Example:**
```javascript
const sdk = new PupiPuppeteerSDK('https://api.pupiai.com');
```

### Methods

#### `setAccessToken(token)`

Sets the access token for API requests.

**Parameters:**
- `token` (string): API access token

**Example:**
```javascript
sdk.setAccessToken('your-secret-token');
```

#### `executeStepsLocally(steps, options)`

Executes a step array locally. This method creates a browser instance with each call and keeps it open. To close the instance, use `closeAllInstances()` or `puppeteerManager.close(instanceId)`.

**Parameters:**
- `steps` (Array): Steps to execute.
- `options` (Object, optional): Additional options.
  - `params` (Object, optional): Used to replace `{{...}}` variables within steps.
  - `launchOptions` (Object, optional): Launch options for Puppeteer (e.g., `{ headless: false }`).

**Returns:** `Promise<Object>` - An object containing `{ result: any, instanceId: string }`. `result` is the result of the last action, `instanceId` is the ID of the created browser instance.

**Example:**
```javascript
const steps = [
  { action: 'navigate', url: 'https://example.com' },
  { action: 'screenshot', options: { type: 'png' } }
];

try {
  const { result, instanceId } = await sdk.executeStepsLocally(steps, {
    launchOptions: { headless: false }
  });
  console.log('Screenshot taken:', Buffer.isBuffer(result));
  console.log('Instance ID:', instanceId);
} finally {
  // Don't forget to close the instance
  await sdk.closeAllInstances();
}
```

#### `sendPromptToAI(prompt, options)`

Sends a prompt to AI for automation.

**Parameters:**
- `prompt` (string): Task description for AI
- `options` (Object, optional): Additional options (e.g., `params`, `enums`)

**Returns:** `Promise<Object>` - AI response

**Example:**
```javascript
sdk.setAccessToken('your-token');
const result = await sdk.sendPromptToAI(
  "Navigate to google.com and search for 'puppeteer'"
);
```

#### `getSessionResult(sessionId)`

Retrieves results from an API session.

**Parameters:**
- `sessionId` (string): Session ID to get results from

**Returns:** `Promise<Object>` - Session results

#### `closeSession(sessionId)`

Closes an API session.

**Parameters:**
- `sessionId` (string): Session ID to close

**Returns:** `Promise<Object>`

#### `getActiveSessions()`

Lists all active sessions on the API.

**Returns:** `Promise<Object>`

#### `closeAllSessions()`

Closes all active sessions on the API.

**Returns:** `Promise<Object>`

#### `closeAllInstances()`

Closes all local browser instances created by the SDK.

**Returns:** `Promise<void>`

---

## Puppeteer Class

Provides a fluent (chaining) API for advanced browser automation. This class manages a single browser instance.

### Constructor

```javascript
new Puppeteer({ launchOptions })
```

**Parameters:**
- `launchOptions` (Object, optional): Puppeteer launch options

### Navigation Methods

#### `go({ url, options })`

Navigates to the specified URL.

**Parameters:**
- `url` (string): URL to navigate to
- `options` (NavigationOptions, optional): Navigation options

**Returns:** `this` (chainable)

#### `reload({ options })`

Reloads the page.

#### `goBack({ options })`

Goes back in browser history.

#### `goForward({ options })`

Goes forward in browser history.

### Interaction Methods

#### `click({ selector, options })`

Clicks an element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.
- `options` (ClickOptions, optional): Click options

#### `write({ selector, value, options })`

Writes text to an element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the input element.
- `value` (string): Text to write
- `options` (Object, optional): Typing options

#### `press({ key, options })`

Presses a keyboard key.

**Parameters:**
- `key` (string): Key to press (e.g., 'Enter', 'Tab')
- `options` (KeyboardPressOptions, optional)

#### `hover({ selector })`

Hovers over an element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.

#### `focus({ selector })`

Focuses an element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.

#### `select({ selector, values })`

Selects options in a select element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the select element.
- `values` (string[]): Option values to select

#### `clearInput({ selector })`

Clears an input element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the input element.

#### `uploadFile({ selector, filePaths })`

Uploads files to a file input.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the file input.
- `filePaths` (string[]): File paths to upload

### Waiting Methods

#### `waitForSelector({ selector, options })`

Waits for an element to appear in the DOM.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.

#### `waitForNavigation({ options })`

Waits for navigation to complete.

#### `waitForFunction({ fn, options, args })`

Waits for a JavaScript function to return a truthy value.

#### `waitForDomUpdate({ timeout })`

Waits for DOM updates to complete.

#### `sleep({ duration })`

Belirtilen süre bekler.

**Parameters:**
- `duration` (number): Bekleme süresi (milisaniye)

### Browser Manipulation Methods

#### `screenshot({ options })`

Sayfa screenshot'ı alır.

**Parameters:**
- `options` (ScreenshotOptions, optional): Screenshot seçenekleri

**Common options:**
- `type: 'png' | 'jpeg'`
- `fullPage: boolean`
- `clip: { x, y, width, height }`

#### `pdf({ options })`

Sayfa PDF'ini oluşturur.

#### `setViewport({ viewport })`

Browser viewport boyutunu ayarlar.

**Parameters:**
- `viewport` (Object): Viewport configuration
  - `width` (number): Genişlik
  - `height` (number): Yükseklik

#### `setUserAgent({ userAgent })`

User agent string'ini ayarlar.

#### `setCookies({ cookies })`

Cookie'leri ayarlar.

#### `deleteCookies({ cookies })`

Cookie'leri siler.

### Data Extraction Methods

#### `evaluate({ fn, args })`

Executes JavaScript in browser context.

**Parameters:**
- `fn` (string): Function string to execute
- `args` (any[], optional): Function arguments


#### `getBodyContent()`

Returns body HTML and interactive elements.

**Returns:** Object with:
- `content` (string): HTML content
- `interactiveElements` (Array): Clickable/writeable elements

#### `getText({ selector })`

Returns the text content of an element.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.

#### `getAttribute({ selector, attribute })`

Returns an element's attribute value.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the element.

#### `getValue({ selector })`

Returns an input element's value.

**Parameters:**
- `selector` (string): JSPath or XPath selector for the input element.

#### `getCookies({ urls })`

Returns cookies.

#### `getClickableElements()`

Returns clickable elements on the page.

#### `getWriteableElements()`

Returns writable elements on the page.

### Execution

#### `run()`

Executes all queued actions.

**Returns:** `Promise<any>` - Result of the last data extraction/manipulation action

**Example:**
```javascript
const result = await new Puppeteer()
  .go({ url: 'https://example.com' })
  .waitForSelector({ selector: '//h1' })
  .screenshot({ options: { type: 'png' } })
  .run();

// result = screenshot buffer
```
