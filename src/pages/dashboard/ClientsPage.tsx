import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';

const ClientsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: clients = [], isLoading } = useClients({ status: statusFilter || undefined });
  const deleteClientMutation = useDeleteClient();

  const filteredClients = clients.filter((client: any) =>
    `${client.first_name} ${client.last_name} ${client.email || ''} ${client.company_name || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await deleteClientMutation.mutateAsync(id);
      toast({
        title: 'Client supprimé',
        description: 'Le client a été supprimé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Gestion de vos clients et leurs informations
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/clients/new')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border-border"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border-border border-border-border bg-card text-foreground"
        >
          <option value="">Tous les statuts</option>
          <option value="prospect">Prospect</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground font-medium">Total clients</p>
              <p className="text-3xl font-bold mt-2">{clients.length}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground font-medium">Clients actifs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {clients.filter((c: any) => c.status === 'active').length}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground font-medium">Prospects</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {clients.filter((c: any) => c.status === 'prospect').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground">Chargement des clients...</p>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border-border border-border-border">
          <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">Aucun client trouvé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Commencez par ajouter vos premiers clients
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border-border border-border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30 border-b border-border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">N° Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Téléphone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Entreprise</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-border">
                {filteredClients.map((client: any) => (
                  <tr
                    key={client.id}
                    className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono font-semibold text-primary">
                        N°{client.customer_number || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {client.first_name} {client.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {client.email ? (
                        <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                          {client.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.company_name || <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          client.status === 'active'
                            ? 'bg-card0/10 text-green-600 dark:text-green-400'
                            : client.status === 'prospect'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-card border border-border0/10 text-gray-600 dark:text-muted-foreground'
                        }`}
                      >
                        {client.status === 'active'
                          ? 'Actif'
                          : client.status === 'prospect'
                            ? 'Prospect'
                            : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/clients/${client.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(client.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Total des clients</p>
          <p className="text-3xl font-bold">{clients.length}</p>
        </div>
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Clients actifs</p>
          <p className="text-3xl font-bold">
            {clients.filter((c: any) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-card rounded-xl border-border border-border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Prospects</p>
          <p className="text-3xl font-bold">
            {clients.filter((c: any) => c.status === 'prospect').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
