import AnimatedSection from "@/components/AnimatedSection";
import {
  Zap,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
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
      "Séance unique d'entraînement au tir laser, idéale pour une première découverte du simulateur ou un entraînement ponctuel. Analyse de performance individuelle et débriefing inclus. Possibilité de mutualiser entre collectivités pour compléter un groupe.",
    objectives: [
      "Prise en main du simulateur de tir laser",
      "Exercices de précision, tir statique et dynamique",
      "Analyse de performance individuelle",
      "Débriefing opérationnel en fin de session",
      "Mutualisation possible entre entités",
    ],
  },
  {
    icon: Award,
    title: "Programme annuel",
    subtitle: "Récurrence & suivi",
    duration: "Annuel",
    audience: "Unités opérationnelles",
    highlight: true,
    description:
      "Notre offre phare : un cycle d'entraînement annuel avec sessions régulières. Ce programme assure un suivi individuel des pratiquants, une progression mesurable et l'intégration de scénarios adaptés aux besoins identifiés au fil des sessions. Complémentaire au tir réel, il multiplie les opportunités d'entraînement opérationnel.",
    objectives: [
      "Diagnostic initial et évaluation des compétences",
      "Progression avec montée en complexité",
      "Suivi individuel et rapports de progression",
      "Scénarios évolutifs adaptés aux retours terrain",
      "Mécanisation des gestes réflexes",
      "Solution complémentaire au tir réel",
      "Rapports d'avancement pour la hiérarchie",
    ],
  },
  {
    icon: Target,
    title: "Programme sur mesure",
    subtitle: "Personnalisé",
    duration: "Selon besoins",
    audience: "Toutes structures",
    highlight: false,
    description:
      "Programme entièrement construit autour de vos besoins opérationnels spécifiques. Idéal pour les structures souhaitant mutualiser plusieurs entités ou adapter le contenu à des protocoles particuliers. Nous identifions vos objectifs et construisons le programme adapté.",
    objectives: [
      "Analyse des besoins et objectifs opérationnels",
      "Construction d'un programme dédié",
      "Mutualisation possible entre collectivités",
      "Modules combinables : CQB, précision, nuit, stress…",
      "Calendrier flexible selon vos contraintes",
    ],
  },
];

const ProgramCards = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {programs.map((prog, i) => (
          <AnimatedSection key={prog.title} delay={i * 0.15}>
            <div
              className={`h-full p-8 rounded-2xl border-border transition-all group relative ${
                prog.highlight
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                  : "bg-card border-border-border hover:border-primary/30"
              }`}
            >
              {prog.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Recommandé
                </div>
              )}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-border border-primary/20 mb-6">
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
);

export default ProgramCards;
