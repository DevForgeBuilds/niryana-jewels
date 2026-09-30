const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "..", "responsive_audit");

const devices = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
];

async function scrollThrough(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < scrollHeight; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
    });
    const page = await context.newPage();

    // Go to a product page and add it to cart via the real UI button
    await page.goto(BASE + "/product/hare-krishna-silver-pendant", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    await addBtn.click();
    await page.waitForTimeout(500);

    // Add a second product too for a fuller cart
    await page.goto(BASE + "/product/9kt-gold-heart-ring", { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(400);
    const addBtn2 = page.getByRole("button", { name: /add to cart/i });
    if (await addBtn2.count()) {
      await addBtn2.click();
      await page.waitForTimeout(400);
    }

    // Cart page
    await page.goto(BASE + "/cart", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.screenshot({ path: path.join(OUT_DIR, `cart-filled-${device.name}.png`), fullPage: true });
    console.log(`Saved cart-filled-${device.name}.png`);

    // Checkout page
    await page.goto(BASE + "/checkout", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.screenshot({ path: path.join(OUT_DIR, `checkout-filled-${device.name}.png`), fullPage: true });
    console.log(`Saved checkout-filled-${device.name}.png`);

    await context.close();
  }

  await browser.close();
})();
