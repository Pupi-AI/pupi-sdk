import puppeteerRunner from "./services/puppeteerRunner.js";
import puppeteerManager from "./services/puppeteerManager.js";
import uuid from "./utils/uuid.js";

/**
 * @typedef {import('puppeteer').LaunchOptions} LaunchOptions
 * @typedef {import('puppeteer').NavigationOptions} NavigationOptions
 * @typedef {import('puppeteer').ClickOptions} ClickOptions
 * @typedef {import('puppeteer').KeyboardPressOptions} KeyboardPressOptions
 * @typedef {import('puppeteer').WaitForSelectorOptions} WaitForSelectorOptions
 * @typedef {import('puppeteer').PDFOptions} PDFOptions
 * @typedef {import('puppeteer').ScreenshotOptions} ScreenshotOptions
 * @typedef {import('puppeteer').Viewport} Viewport
 * @typedef {import('puppeteer').CookieParam} CookieParam
 */

class Puppeteer {
  /**
   * Initializes a new Puppeteer automation instance.
   * @param {{ id?: string, launchOptions?: LaunchOptions }} [params={}] - Configuration for the Puppeteer instance.
   */
  constructor({ id, launchOptions = {} } = {}) {
    this.actions = [];
    this.options = { launchOptions };
    this.id = id || uuid();
  }

  // --- Navigation ---

  /**
   * Navigates to a specified URL.
   * @param {{ url: string, options?: NavigationOptions, enum?: string }} params - The URL to navigate to, optional navigation parameters, and enum category.
   * @returns {this}
   */
  go = ({ url, options, enum: enumValue }) => {
    this.actions.push({ type: "go", payload: { url, options }, enum: enumValue });
    return this;
  };

  /**
   * Reloads the current page.
   * @param {{ options?: NavigationOptions, enum?: string }} [params={}] - Optional navigation parameters and enum category.
   * @returns {this}
   */
  reload = ({ options, enum: enumValue } = {}) => {
    this.actions.push({ type: "reload", payload: { options }, enum: enumValue });
    return this;
  };

  /**
   * Navigates to the previous page in the browser history.
   * @param {{ options?: NavigationOptions, enum?: string }} [params={}] - Optional navigation parameters and enum category.
   * @returns {this}
   */
  goBack = ({ options, enum: enumValue } = {}) => {
    this.actions.push({ type: "goBack", payload: { options }, enum: enumValue });
    return this;
  };

  /**
   * Navigates to the next page in the browser history.
   * @param {{ options?: NavigationOptions, enum?: string }} [params={}] - Optional navigation parameters and enum category.
   * @returns {this}
   */
  goForward = ({ options, enum: enumValue } = {}) => {
    this.actions.push({ type: "goForward", payload: { options }, enum: enumValue });
    return this;
  };

  // --- Clicking and Interacting ---

  /**
   * Clicks an element matching the selector.
   * @param {{ selector: string, options?: ClickOptions, enum?: string }} params - The JSPath or XPath selector for the element to click, optional click parameters, and enum category.
   * @returns {this}
   */
  click = ({ selector, options, enum: enumValue }) => {
    this.actions.push({ type: "click", payload: { selector, options }, enum: enumValue });
    return this;
  };

  /**
   * Simulates a key press.
   * @param {{ key: string, options?: KeyboardPressOptions, enum?: string }} params - The key to press (e.g., 'Enter', 'a'), optional press parameters, and enum category.
   * @returns {this}
   */
  press = ({ key, options, enum: enumValue }) => {
    this.actions.push({ type: "press", payload: { key, options }, enum: enumValue });
    return this;
  };

  /**
   * Types text into an element matching the selector.
   * @param {{ selector: string, value: string, options?: { }, enum?: string }} params - The JSPath or XPath selector, the text to type, optional typing parameters, and enum category.
   * @returns {this}
   */
  write = ({ selector, value, options, enum: enumValue }) => {
    this.actions.push({ type: "write", payload: { selector, value, options }, enum: enumValue });
    return this;
  };

  /**
   * Clears the value of an input element.
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the input element to clear and enum category.
   * @returns {this}
   */
  clearInput = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "clearInput", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Hovers over an element matching the selector.
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the element to hover over and enum category.
   * @returns {this}
   */
  hover = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "hover", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Focuses on an element matching the selector.
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the element to focus on and enum category.
   * @returns {this}
   */
  focus = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "focus", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Selects options in a <select> element.
   * @param {{ selector: string, values: string[], enum?: string }} params - The JSPath or XPath selector for the <select> element, an array of option values to select, and enum category.
   * @returns {this}
   */
  select = ({ selector, values, enum: enumValue }) => {
    this.actions.push({ type: "select", payload: { selector, values }, enum: enumValue });
    return this;
  };

