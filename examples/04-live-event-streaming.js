import PupiPuppeteerSDK from '../src/index.js';

/**
 * This example demonstrates the simplified way to listen for live events.
 * 1. Use the `sdk.startLiveTask()` method to initiate the process.
 * 2. This method returns a `LiveTask` object, which is an EventEmitter.
 * 3. Add listeners for specific events like 'action:start', 'process:end', etc.
 */
async function liveEventStreamingExample() {
  console.log('🚀 Starting simplified live event streaming example...');

  // For local development, explicitly set the API URL to localhost.
  // The SDK default is 'https://api.pupiai.com'.
  const sdk = new PupiPuppeteerSDK('http://localhost:4000');
  sdk.setAccessToken('0acec170-3610-4f35-b385-7f406dee8023');

  const prompt = "Go to httpbin.org/redirect-to?url=https://httpbin.org/forms/post, then get the page title.";

  try {
    // --- Step 1: Start the live task and get the event emitter ---
    console.log(`📤 Sending prompt to AI with live mode enabled.`);
    const task = await sdk.startLiveTask(prompt);

    console.log(`✅ Live process started. Waiting for events...`);

    // --- Step 2: Add listeners for events ---
    task.on('open', () => {
      console.log('🔌 Connection established.');
    });

    task.on('url:change', (payload) => {
      console.log(`\n↪️  URL Changed: ${payload.url}`);
      if (payload.url !== payload.initialUrl) {
        console.log(`    (Redirected from: ${payload.initialUrl})`);
      }
    });

    task.on('action:start', (payload) => {
      console.log(`\n▶️  Action started: ${payload.action.type}`);
      console.log(`    @ URL: ${payload.currentUrl}`);
      if (payload.action.payload.selector) console.log(`    - Selector: ${payload.action.payload.selector}`);
      if (payload.action.payload.value) console.log(`    - Value: ${payload.action.payload.value}`);
    });

    task.on('action:end', (payload) => {
      console.log(`✅  Action finished: ${payload.action.type}`);
    });

    task.on('action:error', (payload) => {
      console.error(`❌  Action error: ${payload.action.type} - ${payload.error.message}`);
    });

    task.on('process:end', (payload) => {
      console.log('\n🎉 [PROCESS FINISHED]');
      console.log('  - Final Result:', payload.result.result);
      task.close(); // Clean up the connection
    });

    task.on('process:error', (payload) => {
      console.error('\n🚨 [PROCESS FAILED]');
      console.error('  - Error:', payload.error.message);
      task.close();
    });

    task.on('close', () => {
      console.log('\n🔌 Connection closed.');
    });

    task.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });

  } catch (error) {
    console.error('❌ An error occurred during the live streaming example:', error.message);
    console.error(error.stack);
  }
}

liveEventStreamingExample();
