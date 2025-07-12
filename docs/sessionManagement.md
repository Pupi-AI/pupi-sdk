# Session Management

Pupi SDK manages two types of sessions: local browser instances and remote API sessions.

## 1. Local Browser Instance Management

When you run automations locally, the SDK handles browser instances automatically. You do not need to manage instance IDs.

### `executeStepsLocally`

Each call to `sdk.executeStepsLocally(steps)` creates a new browser instance that **remains open** after the steps are executed. This is useful for debugging or inspecting the final state of the page.

1.  A new browser instance is created.
2.  The steps are executed.
3.  The instance ID is returned, and the browser stays open.

Because the instance is not closed automatically, you are responsible for cleanup. You can use the returned `instanceId` to close a specific instance or call `sdk.closeAllInstances()` to terminate all of them.

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK();

try {
  // This call will leave a browser instance running.
  const { instanceId } = await sdk.executeStepsLocally(steps1);
  console.log(`Instance ${instanceId} is running.`);

  // You can run another one in parallel.
  const { instanceId: instanceId2 } = await sdk.executeStepsLocally(steps2);
  console.log(`Instance ${instanceId2} is also running.`);

} finally {
  // It's crucial to close all instances at the end.
  await sdk.closeAllInstances();
  console.log("All local instances closed.");
}
```

### `Puppeteer` Class

When you use the `new Puppeteer()` class for chainable commands, a single browser instance is created and managed for the lifetime of that object.

```javascript
import { Puppeteer } from 'pupi-sdk';

// A new browser instance is created for this 'browser' object.
const browser = new Puppeteer(); 

// All these actions run in the same browser instance.
await browser.go({ url: 'https://google.com' }).run();
await browser.go({ url: 'https://github.com' }).run();

// The instance is closed when it's no longer needed (e.g., garbage collected)
// or by calling sdk.closeAllInstances().
```

### Cleaning Up Local Instances

It's good practice to call `sdk.closeAllInstances()` at the end of your script to ensure all local browser processes are terminated, especially in case of errors.

```javascript
try {
  // Your automation code...
} finally {
  await sdk.closeAllInstances();
}
```

## 2. Remote API Session Management

When interacting with the Pupi AI API, you use a `sessionId` to track a remote automation task.

### API Session Lifecycle

1.  **Start Session**: When you call `sdk.sendPromptToAI()`, the API creates a new session and returns a `sessionId`.
2.  **Track Progress**: You can use this `sessionId` to get the status and results of the running task.
3.  **Close Session**: Once the task is complete, you can close the session on the server.

### Example API Session Workflow

```javascript
import PupiPuppeteerSDK from 'pupi-sdk';

const sdk = new PupiPuppeteerSDK('https://your-api.com');
sdk.setAccessToken('your-secret-token');

async function runApiTask() {
  let sessionId = null;
  try {
    // 1. Start the session by sending a prompt
    const aiResponse = await sdk.sendPromptToAI("Find the price of the first product on example.com/shop");
    
    if (!aiResponse.data?.sessionId) {
      throw new Error("Failed to get a session ID from the API.");
    }
    sessionId = aiResponse.data.sessionId;
    console.log(`API Session started with ID: ${sessionId}`);

    // 2. Poll for the result (in a real app, you might use webhooks or a queue)
    let sessionResult = await sdk.getSessionResult(sessionId);
    console.log('Current session status:', sessionResult.status);
    // Add logic here to wait until the status is 'completed' or 'failed'

    console.log('Final session result:', sessionResult);

  } catch (error) {
    console.error("API task failed:", error.message);
  } finally {
    // 3. Close the session on the server
    if (sessionId) {
      await sdk.closeSession(sessionId);
      console.log(`API Session ${sessionId} closed.`);
    }
  }
}

runApiTask();
```

### Managing Multiple API Sessions

You can manage all active sessions on the API server.

```javascript
// Get a list of all active sessions
const { sessions } = await sdk.getActiveSessions();
console.log(`There are ${sessions.length} active sessions.`);

// Close all sessions on the server
if (sessions.length > 0) {
  await sdk.closeAllSessions();
  console.log("All active API sessions have been closed.");
}
```
