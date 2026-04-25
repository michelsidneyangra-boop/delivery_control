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

// Global WhatsApp client instance
let whatsappClient: WhatsAppClient | null = null;

export const whatsappRouter = router({
  /**
   * Get current WhatsApp configuration
   */
  getConfig: publicProcedure.query(async () => {
    return await getWhatsappConfig();
  }),

  /**
   * Login to WhatsApp Web (no credentials needed, just phone number)
   */
  login: publicProcedure
    .input(z.object({
      storeNumber: z.string().min(1, "Número da loja é obrigatório"),
      phoneNumber: z.string().min(10, "Número de telefone inválido"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Create new WhatsApp client
        whatsappClient = new WhatsAppClient(input.phoneNumber);
        
        // Connect to WhatsApp Web
        const isConnected = await whatsappClient.connect();

        if (!isConnected) {
          throw new Error("Falha ao conectar com WhatsApp Web. Por favor, escaneie o código QR.");
        }

        // Save configuration
        const config = await upsertWhatsappConfig({
          storeNumber: input.storeNumber,
          phoneNumber: input.phoneNumber,
          isConnected: true,
          lastChecked: new Date(),
        });

        return {
          success: true,
          message: "WhatsApp Web conectado com sucesso!",
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
   * Logout from WhatsApp Web
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

      // Disconnect client
      if (whatsappClient) {
        await whatsappClient.disconnect();
        whatsappClient = null;
      }

      // Update configuration to disconnected
      await upsertWhatsappConfig({
        storeNumber: config.storeNumber,
        phoneNumber: config.phoneNumber,
        isConnected: false,
        lastChecked: new Date(),
      });

      return {
        success: true,
        message: "WhatsApp desconectado com sucesso!",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao desconectar";
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }),

  /**
   * Verify WhatsApp connection status
   */
  verifyConnection: publicProcedure.query(async () => {
    try {
      const config = await getWhatsappConfig();
      
      if (!config) {
        return {
          isConnected: false,
          message: "Nenhuma configuração de WhatsApp encontrada",
        };
      }

      // Check if client is still connected
      if (whatsappClient && whatsappClient.isLoggedIn()) {
        return {
          isConnected: true,
          phoneNumber: config.phoneNumber,
          message: "WhatsApp Web conectado",
        };
      }

      return {
        isConnected: false,
        phoneNumber: config.phoneNumber,
        message: "WhatsApp Web desconectado. Por favor, faça login novamente.",
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
   * Get all templates
   */
  getTemplates: publicProcedure.query(async () => {
    return await getWhatsappTemplates();
  }),

  /**
   * Get a specific template
   */
  getTemplate: publicProcedure
    .input(z.object({
      status: z.string(),
    }))
    .query(async ({ input }) => {
      return await getWhatsappTemplate(input.status);
    }),

  /**
   * Update a template
   */
  updateTemplate: publicProcedure
    .input(z.object({
      status: z.string(),
      template: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await updateWhatsappTemplate(input.status, input.template);
    }),

  /**
   * Send a test message
   */
  sendTestMessage: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        if (!whatsappClient || !whatsappClient.isLoggedIn()) {
          throw new Error("WhatsApp não está conectado. Por favor, faça login primeiro.");
        }

        const success = await whatsappClient.sendTextMessage(input.phoneNumber, input.message);

        if (success) {
          return {
            success: true,
            message: "Mensagem de teste enviada com sucesso!",
          };
        } else {
          throw new Error("Falha ao enviar mensagem");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao enviar mensagem";
        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    }),

  /**
   * Get message history for a delivery
   */
  getMessageHistory: publicProcedure
    .input(z.object({
      deliveryId: z.number(),
    }))
    .query(async ({ input }) => {
      return await getWhatsappMessages(input.deliveryId);
    }),
});
