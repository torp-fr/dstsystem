import { Truck, ShieldCheck, Users, BarChart3 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const figures = [
  {
    icon: Truck,
    label: "Solution mobile",
    description: "On se déplace dans vos locaux",
  },
  {
    icon: ShieldCheck,
    label: "Zéro munition",
    description: "Sécurité totale, aucun risque",
  },
  {
    icon: Users,
    label: "20 tireurs/jour",
    description: "Sessions matin et après-midi",
  },
  {
    icon: BarChart3,
    label: "Suivi individuel",
    description: "Progression mesurable dans le temps",
  },
];

const KeyFigures = () => (
  <section className="py-20 bg-card border-y border-border-border">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {figures.map((fig, i) => (
          <AnimatedSection key={fig.label} delay={i * 0.1}>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border-border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
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
