import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function NewDelivery() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [formData, setFormData] = useState({
    noteNumber: "",
    clientCode: "",
    clientName: "",
    address: "",
    neighborhood: "",
    phone: "",
    observations: "",
  });

  const createDelivery = trpc.deliveries.create.useMutation();
  const getClientInfo = trpc.deliveries.getClientInfo.useQuery(
    formData.clientCode,
    { enabled: formData.clientCode.length > 0 }
  );
  const checkDuplicate = trpc.deliveries.checkDuplicate.useQuery(
    { noteNumber: formData.noteNumber, clientCode: formData.clientCode },
    { enabled: formData.noteNumber.length > 0 && formData.clientCode.length > 0 }
  );

  // Auto-preencher dados do cliente quando encontrado
  useEffect(() => {
    if (getClientInfo.data) {
      setFormData((prev) => ({
        ...prev,
        clientName: getClientInfo.data?.name || prev.clientName,
        address: getClientInfo.data?.address || prev.address,
        neighborhood: getClientInfo.data?.neighborhood || prev.neighborhood,
        phone: getClientInfo.data?.phone || prev.phone,
      }));
      toast.success("Dados do cliente carregados!");
    }
  }, [getClientInfo.data]);

  // Verificar duplicatas
  useEffect(() => {
    if (checkDuplicate.data) {
      setIsDuplicate(checkDuplicate.data.isDuplicate);
      if (checkDuplicate.data.isDuplicate) {
        toast.error("Entrega já cadastrada para esta nota e código de cliente!");
      }
    }
  }, [checkDuplicate.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDuplicate) {
      toast.error("Não é possível criar entrega duplicada!");
      return;
    }

    setIsSubmitting(true);

    try {
      await createDelivery.mutateAsync({
        ...formData,
        entryDate: new Date(),
      });

      toast.success("Entrega criada com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Entrega</h1>
          <p className="text-muted-foreground">Registre uma nova entrega no sistema</p>
        </div>

        {isDuplicate && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">
              Entrega já cadastrada para esta nota fiscal e código de cliente
            </p>
          </div>
        )}

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Informações da Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noteNumber">N. Nota Fiscal *</Label>
                  <Input
                    id="noteNumber"
                    name="noteNumber"
                    value={formData.noteNumber}
                    onChange={handleChange}
                    placeholder="Ex: 251019"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCode">Código Cliente *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="clientCode"
                      name="clientCode"
                      value={formData.clientCode}
                      onChange={handleChange}
                      placeholder="Ex: 84089"
                      required
                    />
                    {getClientInfo.isLoading && (
                      <div className="flex items-center justify-center px-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    )}
                    {getClientInfo.data && !getClientInfo.isLoading && (
                      <div className="flex items-center justify-center px-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Ex: GILDO JOSE MACHADO"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: RUA HARMONIA 53"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Ex: JAPUIBA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: 998813662"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Adicione observações sobre a entrega..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isDuplicate}
                  className="bg-primary"
                >
                  {isSubmitting ? "Criando..." : "Criar Entrega"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
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
