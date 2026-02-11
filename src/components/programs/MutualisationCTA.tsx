import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MutualisationCTA = () => (
  <section className="py-20 bg-card border-y border-border-border">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Mutualisation entre entités
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Vous êtes une collectivité de 3, 4 ou 5 agents ? Mutualisez vos
            sessions avec d'autres entités pour compléter un programme et
            optimiser les coûts. Notre solution étant commune à plusieurs types
            de publics, nous organisons des rotations et des groupes adaptés.
          </p>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link to="/contact">
              Organiser une mutualisation{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default MutualisationCTA;
