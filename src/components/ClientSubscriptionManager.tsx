import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  useClientSubscriptions,
  useCreateClientSubscription,
  useUpdateClientSubscription,
  useDeleteClientSubscription,
} from '@/hooks/useClientSubscriptions';
import { useOffers } from '@/hooks/useOffers';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface ClientSubscriptionManagerProps {
  clientId: string;
}

export default function ClientSubscriptionManager({ clientId }: ClientSubscriptionManagerProps) {
  const { toast } = useToast();
  const { data: subscriptions = [], isLoading } = useClientSubscriptions(clientId);
  const { data: offers = [] } = useOffers({ is_active: true });

  const createSubscription = useCreateClientSubscription();
  const updateSubscription = useUpdateClientSubscription();
  const deleteSubscription = useDeleteClientSubscription();

  const [selectedOffer, setSelectedOffer] = useState('');
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  const handleAddSubscription = async () => {
    if (!selectedOffer) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une offre',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSubscription.mutateAsync({
        client_id: clientId,
        offer_id: selectedOffer,
        subscription_date: new Date().toISOString(),
        end_date: null,
        status: 'active',
        quantity: 1,
      });

      toast({
        title: 'Succès',
        description: 'Plan commercial ajouté',
      });
      setSelectedOffer('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout du plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deleteSubId) return;

    try {
      await deleteSubscription.mutateAsync({
        id: deleteSubId,
        clientId,
      });

      toast({
        title: 'Succès',
        description: 'Plan supprimé',
      });
      setDeleteSubId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const getOfferName = (offerId: string) => {
    const offer = offers.find((o: any) => o.id === offerId);
    return offer ? offer.name : 'Offre inconnue';
  };

  const getOfferType = (offerId: string) => {
    const offer = offers.find((o: any) => o.id === offerId);
    if (!offer) return '';
    return offer.offer_type === 'single_session'
      ? '📅 Session unique'
      : offer.offer_type === 'subscription'
      ? '♻️ Abonnement'
      : '📦 Package';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans commerciaux</CardTitle>
        <CardDescription>Offres et abonnements du client</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Subscription */}
        <div className="space-y-3 pb-4 border-b">
          <div>
            <label className="text-sm font-medium">Ajouter une offre</label>
            <div className="flex gap-2 mt-2">
              <Select value={selectedOffer} onValueChange={setSelectedOffer}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner une offre" />
                </SelectTrigger>
                <SelectContent>
                  {offers
                    .filter((o: any) => !subscriptions.some((s: any) => s.offer_id === o.id))
                    .map((offer: any) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name} - {offer.price.toFixed(2)}€
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddSubscription} disabled={!selectedOffer}>
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun plan commercial</p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub: any) => (
              <div key={sub.id} className="bg-card border border-border p-4 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{getOfferName(sub.offer_id)}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {getOfferType(sub.offer_id)}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          sub.status === 'active'
                            ? 'bg-green-600/20 text-green-700 dark:text-green-300'
                            : sub.status === 'paused'
                            ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300'
                            : 'bg-red-600/20 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {sub.status === 'active'
                          ? 'Actif'
                          : sub.status === 'paused'
                          ? 'Suspendu'
                          : 'Annulé'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Depuis {new Date(sub.subscription_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteSubId(sub.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteSubId} onOpenChange={(open) => !open && setDeleteSubId(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Supprimer le plan</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce plan commercial ? Cette action est irréversible.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSubscription} className="bg-red-600">
                Supprimer
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
