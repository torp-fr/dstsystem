import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Building2, Zap, ArrowRight } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const resources = [
  {
    icon: BookOpen,
    title: "Maintien des compétences armées",
    description:
      "Guide complet sur les enjeux du maintien opérationnel des forces de sécurité. Comprendre la périssabilité des acquis et les solutions de formation régulière.",
    topics: [
      "Périssabilité des compétences",
      "Entraînement récurrent",
      "Mécanisation des gestes réflexes",
    ],
    href: "/ressources/maintien-competences",
  },
  {
    icon: Target,
    title: "Formation au tir professionnel",
    description:
      "Ressources sur la formation au tir pour professionnels : qualification, progression, simulation sans munitions réelles, évaluation.",
    topics: [
      "Progression mesurable",
      "Certification et suivi",
      "Simulation versus tir réel",
    ],
    href: "/ressources/formation-tir",
  },
  {
    icon: Building2,
    title: "Sécurité et collectivités locales",
    description:
      "Guide pour les élus et responsables de collectivités : comment entraîner vos agents à moindre coût, sans infrastructure lourde.",
    topics: [
      "Solutions mobiles",
      "Budgétisation",
      "Mutualisation entre communes",
    ],
    href: "/ressources/securite-collectivites",
  },
  {
    icon: Zap,
    title: "Simulation mobile : guide complet",
    description:
      "Comprendre la technologie de simulation laser, son déploiement, ses avantages et ses cas d'usage pour l'entraînement opérationnel.",
    topics: [
      "Technologie et fiabilité",
      "Déploiement rapide",
      "Adaptabilité pédagogique",
    ],
    href: "/ressources/simulation-mobile",
  },
];

const Resources = () => (
  <>
    <SEOHead
      title="Ressources — Guides entraînement opérationnel | DST-System"
      description="Centre de ressources : guides sur maintien compétences, formation tir professionnel, sécurité collectivités, simulation mobile. Pour forces de sécurité et institutionnels."
      keywords="ressources entraînement, guides formation, simulation opérationnel"
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
                  Ressources
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                  Centre de ressources opérationnelles
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Guides, articles et ressources éducatives pour comprendre
                  l'entraînement opérationnel, le maintien des compétences et
                  les solutions de formation mobile.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resources.map((resource, i) => (
                <AnimatedSection key={resource.title} delay={i * 0.1}>
                  <div className="h-full p-8 rounded-2xl bg-card border-border border-border-border hover:border-primary/30 transition-all group">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border-border border-primary/20 mb-6 group-hover:bg-primary/20 transition-colors">
                      <resource.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{resource.title}</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="mb-6">
                      <p className="text-xs uppercase font-semibold text-primary tracking-wider mb-3">
                        Thèmes couverts
                      </p>
                      <ul className="space-y-2">
                        {resource.topics.map((topic) => (
                          <li
                            key={topic}
                            className="text-sm text-muted-foreground"
                          >
                            • {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary/30 hover:bg-primary/10 text-primary"
                    >
                      <Link to={resource.href}>
                        Lire la ressource{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card border-t border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Besoin d'un programme adapté à vos besoins ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Contactez-nous pour discuter de vos objectifs opérationnels
                  et découvrir comment DST-System peut vous aider.
                </p>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link to="/contact">
                    Demande d'étude de besoin{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  </>
);

export default Resources;
