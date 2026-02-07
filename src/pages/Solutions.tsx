import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Crosshair, Target, Users, CheckCircle } from "lucide-react";

const solutions = [
  {
    icon: Crosshair,
    title: "Simulateur de tir laser",
    subtitle: "Précision et réalisme sans compromis",
    description:
      "Notre simulateur de tir laser reproduit fidèlement les conditions de tir réelles sans nécessiter de munitions. Grâce à une technologie laser de pointe, chaque tir est analysé en temps réel pour un retour immédiat sur la performance.",
    benefits: [
      "Aucune munition réelle nécessaire",
      "Sécurité totale pour les tireurs et l'environnement",
      "Analyse de performance instantanée",
      "Coûts d'entraînement réduits de manière significative",
      "Utilisable dans tout type d'infrastructure",
    ],
  },
  {
    icon: Target,
    title: "Stand de tir virtuel",
    subtitle: "Entraînement en conditions contrôlées",
    description:
      "Le stand de tir virtuel DST-System offre un environnement d'entraînement contrôlé et modulable. Il permet de reproduire différents scénarios de tir avec des cibles dynamiques et des conditions variées.",
    benefits: [
      "Cibles dynamiques et scénarios personnalisables",
      "Conditions d'éclairage et de distance variables",
      "Suivi statistique de chaque tireur",
      "Compatible avec tous les types d'armes de service",
      "Installation rapide et mobile",
    ],
  },
  {
    icon: Users,
    title: "Mises en situation réelles",
    subtitle: "Scénarios tactiques immersifs",
    description:
      "Nos mises en situation reproduisent des scénarios d'intervention réalistes : contrôles routiers, interventions en milieu urbain, protection de personnes. Chaque scénario est conçu pour développer les réflexes et la prise de décision.",
    benefits: [
      "Scénarios réalistes et évolutifs",
      "Développement des réflexes tactiques",
      "Entraînement à la prise de décision sous stress",
      "Débriefing détaillé après chaque session",
      "Adaptation aux protocoles de chaque unité",
    ],
  },
];

const Solutions = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      {/* Header */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Nos Solutions
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Des solutions adaptées à vos exigences opérationnelles
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System propose une gamme complète de solutions
                d'entraînement par simulateur laser, conçues pour répondre aux
                standards les plus élevés des forces de sécurité et de défense.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Solutions */}
      {solutions.map((sol, i) => (
        <section
          key={sol.title}
          className={`py-20 ${i % 2 === 1 ? "bg-card" : ""}`}
        >
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                    <sol.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{sol.title}</h2>
                  <p className="text-primary font-medium mb-4">
                    {sol.subtitle}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {sol.description}
                  </p>
                  <ul className="space-y-3">
                    {sol.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center">
                    <sol.icon className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      ))}
    </main>
    <Footer />
  </div>
);

export default Solutions;
