import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Truck, CheckCircle, AlertCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  pending: { label: "Pendente", icon: AlertCircle, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  in_transit: { label: "Em Trânsito", icon: Truck, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  returned: { label: "Retornado", icon: AlertCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [noteFilter, setNoteFilter] = useState("");
  const [clientCodeFilter, setClientCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("");

  const combinedSearch = [noteFilter, clientCodeFilter, search].filter(Boolean).join(" ");

  const { data: deliveries, isLoading } = trpc.deliveries.list.useQuery({
    search: combinedSearch || undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
    neighborhood: neighborhoodFilter && neighborhoodFilter !== "all" ? neighborhoodFilter : undefined,
  });

  const { data: summary } = trpc.dashboard.summary.useQuery();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = trpc.deliveries.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDeleteClick = (id: number) => {
    setSelectedDeliveryId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeliveryId) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedDeliveryId);
      await utils.deliveries.list.invalidate();
      await utils.dashboard.summary.invalidate();
      setDeleteDialogOpen(false);
      setSelectedDeliveryId(null);
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const neighborhoods = useMemo(() => {
    if (!deliveries) return [];
    return Array.from(new Set(deliveries.map(d => d.neighborhood).filter(Boolean)));
  }, [deliveries]);

  const stats = [
    {
      label: "Total de Entregas",
      value: summary?.total || 0,
      icon: Package,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Pendentes",
      value: summary?.pending || 0,
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "Em Trânsito",
      value: summary?.inTransit || 0,
      icon: Truck,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Entregues",
      value: summary?.delivered || 0,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral de todas as entregas</p>
          </div>
          <Button onClick={() => setLocation("/new-delivery")} className="bg-primary">
            + Nova Entrega
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="N. Nota Fiscal"
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                className="border-input"
              />
              <Input
                placeholder="Código Cliente"
                value={clientCodeFilter}
                onChange={(e) => setClientCodeFilter(e.target.value)}
                className="border-input"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_transit">Em Trânsito</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="returned">Retornado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por bairro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os bairros</SelectItem>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood || "unknown"}>
                      {neighborhood || "Sem bairro"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nota</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Bairro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => {
                      const statusInfo = statusConfig[delivery.status as keyof typeof statusConfig];
                      const Icon = statusInfo?.icon || Package;
                      const rowColors = {
                        pending: "border-l-4 border-l-blue-500 bg-blue-50/20 dark:bg-blue-950/10",
                        in_transit: "border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10",
                        delivered: "border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10",
                        returned: "border-l-4 border-l-red-500 bg-red-50/20 dark:bg-red-950/10",
                      };
                      return (
                        <TableRow key={delivery.id} className={`hover:bg-muted/50 transition-colors ${rowColors[delivery.status as keyof typeof rowColors] || ""}`}>
                          <TableCell className="font-semibold">{delivery.noteNumber}</TableCell>
                          <TableCell>{delivery.clientName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {delivery.address}
                          </TableCell>
                          <TableCell>{delivery.neighborhood}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${statusInfo?.color}`}>
                              <Icon className="w-4 h-4" />
                              {statusInfo?.label}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(delivery.entryDate).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/delivery/${delivery.id}`)}
                              >
                                Ver
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/edit-delivery/${delivery.id}`)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(delivery.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  "Deletar"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
