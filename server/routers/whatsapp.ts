import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { 
  getWhatsappConfig, 
  upsertWhatsappConfig,
  getWhatsappTemplates,
  getWhatsappTemplate,
  updateWhatsappTemplate,
  getWhatsappMessages
} from "../db";
import { WhatsAppClient, interpolateTemplate } from "../whatsapp";

export const whatsappRouter = router({
  /**
   * Get current WhatsApp configuration
   */
  getConfig: publicProcedure.query(async () => {
    return await getWhatsappConfig();
  }),

  /**
   * Login to WhatsApp with phone number and access token
   */
  login: publicProcedure
    .input(z.object({
      storeNumber: z.string().min(1, "Número da loja é obrigatório"),
      phoneNumber: z.string().min(10, "Número de telefone inválido"),
      phoneNumberId: z.string().min(1, "Phone Number ID é obrigatório"),
      accessToken: z.string().min(1, "Access Token é obrigatório"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Verify phone number connection
        const client = new WhatsAppClient(input.phoneNumberId, input.accessToken);
        const isConnected = await client.verifyPhoneNumber();

        if (!isConnected) {
          throw new Error("Falha ao conectar com o número do WhatsApp. Verifique as credenciais.");
        }

        // Save configuration
        const config = await upsertWhatsappConfig({
          storeNumber: input.storeNumber,
          phoneNumber: input.phoneNumber,
          isConnected: true,
          lastChecked: new Date(),
        });

        // Store credentials securely (in production, use environment variables or secure vault)
        // For now, we'll store them in memory or database with encryption
        process.env.WHATSAPP_PHONE_NUMBER_ID = input.phoneNumberId;
        process.env.WHATSAPP_ACCESS_TOKEN = input.accessToken;

        return {
          success: true,
          message: "WhatsApp conectado com sucesso!",
          config,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao conectar";
        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    }),

  /**
   * Logout from WhatsApp
   */
  logout: publicProcedure.mutation(async () => {
    try {
      const config = await getWhatsappConfig();
      
      if (!config) {
        return {
          success: false,
          message: "Nenhuma configuração de WhatsApp encontrada",
        };
      }

      // Update configuration to disconnected
      await upsertWhatsappConfig({
        storeNumber: config.storeNumber,
        phoneNumber: config.phoneNumber,
        isConnected: false,
        lastChecked: new Date(),
      });

      // Clear environment variables
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;
      delete process.env.WHATSAPP_ACCESS_TOKEN;

      return {
        success: true,
        message: "WhatsApp desconectado com sucesso!",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao desconectar";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }),

  /**
   * Verify WhatsApp connection status
   */
  verifyConnection: publicProcedure.mutation(async () => {
    try {
      const config = await getWhatsappConfig();

      if (!config) {
        return {
          isConnected: false,
          message: "WhatsApp não está configurado",
        };
      }

      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

      if (!phoneNumberId || !accessToken) {
        return {
          isConnected: false,
          message: "Credenciais do WhatsApp não encontradas",
        };
      }

      // Verify connection
      const client = new WhatsAppClient(phoneNumberId, accessToken);
      const isConnected = await client.verifyPhoneNumber();

      // Update last checked time
      await upsertWhatsappConfig({
        storeNumber: config.storeNumber,
        phoneNumber: config.phoneNumber,
        isConnected,
        lastChecked: new Date(),
      });

      return {
        isConnected,
        phoneNumber: config.phoneNumber,
        lastChecked: config.lastChecked,
        message: isConnected ? "WhatsApp conectado" : "WhatsApp desconectado",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao verificar conexão";
      return {
        isConnected: false,
        message: errorMessage,
      };
    }
  }),

  /**
   * Get all message templates
   */
  getTemplates: publicProcedure.query(async () => {
    return await getWhatsappTemplates();
  }),

  /**
   * Get template for specific status
   */
  getTemplate: publicProcedure
    .input(z.object({
      status: z.enum(["pending", "in_transit", "delivered", "returned", "satisfaction"]),
    }))
    .query(async ({ input }) => {
      return await getWhatsappTemplate(input.status);
    }),

  /**
   * Update message template
   */
  updateTemplate: publicProcedure
    .input(z.object({
      status: z.enum(["pending", "in_transit", "delivered", "returned", "satisfaction"]),
      template: z.string().min(10, "Template deve ter pelo menos 10 caracteres"),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await updateWhatsappTemplate(input.status, input.template);
        return {
          success: true,
          message: "Template atualizado com sucesso!",
          template: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar template";
        return {
          success: false,
          message: errorMessage,
        };
      }
    }),

  /**
   * Send test message
   */
  sendTestMessage: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(10, "Número de telefone inválido"),
      message: z.string().min(1, "Mensagem é obrigatória"),
    }))
    .mutation(async ({ input }) => {
      try {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !accessToken) {
          throw new Error("WhatsApp não está configurado");
        }

        const client = new WhatsAppClient(phoneNumberId, accessToken);
        const result = await client.sendTextMessage(input.phoneNumber, input.message);

        return {
          success: true,
          message: "Mensagem de teste enviada com sucesso!",
          result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao enviar mensagem";
        return {
          success: false,
          message: errorMessage,
        };
      }
    }),

  /**
   * Get message history for a delivery
   */
  getMessageHistory: publicProcedure
    .input(z.object({
      deliveryId: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      return await getWhatsappMessages(input.deliveryId);
    }),
});
