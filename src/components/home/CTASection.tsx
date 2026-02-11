import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const CTASection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5" />
          <div className="absolute inset-0 tactical-grid opacity-20" />
          <div className="relative p-12 md:p-20 text-center border-border border-primary/20 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à transformer votre entraînement ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
              Contactez-nous pour découvrir comment DST-System peut répondre aux
              besoins de votre unité.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6"
            >
              <Link to="/contact">
                Nous contacter <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default CTASection;
