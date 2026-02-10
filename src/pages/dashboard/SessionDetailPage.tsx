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
  useSessionById,
  useSessionOperators,
} from '@/hooks/useShootingSessions';
import { useOperatorRates } from '@/hooks/useOperators';
import { useClients } from '@/hooks/useClients';
import { Loader2, ArrowLeft, Edit2, MapPin, Users, Clock, Calendar } from 'lucide-react';

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
  const { data: session, isLoading: sessionLoading } = useSessionById(id);
  const { data: sessionOperators = [] } = useSessionOperators(id);
  const { data: clients = [] } = useClients();

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
                <p className="text-sm text-gray-600 mb-1">Client</p>
                <p className="font-semibold">{getClientName(session.client_id)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <Badge className={statusColors[session.status]}>
                  {statusLabels[session.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Heure</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {session.session_time || 'Non définie'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Durée</p>
                <p className="font-semibold">{session.duration_minutes} minutes</p>
              </div>
              {session.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lieu</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </p>
                </div>
              )}
              {session.max_participants && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Participants max</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {session.max_participants}
                  </p>
                </div>
              )}
            </div>

            {session.notes && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
                <p className="bg-gray-50 p-3 rounded-lg text-sm">{session.notes}</p>
              </div>
            )}

            {/* Dates Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">
                Créée le {new Date(session.created_at).toLocaleDateString('fr-FR')}
              </p>
              {session.updated_at !== session.created_at && (
                <p className="text-xs text-gray-600">
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
                <p className="text-xs text-gray-500">Aucun opérateur assigné</p>
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
                  <div className="flex justify-between items-center py-2 bg-blue-50 px-2 rounded">
                    <span className="font-semibold">Total opérateurs</span>
                    <span className="font-bold text-blue-600">
                      {totalOperatorCost.toFixed(2)}€
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
              <p>💡 Les coûts sont des estimations basées sur les tarifs définis des opérateurs.</p>
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

      {/* Operators Section */}
      {sessionOperators.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Opérateurs assignés</CardTitle>
            <CardDescription>{sessionOperators.length} opérateur(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {sessionOperators.map((so: any) => (
                <div key={so.id} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-semibold">
                    {so.operator?.first_name} {so.operator?.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {so.role === 'instructor'
                        ? '👤 Instructeur'
                        : so.role === 'assistant'
                        ? '👥 Assistant'
                        : '🆘 Support'}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        so.operator?.employment_type === 'salary'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {so.operator?.employment_type === 'salary' ? 'Salarié' : 'Freelance'}
                    </Badge>
                  </div>
                  {so.cost_override && (
                    <p className="text-sm text-gray-600 mt-2">
                      Coût: <span className="font-semibold">{so.cost_override.toFixed(2)}€</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
