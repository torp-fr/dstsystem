import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateClient, useUpdateClient, useClientById } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Copy, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ClientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = !!id && id !== 'new';

  const { data: clientData } = useClientById(isEditMode ? id : null);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    industry: '',
    status: 'prospect',
    category: '',
    address: '',
    city: '',
    country: 'France',
    postal_code: '',
    website: '',
    notes: '',
    learner_count: 0,
    structure_type: 'autre',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    if (clientData) {
      setFormData(clientData);
    }
  }, [clientData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;

    // Handle numeric fields
    if (name === 'learner_count') {
      processedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id,
          ...formData,
        });
        toast({
          title: 'Client mis à jour',
          description: 'Les informations du client ont été mises à jour.',
        });
        navigate('/dashboard/clients');
      } else {
        await createMutation.mutateAsync(formData);

        // Generate temp credentials for new client
        const tempPassword = generateTempPassword();
        setTempCredentials({
          email: formData.email || 'email@example.com',
          password: tempPassword,
        });
        setShowCredentialsDialog(true);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Credentials Dialog */}
      <AlertDialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Identifiants provisoires créés</AlertDialogTitle>
            <AlertDialogDescription>
              Les identifiants temporaires pour ce client ont été générés. Partagez-les avec le client.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {tempCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <code className="flex-1 text-sm font-mono">{tempCredentials.email}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(tempCredentials.email, 'email')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'email' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Mot de passe temporaire</Label>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{tempCredentials.password}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(tempCredentials.password, 'password')}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  ⚠️ Le client devra modifier ce mot de passe lors de sa première connexion.
                </p>
              </div>
            </div>
          )}

          <AlertDialogAction onClick={() => {
            setShowCredentialsDialog(false);
            navigate('/dashboard/clients');
          }}>
            Continuer
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/clients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">
            {isEditMode ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? 'Mettez à jour les informations du client' : 'Créez un nouveau client'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border-border border-border-border p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Informations personnelles */}
          <div>
            <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@example.com"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+33 6 XX XX XX XX"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Informations entreprise */}
          <div>
            <h2 className="text-xl font-bold mb-6">Informations entreprise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Technologie"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Client premium"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Adresse */}
          <div>
            <h2 className="text-xl font-bold mb-6">Adresse</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">Rue</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Rue de la Paix"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="75000"
                    className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Paris"
                    className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="France"
                    className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Formation et Structure */}
          <div>
            <h2 className="text-xl font-bold mb-6">Formation et Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="learner_count">Nombre d'apprenants</Label>
                <Input
                  id="learner_count"
                  name="learner_count"
                  type="number"
                  min="0"
                  value={formData.learner_count}
                  onChange={handleChange}
                  placeholder="ex. 25"
                  className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
                />
                <p className="text-xs text-muted-foreground">
                  Jauge max: 20 tireurs. Pour plus: 2+ jours
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure_type">Type de structure</Label>
                <select
                  id="structure_type"
                  name="structure_type"
                  value={formData.structure_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border-border border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all bg-background text-foreground"
                >
                  <option value="police">Police Nationale</option>
                  <option value="gendarme">Gendarmerie</option>
                  <option value="mairie">Mairie</option>
                  <option value="pompiers">Pompiers</option>
                  <option value="militaire">Militaire</option>
                  <option value="particulier">Particulier</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="association">Association</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Statut */}
          <div>
            <h2 className="text-xl font-bold mb-6">Statut</h2>
            <div className="space-y-2">
              <Label htmlFor="status">Statut du client</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border-border border-border-border bg-background text-foreground"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <h2 className="text-xl font-bold mb-6">Notes</h2>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ajoutez des notes sur ce client..."
                rows={4}
                className="bg-background border-border-border border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/clients')}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
      </div>
    </>
  );
};

export default ClientFormPage;
