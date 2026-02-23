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
      title="Programmes d'entraînement opérationnel pour professionnels armés et collectivités | DST System"
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

        {/* Comparison Table */}
        <section className="py-20 border-t border-border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Comparaison des programmes</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Trois niveaux de progression adaptés à votre maturité opérationnelle
                </p>
              </div>
            </AnimatedSection>

            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border-border">
                    <th className="text-left py-4 px-4 font-bold text-foreground">Critères</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Maintien opérationnel</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Progression dynamique</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Tactique avancée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-border">
                    <td className="py-4 px-4 font-medium text-foreground">Objectif</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Consolidation de base</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Développement collectif</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Maîtrise avancée</td>
                  </tr>
                  <tr className="border-b border-border-border">
                    <td className="py-4 px-4 font-medium text-foreground">Intensité</td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">Modérée</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">Élevée</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">Maximale</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border-border">
                    <td className="py-4 px-4 font-medium text-foreground">Public type</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Tous les niveaux</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Opérateurs expérimentés</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Unités spécialisées</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-foreground">Progression pédagogique</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Fixation des acquis</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Perfectionnement</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Expertise tactique</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="py-4 px-4 font-medium text-foreground">Programme recommandé pour</td>
                    <td className="text-center py-4 px-4 text-sm text-muted-foreground">Collectivités<br/>Rotation large</td>
                    <td className="text-center py-4 px-4 text-sm text-muted-foreground">Services opérationnels</td>
                    <td className="text-center py-4 px-4 text-sm text-muted-foreground">Groupes spécialisés</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

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
