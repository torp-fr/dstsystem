import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import KeyFigures from "@/components/home/KeyFigures";
import SolutionsPreview from "@/components/home/SolutionsPreview";
import AudiencesPreview from "@/components/home/AudiencesPreview";
import CTASection from "@/components/home/CTASection";
import SEOHead from "@/components/common/SEOHead";

const Index = () => (
  <>
    <SEOHead
      title="Entraînement opérationnel mobile pour forces armées | DST-System"
      description="Méthode d'entraînement opérationnel mobile pour tous publics armés : armée, police, gendarmerie, douanes, administration pénitentiaire, sécurité privée, collectivités."
      keywords="entraînement opérationnel mobile, forces de sécurité, simulation sans munitions, tous publics armés"
    />
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <KeyFigures />
        <SolutionsPreview />
        <AudiencesPreview />
        <CTASection />
      </main>
    </div>
  </>
);

export default Index;
