# Step Actions Reference

This document details all actions that can be used in the `executeStepsLocally` function.

## Navigation Actions

### `navigate` / `go`

Navigates to the specified URL.

```javascript
{
  action: 'navigate', // or 'go'
  url: 'https://example.com',
  options: { // optional
    waitUntil: 'domcontentloaded',
    timeout: 30000
  }
}
```

### `reload`

Reloads the page.

```javascript
{
  action: 'reload',
  options: { // optional
    waitUntil: 'domcontentloaded'
  }
}
```

### `goBack` / `goForward`

Goes back/forward in browser history.

```javascript
{
  action: 'goBack', // or 'goForward'
  options: { // optional
    waitUntil: 'domcontentloaded'
  }
}
```

## Interaction Actions

### `click`

Clicks an element.

```javascript
{
  action: 'click',
  selector: "document.getElementById('submit-button')", // JSPath or XPath
  options: { // optional
    button: 'left', // 'left', 'right', 'middle'
    clickCount: 1,
    delay: 0
  }
}
```

### `write` / `type`

Writes text to input.

```javascript
{
  action: 'write', // or 'type'
  selector: "//input[@id='username']", // JSPath or XPath
  value: 'john@example.com',
  options: { // optional
    delay: 0 // delay between characters
  }
}
```

### `press`

Presses a keyboard key.

```javascript
{
  action: 'press',
  key: 'Enter', // 'Tab', 'Escape', 'ArrowDown', etc.
  options: { // optional
    delay: 0
  }
}
```

### `hover`

Hovers over an element.

```javascript
{
  action: 'hover',
  selector: "//div[contains(@class, 'menu-item')]" // JSPath or XPath
}
```

### `focus`

Focuses on an element.

```javascript
{
  action: 'focus',
  selector: "document.getElementById('search-input')" // JSPath or XPath
}
```

### `select`

Selects an option in a select element.

```javascript
{
  action: 'select',
  selector: "//select[@id='country']", // JSPath or XPath
  values: ['turkey', 'usa'] // multiple selection supported
}
```

### `clearInput`

Clears an input element.

```javascript
{
  action: 'clearInput',
  selector: "document.getElementById('email')" // JSPath or XPath
}
```

### `uploadFile`

Uploads files to a file input.

```javascript
{
  action: 'uploadFile',
  selector: "//input[@type='file']", // JSPath or XPath
  filePaths: ['/path/to/file1.jpg', '/path/to/file2.pdf']
}
```

## Waiting Actions

### `wait`

Multi-purpose waiting action.

```javascript
// Selector waiting
{
  action: 'wait',
  selector: "//div[contains(@class, 'loading')]", // JSPath or XPath
  options: {
    timeout: 10000,
    visible: true
  }
}

// Duration waiting
{
  action: 'wait',
  duration: 3000 // 3 seconds
}

// Navigation waiting
{
  action: 'wait',
  navigation: true,
  options: {
    waitUntil: 'networkidle0'
  }
}

// Function waiting
{
  action: 'wait',
  function: 'document.readyState === "complete"',
  options: {
    timeout: 5000
  }
}
```

### `sleep`

Waits for the specified duration.

```javascript
{
  action: 'sleep',
  duration: 2000 // milliseconds
}
```

### `waitForSelector`

Waits for an element to appear in the DOM.

```javascript
{
  action: 'waitForSelector',
  selector: "//div[contains(@class, 'dynamic-content')]", // JSPath or XPath
  options: {
    visible: true,
    timeout: 15000
  }
}
```

### `waitForNavigation`

Waits for navigation to complete.

```javascript
{
  action: 'waitForNavigation',
  options: {
    waitUntil: 'networkidle2',
    timeout: 10000
  }
}
```

### `waitForFunction`

Waits for a JavaScript function to return a truthy value.

```javascript
{
  action: 'waitForFunction',
  function: 'window.jQuery && window.jQuery.active === 0',
  options: {
    timeout: 5000,
    polling: 100
  },
  args: [] // optional function arguments
}
```

### `waitForDomUpdate`

Waits for DOM updates to complete.

```javascript
{
  action: 'waitForDomUpdate',
  timeout: 10000
}
```

## Browser Manipulation Actions

### `screenshot`

Takes a screenshot.

```javascript
{
  action: 'screenshot',
  options: {
    type: 'png', // 'png' or 'jpeg'
    fullPage: true,
    quality: 80, // for jpeg only
    clip: { // optional crop
      x: 0,
      y: 0,
      width: 800,
      height: 600
    }
  }
}
```

