import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContactVisual from "@/components/contact/FranceMap";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    typeStructure: "",
    nombreAgents: "",
    localisation: "",
    programmeEnvisage: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Message envoyé avec succès !",
          description: "Nous vous répondrons dans les meilleurs délais.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          typeStructure: "",
          nombreAgents: "",
          localisation: "",
          programmeEnvisage: "",
          message: "",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de l'envoi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-20 border-b border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-primary text-sm font-medium tracking-wider uppercase">
                  Contact
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                  Demande d'étude de besoin
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Remplissez ce formulaire pour que nous analysons vos besoins
                  opérationnels et vous proposions un programme adapté.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <AnimatedSection>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-card border-border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="bg-card border-border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone <span className="text-muted-foreground text-sm">(optionnel)</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 XX XX XX XX"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="bg-card border-border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typeStructure">Type de structure</Label>
                    <Select
                      value={formData.typeStructure}
                      onValueChange={(value) =>
                        setFormData({ ...formData, typeStructure: value })
                      }
                    >
                      <SelectTrigger className="bg-card border-border-border">
                        <SelectValue placeholder="Sélectionnez votre type de structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="police">Police nationale</SelectItem>
                        <SelectItem value="gendarmerie">Gendarmerie</SelectItem>
                        <SelectItem value="armée">Armée</SelectItem>
                        <SelectItem value="forces-spéciales">Forces spéciales</SelectItem>
                        <SelectItem value="police-municipale">Police municipale</SelectItem>
                        <SelectItem value="collectivité">Collectivité locale</SelectItem>
                        <SelectItem value="sécurité-privée">Sécurité privée armée</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombreAgents">Nombre d'agents</Label>
                      <Input
                        id="nombreAgents"
                        placeholder="Ex: 20"
                        type="number"
                        value={formData.nombreAgents}
                        onChange={(e) =>
                          setFormData({ ...formData, nombreAgents: e.target.value })
                        }
                        className="bg-card border-border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="localisation">Localisation</Label>
                      <Input
                        id="localisation"
                        placeholder="Région ou département"
                        value={formData.localisation}
                        onChange={(e) =>
                          setFormData({ ...formData, localisation: e.target.value })
                        }
                        className="bg-card border-border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="programmeEnvisage">Programme envisagé</Label>
                    <Select
                      value={formData.programmeEnvisage}
                      onValueChange={(value) =>
                        setFormData({ ...formData, programmeEnvisage: value })
                      }
                    >
                      <SelectTrigger className="bg-card border-border-border">
                        <SelectValue placeholder="Quel programme vous intéresse ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintien">Maintien opérationnel</SelectItem>
                        <SelectItem value="progression">Progression dynamique</SelectItem>
                        <SelectItem value="tactique">Tactique avancée</SelectItem>
                        <SelectItem value="personnalisé">Programme personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Informations complémentaires</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez vos objectifs opérationnels spécifiques et vos contraintes logistiques..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="bg-card border-border-border"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? "Envoi en cours..." : "Envoyer la demande"}
                  </Button>
                </form>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">
                      Nos coordonnées
                    </h3>
                    <div className="space-y-4">
                      <a
                        href="mailto:dst-system@hotmail.com"
                        className="flex items-center gap-4 p-4 rounded-xl bg-card border-border border-border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">dst-system@hotmail.com</p>
                        </div>
                      </a>
                      <a
                        href="tel:+33665445226"
                        className="flex items-center gap-4 p-4 rounded-xl bg-card border-border border-border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Téléphone
                          </p>
                          <p className="font-medium">+33 6 65 44 52 26</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border-border border-border-border">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Adresse
                          </p>
                          <p className="font-medium">France</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* France map */}
                  <ContactVisual />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
