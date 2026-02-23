import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Le simulateur remplace-t-il le tir réel ?",
    answer:
      "Non. DST-System est une solution complémentaire au tir réel. La simulation laser ne remplace pas les munitions réelles, mais enrichit le programme d'entraînement : accessibilité accrue, récurrence facilitée, coûts réduits. Elle permet une montée en compétences progressive avant ou entre les sessions de tir réel.",
  },
  {
    question: "Combien d'agents peuvent participer par journée ?",
    answer:
      "Jusqu'à 20 participants par jour selon la configuration choisie. Les séances sont structurées en sessions matin et après-midi pour optimiser le passage des agents. Avec mutualisation entre plusieurs entités, les capacités augmentent significativement.",
  },
  {
    question: "Un programme annuel est-il possible ?",
    answer:
      "Oui, c'est notre offre phare. Le programme annuel comprend plusieurs journées réparties dans l'année, avec suivi individualisé et progression mesurable. Calendrier flexible pour s'adapter à vos contraintes opérationnelles.",
  },
  {
    question: "Quel niveau de compétences faut-il pour commencer ?",
    answer:
      "Tous niveaux. DST-System s'adapte du personnel novice au plus expérimenté. Les programmes Maintien et Progression structurent l'apprentissage progressif, tandis que Tactique avancée cible les unités opérationnelles confirmées.",
  },
  {
    question: "Les formations sont-elles certifiées ou qualifiantes ?",
    answer:
      "DST-System fourni rapports détaillés et suivi individualisé documenté. Ces éléments supportent vos processus de qualification interne. Contactez-nous pour harmoniser avec vos processus de certification spécifiques.",
  },
  {
    question: "Comment se déploie la solution sur site ?",
    answer:
      "Installation rapide : moins d'une heure dans une salle vide. Besoin minimal : 50m² environ. Aucune infrastructure lourde ni munition réelle. Notre équipe s'occupe de tout — installation, animation, débriefing, rangement.",
  },
];

const ProgramFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 border-t border-border-border">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">
              Questions fréquentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              FAQ — Entraînement opérationnel
            </h2>
            <p className="text-muted-foreground">
              Réponses aux questions courantes sur les programmes DST-System.
            </p>
          </div>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <AnimatedSection key={faq.question} delay={index * 0.05}>
              <div className="border-border border-border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-all">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-left">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-primary transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-background/50 border-t border-border-border">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramFAQ;
