import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useSessionById,
  useSessionOperators,
  useAddSessionOperator,
  useRemoveSessionOperator,
} from '@/hooks/useShootingSessions';
import { useOperators } from '@/hooks/useOperators';
import { useClients } from '@/hooks/useClients';
import { Loader2, ArrowLeft, Edit2, MapPin, Users, Clock, Calendar, Plus, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Programmée',
  in_progress: 'En cours',
  completed: 'Complétée',
  cancelled: 'Annulée',
};

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { data: session, isLoading: sessionLoading } = useSessionById(id);
  const { data: sessionOperators = [] } = useSessionOperators(id);
  const { data: clients = [] } = useClients();
  const { data: operators = [] } = useOperators({ status: 'active' });

  const addSessionOperator = useAddSessionOperator();
  const removeSessionOperator = useRemoveSessionOperator();

  const [selectedOperator, setSelectedOperator] = useState('');
  const [operatorRole, setOperatorRole] = useState('instructor');
  const [deleteOperatorId, setDeleteOperatorId] = useState<string | null>(null);

  if (sessionLoading || !id) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Session non trouvée</p>
      </div>
    );
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Sans client';
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const getOperatorName = (operatorId: string) => {
    const op = operators.find((o) => o.id === operatorId);
    return op ? `${op.first_name} ${op.last_name}` : 'Opérateur inconnu';
  };

  const getOperatorObject = (operatorId: string) => {
    return operators.find((o) => o.id === operatorId);
  };

  const handleAddOperator = async () => {
    if (!selectedOperator || !id) return;

    try {
      await addSessionOperator.mutateAsync({
        session_id: id,
        operator_id: selectedOperator,
        role: operatorRole,
        cost_override: null,
      });
      toast({
        title: 'Succès',
        description: 'Opérateur ajouté à la session',
      });
      setSelectedOperator('');
      setOperatorRole('instructor');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout de l\'opérateur',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOperator = async () => {
    if (!deleteOperatorId || !id) return;

    try {
      await removeSessionOperator.mutateAsync({
        id: deleteOperatorId,
        session_id: id,
      });
      toast({
        title: 'Succès',
        description: 'Opérateur supprimé de la session',
      });
      setDeleteOperatorId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  // Calculate operator costs
  const operatorCosts = sessionOperators.map((so: any) => {
    // This would need to fetch the operator rates
    // For now, we'll display the operator info
    return {
      ...so,
      estimatedCost: so.cost_override || 0, // Would be calculated from rates
    };
  });

  const totalOperatorCost = operatorCosts.reduce(
    (sum, oc) => sum + (oc.estimatedCost || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/calendar')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Détails de la session</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{session.theme || 'Session sans thème'}</CardTitle>
                <CardDescription>
                  {new Date(session.session_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={statusColors[session.status]}>
                  {statusLabels[session.status]}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/dashboard/sessions/${id}/edit`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Client</p>
                <p className="font-semibold">{getClientName(session.client_id)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut</p>
                <Badge className={statusColors[session.status]}>
                  {statusLabels[session.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Heure</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {session.session_time || 'Non définie'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Durée</p>
                <p className="font-semibold">
                  {(session as any).duration_type
                    ? (session as any).duration_type === 'full_day'
                      ? 'Journée complète'
                      : '1/2 journée'
                    : `${session.duration_minutes} min`}
                </p>
              </div>
              {session.location && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lieu</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </p>
                </div>
              )}
              {session.max_participants && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Participants max</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {session.max_participants}
                  </p>
                </div>
              )}
            </div>

            {session.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="bg-card p-3 rounded-lg text-sm border border-border">{session.notes}</p>
              </div>
            )}

            {/* Dates Info */}
            <div className="bg-card border border-border p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Créée le {new Date(session.created_at).toLocaleDateString('fr-FR')}
              </p>
              {session.updated_at !== session.created_at && (
                <p className="text-xs text-muted-foreground">
                  Modifiée le {new Date(session.updated_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coûts de la session</CardTitle>
            <CardDescription>Estimation des coûts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operator Costs */}
            <div>
              <p className="text-sm font-medium mb-3">Coûts opérateurs</p>
              {sessionOperators.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun opérateur assigné</p>
              ) : (
                <div className="space-y-2">
                  {sessionOperators.map((so: any) => (
                    <div key={so.id} className="flex justify-between items-center py-2 border-b text-sm">
                      <span>{so.operator?.first_name} {so.operator?.last_name}</span>
                      <span className="font-mono">
                        {so.cost_override ? `${so.cost_override.toFixed(2)}€` : 'À calculer'}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 bg-blue-600/10 px-2 rounded border border-blue-500/30">
                    <span className="font-semibold">Total opérateurs</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {totalOperatorCost.toFixed(2)}€
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profitability Status */}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Rentabilité</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">État</span>
                  <Badge
                    className={`text-xs ${
                      session.status === 'completed'
                        ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300'
                        : session.status === 'cancelled'
                        ? 'bg-rose-600/20 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-600/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {session.status === 'completed'
                      ? 'Complétée'
                      : session.status === 'cancelled'
                      ? 'Annulée'
                      : 'En attente'}
                  </Badge>
                </div>
                {totalOperatorCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Coûts estimés</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{totalOperatorCost.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                className="w-full"
                onClick={() => navigate(`/dashboard/sessions/${id}/edit`)}
              >
                Modifier la session
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard/calendar')}
              >
                Retour au calendrier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Operator Dialog */}
      <AlertDialog open={!!deleteOperatorId} onOpenChange={(open) => !open && setDeleteOperatorId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Retirer l'opérateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir retirer cet opérateur de la session ?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOperator} className="bg-red-600">
              Retirer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Operators Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Opérateurs assignés</CardTitle>
          <CardDescription>{sessionOperators.length} opérateur(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Operator Form */}
          <div className="space-y-3 pb-4 border-b">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Opérateur</label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators
                      .filter((op) => !sessionOperators.some((so: any) => so.operator_id === op.id))
                      .map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.first_name} {op.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <Select value={operatorRole} onValueChange={setOperatorRole}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instructor">Instructeur</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleAddOperator}
              disabled={!selectedOperator || addSessionOperator.isPending}
            >
              <Plus className="h-3 w-3" />
              Ajouter opérateur
            </Button>
          </div>

          {/* Operators List */}
          {sessionOperators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun opérateur assigné</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sessionOperators.map((so: any) => {
                const op = getOperatorObject(so.operator_id);
                return (
                  <div key={so.id} className="bg-card border border-border p-4 rounded-lg flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {op?.first_name} {op?.last_name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {so.role === 'instructor'
                            ? 'Instructeur'
                            : so.role === 'assistant'
                            ? 'Assistant'
                            : 'Support'}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            op?.employment_type === 'salary'
                              ? 'bg-blue-600/20 text-blue-700 dark:text-blue-300'
                              : 'bg-green-600/20 text-green-700 dark:text-green-300'
                          }`}
                        >
                          {op?.employment_type === 'salary' ? 'Salarié' : 'Freelance'}
                        </Badge>
                      </div>
                      {so.cost_override && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Coût: <span className="font-semibold">{so.cost_override.toFixed(2)}€</span>
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteOperatorId(so.id)}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
