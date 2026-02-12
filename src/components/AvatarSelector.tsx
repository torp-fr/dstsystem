import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AVATAR_COLLECTIONS, ALL_AVATARS } from '@/data/avatars';
import { Upload } from 'lucide-react';

interface AvatarSelectorProps {
  value?: string;
  onChange: (avatarUrl: string) => void;
  showPreview?: boolean;
}

export default function AvatarSelector({ value, onChange, showPreview = true }: AvatarSelectorProps) {
  const [uploadMode, setUploadMode] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setUploadMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="badass" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="badass" className="text-xs">Badass</TabsTrigger>
          <TabsTrigger value="realistic" className="text-xs">Réalistes</TabsTrigger>
          <TabsTrigger value="characters" className="text-xs">Personnages</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
        </TabsList>

        {/* Badass Collection */}
        <TabsContent value="badass" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_COLLECTIONS.badass.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onChange(avatar.url)}
                className={`relative h-24 w-24 rounded-lg border-2 overflow-hidden transition-all hover:border-primary flex-shrink-0 ${
                  value === avatar.url ? 'border-primary bg-primary/10' : 'border-border'
                }`}
                title={avatar.name}
              >
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Realistic Collection */}
        <TabsContent value="realistic" className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_COLLECTIONS.realistic.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onChange(avatar.url)}
                className={`relative h-24 w-24 rounded-lg border-2 overflow-hidden transition-all hover:border-primary flex-shrink-0 ${
                  value === avatar.url ? 'border-primary bg-primary/10' : 'border-border'
                }`}
                title={avatar.name}
              >
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Characters Collection */}
        <TabsContent value="characters" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_COLLECTIONS.characters.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onChange(avatar.url)}
                className={`relative h-24 w-24 rounded-lg border-2 overflow-hidden transition-all hover:border-primary flex-shrink-0 ${
                  value === avatar.url ? 'border-primary bg-primary/10' : 'border-border'
                }`}
                title={avatar.name}
              >
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Upload */}
        <TabsContent value="upload" className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Téléchargez une photo de profil (PNG, JPG, GIF)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {showPreview && value && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">Aperçu</p>
          <div className="w-20 h-20 rounded-lg border-2 border-border overflow-hidden">
            <img src={value} alt="Avatar preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