### `pdf`

Creates a PDF.

```javascript
{
  action: 'pdf',
  options: {
    format: 'A4',
    printBackground: true,
    landscape: false,
    margin: {
      top: '1cm',
      bottom: '1cm',
      left: '1cm',
      right: '1cm'
    }
  }
}
```

### `setViewport`

Sets browser viewport size.

```javascript
{
  action: 'setViewport',
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false
  }
}
```

### `setUserAgent`

Sets the user agent string.

```javascript
{
  action: 'setUserAgent',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### `setCookies`

Sets cookies.

```javascript
{
  action: 'setCookies',
  cookies: [
    {
      name: 'session',
      value: 'abc123',
      domain: '.example.com',
      path: '/',
      httpOnly: true,
      secure: true
    }
  ]
}
```

### `deleteCookies`

Deletes cookies.

```javascript
{
  action: 'deleteCookies',
  cookies: [
    {
      name: 'session',
      domain: '.example.com'
    }
  ]
}
```

### `bringToFront`

Brings the browser tab to the front.

```javascript
{
  action: 'bringToFront'
}
```

## Data Extraction Actions

### `evaluate`

Executes JavaScript in the browser context.

```javascript
{
  action: 'evaluate',
  function: 'document.title',
  args: [] // optional
}

// More complex example
{
  action: 'evaluate',
  function: `
    (selector) => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map(el => el.textContent);
    }
  `,
  args: ['.product-title']
}
```


### `getBodyContent`

Gets body HTML and interactive elements.

```javascript
{
  action: 'getBodyContent'
}
```

**Return format:**
```javascript
{
  content: '<div>...</div>',
  interactiveElements: [
    {
      selector: "document.getElementById('button1')",
      type: 'clickable',
      tag: 'button',
      text: 'Submit'
    }
  ],
  stabilizedHTML: true
}
```

### `getText`

Gets the text content of an element.

```javascript
{
  action: 'getText',
  selector: "//h1[contains(@class, 'page-title')]" // JSPath or XPath
}
```

### `getAttribute`

Gets the attribute value of an element.

```javascript
{
  action: 'getAttribute',
  selector: "//img[contains(@class, 'logo')]", // JSPath or XPath
  attribute: 'src'
}
```

### `getValue`

Gets the value of an input element.

```javascript
{
  action: 'getValue',
  selector: "document.getElementById('search-query')" // JSPath or XPath
}
```

### `getCookies`

Gets cookies.

```javascript
{
  action: 'getCookies',
  urls: ['https://example.com'] // optional, if not specified all cookies
}
```

### `getClickableElements`

Gets clickable elements on the page.

```javascript
{
  action: 'getClickableElements'
}
```

### `getWriteableElements`

Gets writable elements on the page.

```javascript
{
  action: 'getWriteableElements'
}
```

## Combination Examples

### Form Filling

```javascript
const formSteps = [
  { action: 'navigate', url: 'https://example.com/form' },
  { action: 'waitForSelector', selector: "document.getElementById('contact-form')" },
  { action: 'write', selector: "document.getElementById('name')", value: 'John Doe' },
  { action: 'write', selector: "document.getElementById('email')", value: 'john@example.com' },
  { action: 'select', selector: "document.getElementById('country')", values: ['turkey'] },
  { action: 'click', selector: "document.getElementById('terms-checkbox')" },
  { action: 'screenshot', options: { type: 'png' } },
  { action: 'click', selector: "document.getElementById('submit')" },
  { action: 'waitForNavigation' },
  { action: 'getText', selector: "//div[contains(@class, 'success-message')]" }
];
```

### E-commerce Scraping

```javascript
const scrapingSteps = [
  { action: 'navigate', url: 'https://shop.example.com' },
  { action: 'setViewport', viewport: { width: 1920, height: 1080 } },
  { action: 'write', selector: "document.getElementById('search')", value: 'laptop' },
  { action: 'press', key: 'Enter' },
  { action: 'waitForSelector', selector: "//div[contains(@class, 'product-list')]" },
  { action: 'evaluate', function: `
    Array.from(document.querySelectorAll('.product')).map(p => ({
      title: p.querySelector('.title')?.textContent,
      price: p.querySelector('.price')?.textContent,
      link: p.querySelector('a')?.href
    }))
  ` },
  { action: 'screenshot', options: { fullPage: true } }
];
```
