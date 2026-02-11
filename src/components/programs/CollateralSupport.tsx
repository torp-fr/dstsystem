import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, HandHeart, Shield, ArrowRight } from "lucide-react";

const CollateralSupport = () => (
  <section className="py-20 bg-gradient-to-b from-primary/5 to-background border-y border-primary/20">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-border border-primary/20 mb-6">
            <HandHeart className="h-8 w-8 text-primary" />
          </div>
          <span className="block text-primary text-sm font-medium tracking-wider uppercase mb-3">
            Association partenaire
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Collatéral Support
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            L'association <strong className="text-foreground">Collatéral Support</strong> a été créée pour 
            permettre le financement — total ou partiel — de sessions d'entraînement au profit 
            des forces publiques armées, grâce aux dons, subventions et mécénat.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
        {[
          {
            icon: Heart,
            title: "Dons & mécénat",
            description:
              "Entreprises et particuliers peuvent contribuer à l'entraînement des forces publiques via des dons déductibles.",
          },
          {
            icon: Shield,
            title: "Subventions publiques",
            description:
              "Collatéral Support facilite l'accès aux financements institutionnels pour les collectivités à budget contraint.",
          },
          {
            icon: HandHeart,
            title: "Programmes financés",
            description:
              "Des sessions entièrement prises en charge peuvent être proposées aux unités qui en ont le plus besoin.",
          },
        ].map((item, i) => (
          <AnimatedSection key={item.title} delay={i * 0.1}>
            <div className="p-6 rounded-xl bg-card border-border border-border-border text-center h-full">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.3}>
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6"
          >
            <Link to="/contact">
              En savoir plus / Contribuer <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default CollateralSupport;
