import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Truck, Users, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/common/SEOHead";
import mobileImg from "@/assets/solutions-simulator.jpg";
import pedagogyImg from "@/assets/solutions-stand.jpg";
import immersionImg from "@/assets/solutions-situation.jpg";

const methodPillars = [
  {
    icon: Truck,
    title: "Mobilité opérationnelle",
    image: mobileImg,
    description:
      "DST-System se déplace directement dans vos locaux. Il suffit d'une salle pour organiser une séance d'entraînement complète. Zéro infrastructure lourde, zéro munition réelle. La solution s'adapte à votre calendrier opérationnel.",
    benefits: [
      "Installation en moins d'une heure",
      "Aucune infrastructure requise",
      "Compatible avec vos espaces existants",
      "Déplacement directement chez vous",
      "Zéro munition réelle — sécurité maximale",
      "Récurrence adaptée à vos contraintes",
    ],
  },
  {
    icon: Users,
    title: "Pédagogie issue du terrain",
    image: pedagogyImg,
    description:
      "Ancien militaire et formateur au CNEC, l'expertise du fondateur infuse chaque programme. Les méthodes d'entraînement reflètent les réalités opérationnelles, les exigences du commandement et les enjeux concrets des forces de sécurité.",
    benefits: [
      "Conçu par un ancien militaire formateur",
      "Adaptation aux protocoles opérationnels réels",
      "Compréhension profonde des besoins terrain",
      "Progression adaptée aux niveaux individuels",
      "Débriefing opérationnel après chaque session",
      "Rapports pertinents pour le commandement",
    ],
  },
  {
    icon: Zap,
    title: "Simulation immersive",
    image: immersionImg,
    description:
      "Scénarios réalistes : CQB, effraction froide, interpellations, situations de crise. Chaque séance développe les réflexes, la mécanisation des gestes critiques et la capacité de prise de décision sous stress.",
    benefits: [
      "Scénarios tactiques immersifs et variés",
      "Graduations de réponse adaptées aux menaces",
      "Travail en équipe et coordination",
      "Gestion du stress et confiance en soi",
      "Adaptation complète à vos exigences tactiques",
      "Sessions mesurables avec suivi de progression",
    ],
  },
];

const Solutions = () => (
  <>
    <SEOHead
      title="Méthode DST - Entraînement opérationnel | DST-System"
      description="La méthode DST repose sur trois piliers : mobilité opérationnel, pédagogie du terrain, simulation immersive. Pour forces de sécurité et collectivités."
      keywords="méthode entraînement, simulation opérationnelle, forces de sécurité"
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
                La méthode DST
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Trois piliers d'entraînement opérationnel
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System repose sur une approche pédagogique fondée sur le terrain,
                déployée de manière mobile et conçue pour l'immersion tactique. Une
                méthode complète au service des forces de sécurité et collectivités.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Méthode piliers */}
      {methodPillars.map((pillar, i) => (
        <section
          key={pillar.title}
          className={`py-20 ${i % 2 === 1 ? "bg-card" : ""}`}
        >
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border-border border-primary/20 mb-6">
                    <pillar.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{pillar.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {pillar.description}
                  </p>
                  <ul className="space-y-3">
                    {pillar.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-border border-border-border">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
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

      {/* CTA */}
      <section className="py-20 border-t border-border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Découvrir nos trois programmes
              </h2>
              <p className="text-muted-foreground mb-8">
                Chaque programme est structuré autour de ces trois piliers.
                Explorez le maintien opérationnel, la progression dynamique et
                la tactique avancée.
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/programmes">
                  Nos trois programmes <ArrowRight className="ml-2 h-4 w-4" />
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

export default Solutions;
