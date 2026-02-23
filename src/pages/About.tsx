import Navbar from "@/components/Navbar";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Target,
  Shield,
  Zap,
  Users,
  Award,
  Heart,
  Truck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import missionImg from "@/assets/about-mission.jpg";
import mobileImg from "@/assets/about-mobile.jpg";
import SEOHead from "@/components/common/SEOHead";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description:
      "Nous visons l'excellence dans chaque aspect de nos solutions d'entraînement, de la technologie au suivi pédagogique.",
  },
  {
    icon: Shield,
    title: "Sécurité",
    description:
      "Zéro compromis sur la sécurité — notre technologie laser élimine tout risque balistique tout en maintenant un réalisme maximal.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Nous innovons constamment pour offrir des scénarios toujours plus réalistes et des analyses de performance toujours plus précises.",
  },
  {
    icon: Users,
    title: "Adaptabilité",
    description:
      "Chaque client est unique. Nous construisons des programmes sur mesure adaptés à vos besoins, vos protocoles et vos contraintes.",
  },
  {
    icon: Award,
    title: "Expertise",
    description:
      "Une expertise opérationnelle au service de la formation — nous comprenons les enjeux du terrain.",
  },
  {
    icon: Heart,
    title: "Engagement",
    description:
      "Un engagement total envers la montée en compétences de ceux qui assurent notre sécurité au quotidien.",
  },
];

const About = () => (
  <>
    <SEOHead
      title="À propos - Ancien militaire, formateur CNEC | DST-System"
      description="DST-System est fondé par un ancien militaire formateur au Centre National d'Entraînement Commando (CNEC). Expertise du terrain au service des forces de sécurité."
      keywords="formateur CNEC, ancien militaire, expertise entraînement opérationnel"
    />
    <div className="min-h-screen bg-background">
      <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Expertise du terrain
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Ancien militaire, formateur au CNEC
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System est fondé par un ancien militaire et formateur au
                Centre National d'Entraînement Commando (CNEC). L'expertise du
                terrain infuse chaque programme et méthode pédagogique.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <h2 className="text-3xl font-bold mb-6">Parcours terrain</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ancien militaire, le fondateur de DST-System connaît les réalités
                  opérationnelles des forces de sécurité. La compétence au tir est
                  périssable — sans entraînement régulier, les acquis se dégradent,
                  les réflexes s'émoussent. Les institutions manquent souvent de
                  moyens logistiques et de temps pour organiser des séances régulières.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  C'est cette expertise de terrain qui a inspiré DST-System. Une
                  solution mobile d'entraînement opérationnel adaptée aux contraintes
                  réelles des unités. Nous nous déplaçons directement chez nos clients —
                  il suffit d'une salle. Programmes structurés. Suivi individualisé.
                  Rapports pertinents pour le commandement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Objectif :</strong> conserver les compétences armées,
                  mécaniser les gestes réflexes, améliorer la graduation de la réponse,
                  et renforcer la confiance opérationnelle des agents.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="aspect-square rounded-2xl overflow-hidden border-border border-border-border">
                <img
                  src={missionImg}
                  alt="Centre de commandement DST-System"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mobile solution */}
      <section className="py-20 bg-card border-y border-border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-border border-border-border lg:order-1">
                <img
                  src={mobileImg}
                  alt="Solution mobile DST-System"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border-border border-primary/20 mb-6">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-6">
                  Une solution 100% mobile
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Contrairement aux stands de tir traditionnels qui nécessitent
                  des déplacements et une logistique importante, DST-System
                  vient à vous. Notre équipe se déplace avec tout le matériel
                  nécessaire et s'installe dans vos locaux en moins d'une heure.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Seule une salle est nécessaire — aucune infrastructure lourde,
                  aucune munition réelle, aucun risque. C'est la solution idéale
                  pour les collectivités et unités qui manquent d'accès aux
                  infrastructures de tir.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background border-border border-border-border text-center">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Jusqu'à 20 tireurs/jour</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border-border border-border-border text-center">
                    <Truck className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Installation en 1h</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nos valeurs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Les valeurs qui guident chaque décision et chaque innovation
                chez DST-System.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <AnimatedSection key={val.title} delay={i * 0.1}>
                <div className="p-6 rounded-xl bg-card border-border border-border-border hover:border-primary/30 transition-all">
                  <val.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {val.description}
                  </p>
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
                Prêt à découvrir DST-System ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Contactez-nous pour une présentation complète de notre solution
                et discutons de vos besoins opérationnels.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to="/contact">
                  Nous contacter <ArrowRight className="ml-2 h-5 w-5" />
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

export default About;
