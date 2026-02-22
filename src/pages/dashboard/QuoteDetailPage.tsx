import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useQuotes } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useToast } from '@/hooks/use-toast';
import QuoteTemplate from '@/components/QuoteTemplate';
import { Loader2 } from 'lucide-react';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exportQuoteToPDF } = usePdfExport();

  const { data: quotes = [] } = useQuotes();
  const { data: clients = [] } = useClients();

  const quote = quotes.find((q: any) => q.id === id);
  const client = quote ? clients.find((c: any) => c.id === quote.client_id) : null;

  if (!quote) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/quotes')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Devis non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get company info from localStorage (from settings page)
  const settings = JSON.parse(localStorage.getItem('dst-system-settings') || '{}');
  const companyInfo = {
    name: settings.companyName || 'DST-System',
    siret: settings.siretNumber || 'SIRET à remplir',
    address: 'Adresse de votre entreprise',
    phone: '+33 X XX XX XX XX',
    email: settings.companyEmail || 'contact@dst-system.fr',
    website: 'www.dst-system.fr',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // TODO: Implement email sending
    alert('Fonction d\'envoi par email à implémenter');
  };

  const handleDownload = async () => {
    try {
      await exportQuoteToPDF(quote.id, quote.quote_number);
      toast({
        title: 'Succès',
        description: `${quote.quote_number}.pdf téléchargé`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du téléchargement du PDF',
        variant: 'destructive',
      });
      console.error('PDF export error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/quotes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Devis {quote.quote_number}</h1>
      </div>

      <QuoteTemplate
        id={`quote-${quote.id}`}
        quote={quote}
        client={client}
        company={companyInfo}
        onPrint={handlePrint}
        onEmail={handleEmail}
        onDownload={handleDownload}
      />
    </div>
  );
}
