import fetch from 'node-fetch';

class ApiClient {
  constructor(baseUrl = 'https://api.pupiai.com') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
  }

  /**
   * Sets the access token for all subsequent API requests.
   * @param {string} token - The access token.
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Sets the base URL for the API
   * @param {string} baseUrl - The base URL of the Pupi AI API
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': this.accessToken || '',
      ...options.headers,
    };

    const config = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Sends a prompt to the AI for processing and automation
   * @param {string} prompt - The task description for AI
   * @param {Object} options - Additional options for the AI request (e.g., params, enums)
   * @returns {Promise<any>} - The AI response and execution result
   */
  async sendPrompt(prompt, options = {}) {
    return this._fetch('/start', {
      method: 'POST',
      body: {
        prompt,
        ...options,
      },
    });
  }

  /**
   * Gets the result of a specific session
   * @param {string} sessionId - Session ID to get results for
   * @returns {Promise<Object>} - Session results
   */
  async getSessionResult(sessionId) {
    return this._fetch(`/sdk/result/${sessionId}`);
  }

  /**
   * Closes an automation session
   * @param {string} sessionId - Session ID to close
   * @returns {Promise<Object>} - Closure confirmation
   */
  async closeSession(sessionId) {
    return this._fetch(`/sdk/close/${sessionId}`, { method: 'POST' });
  }

  /**
   * Gets all active sessions on the server
   * @returns {Promise<Object>} - List of active sessions
   */
  async getActiveSessions() {
    return this._fetch('/sdk/sessions');
  }

  /**
   * Closes all active sessions on the server
   * @returns {Promise<Object>} - Closure confirmation
   */
  async closeAllSessions() {
    return this._fetch('/sdk/close-all', { method: 'POST' });
  }
}

export default ApiClient;
