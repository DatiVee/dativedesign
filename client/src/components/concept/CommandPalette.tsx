import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Command } from "cmdk";
import {
  ArrowUp,
  BookOpen,
  Briefcase,
  Copy,
  CornerDownLeft,
  Facebook,
  Globe,
  HelpCircle,
  Home,
  Instagram,
  Layers,
  Linkedin,
  Phone,
  Search,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import type { Project } from "@/data/siteContent";
import { prefersReducedMotion, scrollToSection } from "./fx";

/*
 * Paleta poleceń (⌘K / Ctrl K albo "/") – szybkie przejście do sekcji, realizacji, podstron
 * i akcji (kopiuj e-mail, zadzwoń, social media, zmiana języka).
 * cmdk (już w zależnościach projektu) daje filtrowanie i nawigację strzałkami,
 * natywny <dialog> – fokus, Esc i nieaktywne tło.
 */

type Section = { id: string; label: string };

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  sections: Section[];
  projects: Project[];
};

const EMAIL = "kontakt@dativedesign.com";

/** Małe litery, bez polskich znaków ("wizytowki" znajduje "Wizytówki"). */
const normalize = (text: string) =>
  text
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l");

/** Dopasowanie fragmentów zamiast rozmytego: każde wpisane słowo musi wystąpić w nazwie lub słowach kluczowych. */
function filterItems(value: string, search: string, keywords?: string[]) {
  const haystack = normalize([value.replace("::", " "), ...(keywords ?? [])].join(" "));
  const terms = normalize(search).split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term)) ? 1 : 0;
}

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function Item({
  value,
  icon: Icon,
  label,
  hint,
  keywords,
  onSelect,
}: {
  value: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <Command.Item value={value} keywords={keywords} onSelect={onSelect} className="c-palette__item">
      <span className="c-palette__icon">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="c-palette__label">{label}</span>
      {hint ? <span className="c-palette__hint">{hint}</span> : null}
      <CornerDownLeft size={14} className="c-palette__enter" aria-hidden="true" />
    </Command.Item>
  );
}

export function CommandPalette({ open, setOpen, sections, projects }: Props) {
  const { locale, switchPath, getStaticPath, getPortfolioDetailPath } = useLocale();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const t =
    locale === "en"
      ? {
          title: "Command palette",
          placeholder: "Search sections, projects, actions…",
          empty: "Nothing found.",
          sections: "Sections",
          work: "Projects",
          pages: "Pages",
          actions: "Actions",
          home: "Home",
          about: "About",
          reviews: "Reviews",
          copy: "Copy e-mail address",
          copied: "E-mail address copied",
          call: "Call +48 796 106 675",
          language: "Polska wersja",
          top: "Back to top",
          move: "navigate",
          choose: "select",
          close: "close",
        }
      : {
          title: "Paleta poleceń",
          placeholder: "Szukaj sekcji, realizacji, akcji…",
          empty: "Nic nie znaleziono.",
          sections: "Sekcje",
          work: "Realizacje",
          pages: "Podstrony",
          actions: "Akcje",
          home: "Strona główna",
          about: "O nas",
          reviews: "Opinie",
          copy: "Kopiuj adres e-mail",
          copied: "Skopiowano adres e-mail",
          call: "Zadzwoń: +48 796 106 675",
          language: "English version",
          top: "Wróć na górę",
          move: "nawigacja",
          choose: "wybierz",
          close: "zamknij",
        };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSearch("");
      dialog.showModal();
      /* showModal() bez atrybutu autofocus ustawia fokus na samym oknie – od razu do pola wyszukiwania */
      dialog.querySelector<HTMLInputElement>(".c-palette__input")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "/" && !event.metaKey && !event.ctrlKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  const run = (action: () => void) => {
    setOpen(false);
    window.setTimeout(action, 60);
  };

  const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast.success(t.copied);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="c-palette"
      aria-label={t.title}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <Command className="c-palette__cmd" label={t.title} loop filter={filterItems}>
        <div className="c-palette__search">
          <Search size={18} aria-hidden="true" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t.placeholder}
            className="c-palette__input"
          />
          <kbd className="c-palette__kbd">Esc</kbd>
        </div>

        <Command.List className="c-palette__list">
          <Command.Empty className="c-palette__empty">{t.empty}</Command.Empty>

          <Command.Group heading={t.sections}>
            {sections.map((section) => (
              <Item
                key={section.id}
                value={`${section.label}::sekcja`}
                icon={Layers}
                label={section.label}
                hint="#"
                onSelect={() => run(() => scrollToSection(section.id))}
              />
            ))}
          </Command.Group>

          <Command.Group heading={t.work}>
            {projects.map((project) => (
              <Item
                key={project.slug}
                value={`${project.title}::realizacja`}
                icon={Briefcase}
                label={project.title}
                hint={project.category}
                keywords={[project.category, project.client]}
                onSelect={() => run(() => navigate(getPortfolioDetailPath(project.slug)))}
              />
            ))}
          </Command.Group>

          <Command.Group heading={t.pages}>
            <Item value={`${t.home}::strona`} icon={Home} label={t.home} onSelect={() => run(() => navigate(getStaticPath("home")))} />
            <Item value={`${t.about}::strona`} icon={User} label={t.about} onSelect={() => run(() => navigate(getStaticPath("about")))} />
            <Item value="Portfolio::strona" icon={Briefcase} label="Portfolio" onSelect={() => run(() => navigate(getStaticPath("portfolio")))} />
            <Item value={`${t.reviews}::strona`} icon={Star} label={t.reviews} onSelect={() => run(() => navigate(getStaticPath("reviews")))} />
            <Item value="FAQ::strona" icon={HelpCircle} label="FAQ" onSelect={() => run(() => navigate(getStaticPath("faq")))} />
            <Item value="Blog::strona" icon={BookOpen} label="Blog" onSelect={() => run(() => navigate(getStaticPath("blog")))} />
          </Command.Group>

          <Command.Group heading={t.actions}>
            <Item value={`${t.copy}::akcja`} icon={Copy} label={t.copy} hint={EMAIL} keywords={["email", "mail"]} onSelect={() => run(copyEmail)} />
            <Item value={`${t.call}::akcja`} icon={Phone} label={t.call} keywords={["telefon", "phone"]} onSelect={() => run(() => (window.location.href = "tel:+48796106675"))} />
            <Item value="Instagram::akcja" icon={Instagram} label="Instagram" hint="@dative_design" onSelect={() => run(() => openExternal("https://instagram.com/dative_design"))} />
            <Item value="Facebook::akcja" icon={Facebook} label="Facebook" onSelect={() => run(() => openExternal("https://facebook.com/DativeDesign"))} />
            <Item value="LinkedIn::akcja" icon={Linkedin} label="LinkedIn" onSelect={() => run(() => openExternal("https://www.linkedin.com/in/damian-wilk-456362271/"))} />
            <Item value={`${t.language}::akcja`} icon={Globe} label={t.language} keywords={["język", "language", "PL", "EN"]} onSelect={() => run(() => navigate(switchPath))} />
            <Item
              value={`${t.top}::akcja`}
              icon={ArrowUp}
              label={t.top}
              onSelect={() => run(() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" }))}
            />
          </Command.Group>
        </Command.List>

        <div className="c-palette__foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t.move}
          </span>
          <span>
            <kbd>↵</kbd> {t.choose}
          </span>
          <span>
            <kbd>Esc</kbd> {t.close}
          </span>
        </div>
      </Command>
    </dialog>
  );
}
