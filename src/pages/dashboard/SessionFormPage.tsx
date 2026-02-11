import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useOperators } from '@/hooks/useOperators';
import {
  useSessionById,
  useCreateShootingSession,
  useUpdateShootingSession,
  useDeleteShootingSession,
  useSessionOperators,
  useAddSessionOperator,
  useRemoveSessionOperator,
  type ShootingSession,
} from '@/hooks/useShootingSessions';
import { Loader2, ArrowLeft, Trash2, Plus, X } from 'lucide-react';

export default function SessionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: session, isLoading: sessionLoading } = useSessionById(id);
  const { data: sessionOperators = [] } = useSessionOperators(id);
  const { data: clients = [] } = useClients();
  const { data: operators = [] } = useOperators({ status: 'active' });

  const createSession = useCreateShootingSession();
  const updateSession = useUpdateShootingSession();
  const deleteSession = useDeleteShootingSession();
  const addSessionOperator = useAddSessionOperator();
  const removeSessionOperator = useRemoveSessionOperator();

  const [formData, setFormData] = useState({
    client_id: '',
    session_date: new Date().toISOString().split('T')[0],
    session_time: '',
    duration_minutes: '60',
    duration_type: null as 'full_day' | 'half_day' | null,
    theme: '',
    max_participants: '',
    status: 'scheduled' as const,
    location: '',
    notes: '',
    created_by: null,
  });

  const [operatorRole, setOperatorRole] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteOperatorId, setDeleteOperatorId] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setFormData({
        client_id: session.client_id || '',
        session_date: session.session_date,
        session_time: session.session_time || '',
        duration_minutes: session.duration_minutes.toString(),
        duration_type: session.duration_type,
        theme: session.theme || '',
        max_participants: session.max_participants?.toString() || '',
        status: session.status,
        location: session.location || '',
        notes: session.notes || '',
        created_by: session.created_by,
      });
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.session_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir la date',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Calculate duration_minutes based on duration_type if set
      let durationMinutes = parseInt(formData.duration_minutes) || 60;
      if (formData.duration_type === 'full_day') {
        durationMinutes = 480; // 8 hours
      } else if (formData.duration_type === 'half_day') {
        durationMinutes = 240; // 4 hours
      }

      const data = {
        client_id: formData.client_id || null,
        session_date: formData.session_date,
        session_time: formData.session_time || null,
        duration_minutes: durationMinutes,
        duration_type: formData.duration_type,
        theme: formData.theme || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        status: formData.status,
        location: formData.location || null,
        notes: formData.notes || null,
        created_by: formData.created_by,
      };

      if (isEditing) {
        await updateSession.mutateAsync({
          id: id!,
          ...data,
        } as any);
        toast({
          title: 'Succès',
          description: 'Session mise à jour',
        });
      } else {
        const result = await createSession.mutateAsync(data as any);
        toast({
          title: 'Succès',
          description: 'Session créée avec succès',
        });
        navigate(`/dashboard/sessions/${result.id}`);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  const handleAddOperator = async () => {
    if (!selectedOperator || !id) return;

    try {
      await addSessionOperator.mutateAsync({
        session_id: id,
        operator_id: selectedOperator,
        role: operatorRole || 'instructor',
        cost_override: null,
      });
      toast({
        title: 'Succès',
        description: 'Opérateur ajouté à la session',
      });
      setSelectedOperator('');
      setOperatorRole('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout de l\'opérateur',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOperator = async () => {
    if (!deleteOperatorId) return;

    try {
      await removeSessionOperator.mutateAsync({
        id: deleteOperatorId,
        session_id: id!,
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

  const handleDeleteSession = async () => {
    if (!id) return;

    try {
      await deleteSession.mutateAsync(id);
      toast({
        title: 'Succès',
        description: 'Session supprimée',
      });
      navigate('/dashboard/calendar');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  if (sessionLoading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getOperatorName = (operatorId: string) => {
    const op = operators.find((o) => o.id === operatorId);
    return op ? `${op.first_name} ${op.last_name}` : 'Opérateur inconnu';
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Sans client';
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client inconnu';
  };

  const getOperatorObject = (operatorId: string) => {
    return operators.find((o) => o.id === operatorId);
  };

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
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier session' : 'Nouvelle session'}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations de la session</CardTitle>
            <CardDescription>Détails de la session de tir</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date*</label>
                  <Input
                    type="date"
                    name="session_date"
                    value={formData.session_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Heure</label>
                  <Input
                    type="time"
                    name="session_time"
                    value={formData.session_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Type de durée</label>
                <Select
                  value={formData.duration_type || 'custom'}
                  onValueChange={(value) => handleSelectChange('duration_type', value === 'custom' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personnalisée</SelectItem>
                    <SelectItem value="half_day">1/2 journée (4h)</SelectItem>
                    <SelectItem value="full_day">Journée complète (8h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => handleSelectChange('client_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                        {client.company_name && ` (${client.company_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Thème de la session</label>
                <Input
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  placeholder="ex. Initiation au tir sportif"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Durée (minutes)</label>
                  <Input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    disabled={!!formData.duration_type}
                    placeholder={
                      formData.duration_type === 'full_day'
                        ? '480'
                        : formData.duration_type === 'half_day'
                        ? '240'
                        : '60'
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Participants max</label>
                  <Input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Lieu</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="ex. Paris, Salle 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut*</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Programmée</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Complétée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createSession.isPending || updateSession.isPending}>
                  {createSession.isPending || updateSession.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : isEditing ? (
                    'Mettre à jour'
                  ) : (
                    'Créer session'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/calendar')}
                >
                  Annuler
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteSessionId(id!)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Operators Section - Only in edit mode */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opérateurs</CardTitle>
              <CardDescription>Gérer les animateurs de la session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Operator Form */}
              <div className="space-y-3 pb-4 border-b">
                <div>
                  <label className="text-sm font-medium">Opérateur*</label>
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
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instructor">Instructeur</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleAddOperator}
                  disabled={!selectedOperator || addSessionOperator.isPending}
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </Button>
              </div>

              {/* Operators List */}
              <div className="space-y-2">
                {sessionOperators.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun opérateur assigné</p>
                ) : (
                  sessionOperators.map((so: any) => {
                    const op = getOperatorObject(so.operator_id);
                    return (
                      <div
                        key={so.id}
                        className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="text-sm">
                          <p className="font-medium">
                            {op?.first_name} {op?.last_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {so.role === 'instructor'
                                ? 'Instructeur'
                                : so.role === 'assistant'
                                ? 'Assistant'
                                : 'Support'}
                            </Badge>
                            {op?.employment_type === 'salary' ? (
                              <Badge className="text-xs bg-blue-100 text-blue-800">Salarié</Badge>
                            ) : (
                              <Badge className="text-xs bg-green-100 text-green-800">Freelance</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteOperatorId(so.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Session Dialog */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer la session</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr ? Cette action est irréversible.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
}
