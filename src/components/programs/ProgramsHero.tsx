import AnimatedSection from "@/components/AnimatedSection";

const ProgramsHero = () => (
  <section className="py-20 border-b border-border">
    <div className="container mx-auto px-4">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Programmes d'entraînement
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Entraînement opérationnel.
            <br />
            <span className="text-primary">Résultats durables.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Le tir est une compétence périssable. Les forces armées et de l'ordre
            manquent souvent de temps, de moyens logistiques et humains pour
            s'entraîner suffisamment. Nos programmes apportent la récurrence
            nécessaire au maintien des compétences opérationnelles — en venant
            directement chez vous.
          </p>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default ProgramsHero;
