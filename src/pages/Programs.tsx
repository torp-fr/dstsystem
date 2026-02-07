import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { GraduationCap, Target, Award, Clock, Users, CheckCircle } from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    title: "Programme Initiation",
    duration: "2 à 3 jours",
    audience: "Tous niveaux",
    description:
      "Formation de base au tir laser pour les personnels découvrant le simulateur. Ce programme couvre les fondamentaux du tir, la prise en main du système et les premiers exercices de précision.",
    objectives: [
      "Maîtrise du simulateur de tir laser",
      "Fondamentaux de la position de tir",
      "Exercices de précision statique",
      "Introduction aux cibles dynamiques",
      "Évaluation initiale des compétences",
    ],
  },
  {
    icon: Target,
    title: "Programme Perfectionnement",
    duration: "5 jours",
    audience: "Niveau intermédiaire",
    description:
      "Programme avancé destiné aux tireurs souhaitant améliorer leurs performances. Inclut des scénarios complexes, du tir en mouvement et des mises en situation sous stress.",
    objectives: [
      "Tir en mouvement et positions dynamiques",
      "Scénarios tactiques complexes",
      "Gestion du stress en situation de tir",
      "Tir de précision à différentes distances",
      "Analyse avancée de la performance",
    ],
  },
  {
    icon: Award,
    title: "Formation Continue",
    duration: "Sur mesure",
    audience: "Unités opérationnelles",
    description:
      "Programme d'entraînement continu conçu pour maintenir et développer les compétences des unités opérationnelles. Adapté aux protocoles et exigences spécifiques de chaque corps.",
    objectives: [
      "Maintien des compétences opérationnelles",
      "Scénarios personnalisés selon le corps",
      "Évaluations régulières et suivi de progression",
      "Exercices collectifs et coordination d'équipe",
      "Adaptation continue aux nouvelles menaces",
    ],
  },
];

const Programs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Programmes
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Programmes d'entraînement
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Des programmes structurés et progressifs, adaptés à chaque
                niveau de compétence et aux besoins spécifiques de chaque unité.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programs.map((prog, i) => (
              <AnimatedSection key={prog.title} delay={i * 0.15}>
                <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                    <prog.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{prog.title}</h2>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> {prog.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      <Users className="h-3 w-3" /> {prog.audience}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {prog.description}
                  </p>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">
                    Objectifs
                  </h4>
                  <ul className="space-y-2">
                    {prog.objectives.map((obj) => (
                      <li
                        key={obj}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Adaptability */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Programmes sur mesure</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Chaque unité est unique. C'est pourquoi nos programmes peuvent
                être entièrement personnalisés pour répondre à vos protocoles,
                vos objectifs opérationnels et les spécificités de votre
                environnement d'intervention.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Programs;
