import { CheckCircle, Mail, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const copy =
    locale === "en"
      ? {
          eyebrow: "Contact",
          title: "Get in touch",
          description:
            "Have an idea, a brief or want to buy a design service right away? Send a message and we will help you choose the right direction, package and next steps.",
          validation: "Fill in all fields.",
          success: "Message sent.",
          error: "The message could not be sent.",
          sentTitle: "Message sent",
          sentDescription: "We will get back to you as soon as possible.",
          nameLabel: "Full name",
          namePlaceholder: "John Smith",
          emailLabel: "Email address",
          emailPlaceholder: "john@company.com",
          messageLabel: "Message",
          messagePlaceholder: "Tell us what you need and what deadline you have.",
          submit: "Send message",
          submitting: "Sending...",
        }
      : {
          eyebrow: "Kontakt",
          title: "Napisz do nas",
          description:
            "Masz pomysł, brief albo chcesz od razu kupić usługę? Napisz. Pomożemy dobrać kierunek, pakiet i kolejne kroki.",
          validation: "Uzupełnij wszystkie pola.",
          success: "Wiadomość wysłana.",
          error: "Nie udało się wysłać wiadomości.",
          sentTitle: "Wiadomość wysłana",
          sentDescription: "Odezwiemy się najszybciej, jak się da.",
          nameLabel: "Imię i nazwisko",
          namePlaceholder: "Jan Kowalski",
          emailLabel: "Adres e-mail",
          emailPlaceholder: "jan@firma.pl",
          messageLabel: "Wiadomość",
          messagePlaceholder: "Napisz, czego potrzebujesz i jaki masz termin.",
          submit: "Wyślij wiadomość",
          submitting: "Wysyłanie...",
        };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(copy.validation);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "447b562f-6ef2-4c83-bf42-36a6655fa08f",
          subject: "DatiVe Design contact form",
          from_name: "DatiVe Design",
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error("send failed");
      }

      setSent(true);
      setFormData({ name: "", email: "", message: "" });
      toast.success(copy.success);
    } catch {
      toast.error(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="py-24">
      <div className="container grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <div className="mt-8 grid gap-4 text-sm text-white/70">
            <a href="mailto:kontakt@dativedesign.com" className="inline-flex items-center gap-3 hover:text-gold">
              <Mail size={18} className="text-gold" />
              kontakt@dativedesign.com
            </a>
            <a href="tel:+48796106675" className="inline-flex items-center gap-3 hover:text-gold">
              <Phone size={18} className="text-gold" />
              +48 796 106 675
            </a>
          </div>
        </div>

        <div className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle size={44} className="mx-auto mb-4 text-gold" />
              <h3 className="font-display text-2xl font-bold text-white">{copy.sentTitle}</h3>
              <p className="mt-3 text-sm text-white/60">{copy.sentDescription}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">
                  {copy.nameLabel}
                </label>
                <input
                  id="contact-name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="h-12 w-full rounded-sm border border-white/10 bg-background px-4 text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold/40"
                  placeholder={copy.namePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">
                  {copy.emailLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="h-12 w-full rounded-sm border border-white/10 bg-background px-4 text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold/40"
                  placeholder={copy.emailPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/35">
                  {copy.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  className="min-h-36 w-full rounded-sm border border-white/10 bg-background px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold/40"
                  placeholder={copy.messagePlaceholder}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="gold-button-shimmer inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm text-sm font-black uppercase tracking-wider text-background disabled:opacity-70"
              >
                <Send size={16} />
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
