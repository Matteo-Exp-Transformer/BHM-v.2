const puppeteer = require('puppeteer');

async function testOnboardingFlow() {
  console.log('🔬 Starting Onboarding Flow Test...');

  const browser = await puppeteer.launch({
    headless: false, // Mostra il browser per debug
    devtools: true,  // Apre gli strumenti di sviluppo
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('📡 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });

    // Check if we're on login page or app page
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    // Check for onboarding wizard
    const onboardingExists = await page.$('.onboarding-wizard') !== null;
    console.log('🎯 Onboarding wizard found:', onboardingExists);

    // Look for navigation elements
    const navExists = await page.$('nav[role="navigation"]') !== null;
    console.log('🧭 Main navigation found:', navExists);

    // Check for conservation page access
    if (navExists) {
      console.log('🔄 Testing conservation page navigation...');

      // Try to click on conservation tab
      const conservationLink = await page.$('a[href="/conservazione"]');
      if (conservationLink) {
        await conservationLink.click();
        await page.waitForTimeout(2000); // Wait for page to load

        // Check for conservation points
        const conservationPoints = await page.$$eval(
          '.conservation-point-card, [data-testid="conservation-point"]',
          cards => cards.length
        );
        console.log('❄️ Conservation points found:', conservationPoints);

        // Check for data loading messages
        const mockDataMessage = await page.evaluate(() => {
          const logs = [];
          // Intercept console.log messages
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog(...args);
          };
          return logs.filter(log => log.includes('mock data')).length;
        });

        console.log('🔧 Mock data messages detected:', mockDataMessage > 0 ? 'YES' : 'NO');
      }
    }

    // Check for development buttons
    const devButtonsExist = await page.$('[data-testid="dev-buttons"], .dev-buttons') !== null;
    console.log('🛠️ Development buttons found:', devButtonsExist);

    // Test precompile functionality if available
    if (devButtonsExist) {
      console.log('🔄 Testing precompile functionality...');

      const prefillButton = await page.$('button:contains("Precompila")');
      if (prefillButton) {
        await prefillButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Precompile button clicked');
      }
    }

    // Check localStorage for onboarding data
    const onboardingData = await page.evaluate(() => {
      const data = localStorage.getItem('onboarding-data');
      return data ? JSON.parse(data) : null;
    });

    console.log('💾 Onboarding data in localStorage:', !!onboardingData);
    if (onboardingData) {
      console.log('  - Business data:', !!onboardingData.business);
      console.log('  - Departments:', onboardingData.departments?.length || 0);
      console.log('  - Staff:', onboardingData.staff?.length || 0);
      console.log('  - Conservation points:', onboardingData.conservation?.length || 0);
      console.log('  - Products:', onboardingData.inventory?.products?.length || 0);
    }

    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log(`✅ Page loaded: ${currentUrl !== 'about:blank'}`);
    console.log(`🎯 Onboarding available: ${onboardingExists}`);
    console.log(`🧭 Main navigation: ${navExists}`);
    console.log(`💾 Data in localStorage: ${!!onboardingData}`);
    console.log(`🛠️ Dev controls: ${devButtonsExist}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection...');
    console.log('📝 Press Ctrl+C to close when done');

    // Don't close browser automatically
    // await browser.close();
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ Server not running on localhost:3000');
    console.log('📋 Please run: npm run dev');
    process.exit(1);
  }

  await testOnboardingFlow();
}

main().catch(console.error);