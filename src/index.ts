import puppeteer = require("puppeteer-core");
const randomUseragent = require("random-useragent");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";

(async () => {
  const userAgent = randomUseragent.getRandom();
  const UA = userAgent || USER_AGENT;
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  });
  const page = await browser.newPage()
  await page.setViewport({
    width: 1200 + Math.floor(Math.random() * 100),
    height: 600 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false
  });
  await page.setUserAgent(UA);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);
  await page.goto("https://accounts.binance.com/en/login");
  // await browser.disconnect();
  // await page.click("#click_login_submit");
})();