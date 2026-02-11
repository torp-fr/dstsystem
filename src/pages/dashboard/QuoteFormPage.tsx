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
import { useShootingSessions } from '@/hooks/useShootingSessions';
import {
  useQuoteById,
  useCreateQuote,
  useUpdateQuote,
  useConvertQuoteToInvoice,
} from '@/hooks/useQuotes';
import { Loader2, ArrowLeft, Check } from 'lucide-react';

export default function QuoteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: quote, isLoading: quoteLoading } = useQuoteById(id);
  const { data: clients = [] } = useClients();
  const { data: sessions = [] } = useShootingSessions();

  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const convertToInvoice = useConvertQuoteToInvoice();

  const [formData, setFormData] = useState({
    client_id: '',
    session_id: '',
    subtotal: '',
    tax_amount: '',
    total_amount: '',
    tva_rate: '20',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'draft' as const,
    notes: '',
    discount_percentage: '',
    discount_amount: '',
    discount_reason: '',
  });

  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        client_id: quote.client_id,
        session_id: quote.session_id || '',
        subtotal: quote.subtotal.toString(),
        tax_amount: quote.tax_amount.toString(),
        total_amount: quote.total_amount.toString(),
        tva_rate: (quote.tva_rate || 20).toString(),
        valid_from: quote.valid_from,
        valid_until: quote.valid_until,
        status: quote.status,
        notes: quote.notes || '',
        discount_percentage: (quote.discount_percentage || '').toString(),
        discount_amount: (quote.discount_amount || '').toString(),
        discount_reason: quote.discount_reason || '',
      });
    }
  }, [quote]);

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

  // Auto-calculate TVA and total
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const tvaRate = parseFloat(formData.tva_rate) || 0;

    // Calculate TVA automatically based on subtotal and rate
    const calculatedTax = (subtotal * tvaRate) / 100;
    const total = subtotal + calculatedTax;

    setFormData((prev) => ({
      ...prev,
      tax_amount: calculatedTax.toFixed(2),
      total_amount: total.toFixed(2),
    }));
  }, [formData.subtotal, formData.tva_rate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un client',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = {
        client_id: formData.client_id,
        session_id: formData.session_id || null,
        subtotal: parseFloat(formData.subtotal) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        status: formData.status,
        notes: formData.notes || null,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
        discount_reason: formData.discount_reason || null,
      };

      if (isEditing) {
        await updateQuote.mutateAsync({
          id: id!,
          ...data,
        } as any);
        toast({
          title: 'Succès',
          description: 'Devis mis à jour',
        });
        navigate(`/dashboard/quotes/${id}`);
      } else {
        const result = await createQuote.mutateAsync(data as any);
        toast({
          title: 'Succès',
          description: 'Devis créé avec succès',
        });
        navigate(`/dashboard/quotes/${result.id}`);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    }
  };

  const handleConvertToInvoice = async () => {
    if (!id) return;

    setConverting(true);
    try {
      await convertToInvoice.mutateAsync(id);
      toast({
        title: 'Succès',
        description: 'Devis converti en facture',
      });
      navigate('/dashboard/invoices');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la conversion',
        variant: 'destructive',
      });
    } finally {
      setConverting(false);
    }
  };

  if (quoteLoading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Client';
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/quotes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier devis' : 'Nouveau devis'}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations du devis</CardTitle>
            <CardDescription>Détails et montants</CardDescription>
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
                <label className="text-sm font-medium">Session (optionnel)</label>
                <Select
                  value={formData.session_id}
                  onValueChange={(value) => handleSelectChange('session_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associer à une session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session: any) => (
                      <SelectItem key={session.id} value={session.id}>
                        {new Date(session.session_date).toLocaleDateString('fr-FR')} -{' '}
                        {session.theme || 'Sans thème'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Sous-total (€)*</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="subtotal"
                    value={formData.subtotal}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Taux TVA (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="tva_rate"
                    value={formData.tva_rate}
                    onChange={handleInputChange}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">TVA (€) - Calculée</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="tax_amount"
                    value={formData.tax_amount}
                    disabled
                    className="bg-card font-semibold"
                  />
                </div>
                <div></div>
                <div>
                  <label className="text-sm font-medium">Total TTC (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="total_amount"
                    value={formData.total_amount}
                    disabled
                    className="bg-primary/10 font-bold text-lg"
                  />
                </div>
              </div>

              {/* Réductions */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-4 text-amber-900 dark:text-amber-100">Réductions</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium">Réduction (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="bg-card"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Montant réduction (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      name="discount_amount"
                      value={formData.discount_amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="bg-card"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Motif de la réduction</label>
                  <Input
                    name="discount_reason"
                    value={formData.discount_reason}
                    onChange={handleInputChange}
                    placeholder="Ex: Fidélité client, Volume important..."
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valide à partir du*</label>
                  <Input
                    type="date"
                    name="valid_from"
                    value={formData.valid_from}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valide jusqu'au*</label>
                  <Input
                    type="date"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
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
                <Button type="submit" disabled={createQuote.isPending || updateQuote.isPending}>
                  {createQuote.isPending || updateQuote.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : isEditing ? (
                    'Mettre à jour'
                  ) : (
                    'Créer devis'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/quotes')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary */}
        {isEditing && quote && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro</p>
                  <p className="font-mono font-semibold">{quote.quote_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Statut actuel</p>
                  <Badge className="mt-1">
                    {quote.status === 'draft'
                      ? 'Brouillon'
                      : quote.status === 'sent'
                      ? 'Envoyé'
                      : quote.status === 'accepted'
                      ? 'Accepté'
                      : quote.status === 'rejected'
                      ? 'Rejeté'
                      : 'Facturisé'}
                  </Badge>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900">
                    Montant total: {quote.total_amount.toFixed(2)}€
                  </p>
                </div>

                {quote.status === 'accepted' && quote.status !== 'converted_to_invoice' && (
                  <Button
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleConvertToInvoice}
                    disabled={converting || convertToInvoice.isPending}
                  >
                    {converting || convertToInvoice.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Conversion...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Convertir en facture
                      </>
                    )}
                  </Button>
                )}

                <div className="text-xs text-gray-500">
                  <p>Créé: {new Date(quote.created_at).toLocaleDateString('fr-FR')}</p>
                  {quote.updated_at !== quote.created_at && (
                    <p>
                      Modifié: {new Date(quote.updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
