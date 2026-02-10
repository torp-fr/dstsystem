import AnimatedSection from "@/components/AnimatedSection";
import {
  CheckCircle,
  Shield,
  Star,
  Calendar,
  Target,
  Zap,
  Award,
  Building2,
  PartyPopper,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const institutionalOffers = [
  {
    color: "border-destructive/40",
    badge: "Ponctuel",
    badgeClass: "bg-destructive/10 text-destructive",
    title: "Séance unique",
    subtitle: "One-Shot Institutionnel",
    indication: "Intervention ponctuelle",
    description:
      "Intervention sans engagement, idéale pour une découverte, un renfort ponctuel ou une première approche de l'entraînement par simulation.",
    features: [
      "1 journée d'entraînement par simulation",
      "Modules standards (fondamentaux, décision, stress)",
      "Jusqu'à 20 participants selon le thème",
      "Mise en place et débriefing inclus",
    ],
    highlight: false,
  },
  {
    color: "border-orange-500/40",
    badge: "Récurrent",
    badgeClass: "bg-orange-500/10 text-orange-400",
    title: "Programme 6 séances",
    subtitle: "Entraînement régulier",
    indication: "Tarif optimisé par la récurrence",
    description:
      "Entraînement récurrent réparti sur l'année. Idéal pour les collectivités souhaitant augmenter la fréquence d'entraînement à large effectif.",
    features: [
      "6 journées réparties sur l'année",
      "Participants variables selon disponibilités",
      "Modules standards adaptables",
      "Fréquence régulière : 1 session / 2 mois",
    ],
    highlight: false,
  },
  {
    color: "border-primary/60",
    badge: "Recommandé",
    badgeClass: "bg-primary/10 text-primary",
    title: "Programme annuel avec suivi",
    subtitle: "Suivi individuel & progression",
    indication: "Notre offre cœur de valeur",
    description:
      "Programme complet avec diagnostic initial, progression pédagogique planifiée, identification individuelle et bilan annuel. La formule privilégiée dans une logique de prévention.",
    features: [
      "Séance initiale de diagnostic qualitatif",
      "Séances d'entraînement progressif",
      "Groupe identifié (jusqu'à 20 participants)",
      "Identification individuelle & progression",
      "Bilan annuel global",
      "Rapports d'avancement pour la hiérarchie",
    ],
    highlight: true,
  },
  {
    color: "border-blue-500/40",
    badge: "Volume",
    badgeClass: "bg-blue-500/10 text-blue-400",
    title: "Séances libres en volume",
    subtitle: "≥ 10 journées / an",
    indication: "Tarif optimisé par le volume",
    description:
      "Capacité optimisée avec mutualisation possible. Les collectivités s'organisent librement pour la répartition inter-services ou inter-communes.",
    features: [
      "Journées d'entraînement non nominatives",
      "Participants libres à chaque séance",
      "Modules standards",
      "Mutualisation inter-services ou inter-communes",
    ],
    highlight: false,
  },
];

const otherOffers = [
  {
    icon: Building2,
    title: "Session B2B — Entreprises",
    description:
      "Journée axée sur la gestion du stress, la prise de décision et la cohésion d'équipe. Adapté aux séminaires et événements corporate.",
    features: [
      "Team building & événements",
      "Aucun scénario forces publiques",
      "Adapté aux séminaires d'entreprise",
    ],
  },
  {
    icon: PartyPopper,
    title: "B2C — Loisirs encadrés",
    description:
      "Session d'environ 3 heures pour découverte, parcours et challenge. EVG, EVJF, loisirs entre amis.",
    features: [
      "Parcours ludiques & challenges",
      "Encadrement professionnel",
      "Aucun exercice opérationnel",
    ],
  },
  {
    icon: Wrench,
    title: "Modules spécifiques",
    description:
      "CQB pédagogique, effraction d'entraînement, secourisme, scénarios haute contrainte. Conditions et logistique sur mesure.",
    features: [
      "Logistique et prérequis adaptés",
      "Jauge et conditions spécifiques",
      "Programme personnalisé sur devis",
    ],
  },
];

const ServiceOffers = () => (
  <>
    {/* Approach */}
    <section className="py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Notre approche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Calendar, text: "Régularité plutôt qu'actions isolées" },
                { icon: Target, text: "Progressivité adaptée aux publics" },
                { icon: Shield, text: "Lisibilité budgétaire pour les collectivités" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center italic">
              DST-System n'est pas un stand de tir et ne se substitue pas aux
              formations réglementaires. Nous intervenons comme opérateur
              d'entraînement complémentaire, mobile et structuré.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Institutional offers */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Forces publiques & services assimilés
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Offres institutionnelles
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Chaque programme est adaptable à vos besoins et à votre budget.
              Contactez-nous pour une proposition personnalisée.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {institutionalOffers.map((offer, i) => (
            <AnimatedSection key={offer.title} delay={i * 0.1}>
              <div
                className={`relative h-full p-8 rounded-2xl border-2 transition-all ${offer.color} ${
                  offer.highlight
                    ? "bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "bg-card"
                }`}
              >
                {offer.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3" /> Offre privilégiée
                    </span>
                  </div>
                )}
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${offer.badgeClass}`}
                >
                  {offer.badge}
                </span>
                <h3 className="text-xl font-bold">{offer.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {offer.subtitle}
                </p>
                <p className="text-primary font-semibold text-sm mb-4 italic">
                  {offer.indication}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {offer.description}
                </p>
                <ul className="space-y-2">
                  {offer.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* B2B / B2C / Modules */}
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Entreprises & loisirs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Offres complémentaires
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Des formules adaptées au monde de l'entreprise et aux particuliers.
              Tarification sur mesure selon vos attentes.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {otherOffers.map((offer, i) => (
            <AnimatedSection key={offer.title} delay={i * 0.1}>
              <div className="h-full p-8 rounded-2xl border border-border bg-background">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <offer.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {offer.description}
                </p>
                <ul className="space-y-2">
                  {offer.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Key takeaways */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">À retenir</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Les programmes avec engagement offrent les conditions les plus avantageuses",
                "Chaque offre est personnalisable selon vos besoins et votre budget",
                "DST-System fixe le cadre, la jauge et les contenus",
                "Les collectivités gèrent la répartition et la mutualisation",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Construisons votre programme
            </h2>
            <p className="text-muted-foreground mb-8">
              Chaque structure a ses spécificités. Contactez-nous pour définir
              ensemble l'offre la plus adaptée à vos besoins opérationnels.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6"
            >
              <Link to="/contact">
                Demander une proposition <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </>
);

export default ServiceOffers;
