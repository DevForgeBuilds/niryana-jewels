const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "..", "responsive_audit");

const devices = [
  { name: "mobile", width: 375, height: 812 },
  { name: "laptop", width: 1440, height: 900 },
];

const adminPages = [
  { name: "admin-dashboard", path: "/admin" },
  { name: "admin-products", path: "/admin/products" },
  { name: "admin-orders", path: "/admin/orders" },
  { name: "admin-analytics", path: "/admin/analytics" },
  { name: "admin-settings", path: "/admin/settings" },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
    });
    const page = await context.newPage();

    // Login to admin first
    await page.goto(BASE + "/admin/login", { waitUntil: "networkidle" });
    await page.getByPlaceholder(/admin password/i).fill("niryana2026");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForTimeout(1500);

    for (const p of adminPages) {
      try {
        await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 20000 });
        await page.waitForTimeout(800);
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
