import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, FileText } from "lucide-react";

export default function DeliveryDetail() {
  const [match, params] = useRoute("/delivery/:id");
  const [, setLocation] = useLocation();
  const deliveryId = params?.id ? parseInt(params.id) : null;

  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [conferentName, setConferentName] = useState<string>("");
  const [deliveryStatus, setDeliveryStatus] = useState<string>("");

  const { data: delivery, isLoading: deliveryLoading } = trpc.deliveries.getById.useQuery(
    deliveryId!,
    { enabled: !!deliveryId }
  );

  const { data: movements } = trpc.movements.getByDelivery.useQuery(
    deliveryId!,
    { enabled: !!deliveryId }
  );

  const { data: drivers } = trpc.drivers.list.useQuery();

  const registerExit = trpc.movements.registerExit.useMutation();
  const registerReturn = trpc.movements.registerReturn.useMutation();

  const handleRegisterExit = async () => {
    if (!selectedDriver) {
      toast.error("Selecione um motorista");
      return;
    }

    try {
      await registerExit.mutateAsync({
        deliveryId: deliveryId!,
        driverId: parseInt(selectedDriver),
      });
      toast.success("Saída registrada com sucesso!");
      setSelectedDriver("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar saída");
    }
  };

  const handleRegisterReturn = async () => {
    if (!deliveryStatus) {
      toast.error("Selecione o status da entrega");
      return;
    }

    try {
      await registerReturn.mutateAsync({
        deliveryId: deliveryId!,
        deliveryStatus: deliveryStatus as "delivered" | "returned",
        conferentName: conferentName || undefined,
      });
      toast.success("Retorno registrado com sucesso!");
      setDeliveryStatus("");
      setConferentName("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar retorno");
    }
  };

  if (deliveryLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!delivery) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Entrega não encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  const statusLabels = {
    pending: "Pendente",
    in_transit: "Em Trânsito",
    delivered: "Entregue",
    returned: "Retornado",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nota {delivery.noteNumber}</h1>
            <p className="text-muted-foreground">Detalhes da entrega</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Código</Label>
                    <p className="font-semibold">{delivery.clientCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge className="mt-1">
                      {statusLabels[delivery.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-semibold">{delivery.clientName}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Endereço</Label>
                    <p className="font-semibold">{delivery.address}</p>
                    <p className="text-sm text-muted-foreground">{delivery.neighborhood}</p>
                  </div>
                </div>

                {delivery.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Telefone</Label>
                      <p className="font-semibold">{delivery.phone}</p>
                    </div>
                  </div>
                )}

                {delivery.observations && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Observações</Label>
                      <p className="text-sm">{delivery.observations}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Movements */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                {movements && movements.length > 0 ? (
                  <div className="space-y-4">
                    {movements.map((movement) => (
                      <div key={movement.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-semibold capitalize">{movement.movementType}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(movement.movementDate).toLocaleString("pt-BR")}
                          </p>
                          {movement.deliveryStatus && (
                            <p className="text-sm mt-1">
                              Status: <Badge>{movement.deliveryStatus}</Badge>
                            </p>
                          )}
                          {movement.conferentName && (
                            <p className="text-sm text-muted-foreground">
                              Conferente: {movement.conferentName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma movimentação registrada</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {delivery.status === "pending" && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Registrar Saída</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Motorista</Label>
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motorista" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleRegisterExit}
                    disabled={registerExit.isPending}
                    className="w-full bg-primary"
                  >
                    {registerExit.isPending ? "Registrando..." : "Registrar Saída"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {delivery.status === "in_transit" && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Registrar Retorno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status da Entrega</Label>
                    <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="returned">Retornado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conferent">Conferente</Label>
                    <Input
                      id="conferent"
                      value={conferentName}
                      onChange={(e) => setConferentName(e.target.value)}
                      placeholder="Nome do conferente"
                    />
                  </div>

                  <Button
                    onClick={handleRegisterReturn}
                    disabled={registerReturn.isPending}
                    className="w-full bg-primary"
                  >
                    {registerReturn.isPending ? "Registrando..." : "Registrar Retorno"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
