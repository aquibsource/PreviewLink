const puppeteer = require('puppeteer-core');

// Helper function to create a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    userDataDir: './chrome_data', // Crucial for saving the login
  });

  const page = await browser.newPage();
  console.log("Navigating to DV360 login/dashboard page...");
  // Go to the main DV360 domain or a general dashboard page first
  await page.goto('https://displayvideo.google.com/', { waitUntil: 'networkidle2', timeout: 60000 });

  console.log("\n--------------------------------------------------------------------");
  console.log("MANUAL LOGIN REQUIRED!");
  console.log("The Chrome browser controlled by Puppeteer has opened.");
  console.log("Please log into your DV360 account in THAT Chrome window now.");
  console.log("Once you are successfully logged in and see your DV360 dashboard,");
  console.log("you can close THIS terminal window (Ctrl+C or Cmd+C) OR");
  console.log("the script will automatically close the browser after the timeout.");
  console.log("The login session will be saved in the './chrome_data' directory.");
  console.log("--------------------------------------------------------------------\n");

  // Keep the browser open for a long time to allow manual login
  // You can adjust this timeout. 300000 ms = 5 minutes.
  const loginTimeoutMs = 300000;
  console.log(`Waiting for ${loginTimeoutMs / 1000 / 60} minutes for manual login...`);
  await delay(loginTimeoutMs); // Use the custom delay function

  console.log("Timeout reached for manual login. Closing browser.");
  await browser.close();

} catch (error) {
  console.error("An error occurred during the initial login setup:", error);
  if (browser) {
    await browser.close();
  }
}
})();