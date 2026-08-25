import { createRequire } from "node:module";
import { join } from "node:path";
import { homedir } from "node:os";

const require = createRequire(
  join(homedir(), ".vscode/extensions/danielsanmedium.dscodegpt-3.24.43/standalone/")
);
const { chromium } = require("patchright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "pt-BR" });
const page = await ctx.newPage();
const consoleMsgs = [];
const failures = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") consoleMsgs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => consoleMsgs.push(`[uncaught] ${String(e)}`));
page.on("requestfailed", (r) => failures.push(`${r.failure()?.errorText} ${r.url()}`));
await page.route("https://www.instagram.com/**", (route) => route.abort());
await page.route("instagram://**", (route) => route.abort());

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForSelector(".card");
await page.waitForTimeout(500);

const first = await page.evaluate(() => ({
  title: document.title,
  status: document.querySelector("[data-status]")?.textContent.trim(),
  stayHidden: document.querySelector("[data-stay]")?.hidden,
  progress: getComputedStyle(document.documentElement).getPropertyValue("--progress"),
}));

await page.screenshot({ path: "assets/_qa-countdown.png" });

await page.click("[data-stay]");
await page.waitForTimeout(200);
const afterStay = await page.evaluate(() => ({
  status: document.querySelector("[data-status]")?.textContent.trim(),
  stayHidden: document.querySelector("[data-stay]")?.hidden,
  leaving: document.body.classList.contains("is-leaving"),
}));

await page.click("[data-copy-link]");
await page.waitForTimeout(200);
const toast = await page.locator("[data-toast]").innerText();

await page.hover("[data-cta]");
await page.waitForTimeout(150);
await page.screenshot({ path: "assets/_qa-desktop.png" });

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "pt-BR" });
const mpage = await mobile.newPage();
await mpage.goto("http://localhost:5173/?stay=1", { waitUntil: "networkidle" });
await mpage.waitForSelector(".card");
await mpage.waitForTimeout(400);
await mpage.screenshot({ path: "assets/_qa-mobile.png" });
await mobile.close();

await browser.close();
console.log(JSON.stringify({ first, afterStay, toast, consoleMsgs, failures }, null, 2));
