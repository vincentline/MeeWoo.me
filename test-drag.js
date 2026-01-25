const playwright = require('playwright');

(async () => {
  // Launch the browser
  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500 // Slow down operations for debugging
  });
  
  // Create a new page
  const page = await browser.newPage();
  
  try {
    // Navigate to the local server
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
    
    // Wait for the page to fully load
    await page.waitForTimeout(1000);
    
    // Check if the app has loaded
    const loadingSkeleton = await page.$('#loading-skeleton');
    if (loadingSkeleton) {
      console.log('App is still loading, waiting...');
      await page.waitForSelector('#loading-skeleton', { state: 'hidden' });
      await page.waitForTimeout(1000);
    }
    
    // Check if we can interact with the page
    await page.click('.footer-empty-tip', { force: true });
    console.log('Clicked on empty tip');
    
    // Wait for the file input to appear
    await page.waitForSelector('input[type="file"]', { timeout: 5000 });
    
    // Upload a test SVGA file if available
    // Note: You'll need to provide a test file path
    // const testFilePath = 'path/to/test.svga';
    // await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Alternatively, just open one of the panels
    console.log('Opening GIF panel...');
    await page.click('.btn-large-primary:has-text("转GIF")', { force: true });
    
    // Wait for the panel to appear
    await page.waitForSelector('.side-panel', { state: 'visible' });
    await page.waitForTimeout(500);
    
    // Check if the panel has the correct classes
    const panel = await page.$('.side-panel');
    const classes = await panel.evaluate(el => el.className);
    console.log('Panel classes:', classes);
    
    // Check if the header exists
    const header = await page.$('.side-panel-header');
    if (header) {
      console.log('Header found');
      
      // Try to drag the panel
      const headerBox = await header.boundingBox();
      if (headerBox) {
        console.log('Header bounding box:', headerBox);
        
        // Calculate the center of the header
        const centerX = headerBox.x + headerBox.width / 2;
        const centerY = headerBox.y + headerBox.height / 2;
        
        // Perform drag operation
        console.log('Starting drag at:', centerX, centerY);
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.waitForTimeout(200);
        
        // Drag the panel to the right and down
        await page.mouse.move(centerX + 100, centerY + 50);
        await page.waitForTimeout(200);
        
        // Release the mouse
        await page.mouse.up();
        console.log('Drag operation completed');
        
        // Check if the panel moved
        const newBox = await panel.boundingBox();
        if (newBox) {
          console.log('New panel position:', newBox.x, newBox.y);
          if (Math.abs(newBox.x - headerBox.x) > 50 || Math.abs(newBox.y - headerBox.y) > 25) {
            console.log('✅ Drag operation successful! Panel moved.');
          } else {
            console.log('❌ Panel did not move significantly');
          }
        }
      }
    } else {
      console.log('❌ Header not found');
    }
    
    // Check the console for any errors
    console.log('\n--- Console Logs ---');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Error in browser: ${msg.text()}`);
      } else {
        console.log(`Console: ${msg.text()}`);
      }
    });
    
    // Wait a bit for any console messages
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error('Error during test:', error);
    
    // Take a screenshot on error
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('Screenshot saved as error-screenshot.png');
    
  } finally {
    // Close the browser after 5 seconds
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
