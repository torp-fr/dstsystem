import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo_dst.png";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
    {/* Tactical grid */}
    <div className="absolute inset-0 tactical-grid opacity-20" />

    <div className="container mx-auto px-4 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Logo prominent — abaissé pour ne pas se confondre avec le header */}
        <div className="mt-16 md:mt-20 lg:mt-24">
          <motion.img
            src={logo}
            alt="DST-System — Drill & Skills Training"
            className="w-52 md:w-72 lg:w-96 mb-10 drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Entraînez vos forces.
          <br />
          <span className="text-primary">Partout. Sans contrainte.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          DST-System déploie un simulateur de tir laser directement dans vos
          locaux — entraînement au tir opérationnel, zéro munition, zéro
          infrastructure lourde. Maintenez les compétences avec
          une solution mobile et immédiate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6"
          >
            <Link to="/solutions">
              Découvrir nos solutions <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-foreground/20 hover:bg-foreground/10 text-base px-8 py-6"
          >
            <Link to="/contact">Nous contacter</Link>
          </Button>
        </div>
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <ChevronDown className="h-6 w-6 text-muted-foreground" />
    </motion.div>
  </section>
);

export default HeroSection;
