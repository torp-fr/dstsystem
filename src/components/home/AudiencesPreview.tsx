import { Link } from "react-router-dom";
import { Shield, Swords, Lock, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";

const audiences = [
  { icon: Swords, label: "Armée & Forces spéciales" },
  { icon: Shield, label: "Police & Gendarmerie" },
  { icon: Building2, label: "Collectivités locales" },
  { icon: Lock, label: "Sécurité privée armée" },
];

const AudiencesPreview = () => (
  <section className="py-24 bg-card border-y border-border-border">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Professionnels armés
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Une méthode pour tous les services opérationnels
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            DST-System est conçue pour les professionnels armés et services opérationnels :
            armée, police, gendarmerie, douanes, administration pénitentiaire, sécurité privée et collectivités.
          </p>
        </div>
      </AnimatedSection>

      <div className="flex flex-wrap justify-center gap-6">
        {audiences.map((aud, i) => (
          <AnimatedSection key={aud.label} delay={i * 0.08}>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background border-border border-border-border hover:border-primary/30 transition-all min-w-[140px]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <aud.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">{aud.label}</span>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.4}>
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 text-primary"
          >
            <Link to="/publics-cibles">
              En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default AudiencesPreview;
