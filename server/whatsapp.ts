/**
 * WhatsApp Business API Integration (Meta)
 * Handles sending messages via WhatsApp Business API
 */

interface WhatsAppMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "template" | "text";
  template?: {
    name: string;
    language: {
      code: string;
    };
    parameters?: {
      body: {
        parameters: Array<{
          type: "text";
          text: string;
        }>;
      };
    };
  };
  text?: {
    preview_url: boolean;
    body: string;
  };
}

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string = "v18.0";
  private baseUrl: string = "https://graph.instagram.com";

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(toPhoneNumber: string, message: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;
      
      const payload: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: toPhoneNumber.replace(/\D/g, ""),
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API Error: ${error.error?.message || "Unknown error"}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  }

  /**
   * Send a template message via WhatsApp
   */
  async sendTemplateMessage(
    toPhoneNumber: string,
    templateName: string,
    parameters?: string[]
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;
      
      const payload: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: toPhoneNumber.replace(/\D/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "pt_BR",
          },
          ...(parameters && {
            parameters: {
              body: {
                parameters: parameters.map((param) => ({
                  type: "text" as const,
                  text: param,
                })),
              },
            },
          }),
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API Error: ${error.error?.message || "Unknown error"}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending WhatsApp template message:", error);
      throw error;
    }
  }

  /**
   * Verify phone number connection to WhatsApp
   */
  async verifyPhoneNumber(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Phone number verification failed");
        return false;
      }

      const data = await response.json();
      return data.verified_name !== undefined;
    } catch (error) {
      console.error("Error verifying phone number:", error);
      return false;
    }
  }

  /**
   * Get phone number details
   */
  async getPhoneNumberDetails(): Promise<any> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get phone number details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting phone number details:", error);
      throw error;
    }
  }
}

/**
 * Default message templates for delivery statuses
 */
export const DEFAULT_TEMPLATES = {
  pending: `Olá {{clientName}},\n\nSua entrega foi recebida!\n\nNota Fiscal: {{noteNumber}}\nData de Entrada: {{entryDate}}\n\nEstaremos em breve enviando seu pedido.\n\nObrigado!`,
  
  in_transit: `Olá {{clientName}},\n\nSua entrega está a caminho!\n\nNota Fiscal: {{noteNumber}}\nMotorista: {{driverName}}\n\nEsperamos entregá-lo em breve.\n\nObrigado!`,
  
  delivered: `Olá {{clientName}},\n\nSua entrega foi realizada com sucesso!\n\nNota Fiscal: {{noteNumber}}\nData de Entrega: {{deliveryDate}}\n\nObrigado pela preferência!`,
  
  returned: `Olá {{clientName}},\n\nInfelizmente não conseguimos entregar seu pedido.\n\nNota Fiscal: {{noteNumber}}\n\nEntraremos em contato para agendar uma nova tentativa.\n\nObrigado!`,
  
  satisfaction: `Olá {{clientName}},\n\nComo foi sua experiência com nossa entrega?\n\nPor favor, responda:\n1️⃣ Excelente\n2️⃣ Bom\n3️⃣ Regular\n4️⃣ Ruim\n\nSua opinião é muito importante para nós!`,
};

/**
 * Replace template variables with actual values
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | undefined>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
  });
  
  return result;
}
