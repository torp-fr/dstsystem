import Navbar from "@/components/Navbar";
import ProgramsHero from "@/components/programs/ProgramsHero";
import ProgramCards from "@/components/programs/ProgramCards";
import CapacityInfo from "@/components/programs/CapacityInfo";
import DecisionMakers from "@/components/programs/DecisionMakers";
import ServiceOffers from "@/components/programs/ServiceOffers";
import CollateralSupport from "@/components/programs/CollateralSupport";
import MutualisationCTA from "@/components/programs/MutualisationCTA";

const Programs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <ProgramsHero />
      <ProgramCards />
      <CapacityInfo />
      <DecisionMakers />
      <ServiceOffers />
      <CollateralSupport />
      <MutualisationCTA />
    </main>
  </div>
);

export default Programs;
