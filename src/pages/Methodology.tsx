import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Users, Zap, CheckCircle, ArrowRight, Layers, TrendingUp } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const Methodology = () => (
  <>
    <SEOHead
      title="Méthodologie d'entraînement opérationnel mobile pour services armés | DST System"
      description="Découvrez la méthodologie DST : une approche pédagogique professionnelle issue du terrain, conçue pour professionnels armés et services opérationnels. Flexible, adaptable, multi-opérateurs."
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
                  La méthodologie d'entraînement opérationnel DST
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Une approche pédagogique professionnelle fondée sur l'expérience du terrain.
                  Conçue pour être déployée par une équipe d'opérateurs formés.
                  Flexible, déployable, adaptée à tous les services opérationnels.
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
                  title: "Professionnelle & Déployable",
                  description:
                    "Conçue pour être déployée par une équipe d'opérateurs formés. DST-System est une méthode, pas une personne. Déployable, elle s'adapte à tous les contextes institutionnels.",
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

        {/* Progression pédagogique */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Progression pédagogique</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  La méthodologie DST s'adapte à votre parcours d'entraînement, du maintien opérationnel à la tactique avancée.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: CheckCircle,
                  level: "Niveau 1",
                  title: "Maintien opérationnel",
                  description: "Consolidation des compétences de base et maintien du niveau tactique de l'unité.",
                },
                {
                  icon: TrendingUp,
                  level: "Niveau 2",
                  title: "Progression dynamique",
                  description: "Développement des capacités collectives et perfectionnement des réflexes sous stress.",
                },
                {
                  icon: Layers,
                  level: "Niveau 3",
                  title: "Tactique avancée",
                  description: "Maîtrise de scénarios complexes et prise de décision en environnement dégradé.",
                },
              ].map((program, i) => (
                <AnimatedSection key={program.title} delay={i * 0.1}>
                  <div className="p-8 rounded-2xl bg-card border-border border-border-border hover:border-primary/30 transition-all">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border-border border-primary/20 mb-4">
                      <program.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{program.level}</span>
                    <h3 className="text-lg font-bold mt-2 mb-3">{program.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.4}>
              <div className="mt-16 p-8 rounded-2xl bg-primary/5 border-border border-primary/20">
                <h3 className="text-lg font-bold mb-4">Adaptabilité multi-services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Déploiement flexible</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Adaptation aux protocoles spécifiques de chaque service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Progression pédagogique personnalisée par unité</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Scalabilité opérationnelle</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Déploiement mobile dans vos locaux</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Suivi mesurable et rapports de progression</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Pourquoi cette méthode */}
        <section className="py-20 bg-card border-t border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Pourquoi cette méthode d'entraînement</h2>
                <p className="text-muted-foreground mb-8">
                  Une approche conçue pour être déployée par plusieurs opérateurs formés.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Contraintes d'accès aux stands de tir</h3>
                        <p className="text-sm text-muted-foreground">Manque d'infrastructures dédiées et difficulté de planification pour les unités décentralisées.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Coût des munitions réelles</h3>
                        <p className="text-sm text-muted-foreground">Budget opérationnel limité pour l'entraînement régulier et les séances de qualification.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Besoin de continuité opérationnelle</h3>
                        <p className="text-sm text-muted-foreground">L'entraînement doit s'adapter aux calendriers opérationnels sans interrompre les missions.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-foreground">Mobilité des équipes opérationnelles</h3>
                        <p className="text-sm text-muted-foreground">Solutions déployables directement sur site, adaptées à la localisation des unités.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
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
