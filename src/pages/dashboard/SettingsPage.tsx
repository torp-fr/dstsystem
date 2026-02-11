import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dst-system-settings');
    return saved ? JSON.parse(saved) : {
      // French social charges (2025)
      employeeChargesPercent: 42,
      employerChargesPercent: 45,
      // PASS ceiling (annual)
      passCeiling: 47100,
      // Default VAT rate
      defaultVATRate: 20,
      // Company info
      companyName: 'DST-System',
      companyRegistration: '',
      // Operational
      hoursPerDay: 8,
      daysPerMonth: 21.67,
      targetMarginPercent: 15,
      minSessionPrice: 0,
    };
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || value : value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('dst-system-settings', JSON.stringify(settings));
      toast({
        title: 'Succès',
        description: 'Paramètres sauvegardés avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de DST-System</p>
        </div>
      </div>

      {/* French Social Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Charges sociales France</CardTitle>
          <CardDescription>Barèmes standards 2025 (modifiables selon affiliation)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employeeCharges">Charges salariales (%)</Label>
              <Input
                id="employeeCharges"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.employeeChargesPercent}
                onChange={(e) => handleChange('employeeChargesPercent', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Déductions sur le salaire net</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerCharges">Charges patronales (%)</Label>
              <Input
                id="employerCharges"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.employerChargesPercent}
                onChange={(e) => handleChange('employerChargesPercent', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Cotisations employeur supplémentaires</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PASS & Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres fiscaux</CardTitle>
          <CardDescription>Plafond annuel et taux de TVA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passCeiling">PASS (€)</Label>
              <Input
                id="passCeiling"
                type="number"
                min="40000"
                step="100"
                value={settings.passCeiling}
                onChange={(e) => handleChange('passCeiling', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Plafond annuel sécurité sociale</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultVAT">TVA par défaut (%)</Label>
              <Input
                id="defaultVAT"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultVATRate}
                onChange={(e) => handleChange('defaultVATRate', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Taux appliqué aux devis par défaut</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres opérationnels</CardTitle>
          <CardDescription>Heures de travail et objectifs de marge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay">Heures par jour</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={settings.hoursPerDay}
                onChange={(e) => handleChange('hoursPerDay', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Journée de travail standard</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysPerMonth">Jours par mois</Label>
              <Input
                id="daysPerMonth"
                type="number"
                min="15"
                max="30"
                step="0.01"
                value={settings.daysPerMonth}
                onChange={(e) => handleChange('daysPerMonth', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Jours ouvrables mensuels moyens</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMargin">Marge cible (%)</Label>
              <Input
                id="targetMargin"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.targetMarginPercent}
                onChange={(e) => handleChange('targetMarginPercent', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Objectif de rentabilité</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minSessionPrice">Prix min session (€)</Label>
              <Input
                id="minSessionPrice"
                type="number"
                min="0"
                step="100"
                value={settings.minSessionPrice}
                onChange={(e) => handleChange('minSessionPrice', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Seuil minimum accepté</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations entreprise</CardTitle>
          <CardDescription>Données de votre structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Raison sociale</Label>
              <Input
                id="companyName"
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyRegistration">SIRET/SIREN</Label>
              <Input
                id="companyRegistration"
                type="text"
                placeholder="14 ou 9 chiffres"
                value={settings.companyRegistration}
                onChange={(e) => handleChange('companyRegistration', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
        </Button>
      </div>

      {/* Info Footer */}
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>💡 Note:</strong> Les paramètres sont sauvegardés localement. Ils sont utilisés pour :
            <br />• Calculer automatiquement les charges sociales
            <br />• Fixer les tarifs minimums des sessions
            <br />• Analyser les marges bénéficiaires
            <br />• Générer des recommandations de prix
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
