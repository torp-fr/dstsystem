import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useCreateDeposit, useUpdateDeposit, useDeposits } from '@/hooks/useQuotes';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function DepositFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: deposits = [] } = useDeposits();

  const deposit = deposits.find((d: any) => d.id === id);

  const createDeposit = useCreateDeposit();
  const updateDeposit = useUpdateDeposit();

  const [amountType, setAmountType] = useState('amount'); // 'amount' or 'percentage'
  const [formData, setFormData] = useState({
    quote_id: '',
    client_id: '',
    amount: '',
    percentage_of_total: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (deposit) {
      setAmountType(deposit.percentage_of_total ? 'percentage' : 'amount');
      setFormData({
        quote_id: deposit.quote_id || '',
        client_id: deposit.client_id,
        amount: deposit.amount.toString(),
        percentage_of_total: deposit.percentage_of_total?.toString() || '',
        due_date: deposit.due_date,
      });
    }
  }, [deposit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
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

    if (!formData.client_id || !formData.due_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      });
      return;
    }

    if (
      amountType === 'amount' &&
      !formData.amount
    ) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant',
        variant: 'destructive',
      });
      return;
    }

    if (amountType === 'percentage' && !formData.percentage_of_total) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un pourcentage',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = {
        quote_id: formData.quote_id || null,
        client_id: formData.client_id,
        amount:
          amountType === 'amount'
            ? parseFloat(formData.amount)
            : 0,
        percentage_of_total:
          amountType === 'percentage'
            ? parseInt(formData.percentage_of_total)
            : null,
        due_date: formData.due_date,
        status: 'pending',
      };

      if (isEditing) {
        await updateDeposit.mutateAsync({
          id: id!,
          ...data,
        } as any);
        toast({
          title: 'Succès',
          description: 'Acompte mis à jour',
        });
      } else {
        await createDeposit.mutateAsync(data as any);
        toast({
          title: 'Succès',
          description: 'Acompte créé avec succès',
        });
        navigate('/dashboard/deposits');
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

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/deposits')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier acompte' : 'Nouvel acompte'}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations d'acompte</CardTitle>
          <CardDescription>
            Paiement partiel (ACOMPTE-YYYY-NNNN)
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
              <label className="text-sm font-medium">Devis (optionnel)</label>
              <Select
                value={formData.quote_id}
                onValueChange={(value) => handleSelectChange('quote_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Associer à un devis" />
                </SelectTrigger>
                <SelectContent>
                  {quotes.map((quote: any) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.quote_number} - {getClientName(quote.client_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for amount type */}
            <Tabs value={amountType} onValueChange={setAmountType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="amount">Montant fixe</TabsTrigger>
                <TabsTrigger value="percentage">Pourcentage</TabsTrigger>
              </TabsList>

              <TabsContent value="amount" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Montant (€)*</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="ex. 500.00"
                  />
                </div>
              </TabsContent>

              <TabsContent value="percentage" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pourcentage (%)*</label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    name="percentage_of_total"
                    value={formData.percentage_of_total}
                    onChange={handleInputChange}
                    placeholder="ex. 30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ex. 30% pour 30% du montant total du devis
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <label className="text-sm font-medium">Date d'échéance*</label>
              <Input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createDeposit.isPending || updateDeposit.isPending}>
                {createDeposit.isPending || updateDeposit.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer acompte'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/deposits')}
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
              <strong>💰 Acompte:</strong> Paiement partiel sur devis ou facture
            </p>
            <p>
              <strong>📊 Deux modes:</strong> Montant fixe ou pourcentage du total
            </p>
            <p>
              <strong>✅ Auto-numérotation:</strong> ACOMPTE-2026-0001, ACOMPTE-2026-0002,
              etc.
            </p>
            <p>
              <strong>📅 Suivi:</strong> Date d'échéance et statut de paiement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
