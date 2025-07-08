import PupiPuppeteerSDK from '../src/index.js';

/**
 * This example demonstrates filling a form using Pupi AI, with pre-defined initial steps.
 * 1. Define 'initial_steps' to navigate to the page and prepare it for automation.
 *    This is useful for handling logins, cookie banners, or other setup tasks.
 * 2. Define a prompt for the AI to perform the main task (filling the form).
 * 3. Send the prompt and initial steps to the API. The AI will continue from where the initial steps left off.
 * 4. The API executes the full pipeline (initial steps + AI steps) and returns the result.
 */
async function formSubmissionExample() {
  console.log('🚀 Starting form submission example with initial steps...');

  const sdk = new PupiPuppeteerSDK('http://localhost:4000');
  sdk.setAccessToken('0acec170-3610-4f35-b385-7f406dee8023');

  // These steps are executed *before* the AI starts its analysis.
  // This guarantees the page is in the correct state for the AI.
  const initial_steps = [
    { type: 'go', value: 'https://httpbin.org/forms/post' },
    { type: 'waitForSelector', selector: 'form' }
  ];

  const prompt = "Fill the form with the following data: Customer Name: 'Pupi AI', Telephone: '555-123-4567', Email: 'contact@pupi.ai'. Then, select 'Medium' for the size and check the first two toppings. Finally, submit the form.";

  const options = {
    initial_steps,
    // We can pass parameters to be used in the prompt or initial steps.
    params: {
      // This is just an example, not used in this specific prompt.
      // delivery_instructions: "Leave at the front door." 
    }
  };

  try {
    // --- Step 1: Send prompt and initial steps to Pupi AI ---
    console.log(`📤 Sending prompt to AI: "${prompt}"`);
    console.log(`➡️  With ${initial_steps.length} initial steps.`);
    
    // The API will run the initial steps, then run the AI-generated steps.
    // The full pipeline is executed on the server side in this case.
    const aiResponse = await sdk.sendPromptToAI(prompt, options);

    if (!aiResponse.data) {
      throw new Error('AI did not return a valid response. Response: ' + JSON.stringify(aiResponse));
    }

    console.log('✅ AI task completed successfully on the server.');
    console.log(`🤖 AI Summary: ${aiResponse.data.result}`);
    console.log('📄 Full server-side log is available via session ID:', aiResponse.data.sessionId);
    
    // You can use the sessionId to get detailed logs or artifacts from the server if needed.
    // const sessionResult = await sdk.getSessionResult(aiResponse.data.sessionId);
    // console.log(sessionResult);

  } catch (error) {
    console.error('❌ An error occurred during the form submission example:', error.message);
    console.error(error.stack);
  } finally {
    // No local instances were created, so no cleanup is needed here.
    // You can optionally close the session on the server.
    console.log('\n🧹 Example finished.');
  }
}

formSubmissionExample();
