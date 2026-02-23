import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Swords,
  Shield,
  Lock,
  CheckCircle,
  ArrowRight,
  Building2,
  Briefcase,
} from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const coreAudiences = [
  {
    icon: Swords,
    title: "Armée",
    description:
      "Entraînement opérationnel mobile pour les forces armées, adapté aux conditions modernes et aux exigences opérationnelles.",
    needs: [
      "Maintien de la capacité opérationnelle",
      "Entraînement en conditions réalistes",
      "Mécanisation des gestes réflexes",
      "Graduation de la réponse selon la menace",
      "CQB et manœuvres tactiques",
      "Coordination d'équipe en intervention",
    ],
    response:
      "DST-System propose des simulations adaptées aux scénarios d'engagement. Solution mobile s'installant directement dans vos unités — aucune logistique lourde requise.",
  },
  {
    icon: Shield,
    title: "Police nationale & Gendarmerie",
    description:
      "Solutions de formation au tir adaptées aux missions de maintien de l'ordre, d'intervention en milieu urbain et aux exigences de qualification des personnels.",
    needs: [
      "Tir de précision en milieu urbain",
      "Gestion du stress opérationnel",
      "Respect des règles d'engagement",
      "Proportionnalité de la réponse",
      "Polyvalence des compétences de tir",
      "Qualification et requalification régulière",
    ],
    response:
      "Nos scénarios reproduisent des interventions réalistes : contrôles, interpellations, situations de crise. Les sessions régulières renforcent la confiance et le professionnalisme des agents. Possibilité de mutualiser entre brigades et commissariats pour optimiser les coûts et compléter un programme.",
  },
  {
    icon: Lock,
    title: "Sécurité privée & Collectivités",
    description:
      "Entraînement pour agents de sécurité privée armée et personnels des collectivités locales (police municipale, gardes champêtres, ASVP), conforme aux réglementations.",
    needs: [
      "Conformité réglementaire et certification",
      "Qualification et requalification",
      "Gestion de situations critiques",
      "Professionnalisation des équipes",
      "Accès facilité pour les petites structures",
    ],
    response:
      "Programmes de formation et certification adaptés au cadre légal, suivi individualisé et rapports pour les responsables. Solution idéale pour collectivités ne disposant pas d'infrastructures.",
  },
  {
    icon: Briefcase,
    title: "Douanes & Administration pénitentiaire",
    description:
      "Entraînement opérationnel pour agents des douanes et personnel pénitentiaire en charge de la sécurité.",
    needs: [
      "Maintien opérationnel des compétences",
      "Entraînement régulier accessible",
      "Conformité aux standards nationaux",
      "Suivi individualisé",
      "Rapports pour l'administration",
    ],
    response:
      "DST-System propose des programmes adaptés aux contraintes spécifiques. Solution mobile sans infrastructure lourde, suivi détaillé pour l'encadrement.",
  },
];


const Audiences = () => (
  <>
    <SEOHead
      title="Tous publics armés - Entraînement opérationnel | DST-System"
      description="DST-System pour tous les publics armés : armée, police, gendarmerie, douanes, administration pénitentiaire, sécurité privée, collectivités."
      keywords="tous publics armés, entraînement opérationnel, forces de sécurité"
    />
    <div className="min-h-screen bg-background">
      <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Publics Cibles
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Une méthode pour tous les
                <br />
                <span className="text-primary">publics armés</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System s'adresse à tous les publics armés : armée, police, gendarmerie,
                douanes, administration pénitentiaire, sécurité privée et collectivités.
                Une approche pédagogique professionnelle adaptée à chaque contexte.
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border-border border-primary/20 mb-4">
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


      {/* Decision makers */}
      <section className="py-20 bg-card border-t border-border-border">
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

              <div className="p-8 md:p-12 rounded-2xl bg-background border-border border-border-border">
                <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                  <strong className="text-foreground">
                    Commandants d'unités, élus locaux, responsables régionaux
                  </strong>{" "}
                  — vos agents ont besoin de s'entraîner régulièrement pour
                  maintenir un niveau opérationnel conforme aux exigences de
                  leur mission.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Le tir est une compétence périssable. Sans entraînement
                  régulier, les réflexes s'émoussent, la confiance diminue, et
                  la capacité de réponse graduée se dégrade. Or, les contraintes
                  logistiques, budgétaires et de temps limitent souvent l'accès
                  aux stands de tir traditionnels.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  <strong className="text-foreground">
                    DST-System apporte une solution concrète
                  </strong>{" "}
                  : une unité mobile qui se déplace dans vos locaux, un
                  programme annuel structuré avec suivi individualisé, et des
                  rapports d'avancement permettant de mesurer l'impact de
                  l'investissement. Le tout avec un coût maîtrisé et zéro
                  infrastructure à installer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-card border-border border-border-border">
                    <p className="text-2xl font-bold text-primary mb-1">0</p>
                    <p className="text-xs text-muted-foreground">
                      infrastructure requise
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card border-border border-border-border">
                    <p className="text-2xl font-bold text-primary mb-1">
                      100%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      solution mobile
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card border-border border-border-border">
                    <p className="text-2xl font-bold text-primary mb-1">ROI</p>
                    <p className="text-xs text-muted-foreground">
                      mesurable et documenté
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link to="/contact">
                      Demander une présentation{" "}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
    </div>
  </>
);

export default Audiences;
