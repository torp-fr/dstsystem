import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Repeat,
  Star,
} from "lucide-react";

const programs = [
  {
    icon: Zap,
    title: "Session à la demande",
    subtitle: "One-shot",
    duration: "1 journée",
    audience: "Tous niveaux",
    highlight: false,
    description:
      "Séance unique d'entraînement au tir laser, idéale pour une première découverte du simulateur ou un entraînement ponctuel. Jusqu'à 20 tireurs par jour (10 le matin, 10 l'après-midi) avec analyse de performance individuelle.",
    objectives: [
      "Prise en main du simulateur de tir laser",
      "Exercices de précision et tir dynamique",
      "Analyse de performance individuelle",
      "Débriefing complet en fin de session",
      "Possibilité de mutualiser entre collectivités",
    ],
  },
  {
    icon: Award,
    title: "Programme annuel",
    subtitle: "10 sessions",
    duration: "10 mois",
    audience: "Unités opérationnelles",
    highlight: true,
    description:
      "Notre offre phare : un cycle d'entraînement annuel de 10 sessions réparties sur l'année. Ce programme permet un suivi individuel des pratiquants, une progression mesurable et l'intégration de scénarios adaptés aux besoins identifiés au fil des sessions.",
    objectives: [
      "Diagnostic initial et évaluation des compétences",
      "Progression sur 10 mois avec montée en complexité",
      "Suivi individuel et analyse de progression",
      "Scénarios évolutifs adaptés aux retours terrain",
      "Solution complémentaire au tir réel",
      "Rapports d'avancement pour la hiérarchie",
    ],
  },
  {
    icon: Target,
    title: "Programme personnalisé",
    subtitle: "Sur mesure",
    duration: "Selon besoins",
    audience: "Toutes structures",
    highlight: false,
    description:
      "Programme entièrement construit autour de vos besoins spécifiques. Idéal pour les structures souhaitant mutualiser plusieurs entités (3 à 5 agents par collectivité) ou adapter le contenu à des protocoles particuliers.",
    objectives: [
      "Analyse des besoins et objectifs opérationnels",
      "Construction d'un programme dédié",
      "Mutualisation possible entre collectivités",
      "Modules combinables à volonté",
      "Calendrier flexible selon vos contraintes",
    ],
  },
];

const advantages = [
  {
    icon: TrendingUp,
    title: "Progression mesurable",
    description: "Chaque tireur bénéficie d'un suivi statistique précis permettant de mesurer sa progression dans le temps.",
  },
  {
    icon: Repeat,
    title: "Récurrence et régularité",
    description: "La compétence au tir est périssable. Nos programmes assurent un entraînement régulier pour maintenir les acquis.",
  },
  {
    icon: BarChart3,
    title: "Rapports pour décideurs",
    description: "Des rapports détaillés pour les commandants d'unités et décideurs, démontrant l'impact concret de l'entraînement.",
  },
  {
    icon: Star,
    title: "Complémentaire au tir réel",
    description: "DST-System ne remplace pas le tir réel — il le complète en multipliant les opportunités d'entraînement.",
  },
];

const Programs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Programmes
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                S'entraîner régulièrement.
                <br />
                <span className="text-primary">Performer durablement.</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                La compétence au tir est périssable. Les institutions manquent
                souvent de temps, de moyens logistiques et humains pour
                s'entraîner suffisamment. Nos programmes apportent la
                récurrence nécessaire au maintien des compétences opérationnelles.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Programs grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programs.map((prog, i) => (
              <AnimatedSection key={prog.title} delay={i * 0.15}>
                <div
                  className={`h-full p-8 rounded-2xl border transition-all group relative ${
                    prog.highlight
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  {prog.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Recommandé
                    </div>
                  )}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                    <prog.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{prog.title}</h2>
                  <p className="text-primary font-medium text-sm mb-4">
                    {prog.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> {prog.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      <Users className="h-3 w-3" /> {prog.audience}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {prog.description}
                  </p>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">
                    Points clés
                  </h4>
                  <ul className="space-y-2">
                    {prog.objectives.map((obj) => (
                      <li
                        key={obj}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Capacity info */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">20</h3>
                <p className="text-muted-foreground text-sm">
                  tireurs par jour<br />(10 matin + 10 après-midi)
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">10</h3>
                <p className="text-muted-foreground text-sm">
                  sessions annuelles<br />pour un suivi optimal
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Repeat className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">∞</h3>
                <p className="text-muted-foreground text-sm">
                  configurations possibles<br />modules combinables à volonté
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Advantages for decision makers */}
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
                Une solution pertinente et mesurable pour vos services,
                avec des résultats concrets à présenter à votre hiérarchie.
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

      {/* Mutualisation */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Mutualisation entre entités
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Vous êtes une collectivité de 3, 4 ou 5 agents ? Mutualisez
                vos sessions avec d'autres entités pour compléter un programme
                et optimiser les coûts. Notre solution étant commune à
                plusieurs types de publics, nous organisons des rotations et
                des groupes adaptés.
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/contact">
                  Organiser une mutualisation <ArrowRight className="ml-2 h-4 w-4" />
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

export default Programs;
