import AnimatedSection from "@/components/AnimatedSection";
import {
  Activity,
  TrendingUp,
  Zap,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

const programs = [
  {
    icon: Activity,
    title: "Maintien opérationnel",
    subtitle: "Préserver les acquis",
    duration: "Récurrent",
    audience: "Forces de sécurité",
    highlight: false,
    description:
      "Lutter contre la périssabilité des compétences armées. Sessions régulières pour conserver la confiance, la précision et les réflexes. Entraînement accessible directement dans vos locaux — il suffit d'une salle.",
    objectives: [
      "Lutte contre la dégradation des acquis",
      "Sessions régulières adaptées au calendrier opérationnel",
      "Evaluation et suivi des niveaux individuels",
      "Débriefing après chaque séance",
      "Rapports de progression pour la hiérarchie",
      "Solution mobile — zéro infrastructure requise",
    ],
  },
  {
    icon: TrendingUp,
    title: "Progression dynamique",
    subtitle: "Monter en compétences",
    duration: "Semestriel/Annuel",
    audience: "Unités opérationnelles",
    highlight: true,
    description:
      "Programme structuré avec progression mesurable et montée en complexité. Diagnostic initial, suivi individualisé, scénarios évolutifs adaptés aux retours terrain. Développer les réflexes opérationnels et la confiance du personnel.",
    objectives: [
      "Diagnostic initial et évaluation des compétences",
      "Progression avec montée en complexité scénaristique",
      "Suivi individualisé avec rapports détaillés",
      "Scénarios adaptés aux besoins opérationnels identifiés",
      "Mécanisation des gestes réflexes critiques",
      "Rapports mesurables pour le commandement",
    ],
  },
  {
    icon: Zap,
    title: "Tactique avancée",
    subtitle: "Scénarios immersifs",
    duration: "Modules flexibles",
    audience: "Toutes structures",
    highlight: false,
    description:
      "Entraînement immersif : CQB, effraction froide, interpellations, travail sous stress. Modules combinables selon vos protocoles et objectifs opérationnels. Adaptation complète aux exigences de votre unité ou collectivité.",
    objectives: [
      "Scénarios : CQB, effraction froide, interpellations",
      "Gestion du stress et prise de décision rapide",
      "Graduation de la réponse à la menace",
      "Travail en équipe et coordination tactique",
      "Modules combinables et personnalisables",
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
