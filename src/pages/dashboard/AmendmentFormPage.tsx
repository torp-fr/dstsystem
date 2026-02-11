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
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import {
  useCreateAmendment,
  useUpdateAmendment,
  useAmendments,
} from '@/hooks/useQuotes';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AmendmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: amendments = [] } = useAmendments();

  const amendment = amendments.find((a: any) => a.id === id);

  const createAmendment = useCreateAmendment();
  const updateAmendment = useUpdateAmendment();

  const [formData, setFormData] = useState({
    quote_id: '',
    client_id: '',
    changes_description: '',
    amount_change: '',
    new_total: '',
    status: 'draft' as const,
  });

  useEffect(() => {
    if (amendment) {
      setFormData({
        quote_id: amendment.quote_id || '',
        client_id: amendment.client_id,
        changes_description: amendment.changes_description,
        amount_change: amendment.amount_change.toString(),
        new_total: amendment.new_total?.toString() || '',
        status: amendment.status,
      });
    }
  }, [amendment]);

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

    if (!formData.client_id || !formData.changes_description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = {
        quote_id: formData.quote_id || null,
        client_id: formData.client_id,
        changes_description: formData.changes_description,
        amount_change: parseFloat(formData.amount_change) || 0,
        new_total: formData.new_total ? parseFloat(formData.new_total) : null,
        status: formData.status,
      };

      if (isEditing) {
        await updateAmendment.mutateAsync({
          id: id!,
          ...data,
        } as any);
        toast({
          title: 'Succès',
          description: 'Avenant mis à jour',
        });
      } else {
        await createAmendment.mutateAsync(data as any);
        toast({
          title: 'Succès',
          description: 'Avenant créé avec succès',
        });
        navigate('/dashboard/amendments');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : '';
  };

  const getQuoteInfo = (quoteId: string) => {
    const quote = quotes.find((q: any) => q.id === quoteId);
    return quote ? `${quote.quote_number} - ${getClientName(quote.client_id)}` : '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/amendments')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier avenant' : 'Nouvel avenant'}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations d'amendement</CardTitle>
          <CardDescription>
            Modification de devis ou facture (AVENANT-YYYY-NNNN)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client*</label>
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
              <label className="text-sm font-medium">Document original (optionnel)</label>
              <Select
                value={formData.quote_id}
                onValueChange={(value) => handleSelectChange('quote_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un devis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun devis</SelectItem>
                  {quotes.map((quote: any) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.quote_number} - {getClientName(quote.client_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Description des modifications*</label>
              <Textarea
                name="changes_description"
                value={formData.changes_description}
                onChange={handleInputChange}
                placeholder="ex. Augmentation du nombre de participants, ajout d'équipement..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Modification du montant (€)*</label>
                <Input
                  type="number"
                  step="0.01"
                  name="amount_change"
                  value={formData.amount_change}
                  onChange={handleInputChange}
                  placeholder="ex. 150.00 (positif) ou -50.00 (négatif)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nouveau total (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="new_total"
                  value={formData.new_total}
                  onChange={handleInputChange}
                  placeholder="ex. 1250.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createAmendment.isPending || updateAmendment.isPending}>
                {createAmendment.isPending || updateAmendment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer avenant'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/amendments')}
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
              <strong>📝 Avenant:</strong> Modification de devis ou facture existante
            </p>
            <p>
              <strong>💰 Montant:</strong> Peut être positif (augmentation) ou négatif
              (réduction)
            </p>
            <p>
              <strong>✅ Auto-numérotation:</strong> AVENANT-2026-0001, AVENANT-2026-0002, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
