import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function WhatsAppConfig() {
  const [, setLocation] = useLocation();
  const [storeNumber, setStoreNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Teste de mensagem do WhatsApp");

  // Queries
  const { data: config } = trpc.whatsapp.getConfig.useQuery();
  const { data: templates } = trpc.whatsapp.getTemplates.useQuery();

  // Mutations
  const loginMutation = trpc.whatsapp.login.useMutation();
  const logoutMutation = trpc.whatsapp.logout.useMutation();
  const verifyMutation = trpc.whatsapp.verifyConnection.useMutation();
  const updateTemplateMutation = trpc.whatsapp.updateTemplate.useMutation();
  const sendTestMutation = trpc.whatsapp.sendTestMessage.useMutation();

  const handleLogin = async () => {
    if (!storeNumber || !phoneNumber || !phoneNumberId || !accessToken) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        storeNumber,
        phoneNumber,
        phoneNumberId,
        accessToken,
      });

      if (result.success) {
        toast.success(result.message);
        setStoreNumber("");
        setPhoneNumber("");
        setPhoneNumberId("");
        setAccessToken("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao conectar com WhatsApp");
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
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Configuração WhatsApp</h1>
          </div>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Voltar
          </Button>
        </div>

        {/* Status Card */}
        <Card className={config?.isConnected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {config?.isConnected ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">WhatsApp Conectado</p>
                      <p className="text-sm text-green-700">{config?.phoneNumber}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">WhatsApp Desconectado</p>
                      <p className="text-sm text-red-700">Configure suas credenciais para começar</p>
                    </div>
                  </>
                )}
              </div>
              {config?.isConnected && (
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Conectar WhatsApp Business API</CardTitle>
                <CardDescription>
                  Insira suas credenciais da WhatsApp Business API do Meta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número da Loja
                  </label>
                  <Input
                    placeholder="Ex: 1"
                    value={storeNumber}
                    onChange={(e) => setStoreNumber(e.target.value)}
                    disabled={config?.isConnected}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número do WhatsApp
                  </label>
                  <Input
                    placeholder="Ex: 5511999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={config?.isConnected}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number ID
                  </label>
                  <Input
                    placeholder="ID do número de telefone do Meta"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    disabled={config?.isConnected}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Access Token
                  </label>
                  <Input
                    type="password"
                    placeholder="Token de acesso do Meta"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    disabled={config?.isConnected}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading || config?.isConnected}
                    className="flex-1"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Conectar
                  </Button>
                  {config?.isConnected && (
                    <Button
                      variant="outline"
                      onClick={handleVerifyConnection}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verificar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
                <CardDescription>
                  Customize as mensagens para cada status de entrega
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {templates?.map((template) => (
                  <TemplateEditor
                    key={template.id}
                    template={template}
                    onUpdate={updateTemplateMutation.mutateAsync}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem de Teste</CardTitle>
                <CardDescription>
                  Teste a conexão enviando uma mensagem de teste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número de Telefone
                  </label>
                  <Input
                    placeholder="Ex: 5511999999999"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mensagem
                  </label>
                  <Textarea
                    placeholder="Digite a mensagem de teste"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSendTest}
                  disabled={isLoading || !config?.isConnected}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enviar Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TemplateEditor({ template, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(template.template);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        status: template.status,
        template: content,
      });
      toast.success("Template atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar template");
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    in_transit: "Em Trânsito",
    delivered: "Entregue",
    returned: "Retornado",
    satisfaction: "Pesquisa de Satisfação",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{statusLabels[template.status]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setContent(template.template);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{template.template}</p>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Editar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
