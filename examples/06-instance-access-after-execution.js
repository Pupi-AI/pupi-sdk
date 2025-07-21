import PupiSDK from '../src/index.js';

/**
 * Example: Instance Access After executeStepsLocally
 * 
 * This example demonstrates how to access and work with browser instances 
 * after running executeStepsLocally. Previously, users could only get the 
 * instanceId but couldn't easily access the browser instance. Now we have 
 * several methods to solve this limitation.
 */

const sdk = new PupiSDK();

async function instanceAccessExample() {
  try {
    console.log('🚀 Starting instance access example...');

    // Step 1: Execute initial automation steps
    const initialSteps = [
      { action: 'go', url: 'https://example.com' },
      { action: 'waitForSelector', selector: 'h1' },
      { action: 'getText', selector: 'h1' }
    ];

    const { result, instanceId } = await sdk.executeStepsLocally(initialSteps);
    console.log('✅ Initial execution completed');
    console.log('📝 Result:', result);
    console.log('🆔 Instance ID:', instanceId);

    // Step 2: Access the instance using different methods
    console.log('\n🔍 Accessing the instance...');

    // Method 1: Get the complete instance object
    const instance = sdk.getInstance(instanceId);
    console.log('📦 Got instance:', !!instance);

    // Method 2: Get just the page object for direct Puppeteer operations
    const page = sdk.getPage(instanceId);
    console.log('📄 Got page:', !!page);

    // Method 3: Get the browser object
    const browser = sdk.getBrowser(instanceId);
    console.log('🌐 Got browser:', !!browser);

    // Step 3: Execute more steps on the same instance
    console.log('\n🔄 Executing additional steps on the same instance...');
    
    const additionalSteps = [
      { action: 'click', selector: 'a' }, // Click first link if exists
      { action: 'waitForDomUpdate' },
      { action: 'getBodyContent' }
    ];

    try {
      const additionalResult = await sdk.executeMoreSteps(instanceId, additionalSteps);
      console.log('✅ Additional steps completed');
      console.log('📝 Additional result length:', additionalResult?.content?.length || 0);
    } catch (error) {
      console.log('⚠️ Additional steps failed (probably no clickable link):', error.message);
    }

    // Step 4: Direct Puppeteer operations on the page
    console.log('\n🎯 Performing direct Puppeteer operations...');
    
    if (page) {
      // Get current URL
      const currentUrl = page.url();
      console.log('🌍 Current URL:', currentUrl);

      // Take a screenshot
      await page.screenshot({ path: 'example-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved as example-screenshot.png');

      // Get page title
      const title = await page.title();
      console.log('📖 Page title:', title);

      // Evaluate custom JavaScript
      const customResult = await page.evaluate(() => {
        return {
          documentHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight,
          linksCount: document.querySelectorAll('a').length
        };
      });
      console.log('📊 Custom evaluation result:', customResult);
    }

    // Step 5: View all active instances
    console.log('\n📋 All active instances:');
    const allInstances = sdk.getAllInstances();
    console.log('🔢 Total active instances:', allInstances.length);
    
    const instanceIds = sdk.getActiveInstanceIds();
    console.log('🆔 Instance IDs:', instanceIds);

    // Step 6: Create a second instance for comparison
    console.log('\n🆕 Creating a second instance...');
    const secondSteps = [
      { action: 'go', url: 'https://httpbin.org/json' },
      { action: 'getBodyContent' }
    ];

    const { result: secondResult, instanceId: secondInstanceId } = await sdk.executeStepsLocally(secondSteps);
    console.log('✅ Second instance created with ID:', secondInstanceId);
    
    console.log('\n📋 Updated active instances:');
    const updatedInstanceIds = sdk.getActiveInstanceIds();
    console.log('🆔 Instance IDs:', updatedInstanceIds);

    // Demonstrate that both instances are independent
    const firstPageUrl = sdk.getPage(instanceId)?.url();
    const secondPageUrl = sdk.getPage(secondInstanceId)?.url();
    console.log('🌍 First instance URL:', firstPageUrl);
    console.log('🌍 Second instance URL:', secondPageUrl);

    // Step 7: Close specific instance
    console.log('\n🗑️ Closing first instance...');
    await sdk.closeInstance(instanceId);
    
    console.log('📋 Remaining instances:');
    const remainingIds = sdk.getActiveInstanceIds();
    console.log('🆔 Instance IDs:', remainingIds);

    // Step 8: Cleanup
    console.log('\n🧹 Cleaning up remaining instances...');
    await sdk.closeAllInstances();
    
    const finalIds = sdk.getActiveInstanceIds();
    console.log('🆔 Final instance count:', finalIds.length);

    console.log('\n🎉 Example completed successfully!');

  } catch (error) {
    console.error('❌ Error in instance access example:', error);
  }
}

// Usage examples for different scenarios:

/**
 * Scenario 1: Long-running automation with multiple phases
 */
async function longRunningAutomationExample() {
  console.log('\n📚 Long-running automation example...');
  
  // Phase 1: Login
  const loginSteps = [
    { action: 'go', url: 'https://example.com/login' },
    { action: 'write', selector: '#username', value: 'user@example.com' },
    { action: 'write', selector: '#password', value: 'password123' },
    { action: 'click', selector: '#login-button' }
  ];

  const { instanceId } = await sdk.executeStepsLocally(loginSteps);
  console.log('✅ Login phase completed');

  // Phase 2: Navigate to dashboard
  const dashboardSteps = [
    { action: 'waitForSelector', selector: '.dashboard' },
    { action: 'click', selector: '.menu-item[data-section="reports"]' }
  ];

  await sdk.executeMoreSteps(instanceId, dashboardSteps);
  console.log('✅ Dashboard navigation completed');

  // Phase 3: Generate report with direct page access
  const page = sdk.getPage(instanceId);
  if (page) {
    // Custom JavaScript for complex operations
    await page.evaluate(() => {
      // Simulate complex report generation
      const reportButton = document.querySelector('#generate-report');
      if (reportButton) reportButton.click();
    });
    console.log('✅ Report generation initiated');
  }

  await sdk.closeInstance(instanceId);
}

/**
 * Scenario 2: Data extraction with multiple pages
 */
async function dataExtractionExample() {
  console.log('\n📊 Data extraction example...');
  
  const urls = [
    'https://httpbin.org/json',
    'https://httpbin.org/xml',
    'https://httpbin.org/html'
  ];

  const results = [];

  for (const url of urls) {
    const steps = [
      { action: 'go', url },
      { action: 'getBodyContent' }
    ];

    const { result, instanceId } = await sdk.executeStepsLocally(steps);
    
    // Get additional metadata using direct page access
    const page = sdk.getPage(instanceId);
    const title = await page.title();
    const finalUrl = page.url();

    results.push({
      originalUrl: url,
      finalUrl,
      title,
      contentLength: result?.content?.length || 0
    });

    await sdk.closeInstance(instanceId);
  }

  console.log('📊 Extraction results:', results);
}

// Run the examples
(async () => {
  await instanceAccessExample();
  
  // Uncomment to run additional examples:
  // await longRunningAutomationExample();
  // await dataExtractionExample();
})();