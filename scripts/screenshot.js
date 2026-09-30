const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "..", "responsive_audit");

const devices = [
  { name: "mobile", width: 375, height: 812 }, // iPhone X/12/13 mini-ish
  { name: "tablet", width: 768, height: 1024 }, // iPad portrait
  { name: "laptop", width: 1440, height: 900 }, // common laptop
];

const pages = [
  { name: "home", path: "/" },
  { name: "shop", path: "/shop" },
  { name: "product", path: "/product/hare-krishna-silver-pendant" },
  { name: "cart", path: "/cart" },
  { name: "checkout", path: "/checkout" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "admin-login", path: "/admin/login" },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
    });
    const page = await context.newPage();

    for (const p of pages) {
      try {
        await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 20000 });
        // Scroll through the whole page first so framer-motion's whileInView
        // reveal animations actually trigger (real users scroll; a raw
        // fullPage screenshot resize does not fire IntersectionObserver).
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y < scrollHeight; y += 400) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(120);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        const filePath = path.join(OUT_DIR, `${p.name}-${device.name}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved ${filePath}`);
      } catch (err) {
        console.error(`FAILED ${p.name} @ ${device.name}: ${err.message}`);
      }
    }
    await context.close();
  }

  await browser.close();
})();
