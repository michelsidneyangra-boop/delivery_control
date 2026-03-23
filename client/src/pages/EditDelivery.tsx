import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function EditDelivery() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    address: "",
    neighborhood: "",
    phone: "",
    observations: "",
  });

  const deliveryId = parseInt(id || "0", 10);
  const { data: delivery, isLoading: isLoadingDelivery } = trpc.deliveries.getById.useQuery(deliveryId);
  const updateMutation = trpc.deliveries.update.useMutation();

  useEffect(() => {
    if (delivery) {
      setFormData({
        clientName: delivery.clientName || "",
        address: delivery.address || "",
        neighborhood: delivery.neighborhood || "",
        phone: delivery.phone || "",
        observations: delivery.observations || "",
      });
    }
  }, [delivery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.address) {
      toast.error("Nome do cliente e endereço são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await updateMutation.mutateAsync({
        id: deliveryId,
        ...formData,
      });
      toast.success("Entrega atualizada com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar entrega");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDelivery) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!delivery) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Entrega não encontrada</p>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Entrega</h1>
            <p className="text-muted-foreground">N. Nota: {delivery.noteNumber}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Entrega</CardTitle>
            <CardDescription>
              Atualize os dados da entrega conforme necessário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">N. Nota (Somente Leitura)</label>
                  <Input
                    value={delivery.noteNumber}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código Cliente (Somente Leitura)</label>
                  <Input
                    value={delivery.clientCode}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cliente *</label>
                <Input
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço *</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bairro</label>
                  <Input
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Bairro"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Telefone"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
