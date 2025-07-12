import Puppeteer from './puppeteer.js';
import ApiClient from './services/apiClient.js';
import puppeteerManager from './services/puppeteerManager.js';
import puppeteerRunner from './services/puppeteerRunner.js';
import LiveTask from './LiveTask.js';
import template from './utils/template.js';

/**
 * Pupi Puppeteer SDK
 * 
 * This SDK allows you to:
 * 1. Execute automation steps locally using Puppeteer.
 * 2. Send prompts to the Pupi AI API for automated execution.
 * 3. Manage browser instances and API sessions.
 */

const replaceParamsInObject = (target, params) => {
    if (!target || !params) {
        return target;
    }

    if (typeof target === 'string') {
        return template.replace(target, params);
    }

    if (Array.isArray(target)) {
        return target.map(item => replaceParamsInObject(item, params));
    }

    if (typeof target === 'object' && target !== null) {
        const newObj = {};
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                newObj[key] = replaceParamsInObject(target[key], params);
            }
        }
        return newObj;
    }

    return target;
};

class PupiPuppeteerSDK {
  constructor(apiBaseUrl = 'https://api.pupiai.com') {
    this.apiClient = new ApiClient(apiBaseUrl);
  }

  /**
   * Sets the access token for all subsequent API requests.
   * @param {string} token - The access token.
   */
  setAccessToken(token) {
    this.apiClient.setAccessToken(token);
  }

  /**
   * Executes a series of automation steps locally.
   * This method creates a browser instance and runs the steps.
   * The instance remains open until explicitly closed via `closeAllInstances()` or by managing the returned instanceId.
   * @param {Array} steps - Array of step objects to execute.
   * @param {Object} [options={}] - Optional parameters.
   * @param {Object} [options.params={}] - Parameters to replace in step values.
   * @param {import('puppeteer').LaunchOptions} [options.launchOptions={}] - Puppeteer launch options.
   * @returns {Promise<{result: any, instanceId: string}>} - An object containing the result of the final step and the ID of the browser instance used.
   */
  async executeStepsLocally(steps, options = {}) {
    const { params = {}, launchOptions = {} } = options;
    const instance = new Puppeteer({ launchOptions });

    const processedSteps = steps.map(step => replaceParamsInObject(step, params));

    processedSteps.forEach(step => {
      const actionType = step.action || step.type;

      switch (actionType) {
        // Navigation
        case 'navigate':
        case 'go':
          instance.go({ url: step.url || step.value, options: step.options });
          break;
        case 'reload':
          instance.reload({ options: step.options });
          break;
        case 'goBack':
          instance.goBack({ options: step.options });
          break;
        case 'goForward':
          instance.goForward({ options: step.options });
          break;

        // Interaction
        case 'click':
          instance.click({ selector: step.selector, options: step.options });
          break;
        case 'type':
        case 'write':
          instance.write({ selector: step.selector, value: step.value, options: step.options });
          break;
        case 'press':
          instance.press({ key: step.key || step.value, options: step.options });
          break;
        case 'hover':
          instance.hover({ selector: step.selector });
          break;
        case 'focus':
          instance.focus({ selector: step.selector });
          break;
        case 'select':
          const selectValues = Array.isArray(step.values) ? step.values : (step.value || '').split(',');
          instance.select({ selector: step.selector, values: selectValues });
          break;
        case 'clearInput':
          instance.clearInput({ selector: step.selector });
          break;
        case 'uploadFile':
          const filePaths = Array.isArray(step.filePaths) ? step.filePaths : (step.value || '').split(',');
          instance.uploadFile({ selector: step.selector, filePaths: filePaths });
          break;

        // Waiting
        case 'sleep':
          instance.sleep({ duration: step.duration || Number(step.value) });
          break;
        case 'waitForSelector':
          instance.waitForSelector({ selector: step.selector, options: step.options });
          break;
        case 'waitForNavigation':
          instance.waitForNavigation({ options: step.options || (step.value ? JSON.parse(step.value) : {}) });
          break;
        case 'waitForFunction':
          instance.waitForFunction({ fn: step.function || step.value, options: step.options, args: step.args });
          break;
        case 'waitForDomUpdate':
          instance.waitForDomUpdate({ timeout: step.timeout || (step.value ? Number(step.value) : undefined) });
          break;

        // Browser manipulation
        case 'screenshot':
          instance.screenshot({ options: step.options || (step.value ? { path: step.value } : {}) });
          break;
        case 'pdf':
          instance.pdf({ options: step.options || (step.value ? { path: step.value } : {}) });
          break;
        case 'setViewport':
          instance.setViewport({ viewport: step.viewport || (step.value ? JSON.parse(step.value) : {}) });
          break;
        case 'setUserAgent':
          instance.setUserAgent({ userAgent: step.userAgent || step.value });
          break;
        case 'setCookies':
          instance.setCookies({ cookies: step.cookies || (step.value ? JSON.parse(step.value) : []) });
          break;
        case 'deleteCookies':
          instance.deleteCookies({ cookies: step.cookies || (step.value ? JSON.parse(step.value) : []) });
          break;
        case 'bringToFront':
          instance.bringToFront();
          break;

        // Data extraction
        case 'evaluate':
          instance.evaluate({ fn: step.function || step.value, args: step.args });
          break;
        case 'getContent':
          instance.getContent();
          break;
        case 'getBodyContent':
          instance.getBodyContent();
          break;
        case 'getHtml':
          instance.getHtml({ selector: step.selector });
          break;
        case 'getText':
          instance.getText({ selector: step.selector });
          break;
        case 'getAttribute':
          instance.getAttribute({ selector: step.selector, attribute: step.attribute || step.value });
          break;
        case 'getValue':
          instance.getValue({ selector: step.selector });
          break;
        case 'getCookies':
          const cookieUrls = Array.isArray(step.urls) ? step.urls : (step.value ? step.value.split(',') : undefined);
          instance.getCookies({ urls: cookieUrls });
          break;
        case 'getClickableElements':
          instance.getClickableElements();
          break;
        case 'getWriteableElements':
          instance.getWriteableElements();
          break;

        default:
          console.warn(`Unknown step action: ${actionType}`);
      }
    });

    const result = await instance.run();
    return { result, instanceId: instance.id };
  }

