import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { EventEmitter } from "events";

puppeteer.use(StealthPlugin());

class PuppeteerManager extends EventEmitter {
  constructor() {
    super();
    this.instances = new Map();
  }

  async create(id, launchOptions = {}, enums = []) {
    if (this.instances.has(id)) {
      console.log(`Instance ${id} already exists.`);
      return this.instances.get(id);
    }

    console.log(`Creating new instance ${id}`);
    const finalLaunchOptions = {
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ...launchOptions,
    };
    const browser = await puppeteer.launch(finalLaunchOptions);
    const context = browser.defaultBrowserContext();
    const page = await browser.newPage();
    const pipeline = [];
    const instance = {
      browser,
      page,
      pipeline,
      enums,
      launchOptions: finalLaunchOptions,
    };

    // Add the global navigation listener
    page.on("framenavigated", async (frame) => {
      if (frame === page.mainFrame()) {
        const newUrl = frame.url();
        console.log(`[Event] Frame navigated to: ${newUrl} for session ${id}`);

        // Emit URL change for live listeners
        this.emit("url:change", { sessionId: id, url: newUrl });
        const url = new URL(newUrl);
        await context.overridePermissions(url.origin, [
          "microphone",
          "camera",
          "notifications",
        ]);
        console.log(`Permissions granted for navigated origin: ${url.origin}`);
      }
    });

    this.instances.set(id, instance);
    return instance;
  }

  get(id) {
    if (!this.instances.has(id)) {
      console.log(
        `Instance ${id} not found. Available instances: ${Array.from(
          this.instances.keys()
        ).join(", ")}`
      );
      return null;
    }
    return this.instances.get(id);
  }

  async close(id) {
    if (!this.instances.has(id)) {
      console.log(`Instance ${id} not found for closing.`);
      return;
    }
    console.log(`Closing instance ${id}`);
    const { browser } = this.instances.get(id);
    await browser.close();
    this.instances.delete(id);
  }

  async closeAll() {
    console.log("Closing all instances.");
    for (const id of this.instances.keys()) {
      await this.close(id);
    }
  }
}

export default new PuppeteerManager();