  /**
   * Uploads files to an input[type=file] element.
   * @param {{ selector: string, filePaths: string[], enum?: string }} params - The JSPath or XPath selector for the file input, an array of file paths to upload, and enum category.
   * @returns {this}
   */
  uploadFile = ({ selector, filePaths, enum: enumValue }) => {
    this.actions.push({ type: "uploadFile", payload: { selector, filePaths }, enum: enumValue });
    return this;
  };

  // --- Waiting ---

  /**
   * Waits for the DOM to finish updating after an action, typically navigation.
   * @param {{ timeout?: number, enum?: string }} [params={}] - Maximum time to wait in milliseconds, defaults to 30000, and enum category.
   * @returns {this}
   */
  waitForDomUpdate = ({ timeout = 30000, enum: enumValue } = {}) => {
    this.actions.push({ type: "waitForDomUpdate", payload: { timeout }, enum: enumValue });
    return this;
  };

  /**
   * Waits for an element matching the selector to appear in the DOM.
   * @param {{ selector: string, options?: WaitForSelectorOptions, enum?: string }} params - The JSPath or XPath selector to wait for, optional wait parameters, and enum category.
   * @returns {this}
   */
  waitForSelector = ({ selector, options, enum: enumValue }) => {
    this.actions.push({ type: "waitForSelector", payload: { selector, options }, enum: enumValue });
    return this;
  };

  /**
   * Waits for a navigation to complete.
   * @param {{ options?: NavigationOptions, enum?: string }} params - Optional navigation parameters and enum category.
   * @returns {this}
   */
  waitForNavigation = ({ options, enum: enumValue }) => {
    this.actions.push({ type: "waitForNavigation", payload: { options }, enum: enumValue });
    return this;
  };

  /**
   * Waits for a JavaScript function to return a truthy value.
   * @param {{ fn: string, options?: { polling?: string | number, timeout?: number }, args?: any[], enum?: string }} params - The function to execute as a string, options, arguments, and enum category.
   * @returns {this}
   */
  waitForFunction = ({ fn, options, args, enum: enumValue }) => {
    this.actions.push({ type: "waitForFunction", payload: { fn, options, args }, enum: enumValue });
    return this;
  };

  /**
   * Pauses execution for a specified duration.
   * @param {{ duration: number, enum?: string }} params - The duration to sleep in milliseconds and enum category.
   * @returns {this}
   */
  sleep = ({ duration, enum: enumValue }) => {
    this.actions.push({ type: "sleep", payload: { duration }, enum: enumValue });
    return this;
  };

  // --- Browser Manipulation ---

  /**
   * Takes a screenshot of the current page. The result will be the last returned value from run().
   * @param {{ options?: ScreenshotOptions, enum?: string }} [params={}] - Optional screenshot parameters and enum category.
   * @returns {this}
   */
  screenshot = ({ options, enum: enumValue } = {}) => {
    this.actions.push({ type: "screenshot", payload: { options }, enum: enumValue });
    return this;
  };

  /**
   * Generates a PDF of the current page. The result will be the last returned value from run().
   * @param {{ options?: PDFOptions, enum?: string }} [params={}] - Optional PDF generation parameters and enum category.
   * @returns {this}
   */
  pdf = ({ options, enum: enumValue } = {}) => {
    this.actions.push({ type: "pdf", payload: { options }, enum: enumValue });
    return this;
  };

  /**
   * Sets the browser viewport dimensions.
   * @param {{ viewport: Viewport, enum?: string }} params - The viewport configuration and enum category.
   * @returns {this}
   */
  setViewport = ({ viewport, enum: enumValue }) => {
    this.actions.push({ type: "setViewport", payload: { viewport }, enum: enumValue });
    return this;
  };

  /**
   * Sets the browser's user agent.
   * @param {{ userAgent: string, enum?: string }} params - The user agent string and enum category.
   * @returns {this}
   */
  setUserAgent = ({ userAgent, enum: enumValue }) => {
    this.actions.push({ type: "setUserAgent", payload: { userAgent }, enum: enumValue });
    return this;
  };

  /**
   * Sets cookies for the current page.
   * @param {{ cookies: CookieParam[], enum?: string }} params - An array of cookie objects to set and enum category.
   * @returns {this}
   */
  setCookies = ({ cookies, enum: enumValue }) => {
    this.actions.push({ type: "setCookies", payload: { cookies }, enum: enumValue });
    return this;
  };

