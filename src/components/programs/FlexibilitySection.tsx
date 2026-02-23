import AnimatedSection from "@/components/AnimatedSection";
import { Calendar, Users, Zap, Truck, Wind, CheckCircle } from "lucide-react";

const FlexibilitySection = () => (
  <section className="py-20 border-t border-border-border">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Flexibilité opérationnelle
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Programmes adaptables à vos besoins
          </h2>
          <p className="text-muted-foreground">
            Programmes planifiables à l'année ou par volume de journées selon vos besoins opérationnels.
            DST-System s'adapte à votre calendrier, vos effectifs et vos objectifs.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: Calendar,
            title: "Programmation flexible",
            description: "Planifiez à l'année ou par volume de journées",
          },
          {
            icon: Users,
            title: "Rotation libre des agents",
            description: "Groupes ouverts ou identifiés selon vos contraintes",
          },
          {
            icon: Zap,
            title: "Progression adaptable",
            description: "Diagnostic initial et suivi individualisé inclus",
          },
          {
            icon: Truck,
            title: "100% mobile",
            description: "Installation directement dans vos locaux",
          },
          {
            icon: Wind,
            title: "Sans munitions",
            description: "Sécurité maximale, coûts optimisés",
          },
          {
            icon: CheckCircle,
            title: "Services opérationnels",
            description: "Adaptation à tous les contextes institutionnels",
          },
        ].map((item, i) => (
          <AnimatedSection key={item.title} delay={i * 0.05}>
            <div className="p-6 rounded-xl bg-card border-border border-border-border hover:border-primary/30 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="p-8 rounded-2xl bg-primary/5 border-border border-primary/20">
          <p className="text-center text-muted-foreground leading-relaxed">
            <strong className="text-foreground">
              Chaque institution a des contraintes uniques.
            </strong>
            {" "}Nous construisons avec vous un programme adapté :
            calendrier opérationnel, effectifs variables, progression pédagogique et suivi mesurable.
            De quelques journées d'essai à un programme pluriannuel, DST-System s'adapte.
          </p>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default FlexibilitySection;
