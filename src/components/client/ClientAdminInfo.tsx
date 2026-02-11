import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ClientAdminInfoProps {
  client: any;
}

export default function ClientAdminInfo({ client }: ClientAdminInfoProps) {
  const structureTypes: Record<string, string> = {
    police: '🚔 Police Nationale',
    gendarme: '🪖 Gendarmerie',
    mairie: '🏛️ Mairie',
    pompiers: '🚒 Pompiers',
    militaire: '⚔️ Militaire',
    particulier: '👤 Particulier',
    entreprise: '🏢 Entreprise',
    association: '👥 Association',
    autre: 'Autre',
  };

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Prénom</label>
              <p className="font-semibold">{client.first_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nom</label>
              <p className="font-semibold">{client.last_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-mono text-sm">{client.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Téléphone</label>
              <p className="font-mono text-sm">{client.phone || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Nom entreprise</label>
              <p className="font-semibold">{client.company_name || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Type de structure</label>
              <p className="font-semibold">
                {structureTypes[client.structure_type as keyof typeof structureTypes] || 'Non renseigné'}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Secteur d'activité</label>
              <p className="font-semibold">{client.industry || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nombre d'apprenants</label>
              <p className="font-semibold">{client.learner_count || 0}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Site web</label>
              <p className="font-mono text-sm">{client.website || 'Non renseigné'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Info */}
      {(client.address || client.city || client.postal_code) && (
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {client.address && <p>{client.address}</p>}
              {(client.postal_code || client.city) && (
                <p>
                  {client.postal_code} {client.city}
                </p>
              )}
              {client.country && <p>{client.country}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
