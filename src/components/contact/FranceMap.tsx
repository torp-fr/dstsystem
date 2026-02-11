import partnershipImg from "@/assets/contact-partnership.jpg";

const ContactVisual = () => (
  <div className="rounded-2xl bg-card border-border border-border-border overflow-hidden relative">
    <img
      src={partnershipImg}
      alt="Partenariat opérationnel DST-System"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <p className="text-foreground font-semibold text-lg">
        Engagez-vous avec DST-System
      </p>
      <p className="text-muted-foreground text-sm mt-1">
        Un partenariat opérationnel pour le maintien des compétences de vos équipes.
      </p>
    </div>
  </div>
);

export default ContactVisual;
