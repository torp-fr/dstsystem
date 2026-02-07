import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les meilleurs délais.",
    });
    setFormData({ name: "", email: "", organization: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-primary text-sm font-medium tracking-wider uppercase">
                  Contact
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                  Contactez-nous
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Une question ? Un projet ? N'hésitez pas à nous contacter pour
                  discuter de vos besoins.
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
                        className="bg-card border-border"
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
                        className="bg-card border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organisation</Label>
                    <Input
                      id="organization"
                      placeholder="Votre organisation ou unité"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: e.target.value,
                        })
                      }
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre projet ou posez votre question..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="bg-card border-border"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="mr-2 h-4 w-4" /> Envoyer le message
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
                        href="mailto:contact@dst-system.com"
                        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">contact@dst-system.com</p>
                        </div>
                      </a>
                      <a
                        href="tel:+33000000000"
                        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Téléphone
                          </p>
                          <p className="font-medium">+33 (0)0 00 00 00 00</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
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

                  {/* Static map placeholder */}
                  <div className="aspect-[4/3] rounded-2xl bg-card border border-border flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        Carte de localisation
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
