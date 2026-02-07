import { Target, ShieldCheck, Shield, BarChart3 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const figures = [
  {
    icon: Target,
    label: "Formation réaliste",
    description: "Conditions d'entraînement fidèles au terrain",
  },
  {
    icon: ShieldCheck,
    label: "Zéro munition",
    description: "Sécurité totale, aucun risque balistique",
  },
  {
    icon: Shield,
    label: "100% Sécurisé",
    description: "Environnement maîtrisé de bout en bout",
  },
  {
    icon: BarChart3,
    label: "Analyse précise",
    description: "Suivi de performance en temps réel",
  },
];

const KeyFigures = () => (
  <section className="py-20 bg-card border-y border-border">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {figures.map((fig, i) => (
          <AnimatedSection key={fig.label} delay={i * 0.1}>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
                <fig.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{fig.label}</h3>
              <p className="text-muted-foreground text-sm">{fig.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default KeyFigures;
