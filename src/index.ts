import axios from "axios";
import puppeteer = require("puppeteer-core");
const colors = require("colors");
const randomUseragent = require("random-useragent");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36";
const RETAIL_ORDER_URL = "https://www.binance.com/bapi/margin/v1/private/collateral-order/query-retail-orders";
const BROWSER_URL = "http://127.0.0.1:9222";
const EXECUTABLE_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const liquidationPriceRate = 1.05;

const pageResponse = async (response: puppeteer.HTTPResponse) => {    
  const ts = new Date();
  if (new RegExp(RETAIL_ORDER_URL, "i").test(response.url())) {
    try {
      const jsonResponse = await response.json();
      console.log("binance loan orders at time: " + ts.toLocaleString());
      if (jsonResponse.success) {
        for(let rowItem of jsonResponse.data.rows) {
          const coin = rowItem.coin;
          const leftTotal = rowItem.leftTotal;
          const collateralAmount = rowItem.collateralAmount;
          const collateralCoin = rowItem.collateralCoin;
          const collateralLevel = rowItem.collateralLevel;
          const deadline = rowItem.deadline;
          const liquidationCollateralRate = rowItem.liquidationCollateralRate;
          const liquidationPrice = rowItem.liquidationPrice;
          let currentPrice = 1;
          try {
            const depthRes: any = await axios.get(`https://api.binance.com/api/v3/depth?symbol=${coin}${collateralCoin}&limit=1`);
            currentPrice = 1 / depthRes.data.asks[0][0];
          } catch(e) {
            console.error(`${coin}/${collateralCoin}, get current price error!`);
            continue;
          }
          
          let colorFunc = colors.yellow
          let status = ""
          if (currentPrice <= liquidationPrice * liquidationPriceRate) {
            colorFunc = colors.red
            status = "danger"
          } else {
            colorFunc = colors.green
            status = "health"
          }
          console.log(colorFunc(`borrowed: ${leftTotal} ${coin}, collateral: ${collateralAmount} ${collateralCoin}, deadline: ${new Date(deadline * 1).toLocaleString()}`));
          console.log(colorFunc(`collateralLevel: ${(collateralLevel * 100).toFixed(2)}% , liquidationCollateralRate: ${liquidationCollateralRate * 100}%`));
          console.log(colorFunc(`currentPrice: ${currentPrice}, autoRepayPrice: ${liquidationPrice * liquidationPriceRate}, liquidationPrice: ${liquidationPrice}`));
          console.log(colorFunc(`status: ${status}`));
          console.log();
        }
      } else {
        console.error(colors.red(jsonResponse));
      }
    }
    catch(e) {
      console.error(e)
    }
  }
};

(async () => {
  const userAgent = randomUseragent.getRandom();
  const UA = userAgent || USER_AGENT;
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: EXECUTABLE_PATH,
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
  await page.waitForNavigation();
  await page.goto("https://www.binance.com/en/loan");
  page.on("response", pageResponse);
  do {
    // 延时一分钟
    await page.reload();
    await page.waitForTimeout(1000 * 60);
  } while(true)
  // await browser.disconnect();
  // await page.click("#click_login_submit");
})();