  /**
   * Deletes cookies.
   * @param {{ cookies: { name: string, url?: string, domain?: string, path?: string }[], enum?: string }} params - An array of cookie objects to delete and enum category.
   * @returns {this}
   */
  deleteCookies = ({ cookies, enum: enumValue }) => {
    this.actions.push({ type: "deleteCookies", payload: { cookies }, enum: enumValue });
    return this;
  };

  /**
   * Brings the page to the front (activates the tab).
   * @param {{ enum?: string }} [params={}] - Optional enum category.
   * @returns {this}
   */
  bringToFront = ({ enum: enumValue } = {}) => {
    this.actions.push({ type: "bringToFront", payload: {}, enum: enumValue });
    return this;
  };

  // --- Data Extraction ---

  /**
   * Executes a function in the browser context. The result will be the last returned value from run().
   * @param {{ fn: string, args?: any[], enum?: string }} params - The function to execute as a string, its arguments, and enum category.
   * @returns {this}
   */
  evaluate = ({ fn, args, enum: enumValue }) => {
    this.actions.push({ type: "evaluate", payload: { fn, args }, enum: enumValue });
    return this;
  };


  /**
   * Gets the inner HTML of the `<body>` element. The result will be the last returned value from run().
   * @param {{ enum?: string }} [params={}] - Optional enum category.
   * @returns {this}
   */
  getBodyContent = ({ enum: enumValue } = {}) => {
    this.actions.push({ type: "getBodyContent", payload: {}, enum: enumValue });
    return this;
  };

  /**
   * Gets the inner HTML of an element matching the selector. The result will be the last returned value from run().
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the element and enum category.
   * @returns {this}
   */
  getHtml = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "getHtml", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Gets the inner text of an element matching the selector. The result will be the last returned value from run().
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the element and enum category.
   * @returns {this}
   */
  getText = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "getText", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Gets an attribute's value from an element. The result will be the last returned value from run().
   * @param {{ selector: string, attribute: string, enum?: string }} params - The JSPath or XPath selector, the attribute name, and enum category.
   * @returns {this}
   */
  getAttribute = ({ selector, attribute, enum: enumValue }) => {
    this.actions.push({ type: "getAttribute", payload: { selector, attribute }, enum: enumValue });
    return this;
  };

  /**
   * Gets the `value` property of an input element. The result will be the last returned value from run().
   * @param {{ selector: string, enum?: string }} params - The JSPath or XPath selector for the input element and enum category.
   * @returns {this}
   */
  getValue = ({ selector, enum: enumValue }) => {
    this.actions.push({ type: "getValue", payload: { selector }, enum: enumValue });
    return this;
  };

  /**
   * Gets cookies for the specified URLs. The result will be the last returned value from run().
   * @param {{ urls?: string[], enum?: string }} [params={}] - Optional array of URLs to get cookies for and enum category.
   * @returns {this}
   */
  getCookies = ({ urls, enum: enumValue } = {}) => {
    this.actions.push({ type: "getCookies", payload: { urls }, enum: enumValue });
    return this;
  };

  /**
   * Gets all clickable elements on the page. The result will be the last returned value from run().
   * @param {{ enum?: string }} [params={}] - Optional enum category.
   * @returns {this}
   */
  getClickableElements = ({ enum: enumValue } = {}) => {
    this.actions.push({ type: "getClickableElements", payload: {}, enum: enumValue });
    return this;
  };

  /**
   * Gets all writeable elements on the page. The result will be the last returned value from run().
   * @param {{ enum?: string }} [params={}] - Optional enum category.
   * @returns {this}
   */
  getWriteableElements = ({ enum: enumValue } = {}) => {
    this.actions.push({ type: "getWriteableElements", payload: {}, enum: enumValue });
    return this;
  };

  /**
   * Detects non-interactive elements (containers, panels, sections) using AI vision.
   * @param {{ prompt: string, enum?: string }} params - Detection parameters.
   * @returns {this}
   */
  detectNonInteractiveItemsWithAI = ({ prompt, enum: enumValue } = {}) => {
    this.actions.push({ 
      type: "detectNonInteractiveItemsWithAI", 
      payload: { prompt }, 
      enum: enumValue 
    });
    return this;
  };

  // --- Execution ---

  /**
   * Executes all queued actions.
   * @returns {Promise<any>} The result of the last data extraction or manipulation action, or null.
   */
  run = async () => {
    let instance = puppeteerManager.get(this.id);
    if (!instance) {
      instance = await puppeteerManager.create(this.id, this.options.launchOptions);
    }
    const { page } = instance;
    return await puppeteerRunner.execute(page, this.actions, this.id);
  };
}

export default Puppeteer;
