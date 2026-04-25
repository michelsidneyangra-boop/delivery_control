/**
 * WhatsApp Web Integration (Puppeteer)
 * Handles sending messages via WhatsApp Web without requiring Meta API authorization
 */

import puppeteer, { Browser, Page } from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const SESSION_DIR = path.join(process.cwd(), "whatsapp-session");

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

export class WhatsAppClient {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private phoneNumber: string;
  private isConnected: boolean = false;

  constructor(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  /**
   * Initialize browser and connect to WhatsApp Web
   */
  async connect(): Promise<boolean> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
        ],
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });

      // Load session if exists
      const sessionPath = path.join(SESSION_DIR, `session-${this.phoneNumber}.json`);
      if (fs.existsSync(sessionPath)) {
        const cookies = JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
        await this.page.setCookie(...cookies);
      }

      // Navigate to WhatsApp Web
      await this.page.goto("https://web.whatsapp.com", { waitUntil: "networkidle2" });

      // Wait for QR code or chat interface
      const isLoggedIn = await this.checkLoginStatus();

      if (!isLoggedIn) {
        console.log("QR Code needed. Please scan it on the browser.");
        // Wait for user to scan QR code (max 60 seconds)
        await this.page.waitForSelector('[data-testid="chat-list-item"]', { timeout: 60000 }).catch(() => {});
      }

      // Save session cookies
      const cookies = await this.page.cookies();
      fs.writeFileSync(sessionPath, JSON.stringify(cookies, null, 2));

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Error connecting to WhatsApp Web:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if already logged in
   */
  private async checkLoginStatus(): Promise<boolean> {
    try {
      if (!this.page) return false;
      
      // Try to find chat list (indicates logged in)
      const chatList = await this.page.$('[data-testid="chat-list-item"]');
      return !!chatList;
    } catch {
      return false;
    }
  }

  /**
   * Send a text message to a contact
   */
  async sendTextMessage(toPhoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.page || !this.isConnected) {
        throw new Error("WhatsApp not connected. Please login first.");
      }

      // Format phone number (remove non-digits)
      const formattedNumber = toPhoneNumber.replace(/\D/g, "");

      // Open chat with contact
      const chatUrl = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`;
      await this.page.goto(chatUrl, { waitUntil: "networkidle2" });

      // Wait for message input field
      await this.page.waitForSelector('[data-testid="compose-box-input"]', { timeout: 10000 });

      // Type message
      const inputField = await this.page.$('[data-testid="compose-box-input"]');
      if (inputField) {
        await inputField.type(message);
      }

      // Send message (click send button or press Ctrl+Enter)
      await this.page.keyboard.press("Enter");

      // Wait a bit for message to be sent
      await this.page.waitForTimeout(2000);

      console.log(`Message sent to ${formattedNumber}`);
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  }

  /**
   * Send a template message (with variables)
   */
  async sendTemplateMessage(
    toPhoneNumber: string,
    template: string,
    variables: Record<string, string> = {}
  ): Promise<boolean> {
    try {
      // Interpolate variables in template
      let message = template;
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(`{{${key}}}`, value);
      });

      return await this.sendTextMessage(toPhoneNumber, message);
    } catch (error) {
      console.error("Error sending template message:", error);
      throw error;
    }
  }

  /**
   * Verify phone number connection
   */
  async verifyPhoneNumber(): Promise<boolean> {
    try {
      if (!this.page) return false;
      return await this.checkLoginStatus();
    } catch {
      return false;
    }
  }

  /**
   * Get phone number details
   */
  async getPhoneNumberDetails(): Promise<{ phoneNumber: string; isConnected: boolean }> {
    return {
      phoneNumber: this.phoneNumber,
      isConnected: this.isConnected,
    };
  }

  /**
   * Disconnect and close browser
   */
  async disconnect(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
      }
      this.isConnected = false;
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }

  /**
   * Check if connected
   */
  isLoggedIn(): boolean {
    return this.isConnected;
  }
}

/**
 * Interpolate template variables
 */
export function interpolateTemplate(template: string, variables: Record<string, string> = {}): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(`{{${key}}}`, value);
  });
  return result;
}
