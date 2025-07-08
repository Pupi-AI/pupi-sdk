# Step Actions Reference

Bu dokümanda `executeStepsLocally` fonksiyonunda kullanılabilecek tüm action'lar detaylı olarak açıklanmaktadır.

## Navigation Actions

### `navigate` / `go`

Belirtilen URL'e gider.

```javascript
{
  action: 'navigate', // veya 'go'
  url: 'https://example.com',
  options: { // opsiyonel
    waitUntil: 'domcontentloaded',
    timeout: 30000
  }
}
```

### `reload`

Sayfayı yeniler.

```javascript
{
  action: 'reload',
  options: { // opsiyonel
    waitUntil: 'domcontentloaded'
  }
}
```

### `goBack` / `goForward`

Browser history'de geri/ileri gider.

```javascript
{
  action: 'goBack', // veya 'goForward'
  options: { // opsiyonel
    waitUntil: 'domcontentloaded'
  }
}
```

## Interaction Actions

### `click`

Element'e tıklar.

```javascript
{
  action: 'click',
  selector: '#submit-button',
  options: { // opsiyonel
    button: 'left', // 'left', 'right', 'middle'
    clickCount: 1,
    delay: 0
  }
}
```

### `write` / `type`

Text input'a yazar.

```javascript
{
  action: 'write', // veya 'type'
  selector: '#username',
  value: 'john@example.com',
  options: { // opsiyonel
    delay: 0 // karakterler arası bekleme
  }
}
```

### `press`

Klavye tuşuna basar.

```javascript
{
  action: 'press',
  key: 'Enter', // 'Tab', 'Escape', 'ArrowDown', vb.
  options: { // opsiyonel
    delay: 0
  }
}
```

### `hover`

Element üzerine hover yapar.

```javascript
{
  action: 'hover',
  selector: '.menu-item'
}
```

### `focus`

Element'e focus yapar.

```javascript
{
  action: 'focus',
  selector: '#search-input'
}
```

### `select`

Select element'inde option seçer.

```javascript
{
  action: 'select',
  selector: '#country',
  values: ['turkey', 'usa'] // multiple selection desteklenir
}
```

### `clearInput`

Input element'ini temizler.

```javascript
{
  action: 'clearInput',
  selector: '#email'
}
```

### `uploadFile`

File input'a dosya yükler.

```javascript
{
  action: 'uploadFile',
  selector: 'input[type="file"]',
  filePaths: ['/path/to/file1.jpg', '/path/to/file2.pdf']
}
```

## Waiting Actions

### `wait`

Çok amaçlı bekleme action'ı.

```javascript
// Selector bekleme
{
  action: 'wait',
  selector: '.loading',
  options: {
    timeout: 10000,
    visible: true
  }
}

// Süre bekleme
{
  action: 'wait',
  duration: 3000 // 3 saniye
}

// Navigation bekleme
{
  action: 'wait',
  navigation: true,
  options: {
    waitUntil: 'networkidle0'
  }
}

// Function bekleme
{
  action: 'wait',
  function: 'document.readyState === "complete"',
  options: {
    timeout: 5000
  }
}
```

### `sleep`

Belirtilen süre bekler.

```javascript
{
  action: 'sleep',
  duration: 2000 // milisaniye
}
```

### `waitForSelector`

Element'in DOM'da görünmesini bekler.

```javascript
{
  action: 'waitForSelector',
  selector: '.dynamic-content',
  options: {
    visible: true,
    timeout: 15000
  }
}
```

### `waitForNavigation`

Navigation tamamlanmasını bekler.

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

JavaScript function'ın truthy değer dönmesini bekler.

```javascript
{
  action: 'waitForFunction',
  function: 'window.jQuery && window.jQuery.active === 0',
  options: {
    timeout: 5000,
    polling: 100
  },
  args: [] // opsiyonel function argumentları
}
```

### `waitForDomUpdate`

DOM güncellemelerinin tamamlanmasını bekler.

```javascript
{
  action: 'waitForDomUpdate',
  timeout: 10000
}
```

## Browser Manipulation Actions

### `screenshot`

Screenshot alır.

```javascript
{
  action: 'screenshot',
  options: {
    type: 'png', // 'png' veya 'jpeg'
    fullPage: true,
    quality: 80, // sadece jpeg için
    clip: { // opsiyonel crop
      x: 0,
      y: 0,
      width: 800,
      height: 600
    }
  }
}
```

### `pdf`

PDF oluşturur.

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

Browser viewport boyutunu ayarlar.

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

User agent string'ini ayarlar.

```javascript
{
  action: 'setUserAgent',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### `setCookies`

Cookie'leri ayarlar.

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

Cookie'leri siler.

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

Browser tab'ını öne getirir.

```javascript
{
  action: 'bringToFront'
}
```

## Data Extraction Actions

### `evaluate`

Browser context'inde JavaScript execute eder.

```javascript
{
  action: 'evaluate',
  function: 'document.title',
  args: [] // opsiyonel
}

// Daha karmaşık örnek
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

### `getContent`

Sayfa HTML content'ini getirir.

```javascript
{
  action: 'getContent'
}
```

### `getBodyContent`

Body HTML'ini ve interactive element'leri getirir.

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
      selector: '#button1',
      type: 'clickable',
      tag: 'button',
      text: 'Submit'
    }
  ],
  stabilizedHTML: true
}
```

### `getText`

Element'in text content'ini getirir.

```javascript
{
  action: 'getText',
  selector: '.page-title'
}
```

### `getAttribute`

Element attribute değerini getirir.

```javascript
{
  action: 'getAttribute',
  selector: 'img.logo',
  attribute: 'src'
}
```

### `getValue`

Input element value'sunu getirir.

```javascript
{
  action: 'getValue',
  selector: '#search-query'
}
```

### `getCookies`

Cookie'leri getirir.

```javascript
{
  action: 'getCookies',
  urls: ['https://example.com'] // opsiyonel, belirtilmezse tüm cookie'ler
}
```

### `getClickableElements`

Sayfadaki tıklanabilir element'leri getirir.

```javascript
{
  action: 'getClickableElements'
}
```

### `getWriteableElements`

Sayfadaki yazılabilir element'leri getirir.

```javascript
{
  action: 'getWriteableElements'
}
```

## Combination Examples

### Form Doldurma

```javascript
const formSteps = [
  { action: 'navigate', url: 'https://example.com/form' },
  { action: 'waitForSelector', selector: '#contact-form' },
  { action: 'write', selector: '#name', value: 'John Doe' },
  { action: 'write', selector: '#email', value: 'john@example.com' },
  { action: 'select', selector: '#country', values: ['turkey'] },
  { action: 'click', selector: '#terms-checkbox' },
  { action: 'screenshot', options: { type: 'png' } },
  { action: 'click', selector: '#submit' },
  { action: 'waitForNavigation' },
  { action: 'getText', selector: '.success-message' }
];
```

### E-commerce Scraping

```javascript
const scrapingSteps = [
  { action: 'navigate', url: 'https://shop.example.com' },
  { action: 'setViewport', viewport: { width: 1920, height: 1080 } },
  { action: 'write', selector: '#search', value: 'laptop' },
  { action: 'press', key: 'Enter' },
  { action: 'waitForSelector', selector: '.product-list' },
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
