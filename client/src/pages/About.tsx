import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getCompanyStats } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function About() {
  const { locale, getStaticPath } = useLocale();
  const companyStats = getCompanyStats(locale);

  usePageMeta(
    locale === "en" ? "About | DatiVe Design" : "O nas | DatiVe Design",
    locale === "en" ? "Meet DatiVe Design, learn about the process, the design approach and why clients choose direct collaboration without middlemen."
      : "Poznaj DatiVe Design, proces pracy, podejście do projektów i powody, dla których klienci wybierają bezpośrednią współpracę bez pośredników.",
    { locale, path: getStaticPath("about") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={locale === "en" ? "About" : "O nas"}
            title={locale === "en" ? "Graphic design built for real business use" : "Projektowanie graficzne tworzone pod realny biznes"}
            description={
              locale === "en" ? "DatiVe Design combines premium aesthetics with practical thinking. The goal is not only to make things look good, but to give the brand materials that sell, build trust and stay consistent everywhere."
                : "DatiVe Design łączy premium estetykę z praktycznym podejściem. Tu nie chodzi tylko o to, żeby projekt dobrze wyglądał, ale żeby wspierał sprzedaż, budował zaufanie i trzymał spójność marki."
            }
          />
        </Reveal>
      </section>

      <section className="container grid gap-12 py-10 lg:grid-cols-2">
        <Reveal as="div" className="rounded-sm border border-white/5 bg-card p-8 gold-border-hover">
          <h2 className="font-display text-3xl font-black text-white">
            {locale === "en" ? "Who we are" : "Kim jesteśmy"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {locale === "en" ? "DatiVe Design is a graphic design studio working with brands that want to look stronger, more modern and more professional in front of their clients. The focus is on logo design, branding, print and promotional graphics."
              : "DatiVe Design to studio graficzne dla marek, które chcą wyglądać mocniej, nowocześniej i bardziej profesjonalnie w oczach swoich klientów. Główny nacisk idzie na logo, branding, druk i grafiki reklamowe."}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {locale === "en" ? "Every project is handled directly, with a structured process and a clear scope. No random agency-style relay, no unnecessary layers, just focused collaboration and a result that makes sense in practice."
              : "Każdy projekt prowadzony jest bezpośrednio, w uporządkowanym procesie i z jasnym zakresem. Bez agencyjnego chaosu, bez zbędnych warstw po drodze, tylko konkretna współpraca i projekt, który działa w praktyce."}
          </p>
        </Reveal>
        <Reveal as="div" delay={100} className="rounded-sm border border-white/5 bg-card p-8 gold-border-hover">
          <h2 className="font-display text-3xl font-black text-white">
            {locale === "en" ? "Why work with us" : "Dlaczego warto z nami współpracować"}
          </h2>
          <div className="mt-6 grid gap-4">
            {(locale === "en" ? [
                  "direct contact with the designer",
                  "clear package structure and transparent scope",
                  "design decisions matched to brand goals, not random taste",
                  "portfolio based on real commercial use cases",
                ]
              : [
                  "kontakt bez pośredników",
                  "jasna struktura pakietów i przejrzysty zakres",
                  "decyzje projektowe dopasowane do celu marki, a nie przypadku",
                  "portfolio oparte o realne zastosowania komercyjne",
                ]).map((item) => (
              <div key={item} className="inline-flex items-center gap-3 text-sm text-white/65">
                <Check size={16} className="text-gold" />
                {item}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container py-16">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "en" ? "Process" : "Proces realizacji"}
            title={locale === "en" ? "How collaboration works" : "Jak wygląda współpraca"}
          />
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {(locale === "en" ? [
                ["01", "Brief and goal", "We define the service, the scope, the deadline and what the project should achieve."],
                ["02", "Direction", "We build a visual concept matched to the brand, audience and practical use."],
                ["03", "Refinement", "The work is polished within the package, based on feedback that actually moves the project forward."],
                ["04", "Delivery", "The client receives final files ready for use in print, online or further rollout."],
              ]
            : [
                ["01", "Brief i cel", "Ustalamy usługę, zakres, termin i to, co projekt ma osiągnąć."],
                ["02", "Kierunek", "Budujemy koncepcję wizualną dopasowaną do marki, odbiorcy i realnego zastosowania."],
                ["03", "Dopracowanie", "Projekt jest szlifowany w ramach pakietu, ale na bazie uwag, które faktycznie go rozwijają."],
                ["04", "Przekazanie", "Na końcu klient dostaje gotowe pliki przygotowane do użycia w druku, online albo dalszym wdrożeniu."],
              ]).map(([step, title, text], index) => (
            <Reveal key={step} delay={(index % 4) * 80} as="article" className="rounded-sm border border-white/5 bg-card p-6 gold-border-hover">
              <div className="font-display text-sm font-black tracking-widest text-gold">{step}</div>
              <h3 className="mt-3 font-display text-2xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "en" ? "Numbers" : "Liczby"}
            title={locale === "en" ? "Data that builds trust" : "Dane, które budują zaufanie"}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {companyStats.map((stat, index) => (
            <Reveal key={stat.label} delay={(index % 4) * 80} as="div" className="rounded-sm border border-white/5 bg-card p-6">
              <div className="font-display text-4xl font-black text-gold">{stat.value}</div>
              <div className="mt-2 text-sm text-white/65">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="rounded-sm border border-gold/20 bg-gradient-to-r from-gold/10 to-card p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="section-label mb-3">{locale === "en" ? "Start" : "Zacznij"}</div>
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                {locale === "en" ? "Want to move from inspiration to a real order"
                  : "Chcesz przejść od inspiracji do konkretnego zamówienia"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
                {locale === "en" ? "You can go straight to the service packages, compare options and choose the scope that matches your brand."
                  : "Możesz od razu przejść do pakietów usług, porównać opcje i wybrać zakres dopasowany do Twojej marki."}
              </p>
            </div>
            <Link href={getStaticPath("order")} className="inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-4 text-sm font-black uppercase tracking-wider text-background">
              {locale === "en" ? "Order project" : "Zamów projekt"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
