import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { launch } from "puppeteer-stream";
import { EventEmitter } from "events";

puppeteer.use(StealthPlugin());

class PuppeteerManager extends EventEmitter {
  constructor() {
    super();
    this.instances = new Map();
  }

  async create(id, launchOptions = {}, enums = []) {
    if (this.instances.has(id)) {
      console.log(`⚠️  Instance ${id} already exists - returning existing instance`);
      return this.instances.get(id);
    }

    console.log(`🆕 Creating NEW browser instance ${id}`);
    console.log(`📊 Active instances before creation: ${this.instances.size}`);
    console.log(`🆔 Active instance IDs: ${Array.from(this.instances.keys()).join(', ')}`);
    
    const finalLaunchOptions = {
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ...launchOptions,
    };
    const browser = await launch(finalLaunchOptions);
    console.log(`🌐 NEW Chrome browser process launched for instance ${id}`);
    
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
    console.log(`✅ Instance ${id} created and stored. Total instances now: ${this.instances.size}`);
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
      console.log(`❌ Instance ${id} not found for closing.`);
      return;
    }
    console.log(`🗑️  Closing browser instance ${id}`);
    console.log(`📊 Active instances before closing: ${this.instances.size}`);
    const { browser } = this.instances.get(id);
    await browser.close();
    this.instances.delete(id);
    console.log(`✅ Instance ${id} closed and removed. Remaining instances: ${this.instances.size}`);
    console.log(`🆔 Remaining instance IDs: ${Array.from(this.instances.keys()).join(', ')}`);
  }

  async closeAll() {
    console.log("Closing all instances.");
    for (const id of this.instances.keys()) {
      await this.close(id);
    }
  }
}

export default new PuppeteerManager();
