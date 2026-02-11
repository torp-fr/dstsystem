import AnimatedSection from "@/components/AnimatedSection";
import { Users, Calendar, Repeat } from "lucide-react";

const CapacityInfo = () => (
  <section className="py-16 bg-card border-y border-border-border">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-border border-primary/20 mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-primary mb-2">20+</h3>
            <p className="text-muted-foreground text-sm">
              tireurs par jour et par simulateur
              <br />
              <span className="text-xs">(capacité extensible selon vos besoins)</span>
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-border border-primary/20 mb-4">
              <Calendar className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-primary mb-2">Annuel</h3>
            <p className="text-muted-foreground text-sm">
              programme récurrent
              <br />pour un suivi optimal
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border-border border-primary/20 mb-4">
              <Repeat className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-primary mb-2">∞</h3>
            <p className="text-muted-foreground text-sm">
              configurations possibles
              <br />modules combinables à volonté
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default CapacityInfo;
