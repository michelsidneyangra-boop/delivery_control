import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Loader2, MessageCircle, QrCode } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function WhatsAppConfig() {
  const [, setLocation] = useLocation();
  const [storeNumber, setStoreNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Teste de mensagem do WhatsApp");

  // Queries
  const { data: config, refetch: refetchConfig } = trpc.whatsapp.getConfig.useQuery();
  const { data: templates, refetch: refetchTemplates } = trpc.whatsapp.getTemplates.useQuery();
  const { data: connectionStatus } = trpc.whatsapp.verifyConnection.useQuery();

  // Mutations
  const loginMutation = trpc.whatsapp.login.useMutation();
  const logoutMutation = trpc.whatsapp.logout.useMutation();
  const verifyMutation = trpc.whatsapp.verifyConnection.useMutation();
  const updateTemplateMutation = trpc.whatsapp.updateTemplate.useMutation();
  const sendTestMutation = trpc.whatsapp.sendTestMessage.useMutation();

  const handleLogin = async () => {
    if (!storeNumber || !phoneNumber) {
      toast.error("Preencha o número da loja e seu número de WhatsApp");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        storeNumber,
        phoneNumber,
      });

      if (result.success) {
        toast.success(result.message);
        toast.info("Por favor, escaneie o código QR que aparecerá em uma nova janela");
        setStoreNumber("");
        setPhoneNumber("");
        refetchConfig();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao conectar com WhatsApp Web");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logoutMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        refetchConfig();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao desconectar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyConnection = async () => {
    setIsLoading(true);
    try {
      const result = await verifyMutation.mutateAsync();
      if (result.isConnected) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao verificar conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhoneNumber || !testMessage) {
      toast.error("Preencha número de telefone e mensagem");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendTestMutation.mutateAsync({
        phoneNumber: testPhoneNumber,
        message: testMessage,
      });

      if (result.success) {
        toast.success(result.message);
        setTestPhoneNumber("");
        setTestMessage("Teste de mensagem do WhatsApp");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (status: string, template: string) => {
    setIsLoading(true);
    try {
      await updateTemplateMutation.mutateAsync({
        status,
        template,
      });
      toast.success("Template atualizado com sucesso!");
      refetchTemplates();
    } catch (error) {
      toast.error("Erro ao atualizar template");
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = connectionStatus?.isConnected ?? config?.isConnected ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuração WhatsApp Web</h1>
          <p className="text-muted-foreground mt-2">
            Configure o WhatsApp Web para enviar mensagens automáticas de status de entregas
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className={isConnected ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-300">Conectado</p>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      {config?.phoneNumber} - {config?.storeNumber}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-300">Desconectado</p>
                    <p className="text-sm text-red-800 dark:text-red-400">
                      Nenhuma configuração de WhatsApp Web encontrada
                    </p>
                  </div>
                </>
              )}
            </div>
            {isConnected && (
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  "Desconectar"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Conectar WhatsApp Web
              </CardTitle>
              <CardDescription>
                Faça login com seu número de WhatsApp. Um código QR será exibido para você escanear.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Número da Loja</label>
                    <Input
                      placeholder="Ex: Loja Centro"
                      value={storeNumber}
                      onChange={(e) => setStoreNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Seu Número de WhatsApp</label>
                    <Input
                      placeholder="Ex: +55 11 99999-9999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use o formato internacional com código do país
                    </p>
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Conectar WhatsApp Web
                      </>
                    )}
                  </Button>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>ℹ️ Como funciona:</strong><br />
                      1. Clique em "Conectar WhatsApp Web"<br />
                      2. Uma janela do navegador será aberta<br />
                      3. Escaneie o código QR com seu celular<br />
                      4. Pronto! Você poderá enviar mensagens
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-300">
                    ✅ WhatsApp Web está conectado e pronto para enviar mensagens!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Mensagens</CardTitle>
              <CardDescription>
                Customize as mensagens automáticas para cada status de entrega
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {templates?.map((template: any) => (
                <div key={template.status} className="space-y-2 pb-6 border-b last:border-b-0">
                  <label className="text-sm font-medium text-foreground capitalize">
                    Status: {template.status}
                  </label>
                  <Textarea
                    placeholder="Digite o template de mensagem"
                    defaultValue={template.template}
                    onChange={(e) => {
                      // Update on blur or button click
                    }}
                    className="min-h-24"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use &#123;&#123;variável&#125;&#125; para inserir dados dinâmicos
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTemplate(template.status, (e.target as any).previousElementSibling?.value || template.template)}
                    disabled={isLoading}
                  >
                    Salvar Template
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem de Teste</CardTitle>
              <CardDescription>
                Teste o envio de mensagens antes de usar em produção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Número de Telefone (destinatário)
                    </label>
                    <Input
                      placeholder="Ex: +55 11 99999-9999"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mensagem</label>
                    <Textarea
                      placeholder="Digite a mensagem de teste"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      disabled={isLoading}
                      className="min-h-24"
                    />
                  </div>

                  <Button
                    onClick={handleSendTest}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar Mensagem de Teste
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-900 dark:text-yellow-300">
                    ⚠️ Conecte o WhatsApp Web primeiro para enviar mensagens de teste
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
