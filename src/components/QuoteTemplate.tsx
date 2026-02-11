import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Printer, Mail, AlertCircle } from 'lucide-react';

interface QuoteTemplateProps {
  quote: any;
  client: any;
  company?: {
    name: string;
    siret?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  onPrint?: () => void;
  onEmail?: () => void;
  onDownload?: () => void;
  id?: string;
}

export default function QuoteTemplate({
  quote,
  client,
  company = {
    name: 'DST-System',
    siret: 'SIRET à remplir',
    address: 'Adresse de votre entreprise',
    phone: '+33 X XX XX XX XX',
    email: 'contact@dst-system.fr',
    website: 'www.dst-system.fr',
  },
  onPrint,
  onEmail,
  onDownload,
  id,
}: QuoteTemplateProps) {
  const quoteDate = new Date(quote.created_at);
  const validUntil = new Date(quote.valid_until);
  const elementId = id || `quote-${quote.id}`;

  return (
    <div className="space-y-6">
      {/* Action Buttons - Hidden on Print */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>
        <Button variant="outline" size="sm" onClick={onEmail} className="gap-2">
          <Mail className="h-4 w-4" />
          Envoyer
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </div>

      {/* Main Quote Card */}
      <Card id={elementId} className="print:shadow-none print:border-none print:bg-white">
        <CardContent className="p-8 print:p-0 print:bg-white">
          <div className="space-y-8">
            {/* Header */}
            <div className="border-b pb-6">
              <div className="flex gap-8 mb-6">
                {/* Logo + Company Info - Left */}
                <div className="flex flex-col items-start print:w-32">
                  <img
                    src="/favicon.png"
                    alt="Logo"
                    className="h-48 w-48 print:h-32 print:w-32 object-contain mb-4"
                  />
                  <div className="space-y-1 text-sm">
                    <h2 className="text-lg font-bold">{company.name}</h2>
                    {company.siret && <p><span className="font-semibold">SIRET:</span> {company.siret}</p>}
                    {company.address && <p>{company.address}</p>}
                    {company.phone && <p>{company.phone}</p>}
                    {company.email && <p>{company.email}</p>}
                    {company.website && <p>{company.website}</p>}
                  </div>
                </div>

                {/* Quote Info - Right */}
                <div className="text-right flex-1">
                  <h1 className="text-5xl font-bold text-primary mb-4">DEVIS</h1>
                  <p className="text-sm text-muted-foreground mb-4">{quote.quote_number}</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Date:</span> {quoteDate.toLocaleDateString('fr-FR')}</p>
                    <p>
                      <span className="font-semibold">Valide jusqu'au:</span>{' '}
                      {validUntil.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b">
              <div>
                <h3 className="font-semibold mb-3">Facturé à:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {client.first_name} {client.last_name}
                    {client.customer_number && (
                      <span className="text-muted-foreground font-normal ml-2">({client.customer_number})</span>
                    )}
                  </p>
                  {client.company_name && <p>{client.company_name}</p>}
                  {client.address && <p>{client.address}</p>}
                  {client.postal_code || client.city ? (
                    <p>
                      {client.postal_code} {client.city}
                    </p>
                  ) : null}
                  {client.email && <p>{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Informations de contact:</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {client.learner_count && (
                    <p><span className="font-semibold text-foreground">Apprenants:</span> {client.learner_count}</p>
                  )}
                  {client.industry && (
                    <p><span className="font-semibold text-foreground">Secteur:</span> {client.industry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="font-semibold mb-4">Détails du devis:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-4 font-semibold">Description</th>
                      <th className="text-right p-4 font-semibold">Quantité</th>
                      <th className="text-right p-4 font-semibold">Prix unitaire</th>
                      <th className="text-right p-4 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items && quote.items.length > 0 ? (
                      quote.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          <td className="p-4">{item.description}</td>
                          <td className="text-right p-4">{item.quantity}</td>
                          <td className="text-right p-4">{item.unit_price?.toFixed(2)}€</td>
                          <td className="text-right p-4 font-semibold">
                            {(item.quantity * item.unit_price)?.toFixed(2)}€
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b">
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          Aucun article
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-semibold">{quote.subtotal?.toFixed(2)}€</span>
                </div>

                {/* Reductions */}
                {(quote.discount_percentage || quote.discount_amount) && (
                  <>
                    {quote.discount_percentage && (
                      <div className="flex justify-between py-2 border-b text-red-600">
                        <span className="text-muted-foreground">
                          Réduction {quote.discount_percentage}%
                          {quote.discount_reason && ` (${quote.discount_reason})`}:
                        </span>
                        <span className="font-semibold">
                          -{(quote.subtotal * (quote.discount_percentage / 100))?.toFixed(2)}€
                        </span>
                      </div>
                    )}
                    {quote.discount_amount && (
                      <div className="flex justify-between py-2 border-b text-red-600">
                        <span className="text-muted-foreground">
                          Déduction
                          {quote.discount_reason && ` (${quote.discount_reason})`}:
                        </span>
                        <span className="font-semibold">-{quote.discount_amount?.toFixed(2)}€</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">TVA (20%):</span>
                  <span className="font-semibold">{quote.tax_amount?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/5 px-4 rounded-lg">
                  <span className="font-bold">TOTAL TTC:</span>
                  <span className="font-bold text-lg text-primary">{quote.total_amount?.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Context / Free Field */}
            {quote.context && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Contexte / Détails:</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{quote.context}</p>
              </div>
            )}

            {/* Notes */}
            {quote.notes && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Notes:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {/* Payment Terms */}
            {quote.payment_terms && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Modalités de paiement:</h4>
                <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{quote.payment_terms}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t text-center text-xs text-muted-foreground space-y-2">
              <p>Merci de votre confiance</p>
              <p>Pour toute question, veuillez contacter {company.email}</p>
              <p className="pt-4">--- Fin du devis ---</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
