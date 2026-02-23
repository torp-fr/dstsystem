import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import ProgramsHero from "@/components/programs/ProgramsHero";
import ProgramCards from "@/components/programs/ProgramCards";
import CapacityInfo from "@/components/programs/CapacityInfo";
import DecisionMakers from "@/components/programs/DecisionMakers";
import FlexibilitySection from "@/components/programs/FlexibilitySection";
import CollateralSupport from "@/components/programs/CollateralSupport";
import MutualisationCTA from "@/components/programs/MutualisationCTA";
import ProgramFAQ from "@/components/programs/ProgramFAQ";
import SEOHead from "@/components/common/SEOHead";

const Programs = () => (
  <>
    <SEOHead
      title="Programmes d'entraînement opérationnel | DST-System"
      description="Trois programmes structurés : Maintien opérationnel, Progression dynamique, Tactique avancée. Pour forces de sécurité, armée et collectivités."
      keywords="programmes entraînement, maintien opérationnel, progression dynamique, tactique"
    />
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <ProgramsHero />
        <ProgramCards />
        <CapacityInfo />
        <DecisionMakers />
        <FlexibilitySection />
        <ProgramFAQ />

        {/* Link to Methodology */}
        <section className="py-12 border-t border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Intéressé par notre approche pédagogique ?{" "}
                  <Link to="/methodologie" className="text-primary hover:underline font-medium">
                    Notre approche pédagogique expliquée →
                  </Link>
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <CollateralSupport />
        <MutualisationCTA />
      </main>
    </div>
  </>
);

export default Programs;
