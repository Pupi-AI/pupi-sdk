import PupiPuppeteerSDK from '../src/index.js';

/**
 * This example demonstrates a real-world web scraping scenario using Pupi AI.
 * 1. Define a prompt to scrape data from a website.
 * 2. Use enums to categorize the actions for better pipeline analysis.
 * 3. Send the prompt to the Pupi AI API to get a series of automation steps.
 * 4. Execute the steps returned by the AI locally.
 * 5. Log the final extracted data.
 */
async function aiWebScrapingExample() {
  console.log('🚀 Starting AI-powered web scraping example...');

  // Initialize the SDK with the API's base URL
  const sdk = new PupiPuppeteerSDK('http://localhost:4000');
  
  // Set the access token for API authentication
  sdk.setAccessToken('0acec170-3610-4f35-b385-7f406dee8023'); // Replace with your actual token

  const prompt = "Go to httpbin.org/forms/post, get all the labels for the form fields, and then get the placeholder for the 'Telephone' input field.";

  const options = {
    // Enums help categorize actions in the resulting pipeline.
    // This is useful for analyzing the automation process later.
    enums: ['navigation', 'data_extraction']
  };

  try {
    // --- Step 1: Get automation steps from Pupi AI ---
    console.log(`📤 Sending prompt to AI: "${prompt}"`);
    const aiResponse = await sdk.sendPromptToAI(prompt, options);

    if (!aiResponse.data || !aiResponse.data.pipeline) {
      throw new Error('AI did not return a valid pipeline. Response: ' + JSON.stringify(aiResponse));
    }

    const { pipeline, result: aiSummary } = aiResponse.data;
    console.log(`✅ AI returned a pipeline with ${pipeline.length} steps.`);
    console.log(`🤖 AI Summary: ${aiSummary}`);

    // The pipeline from the AI contains high-level action descriptions.
    // We can now execute these steps locally.
    const stepsToExecute = pipeline.map(p => ({
        action: p.type,
        selector: p.selector,
        value: p.value,
    }));


    // --- Step 2: Execute the AI-generated steps locally ---
    console.log('\n🔄 Executing AI-generated steps locally...');
    // The browser will remain open after execution for inspection.
    const { result: extractedData, instanceId } = await sdk.executeStepsLocally(stepsToExecute, {
      launchOptions: { headless: false }
    });
    
    console.log('\n✅ Local execution finished!');
    console.log(`📦 Extracted Data (from instance ${instanceId}):`, extractedData);
    console.log('ℹ️ Browser will be closed in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ An error occurred during the web scraping example:', error.message);
    console.error(error.stack);
  } finally {
    // --- Step 3: Clean up ---
    // Ensure all local browser instances are closed.
    await sdk.closeAllInstances();
    console.log('\n🧹 All local browser instances closed.');
  }
}

aiWebScrapingExample();
