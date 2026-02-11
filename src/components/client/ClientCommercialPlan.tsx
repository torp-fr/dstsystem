import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientSubscriptions, useUpdateClientSubscription } from '@/hooks/useClientSubscriptions';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Save, X } from 'lucide-react';

interface ClientCommercialPlanProps {
  clientId: string;
}

export default function ClientCommercialPlan({ clientId }: ClientCommercialPlanProps) {
  const { toast } = useToast();
  const { data: subscriptions = [] } = useClientSubscriptions(clientId);
  const updateSubscription = useUpdateClientSubscription();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState('0');

  const handleSaveDiscount = async (subId: string) => {
    try {
      await updateSubscription.mutateAsync({
        id: subId,
        clientId,
        discount_percentage: parseFloat(discountValue) || 0,
      } as any);
      toast({
        title: 'Succès',
        description: 'Réduction mise à jour',
      });
      setEditingId(null);
      setDiscountValue('0');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Formule commerciale</CardTitle>
          <CardDescription>Plan d'offre et tarification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Aucune formule commerciale assignée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub: any) => {
        const offer = sub.offer;
        const discount = (sub as any).discount_percentage || 0;
        const originalPrice = offer?.price || 0;
        const discountedPrice = originalPrice * (1 - discount / 100);

        return (
          <Card key={sub.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{offer?.name}</CardTitle>
                  <CardDescription>
                    {offer?.offer_type === 'single_session'
                      ? '📅 Session unique'
                      : offer?.offer_type === 'subscription'
                      ? '♻️ Abonnement'
                      : '📦 Package'}
                  </CardDescription>
                </div>
                <Badge
                  className={`${
                    sub.status === 'active'
                      ? 'bg-green-600/20 text-green-700 dark:text-green-300'
                      : 'bg-amber-600/20 text-amber-700'
                  }`}
                >
                  {sub.status === 'active' ? 'Actif' : sub.status === 'paused' ? 'Suspendu' : 'Annulé'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Offer Details */}
              {offer && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{offer.description || 'N/A'}</p>
                  </div>
                  {offer.offer_type === 'subscription' && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre de sessions incluses</p>
                      <p className="font-semibold">{offer.included_sessions || 'Non défini'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix HT</p>
                    <p className="text-2xl font-bold">{originalPrice.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix TTC (20% TVA)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(originalPrice * 1.2).toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* Discount Section */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">Réduction</p>
                    {editingId !== sub.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(sub.id);
                          setDiscountValue(discount.toString());
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>

                  {editingId === sub.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder="Pourcentage"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Pourcentage de réduction</p>
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 p-3 rounded text-center">
                            <p className="text-xs text-muted-foreground">Nouveau prix HT</p>
                            <p className="font-semibold">
                              {(originalPrice * (1 - parseFloat(discountValue || '0') / 100)).toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSaveDiscount(sub.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">{discount.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Réduction appliquée</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {discountedPrice.toFixed(2)}€ HT
                        </p>
                        <p className="text-xs text-muted-foreground">Prix final HT</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Date */}
              <div className="pt-2 text-xs text-muted-foreground border-t">
                <p>Abonnement depuis {new Date(sub.subscription_date).toLocaleDateString('fr-FR')}</p>
                {sub.end_date && (
                  <p>Expiration prévue: {new Date(sub.end_date).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
