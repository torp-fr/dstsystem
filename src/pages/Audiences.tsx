import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Swords,
  Shield,
  Star,
  Eye,
  Lock,
  Briefcase,
  PartyPopper,
  Megaphone,
  CheckCircle,
  ArrowRight,
  Building2,
} from "lucide-react";

const coreAudiences = [
  {
    icon: Swords,
    title: "Armée",
    description:
      "Entraînement tactique de haut niveau pour les forces armées, adapté aux conditions de combat modernes et aux exigences opérationnelles.",
    needs: [
      "Maintien de la capacité opérationnelle",
      "Entraînement en conditions réalistes",
      "Mécanisation des gestes réflexes",
      "Graduation de la réponse selon la menace",
    ],
    response:
      "DST-System propose des simulations de combat adaptées aux scénarios d'engagement actuels. Notre solution mobile s'installe directement dans vos casernes — aucune logistique lourde requise.",
  },
  {
    icon: Shield,
    title: "Police nationale",
    description:
      "Solutions de formation au tir adaptées aux missions de maintien de l'ordre et d'intervention en milieu urbain.",
    needs: [
      "Tir de précision en milieu urbain",
      "Gestion du stress opérationnel",
      "Respect des règles d'engagement",
      "Proportionnalité de la réponse",
    ],
    response:
      "Nos scénarios reproduisent des interventions policières réalistes : contrôles, interpellations, situations de crise. Les sessions régulières renforcent la confiance et le professionnalisme des agents.",
  },
  {
    icon: Star,
    title: "Gendarmerie",
    description:
      "Programmes d'entraînement couvrant l'ensemble des missions de la gendarmerie, du maintien de l'ordre aux interventions spécialisées.",
    needs: [
      "Polyvalence des compétences de tir",
      "Formation continue des personnels",
      "Adaptabilité aux différents contextes",
      "Qualification et requalification régulière",
    ],
    response:
      "Des programmes modulaires couvrant le tir défensif et les situations d'intervention. Possibilité de mutualiser entre brigades pour optimiser les coûts et compléter un programme.",
  },
  {
    icon: Eye,
    title: "Forces spéciales",
    description:
      "Entraînement de pointe pour les unités d'élite nécessitant des compétences de tir exceptionnelles et une réactivité maximale.",
    needs: [
      "Réflexes et précision extrêmes",
      "Coordination d'équipe en intervention",
      "CQB et travail sur effraction froide",
      "Adaptation rapide aux menaces",
    ],
    response:
      "Des scénarios haute intensité reproduisant les conditions les plus exigeantes : CQB, effraction froide, protection de personnes, neutralisation en milieu confiné.",
  },
  {
    icon: Lock,
    title: "Sécurité privée",
    description:
      "Formation au tir pour les agents de sécurité privée, conforme aux réglementations et aux standards professionnels.",
    needs: [
      "Conformité réglementaire et certification",
      "Qualification et requalification",
      "Gestion de situations critiques",
      "Professionnalisation des équipes",
    ],
    response:
      "Des programmes de formation et de certification adaptés au cadre légal de la sécurité privée, avec suivi individualisé et rapports pour les responsables.",
  },
];

