import PupiSDK from '../src/index.js';

/**
 * Example: Reusable Instance with executeStepsLocally
 * 
 * This example demonstrates how executeStepsLocally now automatically reuses 
 * the same browser instance across multiple calls. This eliminates the need 
 * for manual instance management and makes automation workflows much simpler.
 */

const sdk = new PupiSDK();

async function reusableInstanceExample() {
  try {
    console.log('🚀 Starting reusable instance example...');

    // Step 1: First call - creates a new instance
    console.log('\n📍 Phase 1: Initial navigation');
    const phase1Steps = [
      { action: 'go', url: 'https://example.com' },
      { action: 'waitForSelector', selector: 'h1' },
      { action: 'getText', selector: 'h1' }
    ];

    const { result: result1, instanceId: id1, isNewInstance: new1 } = await sdk.executeStepsLocally(phase1Steps);
    console.log('✅ Phase 1 completed');
    console.log('📝 Result:', result1);
    console.log('🆔 Instance ID:', id1);
    console.log('🆕 New instance created:', new1);

    // Step 2: Second call - reuses the same instance
    console.log('\n📍 Phase 2: Additional actions on same page');
    const phase2Steps = [
      { action: 'click', selector: 'a' }, // Click first link if exists
      { action: 'waitForDomUpdate' },
      { action: 'getBodyContent' }
    ];

    try {
      const { result: result2, instanceId: id2, isNewInstance: new2 } = await sdk.executeStepsLocally(phase2Steps);
      console.log('✅ Phase 2 completed');
      console.log('📝 Content length:', result2?.content?.length || 0);
      console.log('🆔 Instance ID:', id2);
      console.log('🆕 New instance created:', new2);
      console.log('♻️ Same instance used:', id1 === id2);
    } catch (error) {
      console.log('⚠️ Phase 2 failed (probably no clickable link):', error.message);
    }

    // Step 3: Third call - navigate to different page
    console.log('\n📍 Phase 3: Navigate to different page');
    const phase3Steps = [
      { action: 'go', url: 'https://httpbin.org/json' },
      { action: 'waitForDomUpdate' },
      { action: 'getBodyContent' }
    ];

    const { result: result3, instanceId: id3, isNewInstance: new3 } = await sdk.executeStepsLocally(phase3Steps);
    console.log('✅ Phase 3 completed');
    console.log('📝 Content length:', result3?.content?.length || 0);
    console.log('🆔 Instance ID:', id3);
    console.log('🆕 New instance created:', new3);
    console.log('♻️ Same instance used:', id1 === id3);

    // Step 4: Access the instance directly between calls
    console.log('\n🎯 Direct instance access between calls');
    const localPage = sdk.getLocalPage();
    if (localPage) {
      const currentUrl = localPage.url();
      const title = await localPage.title();
      console.log('🌍 Current URL:', currentUrl);
      console.log('📖 Page title:', title);

      // Take a screenshot
      await localPage.screenshot({ path: 'reusable-instance-screenshot.png' });
      console.log('📸 Screenshot saved');
    }

    // Step 5: More automation steps
    console.log('\n📍 Phase 4: Back to example.com');
    const phase4Steps = [
      { action: 'go', url: 'https://example.com' },
      { action: 'waitForSelector', selector: 'body' },
      { action: 'evaluate', function: 'document.querySelectorAll("a").length' }
    ];

    const { result: result4, instanceId: id4, isNewInstance: new4 } = await sdk.executeStepsLocally(phase4Steps);
    console.log('✅ Phase 4 completed');
    console.log('📝 Number of links:', result4);
    console.log('🆔 Instance ID:', id4);
    console.log('🆕 New instance created:', new4);
    console.log('♻️ Same instance used:', id1 === id4);

    // Step 6: Force new instance
    console.log('\n📍 Phase 5: Force new instance creation');
    const phase5Steps = [
      { action: 'go', url: 'https://httpbin.org/html' },
      { action: 'getText', selector: 'h1' }
    ];

    const { result: result5, instanceId: id5, isNewInstance: new5 } = await sdk.executeStepsLocally(
      phase5Steps, 
      { forceNewInstance: true }
    );
    console.log('✅ Phase 5 completed');
    console.log('📝 Result:', result5);
    console.log('🆔 Instance ID:', id5);
    console.log('🆕 New instance created:', new5);
    console.log('🔄 Different from original:', id1 !== id5);

    // Step 7: Show all active instances
    console.log('\n📋 All active instances:');
    const allIds = sdk.getActiveInstanceIds();
    console.log('🔢 Total instances:', allIds.length);
    console.log('🆔 Instance IDs:', allIds);

    // Step 8: Continue with the new instance
    console.log('\n📍 Phase 6: Continue with current (new) instance');
    const phase6Steps = [
      { action: 'getBodyContent' }
    ];

    const { result: result6, instanceId: id6, isNewInstance: new6 } = await sdk.executeStepsLocally(phase6Steps);
    console.log('✅ Phase 6 completed');
    console.log('📝 Content length:', result6?.content?.length || 0);
    console.log('🆔 Instance ID:', id6);
    console.log('🆕 New instance created:', new6);
    console.log('♻️ Uses latest instance:', id5 === id6);

    // Step 9: Cleanup
    console.log('\n🧹 Cleanup');
    await sdk.closeLocalInstance();
    console.log('✅ Local instance closed');

    // This will create a new instance again
    const phase7Steps = [
      { action: 'go', url: 'https://example.com' },
      { action: 'getText', selector: 'h1' }
    ];

    const { result: result7, instanceId: id7, isNewInstance: new7 } = await sdk.executeStepsLocally(phase7Steps);
    console.log('✅ New instance after cleanup');
    console.log('🆔 Instance ID:', id7);
    console.log('🆕 New instance created:', new7);

    await sdk.closeAllInstances();
    console.log('\n🎉 Example completed successfully!');

  } catch (error) {
    console.error('❌ Error in reusable instance example:', error);
  }
}

