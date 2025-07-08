# Pupi Puppeteer SDK

Node.js tabanlı browser automation SDK'sı. AI tarafından üretilen automation step'leri yerel olarak çalıştırabilir ve Pupi AI API'si ile entegre çalışabilir.

## ✨ Özellikler

- **🏠 Yerel Çalıştırma**: Automation step'leri doğrudan bilgisayarınızda çalıştırın
- **🤖 AI Entegrasyonu**: Pupi AI API'si ile sorunsuz entegrasyon
- **🎯 Otomatik Session Yönetimi**: Browser instance'ları otomatik olarak yönetilir
- **🔍 Element Detection**: Güçlü element tespit sistemi (React, Vue, Angular destekli)
- **⚡ Fluent API**: Kolay kullanım için zincirleme metodlar
- **🛡️ Stealth Mode**: Anti-detection özellikler

## 📦 Kurulum

```bash
npm install pupi-sdk
```

## 🚀 Hızlı Başlangıç

### Basit Yerel Otomasyon

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

const steps = [
  { action: 'navigate', url: 'https://example.com' },
  { action: 'screenshot', options: { type: 'png' } }
];

// SDK, browser instance'ını otomatik olarak oluşturur ve kapatır.
const result = await sdk.executeStepsLocally(steps);
await sdk.closeAllInstances(); // Kalan tüm instance'ları temizler
```

### Gelişmiş Fluent API

```javascript
import { Puppeteer } from 'pupi-sdk';

// ID belirtmeye gerek yok, SDK otomatik yönetir
const result = await new Puppeteer()
  .go({ url: 'https://example.com' })
  .waitForSelector({ selector: 'h1' })
  .screenshot({ options: { fullPage: true } })
  .run();
```

## 📚 Dokümantasyon

- **[🚀 Getting Started](./docs/gettingStarted.md)** - Başlangıç rehberi ve temel kullanım
- **[📖 API Reference](./docs/apiReference.md)** - Tüm metodların detaylı açıklamaları  
- **[⚡ Step Actions](./docs/stepActions.md)** - Kullanılabilir tüm action'ların listesi
- **[🎯 Session Management](./docs/sessionManagement.md)** - Session yönetimi ve best practices

## 💡 Temel Örnekler

### Paralel Yerel Otomasyon

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

// Her `executeStepsLocally` çağrısı kendi izole browser instance'ında çalışır
const googleTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://google.com' },
  { action: 'screenshot' }
]);

const githubTask = sdk.executeStepsLocally([
  { action: 'navigate', url: 'https://github.com' },
  { action: 'getContent' }
]);

// Paralel çalıştırma
const [googleResult, githubResult] = await Promise.all([
  googleTask,
  githubTask
]);
```

### AI Entegrasyonu

```javascript
const sdk = new PupiPuppeteerSDK('https://your-pupi-api.com');
sdk.setAccessToken('your-access-token-here');

// AI'ya Türkçe prompt gönderebilirsiniz
const result = await sdk.sendPromptToAI(
  "Google'a git ve 'puppeteer tutorial' ara"
);

// Session sonuçlarını kontrol edin
const sessionId = result.data.sessionId;
const sessionResult = await sdk.getSessionResult(sessionId);
```

### Form Otomasyonu

```javascript
const formSteps = [
  { action: 'navigate', url: 'https://example.com/form' },
  { action: 'write', selector: '#email', value: 'test@example.com' },
  { action: 'write', selector: '#password', value: 'secure123' },
  { action: 'select', selector: '#country', values: ['turkey'] },
  { action: 'click', selector: '#submit' },
  { action: 'waitForNavigation' },
  { action: 'getText', selector: '.success-message' }
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
- `getContent()` - Get full page HTML
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
          'bringToFront' | 'evaluate' | 'getContent' | 'getBodyContent' | 
          'getHtml' | 'getText' | 'getAttribute' | 'getValue' | 'getCookies' | 
          'getClickableElements' | 'getWriteableElements',

  // Navigation properties
  url?: string,                    // for navigate, go
  
  // Interaction properties  
  selector?: string,               // for element-based actions
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
  await sdk.closeAllInstances(); // Her zaman cleanup
}
```

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

ISC

## 🆘 Destek

- **Issues**: [GitHub Issues](https://github.com/pupi-ai/pupi-sdk/issues)
- **Documentation**: [/docs klasörü](./docs/)
- **Examples**: [/examples klasörü](./examples/)
