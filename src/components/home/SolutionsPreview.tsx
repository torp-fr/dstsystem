import { Link } from "react-router-dom";
import { Crosshair, Target, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";

const solutions = [
  {
    icon: Crosshair,
    title: "Simulateur de tir laser",
    description:
      "Entraînement de précision en conditions contrôlées avec retour instantané sur la performance. Aucune munition réelle nécessaire.",
  },
  {
    icon: Target,
    title: "Stand de tir virtuel",
    description:
      "Cibles dynamiques, tir statique et dynamique, de jour comme de nuit. Progression mesurable à chaque session.",
  },
  {
    icon: Users,
    title: "Mises en situation tactiques",
    description:
      "CQB, effraction froide, interpellations — des scénarios réalistes pour développer les réflexes et la prise de décision.",
  },
];

const SolutionsPreview = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Nos solutions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Une solution mobile d'entraînement de pointe
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            DST-System se déplace directement dans vos locaux. Il suffit d'une
            salle pour organiser une séance complète — aucune infrastructure
            lourde requise.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {solutions.map((sol, i) => (
          <AnimatedSection key={sol.title} delay={i * 0.15}>
            <div className="group relative p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 h-full">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                  <sol.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{sol.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {sol.description}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.3}>
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 text-primary"
          >
            <Link to="/solutions">
              Voir toutes nos solutions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default SolutionsPreview;
