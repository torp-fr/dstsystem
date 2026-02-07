import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Target, Shield, Zap, Users, Award, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque aspect de nos solutions d'entraînement.",
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "La sécurité est au cœur de notre approche — zéro compromis.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Nous innovons constamment pour offrir les technologies les plus avancées.",
  },
  {
    icon: Users,
    title: "Adaptabilité",
    description: "Nos solutions s'adaptent aux besoins uniques de chaque client.",
  },
  {
    icon: Award,
    title: "Expertise",
    description: "Une expertise opérationnelle reconnue par les professionnels du secteur.",
  },
  {
    icon: Heart,
    title: "Engagement",
    description:
      "Un engagement total envers la formation et la préparation de ceux qui nous protègent.",
  },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                À propos
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                DST-System
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Drill & Skills Training
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
                <h2 className="text-3xl font-bold mb-6">Notre mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  DST-System est né d'une conviction simple : l'entraînement au
                  tir doit être accessible, sûr et efficace. Notre mission est
                  de fournir aux forces de sécurité et de défense les outils les
                  plus performants pour développer et maintenir leurs compétences
                  de tir.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Grâce à notre technologie de simulation laser, nous rendons
                  possible un entraînement réaliste et intensif sans les
                  contraintes logistiques et sécuritaires liées à l'utilisation
                  de munitions réelles.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Chaque solution que nous développons est pensée pour répondre
                  aux exigences opérationnelles les plus élevées, tout en
                  offrant une flexibilité totale dans la mise en œuvre.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center">
                <Target className="h-32 w-32 text-primary/20" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card border-y border-border">
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
                <div className="p-6 rounded-xl bg-background border border-border">
                  <val.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {val.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
