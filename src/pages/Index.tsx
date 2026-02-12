import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import KeyFigures from "@/components/home/KeyFigures";
import SolutionsPreview from "@/components/home/SolutionsPreview";
import AudiencesPreview from "@/components/home/AudiencesPreview";
import CTASection from "@/components/home/CTASection";

const Index = () => (
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
);

export default Index;
