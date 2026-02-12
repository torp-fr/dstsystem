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
    const defaults = {
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
    if (!saved) return defaults;
    const parsed = JSON.parse(saved);
    // Ensure all values are strings for proper input handling
    return Object.keys(defaults).reduce((acc: any, key: string) => {
      acc[key] = String(parsed[key] || defaults[key as keyof typeof defaults]);
      return acc;
    }, {});
  });

  const handleChange = (field: string, value: string) => {
    // Keep value as string in state for input, validate on save
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      // Convert string values to numbers for numeric fields on save
      const settingsToSave = Object.keys(settings).reduce((acc: any, key: string) => {
        const value = settings[key as keyof typeof settings];
        // Parse numeric fields
        if (['employeeChargesPercent', 'employerChargesPercent', 'passCeiling', 'defaultVATRate',
              'hoursPerDay', 'daysPerMonth', 'targetMarginPercent', 'minSessionPrice'].includes(key)) {
          acc[key] = parseFloat(value as string) || 0;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

      localStorage.setItem('dst-system-settings', JSON.stringify(settingsToSave));
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

  const SettingField = ({ label, id, value, onChange, help, type = 'number' }: any) => {
    const handleInput = (e: any) => {
      const val = e.target.value;
      // For number fields, only allow digits and decimal point
      if (type === 'number') {
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
          onChange(e);
        }
      } else {
        onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{help}</p>
        <Input
          id={id}
          type={type === 'number' ? 'text' : 'text'}
          value={value}
          onChange={handleInput}
          className="h-8 text-sm border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
          placeholder="0"
          inputMode={type === 'number' ? 'decimal' : 'text'}
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Paramètres</h1>
        <p className="text-xs text-muted-foreground">Configuration DST-System</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* French Social Charges */}
        <div className="bg-card rounded-lg border-border border p-2">
          <h3 className="font-semibold text-xs mb-2">Charges sociales</h3>
          <div className="space-y-1">
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
        <div className="bg-card rounded-lg border-border border p-2">
          <h3 className="font-semibold text-xs mb-2">Fiscal</h3>
          <div className="space-y-1">
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
        <div className="bg-card rounded-lg border-border border p-2">
          <h3 className="font-semibold text-xs mb-2">Opérationnel</h3>
          <div className="space-y-1">
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
        <div className="bg-card rounded-lg border-border border p-2">
          <h3 className="font-semibold text-xs mb-2">Rentabilité</h3>
          <div className="space-y-1">
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
        <div className="bg-card rounded-lg border-border border p-2 lg:col-span-2">
          <h3 className="font-semibold text-xs mb-2">Entreprise</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="companyName" className="text-xs font-medium">Raison sociale</Label>
              <Input
                id="companyName"
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="h-8 text-sm mt-1 border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
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
                className="h-8 text-sm mt-1 border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-50/10 focus:border-blue-300/60 focus:bg-blue-50/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-1">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="gap-1 h-8"
        >
          <Save className="h-3 w-3" />
          <span className="text-xs">Enregistrer</span>
        </Button>
      </div>
    </div>
  );
}
