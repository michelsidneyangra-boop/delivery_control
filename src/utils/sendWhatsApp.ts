// src/utils/sendWhatsApp.ts
// Utility to send WhatsApp messages via WhatsApp Web using Puppeteer.
// Intended for local/test automation. Persist user session via userDataDir so
// you don't need to scan QR every time.

import puppeteer, { Browser, Page, LaunchOptions } from 'puppeteer';

export type SendOptions = {
  userDataDir?: string; // path to persist session (e.g. './whatsapp-session')
  headless?: boolean; // default false (we want to scan QR the first time)
  launchOptions?: LaunchOptions; // extra puppeteer launch options
  timeoutMs?: number; // maximum wait for selectors
  closeAfterSend?: boolean; // close browser after sending
};

/**
 * Send a WhatsApp message (via web.whatsapp.com) to a phone number.
 *
 * phone must be in international format without + or spaces (e.g. 5511912345678).
 * message is the text to send.
 *
 * NOTE: Automating WhatsApp Web may violate WhatsApp terms of service. Use only
 * for local testing and with numbers you have permission to contact. For
 * production/mass sending use the official WhatsApp Business API.
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  opts: SendOptions = {}
): Promise<{ success: boolean; error?: string }>{
  const userDataDir = opts.userDataDir ?? './whatsapp-session';
  const headless = opts.headless ?? false;
  const timeoutMs = opts.timeoutMs ?? 60000; // 60s
  const closeAfterSend = opts.closeAfterSend ?? false;

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless,
      userDataDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...(opts.launchOptions || {}),
    });

    const page: Page = await browser.newPage();
    // Prevent navigation timeout for slow connections
    await page.setDefaultNavigationTimeout(timeoutMs);

    const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for either the textbox or the QR code or the chat to load
    // The chat input usually has role="textbox"
    await page.waitForTimeout(1000);

    // If phone is invalid or WhatsApp shows an error, there's a div with data-testid='error' or a redirect
    const errorSelector = 'div[data-testid="alert-popup-text"]';
    const hasError = await page.$(errorSelector);
    if (hasError) {
      const errText = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.textContent : null;
      }, errorSelector);
      return { success: false, error: `WhatsApp showed error: ${errText}` };
    }

    // Wait for the message box OR the send button
    const textboxSelector = 'div[role="textbox"]';
    const sendButtonSelector = 'button[data-testid="compose-btn-send"]';

    // Wait for either textbox OR send button to be visible
    await page.waitForFunction(
      (tbSel, btnSel) => !!document.querySelector(tbSel) || !!document.querySelector(btnSel),
      { timeout: timeoutMs },
      textboxSelector,
      sendButtonSelector
    );

    // Try to send by pressing Enter inside the textbox (most reliable)
    const textbox = await page.$(textboxSelector);
    if (textbox) {
      await textbox.focus();
      // If message param was passed in URL, WA usually pre-fills it and Enter sends.
      // Still press Enter to ensure send.
      await page.keyboard.press('Enter');
      // give a short delay to let the message send
      await page.waitForTimeout(1000);
    } else {
      // fallback: click the send button if exists
      const sendBtn = await page.$(sendButtonSelector);
      if (sendBtn) {
        await sendBtn.click();
        await page.waitForTimeout(1000);
      } else {
        return { success: false, error: 'Não foi possível localizar caixa de texto nem botão de enviar.' };
      }
    }

    if (closeAfterSend) await browser.close();
    return { success: true };
  } catch (err: any) {
    try {
      if (browser && opts.closeAfterSend) await browser.close();
    } catch (_) {}
    return { success: false, error: err?.message ?? String(err) };
  }
}

// Example usage (uncomment to run as script):
// (async () => {
//   const res = await sendWhatsAppMessage('5511912345678', 'Olá! Mensagem de teste.', { headless: false, userDataDir: './whatsapp-session', closeAfterSend: true });
//   console.log(res);
// })();
