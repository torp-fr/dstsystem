import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dst-system-settings');
    return saved ? JSON.parse(saved) : {
      employeeChargesPercent: 42,
      employerChargesPercent: 45,
      passCeiling: 47100,
      defaultVATRate: 20,
      companyName: 'DST-System',
      companyRegistration: '',
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
        description: 'Paramètres sauvegardés',
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

  const SettingField = ({ label, id, value, onChange, help, type = 'number' }: any) => (
    <div className="pb-3 border-b border-border/50">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground mt-0.5">{help}</p>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 w-full"
        step={type === 'number' ? 'any' : undefined}
      />
    </div>
  );

  return (
    <div className="space-y-2 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-xs text-muted-foreground">Configuration DST-System</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* French Social Charges */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2">Charges sociales</h3>
          <div className="space-y-2">
            <SettingField
              label="Charges salariales"
              id="employeeCharges"
              value={settings.employeeChargesPercent}
              onChange={(e) => handleChange('employeeChargesPercent', e.target.value)}
              help="Déductions (%)"
            />
            <SettingField
              label="Charges patronales"
              id="employerCharges"
              value={settings.employerChargesPercent}
              onChange={(e) => handleChange('employerChargesPercent', e.target.value)}
              help="Cotisations (%)"
            />
          </div>
        </div>

        {/* Fiscal Parameters */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2">Fiscal</h3>
          <div className="space-y-2">
            <SettingField
              label="PASS"
              id="passCeiling"
              value={settings.passCeiling}
              onChange={(e) => handleChange('passCeiling', e.target.value)}
              help="Plafond annuel (€)"
            />
            <SettingField
              label="TVA"
              id="defaultVAT"
              value={settings.defaultVATRate}
              onChange={(e) => handleChange('defaultVATRate', e.target.value)}
              help="Taux par défaut (%)"
            />
          </div>
        </div>

        {/* Operational - Part 1 */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2">Opérationnel</h3>
          <div className="space-y-2">
            <SettingField
              label="Heures/jour"
              id="hoursPerDay"
              value={settings.hoursPerDay}
              onChange={(e) => handleChange('hoursPerDay', e.target.value)}
              help="Journée standard"
            />
            <SettingField
              label="Jours/mois"
              id="daysPerMonth"
              value={settings.daysPerMonth}
              onChange={(e) => handleChange('daysPerMonth', e.target.value)}
              help="Jours ouvrables"
            />
          </div>
        </div>

        {/* Operational - Part 2 */}
        <div className="bg-card rounded-lg border-border border p-3">
          <h3 className="font-semibold text-sm mb-2">Rentabilité</h3>
          <div className="space-y-2">
            <SettingField
              label="Marge cible"
              id="targetMargin"
              value={settings.targetMarginPercent}
              onChange={(e) => handleChange('targetMarginPercent', e.target.value)}
              help="Objectif (%)"
            />
            <SettingField
              label="Prix min session"
              id="minSessionPrice"
              value={settings.minSessionPrice}
              onChange={(e) => handleChange('minSessionPrice', e.target.value)}
              help="Seuil (€)"
            />
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-card rounded-lg border-border border p-3 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-2">Entreprise</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="companyName" className="text-xs font-medium">Raison sociale</Label>
              <Input
                id="companyName"
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="companyRegistration" className="text-xs font-medium">SIRET/SIREN</Label>
              <Input
                id="companyRegistration"
                type="text"
                placeholder="14 ou 9 chiffres"
                value={settings.companyRegistration}
                onChange={(e) => handleChange('companyRegistration', e.target.value)}
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          <Save className="h-3 w-3" />
          {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}
