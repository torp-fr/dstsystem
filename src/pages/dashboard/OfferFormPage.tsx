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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreateOffer, useUpdateOffer, useOfferById } from '@/hooks/useOffers';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OfferFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: offer } = useOfferById(id);
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offer_type: 'single_session' as 'single_session' | 'subscription' | 'package',
    is_active: true,
    subscription_duration_months: '',
    price_per_session: '',
    sessions_included: '',
    discount_percentage: '',
    min_participants: '',
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        description: offer.description || '',
        price: offer.price?.toString() || '',
        offer_type: offer.offer_type || 'single_session',
        is_active: offer.is_active !== false,
        subscription_duration_months: offer.subscription_duration_months?.toString() || '',
        price_per_session: offer.price_per_session?.toString() || '',
        sessions_included: offer.sessions_included?.toString() || '',
        discount_percentage: offer.discount_percentage?.toString() || '',
        min_participants: offer.min_participants?.toString() || '',
      });
    }
  }, [offer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === 'true' ? true : value === 'false' ? false : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les champs requis (nom, prix)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data: any = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        offer_type: formData.offer_type,
        is_active: formData.is_active,
      };

      // Add type-specific fields
      if (formData.offer_type === 'single_session') {
        data.min_participants = formData.min_participants ? parseInt(formData.min_participants) : null;
      } else if (formData.offer_type === 'subscription') {
        data.subscription_duration_months = formData.subscription_duration_months
          ? parseInt(formData.subscription_duration_months)
          : null;
        data.sessions_included = formData.sessions_included ? parseInt(formData.sessions_included) : null;
        data.discount_percentage = formData.discount_percentage ? parseFloat(formData.discount_percentage) : null;
      } else if (formData.offer_type === 'package') {
        data.sessions_included = formData.sessions_included ? parseInt(formData.sessions_included) : null;
        data.discount_percentage = formData.discount_percentage ? parseFloat(formData.discount_percentage) : null;
        data.price_per_session = formData.price_per_session ? parseFloat(formData.price_per_session) : null;
      }

      if (isEditing) {
        await updateOffer.mutateAsync({
          id: id!,
          ...data,
        });
        toast({
          title: 'Succès',
          description: 'Offre mise à jour',
        });
      } else {
        await createOffer.mutateAsync(data);
        toast({
          title: 'Succès',
          description: 'Offre créée avec succès',
        });
        navigate('/dashboard/offers');
        return;
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/offers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier offre' : 'Créer offre'}
        </h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations offre</CardTitle>
          <CardDescription>
            Créez une offre flexible avec les paramètres adaptés à votre type
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de l'offre*</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex. Session découverte, Abonnement annuel..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre offre..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prix total (€)*</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="ex. 150.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type d'offre*</label>
                  <Select
                    value={formData.offer_type}
                    onValueChange={(value) =>
                      handleSelectChange('offer_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_session">Session unique</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                      <SelectItem value="package">Forfait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={formData.is_active.toString()}
                  onValueChange={(value) => handleSelectChange('is_active', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type-specific fields */}
            <Tabs value={formData.offer_type}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single_session">Session unique</TabsTrigger>
                <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                <TabsTrigger value="package">Forfait</TabsTrigger>
              </TabsList>

              {/* Single Session */}
              <TabsContent value="single_session" className="space-y-4 border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm font-medium text-blue-900">Session unique</p>
                  <p className="text-sm text-blue-700">
                    Idéale pour une séance ponctuelle avec tarif fixe
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Nombre minimum de participants</label>
                  <Input
                    type="number"
                    min="1"
                    name="min_participants"
                    value={formData.min_participants}
                    onChange={handleInputChange}
                    placeholder="ex. 2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Laisser vide si aucune limite
                  </p>
                </div>
              </TabsContent>

              {/* Subscription */}
              <TabsContent value="subscription" className="space-y-4 border-t pt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <p className="text-sm font-medium text-purple-900">Abonnement</p>
                  <p className="text-sm text-purple-700">
                    Offre récurrente avec durée définie et sessions incluses
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Durée (mois)</label>
                    <Input
                      type="number"
                      min="1"
                      name="subscription_duration_months"
                      value={formData.subscription_duration_months}
                      onChange={handleInputChange}
                      placeholder="ex. 12"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sessions incluses</label>
                    <Input
                      type="number"
                      min="1"
                      name="sessions_included"
                      value={formData.sessions_included}
                      onChange={handleInputChange}
                      placeholder="ex. 4"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Réduction (%) par rapport au prix normal</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="ex. 15"
                  />
                </div>
              </TabsContent>

              {/* Package */}
              <TabsContent value="package" className="space-y-4 border-t pt-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm font-medium text-green-900">Forfait</p>
                  <p className="text-sm text-green-700">
                    Offre groupée avec X sessions à un prix global
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre de sessions</label>
                    <Input
                      type="number"
                      min="1"
                      name="sessions_included"
                      value={formData.sessions_included}
                      onChange={handleInputChange}
                      placeholder="ex. 5"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Prix par session (calculé)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price_per_session"
                      value={formData.price_per_session}
                      onChange={handleInputChange}
                      placeholder="Calculé automatiquement"
                      disabled
                    />
                    {formData.price && formData.sessions_included && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(parseFloat(formData.price) / parseInt(formData.sessions_included)).toFixed(2)}€ par session
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Économies (%) par rapport au prix normal</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="ex. 20"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="submit"
                disabled={createOffer.isPending || updateOffer.isPending}
              >
                {createOffer.isPending || updateOffer.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer offre'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/offers')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              <strong>💡 Conseil:</strong> Utilisez les réductions (%) plutôt que les prix fixes pour les forfaits et abonnements
            </p>
            <p>
              <strong>📊 Prix par session:</strong> Pour les forfaits, le prix par session est calculé automatiquement
            </p>
            <p>
              <strong>✅ Statut:</strong> Les offres inactives ne s'affichent pas aux clients
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
