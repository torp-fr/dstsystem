import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Users, Zap, CheckCircle, ArrowRight } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const Methodology = () => (
  <>
    <SEOHead
      title="Méthodologie DST - Approche pédagogique d'entraînement opérationnel | DST-System"
      description="Découvrez la méthodologie DST : une approche pédagogique professionnelle issue du terrain, conçue pour tous publics armés. Flexible, adaptable, multi-opérateurs."
      keywords="méthodologie DST, entraînement opérationnel, approche pédagogique, pédagogie du terrain"
    />
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="py-20 border-b border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-primary text-sm font-medium tracking-wider uppercase">
                  Méthodologie
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                  L'approche DST
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Une méthodologie professionnelle d'entraînement opérationnel, fondée sur l'expérience du terrain
                  et conçue pour être déployée par une équipe d'opérateurs formés. Flexible, adaptable à tous les publics armés.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Principes fondateurs */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Principes fondateurs</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  La méthodologie DST repose sur trois principes clés
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Fondée sur le terrain",
                  description:
                    "Née de l'expérience opérationnelle réelle, l'approche DST comprend les enjeux concrets des forces de sécurité et collectivités. Pas de théorie vide : pédagogie ancrée dans la réalité.",
                },
                {
                  icon: Users,
                  title: "Professionnelle & Scalable",
                  description:
                    "Conçue pour être déployée par une équipe d'opérateurs formés. DST-System est une méthode, pas une personne. Scalable, elle s'adapte à tous les contextes institutionnels.",
                },
                {
                  icon: Zap,
                  title: "Adaptable & Flexible",
                  description:
                    "Chaque institution a des besoins uniques. DST s'adapte au calendrier opérationnel, aux effectifs variables et aux objectifs spécifiques de chaque unité.",
                },
              ].map((principle, i) => (
                <AnimatedSection key={principle.title} delay={i * 0.1}>
                  <div className="p-8 rounded-2xl bg-card border-border border-border-border hover:border-primary/30 transition-all h-full">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-border border-primary/20 mb-6">
                      <principle.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Piliers de la méthode */}
        <section className="py-20 bg-card border-t border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">3 piliers d'entraînement</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  La méthodologie DST s'articule autour de trois piliers opérationnels
                </p>
              </div>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto space-y-8">
              {[
                {
                  title: "Mobilité opérationnel",
                  points: [
                    "Déploiement direct dans vos locaux",
                    "Installation en moins de 1 heure",
                    "Aucune infrastructure lourde requise",
                    "Zéro munition réelle",
                  ],
                },
                {
                  title: "Pédagogie du terrain",
                  points: [
                    "Approche méthodique et progressive",
                    "Adaptation aux protocoles réels",
                    "Débriefing opérationnel après chaque session",
                    "Rapports détaillés pour le commandement",
                  ],
                },
                {
                  title: "Simulation immersive",
                  points: [
                    "Scénarios réalistes et variés",
                    "Gestion du stress et confiance",
                    "Travail en équipe et coordination",
                    "Progression mesurable et suivie",
                  ],
                },
              ].map((pillar, i) => (
                <AnimatedSection key={pillar.title} delay={i * 0.1}>
                  <div className="p-8 rounded-xl border-border border-border-border bg-background">
                    <h3 className="text-xl font-bold mb-6 text-primary">
                      {i + 1}. {pillar.title}
                    </h3>
                    <ul className="space-y-3">
                      {pillar.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Prêt à déployer la méthode DST ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Découvrez nos trois programmes d'entraînement opérationnel
                  ou demandez une étude de besoin personnalisée.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link to="/programmes">
                      Nos programmes <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10 text-primary"
                  >
                    <Link to="/contact">
                      Demande d'étude <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  </>
);

export default Methodology;
