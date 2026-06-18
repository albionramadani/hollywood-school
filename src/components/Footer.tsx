import { Facebook, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-footer-bg py-10" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <a href="/" className="flex items-center">
          <img src={logo} alt="Hollywood School" className="h-16 w-auto" />
        </a>

        <a href="https://maps.app.goo.gl/uBm8ArcMvRfB6zX58?g_st=iw" target="_blank" rel="noopener noreferrer" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors space-y-1">
          <p>Prishtinë</p>
          <p>Rr. Gjilani, nr.204</p>
        </a>

        <div className="font-body text-sm text-muted-foreground space-y-1">
          <a href="mailto:info@thehollywoodschool.com" className="block hover:text-gold transition-colors">info@hollywoodschool.com</a>
          <a href="tel:+38348734899" className="block hover:text-gold transition-colors">+383 48 734 899</a>
        </div>

        <div className="space-y-2">
          <p className="font-body text-sm text-foreground">Follow Us</p>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/hollywoodschool1" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/hollywoodschool/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