/**
 * Example: Multi-step workflow automation
 */
async function workflowExample() {
  console.log('\n🔄 Workflow automation example...');
  
  const sdk = new PupiSDK();

  try {
    // Step 1: Login simulation
    await sdk.executeStepsLocally([
      { action: 'go', url: 'https://httpbin.org/forms/post' },
      { action: 'waitForSelector', selector: 'form' }
    ]);
    console.log('✅ Login page loaded');

    // Step 2: Fill form
    await sdk.executeStepsLocally([
      { action: 'write', selector: 'input[name="custname"]', value: 'John Doe' },
      { action: 'write', selector: 'input[name="custtel"]', value: '555-1234' },
      { action: 'write', selector: 'input[name="custemail"]', value: 'john@example.com' }
    ]);
    console.log('✅ Form filled');

    // Step 3: Verify form data
    const page = sdk.getLocalPage();
    if (page) {
      const formData = await page.evaluate(() => {
        const form = document.querySelector('form');
        const data = {};
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        inputs.forEach(input => {
          data[input.name] = input.value;
        });
        return data;
      });
      console.log('📋 Form data:', formData);
    }

    // Step 4: Submit and capture result
    await sdk.executeStepsLocally([
      { action: 'click', selector: 'input[type="submit"]' },
      { action: 'waitForDomUpdate' },
      { action: 'getBodyContent' }
    ]);
    console.log('✅ Form submitted');

    await sdk.closeLocalInstance();
    
  } catch (error) {
    console.error('❌ Workflow error:', error);
    await sdk.closeAllInstances();
  }
}

/**
 * Example: Data extraction across multiple pages
 */
async function dataExtractionWorkflow() {
  console.log('\n📊 Data extraction workflow...');
  
  const sdk = new PupiSDK();
  const results = [];

  try {
    const pages = [
      'https://httpbin.org/json',
      'https://httpbin.org/xml', 
      'https://httpbin.org/html'
    ];

    for (let i = 0; i < pages.length; i++) {
      const url = pages[i];
      console.log(`📄 Processing page ${i + 1}: ${url}`);

      // Navigate and extract content
      const { result } = await sdk.executeStepsLocally([
        { action: 'go', url },
        { action: 'waitForDomUpdate' },
        { action: 'getBodyContent' }
      ]);

      // Get additional metadata using direct page access
      const page = sdk.getLocalPage();
      const title = await page.title();
      const finalUrl = page.url();

      results.push({
        index: i + 1,
        originalUrl: url,
        finalUrl,
        title,
        contentLength: result?.content?.length || 0,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Page ${i + 1} processed`);
    }

    console.log('\n📊 Final results:');
    results.forEach(result => {
      console.log(`${result.index}. ${result.title} - ${result.contentLength} chars`);
    });

    await sdk.closeLocalInstance();
    
  } catch (error) {
    console.error('❌ Data extraction error:', error);
    await sdk.closeAllInstances();
  }
}

// Run the examples
(async () => {
  await reusableInstanceExample();
  
  // Uncomment to run additional examples:
  // await workflowExample();
  // await dataExtractionWorkflow();
})();