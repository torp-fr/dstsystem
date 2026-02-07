import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Swords, Shield, Star, Eye, Lock, CheckCircle } from "lucide-react";

const audiences = [
  {
    icon: Swords,
    title: "Armée",
    description:
      "Entraînement tactique de haut niveau pour les forces armées, adapté aux conditions de combat modernes et aux exigences opérationnelles.",
    needs: [
      "Maintien de la capacité opérationnelle",
      "Entraînement en conditions réalistes",
      "Gestion de situations de combat complexes",
    ],
    response:
      "DST-System propose des simulations de combat adaptées aux scénarios d'engagement actuels, permettant un entraînement intensif sans logistique lourde.",
  },
  {
    icon: Shield,
    title: "Police nationale",
    description:
      "Solutions de formation au tir adaptées aux missions de maintien de l'ordre et d'intervention en milieu urbain.",
    needs: [
      "Tir de précision en milieu urbain",
      "Gestion du stress opérationnel",
      "Respect des règles d'engagement",
    ],
    response:
      "Nos scénarios reproduisent des interventions policières réalistes : contrôles, interpellations, situations de crise, avec un focus sur la proportionnalité de la réponse.",
  },
  {
    icon: Star,
    title: "Gendarmerie",
    description:
      "Programmes d'entraînement couvrant l'ensemble des missions de la gendarmerie, du maintien de l'ordre aux interventions spécialisées.",
    needs: [
      "Polyvalence des compétences de tir",
      "Adaptabilité aux différents contextes",
      "Formation continue des personnels",
    ],
    response:
      "Des programmes modulaires couvrant aussi bien le tir défensif que les situations d'intervention, adaptés aux protocoles de la gendarmerie.",
  },
  {
    icon: Eye,
    title: "Forces spéciales",
    description:
      "Entraînement de pointe pour les unités d'élite nécessitant des compétences de tir exceptionnelles et une réactivité maximale.",
    needs: [
      "Réflexes et précision extrêmes",
      "Coordination d'équipe en intervention",
      "Adaptation rapide aux menaces",
    ],
    response:
      "Des scénarios haute intensité conçus en collaboration avec des experts opérationnels, reproduisant les conditions les plus exigeantes.",
  },
  {
    icon: Lock,
    title: "Sécurité privée",
    description:
      "Formation au tir pour les agents de sécurité privée, conforme aux réglementations et aux standards professionnels.",
    needs: [
      "Conformité réglementaire",
      "Qualification et requalification",
      "Gestion de situations critiques",
    ],
    response:
      "Des programmes de formation et de certification adaptés au cadre légal de la sécurité privée, avec suivi individualisé.",
  },
];

const Audiences = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Publics Cibles
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                Des solutions pour chaque corps
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DST-System s'adapte aux besoins spécifiques de chaque corps de
                sécurité et de défense avec des programmes dédiés.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {audiences.map((aud, i) => (
        <section
          key={aud.title}
          className={`py-16 ${i % 2 === 1 ? "bg-card" : ""}`}
        >
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                    <aud.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{aud.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {aud.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">
                    Besoins identifiés
                  </h3>
                  <ul className="space-y-3">
                    {aud.needs.map((need) => (
                      <li
                        key={need}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">
                    Notre réponse
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {aud.response}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      ))}
    </main>
    <Footer />
  </div>
);

export default Audiences;