const additionalAudiences = [
  {
    icon: Briefcase,
    title: "Entreprises",
    description: "Team building, gestion du stress, événements d'entreprise",
    details:
      "Proposez une expérience unique à vos équipes : séances de tir laser en team building, ateliers de gestion du stress, séminaires d'entreprise. Une activité fédératrice et originale qui développe la concentration et la cohésion d'équipe.",
  },
  {
    icon: PartyPopper,
    title: "Événements B2C",
    description: "EVG, EVJF, loisirs, anniversaires",
    details:
      "Offrez un moment inoubliable : enterrements de vie de garçon ou de jeune fille, anniversaires, sorties entre amis. Une activité ludique et adrénaline dans un cadre sécurisé avec un encadrement professionnel.",
  },
  {
    icon: Megaphone,
    title: "Salons et sous-traitance",
    description: "Démonstrations, sensibilisation, partenariats",
    details:
      "Nous intervenons en sous-traitance sur des salons, événements et formations. Initiation au tir, sensibilisation à la sécurité, démonstrations de notre technologie — nous nous adaptons à chaque contexte.",
  },
  {
    icon: Building2,
    title: "Collectivités locales",
    description: "Police municipale, gardes champêtres, ASVP",
    details:
      "Une solution accessible pour les petites collectivités qui ne disposent pas d'infrastructures de tir. Possibilité de mutualiser entre plusieurs communes voisines pour rentabiliser un programme annuel.",
  },
];

const Audiences = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Publics Cibles
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Une solution commune,
                <br />
                <span className="text-primary">des réponses sur mesure</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Notre technologie de simulateur laser s'adapte à chaque public.
                Des forces armées aux entreprises, nous répondons à vos besoins
                spécifiques avec des programmes personnalisés.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Core audiences */}
      <section>
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">
                Cœur de cible : Forces de l'ordre & Armées
              </h2>
              <p className="text-muted-foreground">
                Notre expertise première au service de ceux qui protègent.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {coreAudiences.map((aud, i) => (
          <section
            key={aud.title}
            className={`py-16 ${i % 2 === 1 ? "bg-card" : ""}`}
          >
            <div className="container mx-auto px-4">
              <AnimatedSection>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                      <aud.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{aud.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {aud.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">
                      Besoins identifiés
                    </h3>
                    <ul className="space-y-3">
                      {aud.needs.map((need) => (
                        <li
                          key={need}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">
                      Notre réponse
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {aud.response}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        ))}
      </section>

      {/* Additional audiences */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Et aussi
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
                Au-delà des forces de l'ordre
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Notre solution s'ouvre également aux entreprises, aux
                événements et aux particuliers pour des expériences uniques.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {additionalAudiences.map((aud, i) => (
              <AnimatedSection key={aud.title} delay={i * 0.1}>
                <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                    <aud.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{aud.title}</h3>
                  <p className="text-primary text-sm font-medium mb-3">
                    {aud.description}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {aud.details}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4}>
            <div className="text-center mt-12">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/contact">
                  Discutons de votre projet <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Decision makers */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-primary text-sm font-medium tracking-wider uppercase">
                  Décideurs
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
                  Un message aux décideurs
                </h2>
              </div>

              <div className="p-8 md:p-12 rounded-2xl bg-background border border-border">
                <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                  <strong className="text-foreground">Commandants d'unités, élus locaux, responsables régionaux</strong> — 
                  vos agents ont besoin de s'entraîner régulièrement pour maintenir
                  un niveau opérationnel conforme aux exigences de leur mission.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Le tir est une compétence périssable. Sans entraînement régulier,
                  les réflexes s'émoussent, la confiance diminue, et la capacité de
                  réponse graduée se dégrade. Or, les contraintes logistiques,
                  budgétaires et de temps limitent souvent l'accès aux stands de tir
                  traditionnels.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  <strong className="text-foreground">DST-System apporte une solution concrète</strong> : 
                  une unité mobile qui se déplace dans vos locaux, un programme
                  annuel structuré avec suivi individualisé, et des rapports
                  d'avancement permettant de mesurer l'impact de l'investissement.
                  Le tout avec un coût maîtrisé et zéro infrastructure à installer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary mb-1">0</p>
                    <p className="text-xs text-muted-foreground">infrastructure requise</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary mb-1">100%</p>
                    <p className="text-xs text-muted-foreground">solution mobile</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary mb-1">ROI</p>
                    <p className="text-xs text-muted-foreground">mesurable et documenté</p>
                  </div>
                </div>
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link to="/contact">
                      Demander une présentation <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Audiences;
