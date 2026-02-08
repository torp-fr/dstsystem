import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Crosshair, Target, Users, Zap, Moon, UserCheck, Settings, CheckCircle, ArrowRight, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import simulatorImg from "@/assets/solutions-simulator.jpg";
import standImg from "@/assets/solutions-stand.jpg";
import situationImg from "@/assets/solutions-situation.jpg";

const solutions = [
  {
    icon: Crosshair,
    title: "Simulateur de tir laser",
    subtitle: "Précision et réalisme sans compromis",
    image: simulatorImg,
    description:
      "Notre simulateur de tir laser reproduit fidèlement les conditions de tir réelles sans nécessiter de munitions. Grâce à une technologie laser de pointe, chaque tir est analysé en temps réel pour un retour immédiat sur la performance. La compétence au tir est périssable — notre système permet un entraînement régulier et accessible pour maintenir les acquis et développer les réflexes.",
    benefits: [
      "Aucune munition réelle nécessaire — sécurité totale",
      "Analyse de performance instantanée et suivi individuel",
      "Coûts d'entraînement réduits de manière significative",
      "Solution mobile : installation dans vos locaux en moins d'une heure",
      "Compatible avec tous les types d'armes de service",
      "Tir statique et dynamique, individuel et en groupe",
    ],
  },
  {
    icon: Target,
    title: "Stand de tir virtuel",
    subtitle: "Entraînement en conditions contrôlées avec progression",
    image: standImg,
    description:
      "Le stand de tir virtuel DST-System offre un environnement d'entraînement contrôlé et modulable. Il permet de travailler la précision, la vitesse de réaction et la prise de décision avec des cibles dynamiques et des conditions variées. Chaque session est suivie et analysée pour mesurer la progression.",
    benefits: [
      "Cibles dynamiques et scénarios personnalisables",
      "Progression mesurable : précision, vitesse, réactivité",
      "Suivi statistique individuel de chaque tireur",
      "Exercices de jour et simulation de nuit",
      "Capacité jusqu'à 20 tireurs par jour (sessions matin/après-midi)",
      "Installation rapide, ne nécessite qu'une salle",
    ],
  },
  {
    icon: Users,
    title: "Mises en situation tactiques",
    subtitle: "Scénarios d'intervention réalistes et immersifs",
    image: situationImg,
    description:
      "Nos mises en situation reproduisent des scénarios d'intervention réalistes : contrôles, interpellations, CQB (Close Quarter Battle), effraction froide, protection de personnes. Chaque scénario développe les réflexes, la graduation de la réponse et la prise de décision sous stress.",
    benefits: [
      "Scénarios CQB, effraction froide, interpellations",
      "Graduation de la réponse à la situation",
      "Développement des réflexes et de la confiance en soi",
      "Travail en équipe et coordination tactique",
      "Débriefing détaillé après chaque session",
      "Adaptation aux protocoles spécifiques de chaque unité",
    ],
  },
];

const modules = [
  {
    icon: Target,
    title: "Tir de précision",
    description: "Exercices statiques à différentes distances, travail de la visée et de la stabilité.",
  },
  {
    icon: Zap,
    title: "Tir dynamique",
    description: "Tir en mouvement, changement de positions, cibles mouvantes et temps de réaction.",
  },
  {
    icon: Users,
    title: "Travail en équipe",
    description: "Coordination tactique, progression en binôme, couverture et communication.",
  },
  {
    icon: Moon,
    title: "Simulation de nuit",
    description: "Entraînement en conditions de faible luminosité, gestion de la lampe et de l'arme.",
  },
  {
    icon: UserCheck,
    title: "Gestion du stress",
    description: "Mises en situation sous pression, prise de décision rapide, graduation de la réponse.",
  },
  {
    icon: Settings,
    title: "Modules sur mesure",
    description: "Création de scénarios personnalisés selon vos besoins opérationnels spécifiques.",
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
                Une solution mobile adaptée à vos exigences
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System se déplace directement dans vos locaux avec tout
                l'équipement nécessaire. Il suffit d'une salle pour organiser
                une séance d'entraînement complète — aucune infrastructure
                lourde requise.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mobile advantage banner */}
      <section className="py-12 bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Solution 100% mobile</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Nous venons directement chez vous. Notre équipe se déplace avec le simulateur
                  complet et s'installe dans vos locaux en moins d'une heure. Seule une salle
                  est nécessaire — très peu de contraintes logistiques.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Solutions détaillées */}
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
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border">
                    <img
                      src={sol.image}
                      alt={sol.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      ))}

      {/* Catalogue de modules */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Catalogue
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
                Nos modules d'entraînement
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Chaque module peut être combiné et personnalisé pour répondre
                exactement à vos besoins opérationnels. Nous construisons votre
                programme sur mesure.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod, i) => (
              <AnimatedSection key={mod.title} delay={i * 0.1}>
                <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all h-full group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/20 transition-colors">
                    <mod.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{mod.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4}>
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Un besoin spécifique ? Nous créons des modules sur mesure adaptés
                à vos protocoles et objectifs.
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/contact">
                  Demander un programme personnalisé <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Solutions;
