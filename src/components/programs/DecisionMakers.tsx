import AnimatedSection from "@/components/AnimatedSection";
import { TrendingUp, Repeat, BarChart3, Star } from "lucide-react";

const advantages = [
  {
    icon: TrendingUp,
    title: "Progression mesurable",
    description:
      "Chaque tireur bénéficie d'un suivi statistique précis permettant de mesurer sa progression dans le temps.",
  },
  {
    icon: Repeat,
    title: "Récurrence et régularité",
    description:
      "La compétence au tir est périssable. Nos programmes assurent un entraînement régulier pour maintenir les acquis opérationnels.",
  },
  {
    icon: BarChart3,
    title: "Rapports pour décideurs",
    description:
      "Des rapports détaillés pour les commandants d'unités et décideurs, démontrant l'impact concret de l'entraînement.",
  },
  {
    icon: Star,
    title: "Complémentaire au tir réel",
    description:
      "DST-System ne remplace pas le tir réel — il le complète en multipliant les opportunités d'entraînement opérationnel.",
  },
];

const DecisionMakers = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Pour les décideurs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Pourquoi choisir DST-System ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une solution pertinente et mesurable pour vos services, avec des
            résultats concrets à présenter à votre hiérarchie.
          </p>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {advantages.map((adv, i) => (
          <AnimatedSection key={adv.title} delay={i * 0.1}>
            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <adv.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{adv.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default DecisionMakers;
