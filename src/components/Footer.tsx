import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo_dst.png";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Logo & description */}
        <div className="lg:col-span-1">
          <img src={logo} alt="DST-System" className="h-12 w-auto mb-4" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Drill & Skills Training — Solutions d'entraînement au tir par
            simulateur laser pour les forces de l'ordre et les corps
            institutionnels.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-foreground font-semibold mb-4 uppercase text-sm tracking-wider">
            Navigation
          </h4>
          <div className="flex flex-col gap-3">
            <Link to="/solutions" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Nos Solutions
            </Link>
            <Link to="/programmes" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Programmes
            </Link>
            <Link to="/publics-cibles" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Publics Cibles
            </Link>
            <Link to="/a-propos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              À propos
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-foreground font-semibold mb-4 uppercase text-sm tracking-wider">
            Contact
          </h4>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:DST-System@hotmail.com"
              className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
            >
              <Mail className="h-4 w-4" /> DST-System@hotmail.com
            </a>
            <a
              href="tel:+33665445226"
              className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
            >
              <Phone className="h-4 w-4" /> +33 6 65 44 52 26
            </a>
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" /> France
            </span>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-foreground font-semibold mb-4 uppercase text-sm tracking-wider">
            Légal
          </h4>
          <div className="flex flex-col gap-3">
            <span className="text-muted-foreground text-sm">Mentions légales</span>
            <span className="text-muted-foreground text-sm">Politique de confidentialité</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} DST-System. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
