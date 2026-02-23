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
      title="Entraînement opérationnel mobile | DST-System"
      description="DST-System propose des programmes d'entraînement opérationnel pour forces de sécurité et collectivités. Solution mobile de simulation sans tir réel. Expertise formateur CNEC."
      keywords="entraînement opérationnel, maintien compétences, forces de sécurité, simulation laser"
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
