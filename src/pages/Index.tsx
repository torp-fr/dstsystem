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
      title="Entraînement tir professionnel mobile pour forces de sécurité et collectivités | DST System"
      description="Méthode d'entraînement opérationnel mobile pour professionnels armés : armée, police, gendarmerie, douanes, administration pénitentiaire, sécurité privée, collectivités."
      keywords="entraînement opérationnel mobile, professionnels armés, services opérationnels"
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