  /**
   * Sends a prompt to the Pupi AI API for automation.
   * @param {string} prompt - The task description for the AI.
   * @param {Object} options - Additional options for the AI request (e.g., params, enums).
   * @returns {Promise<any>} - The response from the AI.
   */
  async sendPromptToAI(prompt, options = {}) {
    return await this.apiClient.sendPrompt(prompt, options);
  }

  /**
   * Starts a live automation task and returns an event emitter to listen for real-time events.
   * @param {string} prompt - The task description for the AI.
   * @param {Object} options - Additional options for the AI request (e.g., params, enums).
   * @returns {Promise<LiveTask>} - A LiveTask instance (EventEmitter) for listening to events.
   */
  async startLiveTask(prompt, options = {}) {
    const liveOptions = { ...options, live: true };
    const initialResponse = await this.sendPromptToAI(prompt, liveOptions);

    if (initialResponse.code !== 202 || !initialResponse.data?.websocketUrl) {
      throw new Error('Failed to start live process. API did not return a valid WebSocket URL. Response: ' + JSON.stringify(initialResponse));
    }

    const { websocketUrl } = initialResponse.data;
    return new LiveTask(websocketUrl);
  }

  /**
   * Gets the result of a session from the API.
   * @param {string} sessionId - Session ID to get results for.
   * @returns {Promise<Object>} - Session results.
   */
  async getSessionResult(sessionId) {
    return await this.apiClient.getSessionResult(sessionId);
  }

  /**
   * Closes a session via the API.
   * @param {string} sessionId - Session ID to close.
   * @returns {Promise<Object>} - Closure confirmation.
   */
  async closeSession(sessionId) {
    return await this.apiClient.closeSession(sessionId);
  }

  /**
   * Gets all active sessions from the API.
   * @returns {Promise<Object>} - A list of active sessions.
   */
  async getActiveSessions() {
    return await this.apiClient.getActiveSessions();
  }

  /**
   * Closes all active sessions on the API server.
   * @returns {Promise<Object>} - Closure confirmation.
   */
  async closeAllSessions() {
    return await this.apiClient.closeAllSessions();
  }

  /**
   * Sets the API base URL.
   * @param {string} baseUrl - New base URL.
   */
  setApiBaseUrl(baseUrl) {
    this.apiClient.setBaseUrl(baseUrl);
  }

  /**
   * Closes all local browser instances managed by this SDK.
   * @returns {Promise<void>}
   */
  async closeAllInstances() {
    await puppeteerManager.closeAll();
  }

  /**
   * Gets a reference to the Puppeteer class for advanced, chainable usage.
   * @returns {Function} - The Puppeteer class.
   */
  get Puppeteer() {
    return Puppeteer;
  }

  /**
   * Gets a reference to the API client for advanced usage.
   * @returns {ApiClient} - The API client instance.
   */
  get api() {
    return this.apiClient;
  }
}

// Export both the main class and individual components
export default PupiPuppeteerSDK;
export { Puppeteer, ApiClient, puppeteerManager, puppeteerRunner, LiveTask };
