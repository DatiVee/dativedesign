import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

export function SiteFooter() {
  const { locale, getStaticPath } = useLocale();

  const navigationLinks = [
    { href: getStaticPath("about"), label: locale === "en" ? "About" : "O nas" },
    { href: getStaticPath("services"), label: locale === "en" ? "Services" : "Usługi" },
    { href: getStaticPath("portfolio"), label: "Portfolio" },
    { href: getStaticPath("reviews"), label: locale === "en" ? "Reviews" : "Opinie" },
    { href: getStaticPath("faq"), label: "FAQ" },
    { href: getStaticPath("blog"), label: "Blog" },
    { href: getStaticPath("order"), label: locale === "en" ? "Order a project" : "Zamów projekt" },
  ];

  return (
    <footer className="border-t border-white/5 bg-card/40 py-14">
      <div className="container grid gap-10 md:grid-cols-[1.25fr_1.1fr_1fr]">
        <div>
          <img src="/logo.png" alt="DatiVe Design" className="mb-5 h-12 w-auto" />
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            {locale === "en"
              ? "DatiVe Design is a modern design studio combining premium portfolio presentation, online service sales and an organized delivery process."
              : "DatiVe Design to nowoczesne studio projektowe łączące premium portfolio, sprzedaż usług online i uporządkowany proces realizacji."}
          </p>
        </div>

        <div>
          <div className="section-label mb-4">{locale === "en" ? "Navigation" : "Nawigacja"}</div>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label mb-4">{locale === "en" ? "Contact" : "Kontakt"}</div>
          <div className="grid gap-3 text-sm text-white/70">
            <a href="mailto:kontakt@dativedesign.com" className="inline-flex items-center gap-2 hover:text-gold">
              <Mail size={16} />
              kontakt@dativedesign.com
            </a>
            <a href="tel:+48796106675" className="inline-flex items-center gap-2 hover:text-gold">
              <Phone size={16} />
              +48 796 106 675
            </a>
            <a
              href="https://instagram.com/dative_design"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Instagram size={16} />
              Instagram
            </a>
            <a
              href="https://facebook.com/DativeDesign"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Facebook size={16} />
              Facebook
            </a>
            <a
              href="https://www.linkedin.com/in/damian-wilk-456362271/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="container mt-10 border-t border-white/5 pt-6 text-xs tracking-wide text-white/55">
        © 2025-2026 DatiVe Design -{" "}
        {locale === "en"
          ? "Professional graphic design services for your business."
          : "Profesjonalne usługi graficzne dla Twojej firmy."}
      </div>
    </footer>
  );
}
