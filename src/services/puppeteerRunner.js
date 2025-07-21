import puppeteerManager from "./puppeteerManager.js";
import { elementDetectorSource } from "../utils/elementDetector.js";

class PuppeteerRunner {
  async _waitForSelector(page, selector, options = {}) {
    try {
      // 1. Check for XPath
      if (selector.startsWith('//') || selector.startsWith('./') || selector.startsWith('(')) {
        await page.waitForFunction(
          (xpath) => {
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue !== null;
          },
          options,
          selector
        );
      } 
      // 2. Check for JSPath
      else if (selector.includes('document.')) {
         await page.waitForFunction(selector, options);
      }
      // 3. Assume CSS selector
      else {
        await page.waitForSelector(selector, options);
      }
    } catch (error) {
      throw new Error(`waitForSelector failed for selector "${selector}": ${error.message}`);
    }
  }

  async _getElementHandle(page, selector) {
    if (typeof selector !== 'string' || !selector) {
      throw new Error('Selector must be a non-empty string.');
    }

    if (selector.startsWith('//') || selector.startsWith('./') || selector.startsWith('(')) {
      try {
        // Use evaluate to find element with XPath
        await page.waitForFunction(
          (xpath) => {
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue !== null;
          },
          { timeout: 15000 },
          selector
        );
        
        const element = await page.evaluateHandle(
          (xpath) => {
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
          },
          selector
        );
        
        const elementHandle = element.asElement();
        if (!elementHandle) {
          await element.dispose();
          throw new Error(`XPath element not found: ${selector}`);
        }
        return elementHandle;
      } catch (e) {
        throw new Error(`Waiting for XPath selector "${selector}" failed: ${e.message}`);
      }
    }

    // 2. Check for JSPath
    if (selector.includes('document.')) {
        try {
          await page.waitForFunction(selector, { timeout: 15000 });
          const handle = await page.evaluateHandle(selector);
          const element = handle.asElement();
          if (!element) {
            await handle.dispose();
            throw new Error(`JSPath did not resolve to an element: ${selector}`);
          }
          return element;
        } catch (e) {
          throw new Error(`Waiting for JSPath selector "${selector}" failed: ${e.message}`);
        }
    }

    // 3. Assume CSS selector
    try {
      await page.waitForSelector(selector, { timeout: 15000 });
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`CSS selector did not resolve to an element: ${selector}`);
      }
      return element;
    } catch (e) {
      throw new Error(`Waiting for CSS selector "${selector}" failed: ${e.message}`);
    }
  }

  async execute(page, actions, id) {
    console.log(`Puppeteer Runner Started - ${id}`);
    let lastResult = null;

    const instance = puppeteerManager.get(id);

    try {
      console.log(`🔍 Checking page readiness for ${id}...`);
      const currentUrl = page.url();
      if (currentUrl === 'about:blank') {
        console.log(`⚠️  Page is still on about:blank - waiting for navigation...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log(`✅ Page ready at: ${page.url()}`);
    } catch (error) {
      console.log(`⚠️  Page readiness check failed: ${error.message}`);
    }

    for (const action of actions) {
      let currentUrlBeforeAction;
      try {
        currentUrlBeforeAction = page.url();
      } catch (e) {
        currentUrlBeforeAction = "N/A (page closed or invalid)";
      }

      let handle = null;

      try {
        console.log(`Executing action: ${action.type}`, action.payload);
        puppeteerManager.emit('action:start', { sessionId: id, action, currentUrl: currentUrlBeforeAction });

        switch (action.type) {
          case "go":
            {
              let initialUrl = action.payload.url;
              if (!initialUrl.startsWith('http://') && !initialUrl.startsWith('https://')) {
                initialUrl = `https://${initialUrl}`;
              }
              const initialOrigin = new URL(initialUrl).origin;
              await page.browserContext().overridePermissions(initialOrigin, ["microphone", "camera", "notifications"]);
              await page.goto(initialUrl, { waitUntil: "domcontentloaded", timeout: 30000, ...(action.payload.options || {}) });
            }
            break;
          case "reload":
            await page.reload(action.payload.options);
            break;
          case "goBack":
            await page.goBack(action.payload.options);
            break;
          case "goForward":
            await page.goForward(action.payload.options);
            break;

          case "click":
            await this._waitForSelector(page, action.payload.selector, { timeout: 60 * 10000 });
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.click(action.payload.options);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          case "press":
            await page.keyboard.press(action.payload.key, action.payload.options);
            break;
          case "write":
            await this._waitForSelector(page, action.payload.selector, { timeout: 60 * 10000 });
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.focus();
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await new Promise(resolve => setTimeout(resolve, 500));
            await handle.type(action.payload.value, action.payload.options);
            await new Promise(resolve => setTimeout(resolve, 500));
            break;
          case "clearInput":
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.evaluate(el => el.value = '');
            await new Promise(resolve => setTimeout(resolve, 300));
            break;
          case "hover":
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.hover();
            await new Promise(resolve => setTimeout(resolve, 300));
            break;
          case "focus":
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.focus();
            break;
          case "select":
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.select(...action.payload.values);
            break;
          case "uploadFile":
            handle = await this._getElementHandle(page, action.payload.selector);
            await handle.uploadFile(...action.payload.filePaths);
            break;

          case "waitForDomUpdate":
            await page.waitForNetworkIdle({ idleTime: 1000, timeout: action.payload.timeout || 30000 }).catch(err => console.log(`Network idle timeout - continuing: ${err.message}`));
            break;
          case "waitForSelector":
            await this._waitForSelector(page, action.payload.selector, action.payload.options || {});
            break;
          case "waitForNavigation":
            await page.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded', ...(action.payload.options || {}) }).catch(err => console.log(`Navigation timeout - continuing: ${err.message}`));
            break;
          case "waitForFunction":
            {
              const functionToExecute = action.payload.fn || action.payload.function || action.payload.pageFunction || action.payload.value;
              if (!functionToExecute) throw new Error('waitForFunction requires a function string.');
              await page.waitForFunction(functionToExecute, action.payload.options, ...(action.payload.args || []));
            }
            break;
          case "sleep":
            await new Promise(resolve => setTimeout(resolve, action.payload.duration));
            break;

          case "screenshot":
            lastResult = await page.screenshot(action.payload.options);
            break;
          case "pdf":
            lastResult = await page.pdf(action.payload.options);
            break;
          case "setViewport":
            await page.setViewport(action.payload.viewport);
            break;
          case "setUserAgent":
            await page.setUserAgent(action.payload.userAgent);
            break;
          case "setCookies":
            await page.setCookie(...action.payload.cookies);
            break;
          case "deleteCookies":
            await page.deleteCookie(...action.payload.cookies);
            break;
          case "bringToFront":
            await page.bringToFront();
            break;

          case "evaluate":
            {
              const evaluateFunction = action.payload.fn || action.payload.function || action.payload.pageFunction || action.payload.value;
              if (!evaluateFunction) throw new Error('evaluate requires a function string.');
              lastResult = await page.evaluate(evaluateFunction, ...(action.payload.args || []));
            }
            break;
          case "getBodyContent":
            {
              await page.waitForNetworkIdle({ idleTime: 2000, timeout: 5000 }).catch(() => {});
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              const bodyContent = await page.evaluate(() => document.body ? document.body.innerHTML : '');
              
              lastResult = { content: bodyContent, stabilizedHTML: true };
            }
            break;
          case "getHtml":
            handle = await this._getElementHandle(page, action.payload.selector);
            lastResult = await handle.evaluate(el => el.outerHTML);
            break;
          case "getText":
            handle = await this._getElementHandle(page, action.payload.selector);
            lastResult = await handle.evaluate(el => el.innerText);
            break;
          case "getAttribute":
            handle = await this._getElementHandle(page, action.payload.selector);
            lastResult = await handle.evaluate((el, attr) => el.getAttribute(attr), action.payload.attribute);
            break;
          case "getValue":
            handle = await this._getElementHandle(page, action.payload.selector);
            lastResult = await handle.evaluate(el => el.value);
            break;
          case "getCookies":
            lastResult = await page.cookies(...(action.payload.urls || []));
            break;
          case "getClickableElements":
          case "getWriteableElements":
            {
              const allElements = await page.evaluate((source) => eval(source), elementDetectorSource);
              lastResult = allElements.filter(el => el.type === (action.type === 'getClickableElements' ? 'clickable' : 'writeable'));
            }
            break;

          default:
            console.log(`Unknown action type: ${action.type}`);
        }

        if (instance) {
          instance.pipeline.push(action);
        }
        puppeteerManager.emit('action:end', { sessionId: id, action, result: lastResult, currentUrl: page.url() });
      } catch (error) {
        console.log("Puppeteer Runner Action Error:", { action: action.type, message: error.message });
        puppeteerManager.emit('action:error', { sessionId: id, action, error: { message: error.message, stack: error.stack }, currentUrl: currentUrlBeforeAction });
        throw error;
      } finally {
        if (handle) {
          await handle.dispose();
        }
      }
    }
    
    console.log(`Puppeteer Runner finished actions for instance ${id}`);
    return lastResult;
  }
}

export default new PuppeteerRunner();
