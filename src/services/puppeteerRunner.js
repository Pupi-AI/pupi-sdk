import puppeteerManager from "./puppeteerManager.js";
import { elementDetectorSource } from "../utils/elementDetector.js";
import htmlSimplifier from "../utils/htmlSimplifier.js";

class PuppeteerRunner {
  
  
  // Validate selector to ensure it's a JSPath selector only
  validateSelector(selector) {
    if (!selector || typeof selector !== 'string') return true;
    
    // Check for any human-readable attributes - reject them completely
    const humanReadableAttributes = [
      'aria-label', 'title', 'alt', 'placeholder', 'data-tooltip', 'data-title', 
      'aria-describedby', 'aria-description', 'aria-labelledby', 'data-original-title',
      'tooltip', 'hint', 'help-text', 'description'
    ];
    
    const hasHumanReadableAttribute = humanReadableAttributes.some(attr => 
      selector.includes(`${attr}=`) || selector.includes(`[${attr}`)
    );
    
    if (hasHumanReadableAttribute) {
      console.log(`Invalid selector - contains human-readable attributes which are language-dependent: ${selector}`);
      return false;
    }

    // Check for text content in selectors (e.g., contains(), text())
    const textContentPatterns = [
      /contains\s*\(/,
      /text\s*\(/,
      /:contains\s*\(/,
      /normalize-space\s*\(/
    ];
    
    const hasTextContent = textContentPatterns.some(pattern => pattern.test(selector));
    
    if (hasTextContent) {
      console.log(`Invalid selector - contains text content which is language-dependent: ${selector}`);
      return false;
    }
    
    return true;
  }
  async execute(page, actions, id) {
    console.log(`Puppeteer Runner Started - ${id}`);
    let lastResult = null;

    const instance = puppeteerManager.get(id);

    for (const action of actions) {
      let currentUrlBeforeAction;
      try {
        currentUrlBeforeAction = page.url();
      } catch (e) {
        currentUrlBeforeAction = "N/A (page closed or invalid)";
      }

      try {
        console.log(`Executing action: ${action.type}`, action.payload);
        puppeteerManager.emit('action:start', { sessionId: id, action, currentUrl: currentUrlBeforeAction });

        switch (action.type) {
          case "go":
            try {
              let initialUrl = action.payload.url;
              if (!initialUrl.startsWith('http://') && !initialUrl.startsWith('https://')) {
                initialUrl = `https://${initialUrl}`;
                console.log(`URL auto-corrected: ${action.payload.url} -> ${initialUrl}`);
              }
              const initialOrigin = new URL(initialUrl).origin
              await page.browserContext().overridePermissions(initialOrigin, [
                "microphone",
                "camera",
                "notifications",
              ]);
              console.log(`Permissions granted for navigated origin: ${initialOrigin}`);

              await page.goto(initialUrl, { 
                waitUntil: "domcontentloaded", 
                timeout: 30000,
                ...(action.payload.options || {}) 
              });

            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Page load timeout - page may be partially loaded: ${error.message}`);
              } else if (error.message.includes('Cannot navigate to invalid URL')) {
                console.log(`Invalid URL error: ${action.payload.url}`);
                throw error;
              } else {
                throw error;
              }
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

          // Clicking and Interacting
          case "click":
            if (!this.validateSelector(action.payload.selector)) {
              throw new Error('Invalid selector: contains human-readable text');
            }
            try {
              await page.waitForSelector(action.payload.selector, { timeout: 15000 });
              await page.click(action.payload.selector, action.payload.options);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Click target not found - selector may not exist: ${action.payload.selector}`);
                throw error;
              } else {
                throw error;
              }
            }
            break;
          case "press":
            await page.keyboard.press(action.payload.key, action.payload.options);
            break;
          case "write":
            if (!this.validateSelector(action.payload.selector)) {
              throw new Error('Invalid selector: contains human-readable text');
            }
            try {
              await page.waitForSelector(action.payload.selector, { timeout: 30000 });
              // Clear the field first
              await page.focus(action.payload.selector);
              await page.keyboard.down('Control');
              await page.keyboard.press('a');
              await page.keyboard.up('Control');
              await page.keyboard.press('Backspace');
              await new Promise(resolve => setTimeout(resolve, 500));
              await page.type(action.payload.selector, action.payload.value, action.payload.options);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Write target not found - selector may not exist: ${action.payload.selector}`);
                throw error;
              } else {
                throw error;
              }
            }
            break;
          case "clearInput":
            if (!this.validateSelector(action.payload.selector)) {
              throw new Error('Invalid selector: contains human-readable text');
            }
            try {
              await page.waitForSelector(action.payload.selector, { timeout: 15000 });
              await page.$eval(action.payload.selector, el => el.value = '');
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Clear input target not found - selector may not exist: ${action.payload.selector}`);
                throw error;
              } else {
                throw error;
              }
            }
            break;
          case "hover":
            if (!this.validateSelector(action.payload.selector)) {
              throw new Error('Invalid selector: contains human-readable text');
            }
            try {
              await page.waitForSelector(action.payload.selector, { timeout: 15000 });
              await page.hover(action.payload.selector);
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Hover target not found - selector may not exist: ${action.payload.selector}`);
                throw error;
              } else {
                throw error;
              }
            }
            break;
          case "focus":
            await page.waitForSelector(action.payload.selector);
            await page.focus(action.payload.selector);
            break;
          case "select":
            await page.waitForSelector(action.payload.selector);
            await page.select(action.payload.selector, ...action.payload.values);
            break;
          case "uploadFile":
            {
              await page.waitForSelector(action.payload.selector);
              const elementHandle = await page.$(action.payload.selector);
              await elementHandle.uploadFile(...action.payload.filePaths);
            }
            break;

          // Waiting
          case "waitForDomUpdate":
            try {
              await page.waitForNetworkIdle({ 
                idleTime: 1000, 
                timeout: action.payload.timeout || 30000 
              });
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Network idle timeout - continuing: Waited ${action.payload.timeout || 30000}ms for network idle`);
              } else {
                throw error;
              }
            }
            break;
          case "waitForSelector":
            if (!this.validateSelector(action.payload.selector)) {
              throw new Error('Invalid selector: contains human-readable text');
            }
            await page.waitForSelector(action.payload.selector, action.payload.options);
            break;
          case "waitForNavigation":
            try {
              await page.waitForNavigation({ 
                timeout: 10000,
                waitUntil: 'domcontentloaded',
                ...(action.payload.options || {})
              });
            } catch (error) {
              if (error.name === 'TimeoutError') {
                console.log(`Navigation timeout - continuing without waiting: ${error.message}`);
              } else {
                throw error;
              }
            }
            break;
          case "waitForFunction":
            // Validate function doesn't contain human-readable text selectors
            const humanReadableAttributes = ['aria-label', 'title', 'alt', 'placeholder', 'data-tooltip', 'data-title', 'aria-describedby', 'aria-description'];
            if (action.payload.fn && typeof action.payload.fn === 'string') {
              const hasHumanReadableText = humanReadableAttributes.some(attr => action.payload.fn.includes(attr));
              if (hasHumanReadableText) {
                console.log(`Invalid waitForFunction - human-readable attribute detected: Function contains human-readable attribute which is language-dependent: ${action.payload.fn}`);
                throw new Error('waitForFunction cannot use human-readable text attributes as they are language-dependent');
              }
            }
            await page.waitForFunction(action.payload.fn, action.payload.options, ...(action.payload.args || []));
            break;
          case "sleep":
            await new Promise(resolve => setTimeout(resolve, action.payload.duration));
            break;

          // Browser Manipulation
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

          // Data Extraction
          case "evaluate":
            lastResult = await page.evaluate(action.payload.fn, ...(action.payload.args || []));
            break;
          case "getContent":
            lastResult = await page.content();
            break;
          case "getBodyContent":
            try {
              try {
                await page.waitForNetworkIdle({ 
                  idleTime: 2000, 
                  timeout: 5000 
                });
              } catch (timeoutError) {
                console.log("Network idle timeout during getBodyContent - continuing: Some network requests may still be pending");
              }
              
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              await page.waitForFunction(() => {
                return document.readyState === 'complete';
              }, { timeout: 3000 }).catch(() => {
              });
              
              const evaluationResult = await page.evaluate((elementDetectorSource) => {
                // Get body content with stable selectors
                const bodyContent = document.body.innerHTML;
                
                // Execute the element detector function
                const elementDetectorFunction = eval(elementDetectorSource);
                const elements = elementDetectorFunction.filter(el => 
                  el.type === 'clickable' || el.type === 'writeable'
                );
                
                // Return both content and elements with stable selectors
                return {
                  content: bodyContent,
                  interactiveElements: elements
                };
              }, elementDetectorSource);
              
              // Process the content with stable selectors
              const stabilizedContent = htmlSimplifier.replaceWithStableSelectors(
                evaluationResult.content, 
                evaluationResult.interactiveElements
              );
              
              lastResult = {
                content: stabilizedContent,
                interactiveElements: evaluationResult.interactiveElements,
                stabilizedHTML: true
              };
            } catch (error) {
              console.log(`getBodyContent failed: Error: ${error.message}`);
              lastResult = { error: true, message: `Failed to get page content - ${error.message}` };
            }
            break;
          case "getHtml":
            await page.waitForSelector(action.payload.selector);
            lastResult = await page.$eval(action.payload.selector, el => el.innerHTML);
            break;
          case "getText":
            await page.waitForSelector(action.payload.selector);
            lastResult = await page.$eval(action.payload.selector, el => el.innerText);
            break;
          case "getAttribute":
            await page.waitForSelector(action.payload.selector);
            lastResult = await page.$eval(action.payload.selector, (el, attr) => el.getAttribute(attr), action.payload.attribute);
            break;
          case "getValue":
            await page.waitForSelector(action.payload.selector);
            lastResult = await page.$eval(action.payload.selector, el => el.value);
            break;
          case "getCookies":
            lastResult = await page.cookies(...(action.payload.urls || []));
            break;

          case "getClickableElements":
          case "getWriteableElements":
            {
              const allElements = await page.evaluate((elementDetectorSource) => {
                const elementDetectorFunction = eval(elementDetectorSource);
                return elementDetectorFunction;
              }, elementDetectorSource);
              if (action.type === "getClickableElements") {
                lastResult = allElements.filter(el => el.type === 'clickable');
              } else { // getWriteableElements
                lastResult = allElements.filter(el => el.type === 'writeable');
              }
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
      }
    }
    
    console.log(`Puppeteer Runner finished actions for instance ${id}`);
    return lastResult;
  }
}

export default new PuppeteerRunner();