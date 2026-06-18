import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center py-5" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
      <a href="/" className="flex items-center flex-shrink-0">
        <img src={logo} alt="Hollywood School" className="h-24 w-auto" />
      </a>

      <div className="hidden lg:flex items-center justify-center flex-1 gap-x-8 xl:gap-x-12">
        <a href="/#about" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">About</a>
        <a href="/classes" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">Classes</a>
        <a href="/media" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">Media</a>
        <a href="/testimonials" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">Testimonials</a>
        <a href="/#services" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">Services</a>
        <a href="/contact" className="font-body text-lg xl:text-xl text-foreground hover:text-gold transition-colors">Contact</a>
      </div>

       <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
        <button
          className="text-foreground hover:text-gold transition-colors lg:hidden"
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md flex flex-col items-center gap-6 py-8 lg:hidden">
          <a href="/#about" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">About</a>
          <a href="/classes" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">Classes</a>
          <a href="/media" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">Media</a>
          <a href="/testimonials" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">Testimonials</a>
          <a href="/#services" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">Services</a>
          <a href="/contact" onClick={() => setMobileOpen(false)} className="font-body text-xl text-foreground hover:text-gold transition-colors">Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
