const puppeteer = require('puppeteer-core');

(async () => {
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false, // Important: Use real browser for mouse interactions
    userDataDir: './chrome_data',
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  
  // Set viewport to ensure elements are visible
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Navigate to the page
  await page.goto('https://displayvideo.google.com/ng_nav/p/1052433/a/578086711/creatives', { 
    waitUntil: 'networkidle2', 
    timeout: 90000 
  });
  
  // Add a delay to ensure Angular has fully rendered the content
  console.log("Waiting for Angular to render content...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const creativeIds = [
    '658711232',
    '658704570',
    '658705872',
    '658705872',
    '658709647',

  ];

  for (const creativeId of creativeIds) {
    try {
      console.log(`Processing creative ID: ${creativeId}`);
      
      // Use a specific selector for the name element
      const nameSelector = `a[id="${creativeId}-name"]`;
      
      // Wait for the element to be available in the DOM
      const nameElement = await page.$(nameSelector);
      
      if (!nameElement) {
        console.warn(`Element with selector ${nameSelector} not found. Skipping.`);
        continue;
      }
      
      console.log(`Found element with selector: ${nameSelector}`);
      
      // Get the bounding box of the element to hover at the right position
      const boundingBox = await nameElement.boundingBox();
      
      if (!boundingBox) {
        console.warn(`Could not get bounding box for element with selector: ${nameSelector}`);
        continue;
      }
      
      // Find the parent TR element to hover over it
      const parentTR = await page.evaluateHandle(el => {
        let current = el;
        while (current && current.tagName !== 'TR') {
          current = current.parentElement;
        }
        return current;
      }, nameElement);
      
      const trBoundingBox = await parentTR.boundingBox();
      
      if (!trBoundingBox) {
        console.warn(`Could not get bounding box for parent TR element`);
        continue;
      }
      
      console.log(`Found parent row. Hovering over it...`);
      
      // Hover over the TR element using Puppeteer's mouse
      await page.mouse.move(
        trBoundingBox.x + trBoundingBox.width / 2, 
        trBoundingBox.y + trBoundingBox.height / 2
      );
      
      // Wait a moment for the hover effect to show the preview button
      console.log(`Waiting for preview button to appear after hover...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now look for the preview button that should be visible after hovering
      const previewButtonSelector = 'button[mattooltip="Preview"]';
      
      // Check if the preview button exists within the row
      const previewButtonExists = await page.evaluate((trElement, buttonSelector) => {
        const buttons = trElement.querySelectorAll(buttonSelector);
        return buttons.length > 0;
      }, parentTR, previewButtonSelector);
      
      if (!previewButtonExists) {
        console.warn(`Preview button not found after hovering. Skipping.`);
        continue;
      }
      
      console.log(`Preview button found. Clicking it...`);
      
      // Click the preview button within the row
      await page.evaluate((trElement, buttonSelector) => {
        const button = trElement.querySelector(buttonSelector);
        if (button) button.click();
      }, parentTR, previewButtonSelector);
      
      // Wait for a new page to be created
      console.log("Waiting for new page to open...");
      const newPagePromise = new Promise(resolve => {
        const timeoutId = setTimeout(() => resolve(null), 10000); // 10 second timeout
        
        browser.once('targetcreated', async target => {
          clearTimeout(timeoutId);
          const newPage = await target.page();
          resolve(newPage);
        });
      });
      
      const newPage = await newPagePromise;
      
      if (!newPage) {
        console.error(`No new page opened for creative ID: ${creativeId}`);
        
        // Try a direct click as a fallback
        console.log("Trying direct click on preview button as fallback...");
        
        // Find the preview button directly
        const previewButton = await page.evaluateHandle((trElement, buttonSelector) => {
          return trElement.querySelector(buttonSelector);
        }, parentTR, previewButtonSelector);
        
        if (previewButton) {
          // Get the bounding box of the button
          const buttonBox = await previewButton.boundingBox();
          
          if (buttonBox) {
            // Click directly on the button using mouse coordinates
            await page.mouse.click(
              buttonBox.x + buttonBox.width / 2,
              buttonBox.y + buttonBox.height / 2
            );
            
            // Wait again for a new page
            const secondAttemptPage = await new Promise(resolve => {
              const timeoutId = setTimeout(() => resolve(null), 10000);
              browser.once('targetcreated', async target => {
                clearTimeout(timeoutId);
                const newPage = await target.page();
                resolve(newPage);
              });
            });
            
            if (!secondAttemptPage) {
              console.error(`Still no new page after direct click. Skipping.`);
              continue;
            }
            
            console.log(`New page opened after direct click for creative ID: ${creativeId}`);
            // Get the URL immediately without waiting for navigation
            const previewUrl = secondAttemptPage.url();
            console.log(`Preview URL for creative ID ${creativeId}: ${previewUrl}`);
            await secondAttemptPage.close();
            continue;
          }
        }
        
        console.error(`Fallback also failed. Skipping.`);
        continue;
      }
      
      console.log(`New page opened for creative ID: ${creativeId}`);
      
      // Get the URL immediately without waiting for navigation
      const previewUrl = newPage.url();
      console.log(`Preview URL for creative ID ${creativeId}: ${previewUrl}`);
      
      // Close the new page
      await newPage.close();
      
    } catch (error) {
      console.error(`Error processing creative ID ${creativeId}:`, error.message);
    }
  }

  console.log("Script finished processing all creative IDs. Browser will close in 5 seconds.");
  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();

} catch (error) {
  console.error("A critical error occurred:", error);
  if (browser) await browser.close();
}
})();