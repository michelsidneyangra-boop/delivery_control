/**
 * WhatsApp Web Integration (whatsapp-web.js)
 * Handles sending messages via WhatsApp Web without requiring Meta API authorization
 */

import type { Client as WhatsAppClientType } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import * as qrcode from "qrcode";

const SESSION_DIR = path.join(process.cwd(), "whatsapp-session");

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// Lazy load whatsapp-web.js to avoid ESM issues
let WhatsAppClientClass: any = null;
let LocalAuthClass: any = null;

async function loadWhatsAppClasses() {
  if (!WhatsAppClientClass) {
    const module = await import("whatsapp-web.js");
    WhatsAppClientClass = module.Client;
    LocalAuthClass = module.LocalAuth;
  }
}

export class WhatsAppClient {
  private client: WhatsAppClientType | null = null;
  private phoneNumber: string;
  private isConnected: boolean = false;
  private qrCode: string | null = null;
  private isScanning: boolean = false;

  constructor(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  /**
   * Initialize and connect to WhatsApp Web
   */
  async connect(): Promise<{ success: boolean; qrCode?: string; message: string }> {
    try {
      if (this.client) {
        return { success: true, message: "Already connected" };
      }

      // Load WhatsApp classes
      await loadWhatsAppClasses();

      this.isScanning = true;

      // Create client with local authentication
      this.client = new WhatsAppClientClass({
        authStrategy: new LocalAuthClass({
          clientId: `client-${this.phoneNumber}`,
          dataPath: SESSION_DIR,
        }),
        puppeteer: {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        },
      });

      // Handle QR code
      this.client!.on("qr", async (qr: string) => {
        try {
          // Generate QR code as data URL
          this.qrCode = await qrcode.toDataURL(qr);
          console.log("QR Code generated, waiting for scan...");
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      });

      // Handle ready event
      this.client!.on("ready", () => {
        console.log("WhatsApp client is ready!");
        this.isConnected = true;
        this.isScanning = false;
        this.qrCode = null;
      });

      // Handle disconnection
      this.client!.on("disconnected", () => {
        console.log("WhatsApp client disconnected");
        this.isConnected = false;
        this.client = null;
      });

      // Handle authentication failure
      this.client!.on("auth_failure", () => {
        console.error("Authentication failed");
        this.isConnected = false;
        this.isScanning = false;
      });

      // Initialize client
      await this.client!.initialize();

      // Wait for connection with timeout
      const timeout = 120000; // 2 minutes
      const startTime = Date.now();

      while (this.isScanning && Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (this.isConnected) {
        return { success: true, message: "Connected successfully" };
      } else if (this.qrCode) {
        return { success: false, qrCode: this.qrCode, message: "Please scan the QR code" };
      } else {
        throw new Error("Failed to connect to WhatsApp");
      }
    } catch (error) {
      console.error("Error connecting to WhatsApp Web:", error);
      this.isConnected = false;
      this.isScanning = false;
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  /**
   * Get current QR code
   */
  getQRCode(): string | null {
    return this.qrCode;
  }

  /**
   * Send a text message to a contact
   */
  async sendTextMessage(toPhoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        throw new Error("WhatsApp not connected. Please login first.");
      }

      // Format phone number (remove non-digits and add country code if needed)
      let formattedNumber = toPhoneNumber.replace(/\D/g, "");

      // Add country code if not present (assume Brazil +55)
      if (formattedNumber.length === 11) {
        formattedNumber = "55" + formattedNumber;
      } else if (formattedNumber.length === 10) {
        formattedNumber = "55" + formattedNumber;
      }

      // Add @c.us suffix for WhatsApp
      const chatId = formattedNumber + "@c.us";

      // Send message
      await this.client.sendMessage(chatId, message);

      console.log(`Message sent to ${toPhoneNumber}`);
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
      if (!this.client) return false;
      return this.isConnected;
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
   * Disconnect and close client
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }
      this.isConnected = false;
      this.isScanning = false;
      this.qrCode = null;
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

  /**
   * Check if currently scanning QR code
   */
  isWaitingForQRScan(): boolean {
    return this.isScanning;
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
