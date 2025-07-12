# API Reference

## PupiPuppeteerSDK Class

Ana SDK sınıfı. Browser automation ve AI entegrasyonu için kullanılır.

### Constructor

```javascript
new PupiPuppeteerSDK(apiBaseUrl?: string)
```

**Parameters:**
- `apiBaseUrl` (string, optional): Pupi AI API'nin base URL'i. Default: `'https://api.pupiai.com'`

**Example:**
```javascript
const sdk = new PupiPuppeteerSDK('https://api.pupiai.com');
```

### Methods

#### `setAccessToken(token)`

API istekleri için access token'ı ayarlar.

**Parameters:**
- `token` (string): API access token

**Example:**
```javascript
sdk.setAccessToken('your-secret-token');
```

#### `executeStepsLocally(steps, options)`

Step array'ini yerel olarak execute eder. Bu metod, her çağrıldığında bir browser instance'ı oluşturur ve bu instance'ı açık bırakır. Instance'ı kapatmak için `closeAllInstances()` veya `puppeteerManager.close(instanceId)` kullanılmalıdır.

**Parameters:**
- `steps` (Array): Execute edilecek step'ler.
- `options` (Object, optional): Ek seçenekler.
  - `params` (Object, optional): Step'ler içindeki `{{...}}` değişkenlerini değiştirmek için kullanılır.
  - `launchOptions` (Object, optional): Puppeteer için launch seçenekleri (örn: `{ headless: false }`).

**Returns:** `Promise<Object>` - `{ result: any, instanceId: string }` içeren bir obje. `result` son action'ın sonucudur, `instanceId` ise oluşturulan browser instance'ının ID'sidir.

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
  // Instance'ı kapatmayı unutmayın
  await sdk.closeAllInstances();
}
```

#### `sendPromptToAI(prompt, options)`

AI'ya otomasyon için prompt gönderir.

**Parameters:**
- `prompt` (string): AI için task açıklaması
- `options` (Object, optional): Ek seçenekler (örn: `params`, `enums`)

**Returns:** `Promise<Object>` - AI response

**Example:**
```javascript
sdk.setAccessToken('your-token');
const result = await sdk.sendPromptToAI(
  "Navigate to google.com and search for 'puppeteer'"
);
```

#### `getSessionResult(sessionId)`

Bir API session'ının sonuçlarını getirir.

**Parameters:**
- `sessionId` (string): Sonuçları alınacak Session ID

**Returns:** `Promise<Object>` - Session sonuçları

#### `closeSession(sessionId)`

Bir API session'ını kapatır.

**Parameters:**
- `sessionId` (string): Kapatılacak Session ID

**Returns:** `Promise<Object>`

#### `getActiveSessions()`

API üzerindeki tüm aktif session'ları listeler.

**Returns:** `Promise<Object>`

#### `closeAllSessions()`

API üzerindeki tüm aktif session'ları kapatır.

**Returns:** `Promise<Object>`

#### `closeAllInstances()`

SDK tarafından oluşturulan tüm yerel browser instance'larını kapatır.

**Returns:** `Promise<void>`

---

## Puppeteer Class

Advanced browser automation için fluent (zincirleme) API sağlar. Bu sınıf, tek bir browser instance'ını yönetir.

### Constructor

```javascript
new Puppeteer({ launchOptions })
```

**Parameters:**
- `launchOptions` (Object, optional): Puppeteer launch seçenekleri

### Navigation Methods

#### `go({ url, options })`

Belirtilen URL'e gider.

**Parameters:**
- `url` (string): Gidilecek URL
- `options` (NavigationOptions, optional): Navigation seçenekleri

**Returns:** `this` (chainable)

#### `reload({ options })`

Sayfayı yeniler.

#### `goBack({ options })`

Browser history'de geri gider.

#### `goForward({ options })`

Browser history'de ileri gider.

### Interaction Methods

#### `click({ selector, options })`

Element'e tıklar.

**Parameters:**
- `selector` (string): CSS selector
- `options` (ClickOptions, optional): Click seçenekleri

#### `write({ selector, value, options })`

Element'e text yazar.

**Parameters:**
- `selector` (string): Input element selector
- `value` (string): Yazılacak text
- `options` (Object, optional): Typing seçenekleri

#### `press({ key, options })`

Klavye tuşuna basar.

**Parameters:**
- `key` (string): Basılacak tuş (örn: 'Enter', 'Tab')
- `options` (KeyboardPressOptions, optional)

#### `hover({ selector })`

Element üzerine hover yapar.

#### `focus({ selector })`

Element'e focus yapar.

#### `select({ selector, values })`

Select element'inde option seçer.

**Parameters:**
- `selector` (string): Select element selector
- `values` (string[]): Seçilecek option value'ları

#### `clearInput({ selector })`

Input element'ini temizler.

#### `uploadFile({ selector, filePaths })`

File input'a dosya yükler.

**Parameters:**
- `selector` (string): File input selector
- `filePaths` (string[]): Yüklenecek dosya path'leri

### Waiting Methods

#### `waitForSelector({ selector, options })`

Element'in DOM'da görünmesini bekler.

#### `waitForNavigation({ options })`

Navigation tamamlanmasını bekler.

#### `waitForFunction({ fn, options, args })`

JavaScript function'ın truthy değer dönmesini bekler.

#### `waitForDomUpdate({ timeout })`

DOM güncellemelerinin tamamlanmasını bekler.

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

Browser context'inde JavaScript execute eder.

**Parameters:**
- `fn` (string): Execute edilecek function string'i
- `args` (any[], optional): Function argumentları

#### `getContent()`

Sayfa HTML content'ini getirir.

#### `getBodyContent()`

Body HTML'ini ve interactive element'leri getirir.

**Returns:** Object with:
- `content` (string): HTML content
- `interactiveElements` (Array): Clickable/writeable elements

#### `getText({ selector })`

Element'in text content'ini getirir.

#### `getAttribute({ selector, attribute })`

Element attribute değerini getirir.

#### `getValue({ selector })`

Input element value'sunu getirir.

#### `getCookies({ urls })`

Cookie'leri getirir.

#### `getClickableElements()`

Sayfadaki tıklanabilir element'leri getirir.

#### `getWriteableElements()`

Sayfadaki yazılabilir element'leri getirir.

### Execution

#### `run()`

Kuyruğa alınan tüm action'ları execute eder.

**Returns:** `Promise<any>` - Son data extraction/manipulation action'ının sonucu

**Example:**
```javascript
const result = await new Puppeteer()
  .go({ url: 'https://example.com' })
  .waitForSelector({ selector: 'h1' })
  .screenshot({ options: { type: 'png' } })
  .run();

// result = screenshot buffer
```
