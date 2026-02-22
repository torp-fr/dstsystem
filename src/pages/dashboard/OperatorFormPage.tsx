import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import AvatarSelector from '@/components/AvatarSelector';
import {
  useOperatorById,
  useCreateOperator,
  useUpdateOperator,
  useOperatorRates,
  useCreateOperatorRate,
  useUpdateOperatorRate,
  useDeleteOperatorRate,
  type Operator,
  type OperatorRate,
} from '@/hooks/useOperators';
import { Loader2, ArrowLeft, Trash2, Plus } from 'lucide-react';

export default function OperatorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: operator, isLoading: operatorLoading } = useOperatorById(id);
  const { data: rates = [] } = useOperatorRates(id);
  const createOperator = useCreateOperator();
  const updateOperator = useUpdateOperator();
  const createRate = useCreateOperatorRate();
  const updateRate = useUpdateOperatorRate();
  const deleteRate = useDeleteOperatorRate();

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employment_type: 'freelance' as const,
    status: 'active' as const,
    notes: '',
    avatar_url: '',
    created_by: null,
    // Pricing
    tarif_horaire_brut: '',
    tarif_facture_freelance: '',
    // Company info (for freelance)
    company_name: '',
    siret: '',
    email_facturation: '',
    // Profile lock
    is_profile_locked: false,
  });

  const [rateForm, setRateForm] = useState({
    rate_type: 'per_session',
    rate_amount: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
  });

  const [deleteRateId, setDeleteRateId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  useEffect(() => {
    if (operator) {
      setFormData({
        first_name: operator.first_name,
        last_name: operator.last_name,
        email: operator.email || '',
        phone: operator.phone || '',
        employment_type: operator.employment_type,
        status: operator.status,
        notes: operator.notes || '',
        avatar_url: (operator as any).avatar_url || '',
        created_by: operator.created_by,
        tarif_horaire_brut: (operator as any).tarif_horaire_brut || '',
        tarif_facture_freelance: (operator as any).tarif_facture_freelance || '',
        company_name: (operator as any).company_name || '',
        siret: (operator as any).siret || '',
        email_facturation: (operator as any).email_facturation || '',
        is_profile_locked: (operator as any).is_profile_locked || false,
      });
    }
  }, [operator]);

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

  const handleRateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRateSelectChange = (name: string, value: string) => {
    setRateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le prénom et le nom',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Clean data - remove created_by and avatar_url if empty
      const cleanedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        employment_type: formData.employment_type,
        status: formData.status,
        notes: formData.notes || null,
        ...(formData.avatar_url && { avatar_url: formData.avatar_url }),
        tarif_horaire_brut: formData.tarif_horaire_brut ? parseFloat(formData.tarif_horaire_brut) : null,
        tarif_facture_freelance: formData.tarif_facture_freelance ? parseFloat(formData.tarif_facture_freelance) : null,
        company_name: formData.company_name || null,
        siret: formData.siret || null,
        email_facturation: formData.email_facturation || null,
        is_profile_locked: formData.is_profile_locked,
      };

      if (isEditing) {
        await updateOperator.mutateAsync({
          id: id!,
          ...cleanedData,
        });
        toast({
          title: 'Succès',
          description: 'Opérateur mis à jour',
        });
      } else {
        await createOperator.mutateAsync(cleanedData as any);
        toast({
          title: 'Succès',
          description: 'Opérateur créé avec succès',
        });
        navigate('/dashboard/operators');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rateForm.rate_amount || !rateForm.rate_type || !rateForm.effective_from) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingRateId) {
        await updateRate.mutateAsync({
          id: editingRateId,
          operator_id: id!,
          rate_type: rateForm.rate_type,
          rate_amount: parseFloat(rateForm.rate_amount),
          effective_from: rateForm.effective_from,
          effective_to: rateForm.effective_to || null,
        } as any);
        toast({
          title: 'Succès',
          description: 'Tarif mis à jour',
        });
        setEditingRateId(null);
      } else {
        await createRate.mutateAsync({
          operator_id: id!,
          rate_type: rateForm.rate_type,
          rate_amount: parseFloat(rateForm.rate_amount),
          currency: 'EUR',
          effective_from: rateForm.effective_from,
          effective_to: rateForm.effective_to || null,
        });
        toast({
          title: 'Succès',
          description: 'Tarif ajouté avec succès',
        });
      }

      setRateForm({
        rate_type: 'per_session',
        rate_amount: '',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde du tarif',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRate = async () => {
    if (!deleteRateId) return;

    try {
      await deleteRate.mutateAsync({
        id: deleteRateId,
        operator_id: id!,
      });
      toast({
        title: 'Succès',
        description: 'Tarif supprimé',
      });
      setDeleteRateId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  if (operatorLoading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rateTypeLabels = {
    hourly: 'Horaire',
    daily: 'Journalier',
    per_session: 'Par session',
    monthly_salary: 'Salaire mensuel',
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/operators')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier opérateur' : 'Nouvel opérateur'}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>Détails de l'opérateur</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Section */}
              <div className="pb-4 border-b">
                <label className="text-sm font-medium block mb-3">Avatar</label>
                <AvatarSelector
                  value={formData.avatar_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  showPreview={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom*</label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Jean"
                    className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom*</label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Dupont"
                    className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean@example.com"
                  className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 6 12 34 56 78"
                  className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type d'emploi*</label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) =>
                      handleSelectChange('employment_type', value)
                    }
                  >
                    <SelectTrigger className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salarié</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut*</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
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
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>

              {/* Pricing Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Tarification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tarif horaire brut (€)</label>
                    <Input
                      name="tarif_horaire_brut"
                      type="number"
                      step="0.01"
                      value={formData.tarif_horaire_brut}
                      onChange={handleInputChange}
                      placeholder="35.50"
                      disabled={formData.is_profile_locked}
                      className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tarif facture freelance (€)</label>
                    <Input
                      name="tarif_facture_freelance"
                      type="number"
                      step="0.01"
                      value={formData.tarif_facture_freelance}
                      onChange={handleInputChange}
                      placeholder="50.00"
                      disabled={formData.is_profile_locked}
                      className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Company Info Section (Freelance) */}
              {formData.employment_type === 'freelance' && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Société facturante</h3>
                  <div>
                    <label className="text-sm font-medium">Nom de la société</label>
                    <Input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="Mon Entreprise SARL"
                      disabled={formData.is_profile_locked}
                      className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all disabled:opacity-50 mb-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">SIRET</label>
                      <Input
                        name="siret"
                        value={formData.siret}
                        onChange={handleInputChange}
                        placeholder="12345678901234"
                        disabled={formData.is_profile_locked}
                        className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email facturation</label>
                      <Input
                        name="email_facturation"
                        type="email"
                        value={formData.email_facturation}
                        onChange={handleInputChange}
                        placeholder="facturation@example.com"
                        disabled={formData.is_profile_locked}
                        className="border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Lock Section */}
              <div className="border-t pt-4 flex items-center gap-2">
                <Checkbox
                  id="is_profile_locked"
                  checked={formData.is_profile_locked}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      is_profile_locked: checked === true,
                    }))
                  }
                />
                <label htmlFor="is_profile_locked" className="text-sm font-medium cursor-pointer">
                  Verrouiller le profil (désactive tous les champs)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createOperator.isPending || updateOperator.isPending}>
                  {createOperator.isPending || updateOperator.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : isEditing ? (
                    'Mettre à jour'
                  ) : (
                    'Créer opérateur'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/operators')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Rates Section - Only show in edit mode */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tarifs</CardTitle>
              <CardDescription>Gérer les taux horaires/salaires</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add/Edit Rate Form */}
              <form onSubmit={handleAddRate} className="space-y-3 pb-4 border-b">
                <div>
                  <label className="text-sm font-medium">Type*</label>
                  <Select
                    value={rateForm.rate_type}
                    onValueChange={(value) =>
                      handleRateSelectChange('rate_type', value)
                    }
                  >
                    <SelectTrigger className="text-sm border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Horaire</SelectItem>
                      <SelectItem value="daily">Journalier</SelectItem>
                      <SelectItem value="per_session">Par session</SelectItem>
                      <SelectItem value="monthly_salary">Salaire mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Montant (€)*</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="rate_amount"
                    value={rateForm.rate_amount}
                    onChange={handleRateInputChange}
                    placeholder="0.00"
                    className="text-sm border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Valide à partir de*</label>
                  <Input
                    type="date"
                    name="effective_from"
                    value={rateForm.effective_from}
                    onChange={handleRateInputChange}
                    className="text-sm border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Valide jusqu'au</label>
                  <Input
                    type="date"
                    name="effective_to"
                    value={rateForm.effective_to}
                    onChange={handleRateInputChange}
                    className="text-sm border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full gap-2"
                  disabled={createRate.isPending || updateRate.isPending}
                >
                  <Plus className="h-3 w-3" />
                  {editingRateId ? 'Mettre à jour' : 'Ajouter tarif'}
                </Button>

                {editingRateId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditingRateId(null);
                      setRateForm({
                        rate_type: 'per_session',
                        rate_amount: '',
                        effective_from: new Date().toISOString().split('T')[0],
                        effective_to: '',
                      });
                    }}
                  >
                    Annuler édition
                  </Button>
                )}
              </form>

              {/* Rates List */}
              <div className="space-y-2">
                {rates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun tarif défini</p>
                ) : (
                  rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="bg-card p-3 rounded-lg border-border flex items-center justify-between"
                    >
                      <div className="text-sm">
                        <Badge variant="outline" className="mb-1">
                          {rateTypeLabels[rate.rate_type as keyof typeof rateTypeLabels]}
                        </Badge>
                        <p className="font-medium">
                          {rate.rate_amount}€ {rate.rate_type === 'hourly' ? '/h' : ''}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Depuis {new Date(rate.effective_from).toLocaleDateString('fr-FR')}
                          {rate.effective_to &&
                            ` jusqu'au ${new Date(rate.effective_to).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRateId(rate.id);
                            setRateForm({
                              rate_type: rate.rate_type,
                              rate_amount: rate.rate_amount.toString(),
                              effective_from: rate.effective_from,
                              effective_to: rate.effective_to || '',
                            });
                          }}
                        >
                          Éditer
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteRateId(rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Rate Dialog */}
      <AlertDialog open={!!deleteRateId} onOpenChange={(open) => !open && setDeleteRateId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer le tarif</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr ? Cette action est irréversible.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRate} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
