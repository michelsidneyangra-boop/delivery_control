import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditDriver() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/edit-driver/:id");
  const driverId = params?.id ? parseInt(params.id) : null;

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const { data: driver, isLoading: driverLoading } = trpc.drivers.getById.useQuery(
    driverId!,
    { enabled: !!driverId }
  );

  const updateDriver = trpc.drivers.update.useMutation();
  const deleteDriver = trpc.drivers.delete.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || "",
        phone: driver.phone || "",
        email: driver.email || "",
      });
    }
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await updateDriver.mutateAsync({
        id: driverId!,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
      });
      await utils.drivers.list.invalidate();
      toast.success("Motorista atualizado com sucesso!");
      setLocation("/drivers");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar motorista");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteDriver.mutateAsync(driverId!);
      await utils.drivers.list.invalidate();
      toast.success("Motorista deletado com sucesso!");
      setLocation("/drivers");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar motorista");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (driverLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Motorista não encontrado</p>
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
            onClick={() => setLocation("/drivers")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Motorista</h1>
            <p className="text-muted-foreground">Atualize os dados do motorista</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Motorista</CardTitle>
            <CardDescription>
              Modifique os dados do motorista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome completo do motorista"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(XX) XXXXX-XXXX"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  disabled={isLoading}
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
                  onClick={() => setLocation("/drivers")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Motorista</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este motorista? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
