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
import { Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

const statusConfig = {
  pending: { label: "Pendente", icon: AlertCircle, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  in_transit: { label: "Em Trânsito", icon: Truck, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  returned: { label: "Retornado", icon: AlertCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("");

  const { data: deliveries, isLoading } = trpc.deliveries.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    neighborhood: neighborhoodFilter || undefined,
  });

  const { data: summary } = trpc.dashboard.summary.useQuery();

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por nota, cliente ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-input"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
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
                  <SelectItem value="">Todos os bairros</SelectItem>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood || ""}>
                      {neighborhood}
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
                      return (
                        <TableRow key={delivery.id} className="hover:bg-muted/50">
                          <TableCell className="font-semibold">{delivery.noteNumber}</TableCell>
                          <TableCell>{delivery.clientName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {delivery.address}
                          </TableCell>
                          <TableCell>{delivery.neighborhood}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Icon className="w-3 h-3" />
                              {statusInfo?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(delivery.entryDate).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/delivery/${delivery.id}`)}
                            >
                              Ver
                            </Button>
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
      </div>
    </DashboardLayout>
  );
}
