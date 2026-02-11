import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useOffers, useDeleteOffer } from '@/hooks/useOffers';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const offerTypeLabels: Record<string, string> = {
  single_session: 'Session unique',
  subscription: 'Abonnement',
  package: 'Forfait',
};

const offerTypeColors: Record<string, string> = {
  single_session: 'bg-blue-100 text-blue-800',
  subscription: 'bg-purple-100 text-purple-800',
  package: 'bg-green-100 text-green-800',
};

export default function OffersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: offers = [] } = useOffers({
    is_active: showActiveOnly ? true : undefined,
  });

  const deleteOffer = useDeleteOffer();

  // Filter offers
  const filteredOffers = offers.filter((offer: any) => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !offerTypeFilter || offer.offer_type === offerTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteOffer.mutateAsync(id);
      toast({
        title: 'Succès',
        description: 'Offre supprimée',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats
  const stats = {
    total: offers.length,
    single_session: offers.filter((o: any) => o.offer_type === 'single_session').length,
    subscription: offers.filter((o: any) => o.offer_type === 'subscription').length,
    package: offers.filter((o: any) => o.offer_type === 'package').length,
    active: offers.filter((o: any) => o.is_active).length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Offres & Formules</h1>
        <Button onClick={() => navigate('/dashboard/offers/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer offre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions uniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.single_session}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abonnements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.subscription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Forfaits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.package}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={offerTypeFilter} onValueChange={setOfferTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            <SelectItem value="single_session">Session unique</SelectItem>
            <SelectItem value="subscription">Abonnement</SelectItem>
            <SelectItem value="package">Forfait</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showActiveOnly ? 'default' : 'outline'}
          onClick={() => setShowActiveOnly(!showActiveOnly)}
        >
          {showActiveOnly ? 'Actives' : 'Toutes'}
        </Button>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Aucune offre trouvée</p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/dashboard/offers/new')}
                >
                  Créer une offre
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer: any) => (
              <Card
                key={offer.id}
                className={!offer.is_active ? 'opacity-60' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{offer.name}</CardTitle>
                      <Badge className={offerTypeColors[offer.offer_type]}>
                        {offerTypeLabels[offer.offer_type]}
                      </Badge>
                    </div>
                    {!offer.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  {offer.description && (
                    <CardDescription className="text-sm">
                      {offer.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price Display */}
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Prix</p>
                    <p className="text-3xl font-bold text-primary">
                      {offer.price.toFixed(2)}€
                    </p>
                  </div>

                  {/* Offer Type Details */}
                  <div className="space-y-2 text-sm">
                    {offer.offer_type === 'single_session' && (
                      <>
                        {offer.min_participants && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Min. participants
                            </span>
                            <span className="font-medium">{offer.min_participants}</span>
                          </div>
                        )}
                        <p className="text-muted-foreground">
                          Idéal pour une session unique
                        </p>
                      </>
                    )}

                    {offer.offer_type === 'subscription' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Durée</span>
                          <span className="font-medium">
                            {offer.subscription_duration_months} mois
                          </span>
                        </div>
                        {offer.sessions_included && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sessions incluses</span>
                            <span className="font-medium">{offer.sessions_included}</span>
                          </div>
                        )}
                        {offer.discount_percentage && (
                          <div className="flex items-center justify-between bg-green-500/10 p-2 rounded">
                            <span className="text-green-700">Réduction</span>
                            <span className="font-bold text-green-700">
                              -{offer.discount_percentage}%
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {offer.offer_type === 'package' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Sessions</span>
                          <span className="font-medium">{offer.sessions_included}</span>
                        </div>
                        {offer.price_per_session && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Par session</span>
                            <span className="font-medium">
                              {(offer.price / offer.sessions_included).toFixed(2)}€
                            </span>
                          </div>
                        )}
                        {offer.discount_percentage && (
                          <div className="flex items-center justify-between bg-green-500/10 p-2 rounded">
                            <span className="text-green-700">Économies</span>
                            <span className="font-bold text-green-700">
                              -{offer.discount_percentage}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/dashboard/offers/${offer.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(offer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer l'offre</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p>
              <strong>🎯 Offres flexibles:</strong> Créez des offres pour sessions uniques, abonnements ou forfaits
            </p>
            <p>
              <strong>💰 Prix personnalisé:</strong> Définissez des prix différents selon le type d'offre
            </p>
            <p>
              <strong>🎁 Réductions:</strong> Appliquez des réductions en pourcentage pour les forfaits et abonnements
            </p>
            <p>
              <strong>👥 Participants min:</strong> Pour les sessions uniques, définissez un nombre minimum de participants
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
