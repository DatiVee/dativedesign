import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getBriefPrompt } from "@/data/orderBriefConfig";
import { useLocale } from "@/contexts/LocaleContext";
import { type OrderBriefAnswer, type OrderBriefFile, useOrderFlow } from "@/contexts/OrderFlowContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const MAX_FILES_PER_ITEM = 5;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_TOTAL_SIZE = 18 * 1024 * 1024;

function readFileAsBriefAttachment(file: File) {
  return new Promise<OrderBriefFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        content: result.includes(",") ? result.split(",")[1] : result,
      });
    };
    reader.readAsDataURL(file);
  });
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

type BriefFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  textarea?: boolean;
  compact?: boolean;
  onChange: (value: string) => void;
};

function BriefField({
  label,
  value,
  placeholder,
  disabled,
  textarea,
  compact,
  onChange,
}: BriefFieldProps) {
  const baseClass =
    "w-full rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none transition focus:border-gold/45 disabled:opacity-60";

  return (
    <label className="grid gap-2">
      <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/38">
        {label}
      </span>
      {textarea ? (
        <textarea
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${baseClass} ${compact ? "min-h-20" : "min-h-24"} py-3 leading-relaxed`}
        />
      ) : (
        <input
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${baseClass} h-11`}
        />
      )}
    </label>
  );
}

export default function OrderBriefPage() {
  const { locale, getStaticPath } = useLocale();
  const { activeOrder, submitBrief, isSubmitting } = useOrderFlow();
  const [, navigate] = useLocation();

  const initialAnswers = useMemo<OrderBriefAnswer[]>(
    () =>
      activeOrder?.items.map((item) => ({
        itemId: item.id,
        brandName: item.brandName || activeOrder.customer.company || "",
        projectGoal: "",
        audience: "",
        visualDirection: "",
        references: "",
        contentScope: item.scopeDetails || "",
        deadline: "",
        additionalNotes: item.notes || "",
        attachments: [],
      })) ?? [],
    [activeOrder]
  );

  const [answers, setAnswers] = useState<OrderBriefAnswer[]>(initialAnswers);

  // activeOrder ładuje się asynchronicznie z localStorage - po odświeżeniu strony
  // stan startuje pusty, więc uzupełniamy go, gdy tylko zamówienie się pojawi.
  useEffect(() => {
    setAnswers((current) => (current.length === 0 ? initialAnswers : current));
  }, [initialAnswers]);

  usePageMeta(
    locale === "en" ? "Project Brief | DatiVe Design" : "Brief projektowy | DatiVe Design",
    locale === "en"
      ? "Post-purchase project brief for DatiVe Design orders. The client fills in brand, scope, references and execution details."
      : "Brief projektowy po zakupie usługi DatiVe Design. Klient uzupełnia markę, zakres, inspiracje i detale realizacji.",
    { locale, path: getStaticPath("brief"), robots: "noindex, follow" }
  );

  if (!activeOrder) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Brief"
            title={
              locale === "en"
                ? "There is no inquiry to complete"
                : "Nie ma zapytania do uzupełnienia"
            }
            description={
              locale === "en"
                ? "The brief appears after you send a quote request from the cart."
                : "Brief pojawia się po wysłaniu zapytania o wycenę z koszyka."
            }
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={getStaticPath("cart")}
              className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
            </Link>
            <Link
              href={getStaticPath("order")}
              className="inline-flex items-center justify-center rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "Go to shop" : "Przejdź do sklepu"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const updateAnswer = (itemId: string, key: keyof OrderBriefAnswer, value: string) => {
    setAnswers((current) =>
      current.map((answer) =>
        answer.itemId === itemId
          ? {
              ...answer,
              [key]: value,
            }
          : answer
      )
    );
  };

  const updateAttachments = (itemId: string, attachments: OrderBriefFile[]) => {
    setAnswers((current) =>
      current.map((answer) =>
        answer.itemId === itemId
          ? {
              ...answer,
              attachments,
            }
          : answer
      )
    );
  };

  const addFiles = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const answer = answers.find((entry) => entry.itemId === itemId);
    if (!answer) return;

    const selectedFiles = Array.from(files);
    const tooLarge = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast.error(
        locale === "en"
          ? `File "${tooLarge.name}" is too large. Max file size is 8 MB.`
          : `Plik "${tooLarge.name}" jest za duży. Maksymalny rozmiar jednego pliku to 8 MB.`
      );
      return;
    }

    if (answer.attachments.length + selectedFiles.length > MAX_FILES_PER_ITEM) {
      toast.error(
        locale === "en"
          ? `You can attach up to ${MAX_FILES_PER_ITEM} files per item.`
          : `Możesz dodać maksymalnie ${MAX_FILES_PER_ITEM} plików do jednej pozycji.`
      );
      return;
    }

    const currentTotal = answer.attachments.reduce((sum, file) => sum + file.size, 0);
    const newTotal = selectedFiles.reduce((sum, file) => sum + file.size, currentTotal);
    if (newTotal > MAX_TOTAL_SIZE) {
      toast.error(
        locale === "en"
          ? "Attached files are too large. Max total size per item is 18 MB."
          : "Załączniki są za duże. Maksymalny łączny rozmiar przy jednej pozycji to 18 MB."
      );
      return;
    }

    try {
      const attachments = await Promise.all(selectedFiles.map(readFileAsBriefAttachment));
      updateAttachments(itemId, [...answer.attachments, ...attachments]);
    } catch {
      toast.error(
        locale === "en"
          ? "One of the files could not be read."
          : "Nie udało się odczytać jednego z plików."
      );
    }
  };

  const removeFile = (itemId: string, fileIndex: number) => {
    const answer = answers.find((entry) => entry.itemId === itemId);
    if (!answer) return;
    updateAttachments(
      itemId,
      answer.attachments.filter((_, index) => index !== fileIndex)
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (answers.length === 0) {
      toast.error(
        locale === "en"
          ? "The brief has not loaded yet. Try again in a moment."
          : "Brief jeszcze się nie załadował. Spróbuj za chwilę."
      );
      return;
    }

    const hasMissing = answers.some(
      (answer) =>
        !answer.brandName ||
        !answer.projectGoal ||
        !answer.audience ||
        !answer.visualDirection ||
        !answer.contentScope
    );

    if (hasMissing) {
      toast.error(
        locale === "en"
          ? "Fill in the key project inputs for each ordered item."
          : "Uzupełnij kluczowe informacje projektowe dla każdej zamówionej pozycji."
      );
      return;
    }

    try {
      await submitBrief(answers);
      toast.success(locale === "en" ? "Brief saved." : "Brief zapisany.");
      navigate(getStaticPath("thankYou"));
    } catch {
      toast.error(
        locale === "en"
          ? "The brief could not be saved on the server."
          : "Nie udało się zapisać briefu po stronie serwera."
      );
    }
  };

  return (
    <SiteLayout>
      <section className="container py-10 sm:py-14 lg:py-16">
        <div className="grid gap-5 rounded-sm border border-gold/20 bg-card p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="section-label mb-3">
              {locale === "en" ? "Optional step" : "Krok opcjonalny"}
            </div>
            <h1 className="max-w-4xl font-display text-3xl font-black leading-[1.04] text-white sm:text-5xl">
              {locale === "en" ? "Speed up your quote with a brief" : "Przyspiesz wycenę briefem"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
              {locale === "en"
                ? "Your quote request has been sent. If you add a few project details now, the quote will be more accurate and faster - but you can skip this step."
                : "Twoje zapytanie o wycenę zostało wysłane. Jeśli teraz dodasz kilka szczegółów projektu, wycena będzie trafniejsza i szybsza - ale możesz ten krok pominąć."}
            </p>
          </div>

          <div className="grid gap-3 rounded-sm border border-white/8 bg-background p-4 text-sm sm:min-w-72">
            <div>
              <div className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/35">
                {locale === "en" ? "Inquiry number" : "Numer zapytania"}
              </div>
              <div className="mt-1 font-display text-2xl font-black text-gold">{activeOrder.number}</div>
            </div>
            <div className="grid gap-1 text-white/60">
              <span>
                {locale === "en" ? "Client" : "Klient"}:{" "}
                <strong className="text-white">{activeOrder.customer.name}</strong>
              </span>
              <span>
                {locale === "en" ? "Status" : "Status"}:{" "}
                <strong className="text-white">
                  {locale === "en" ? "Inquiry sent" : "Zapytanie wysłane"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-5">
          {activeOrder.items.map((item) => {
            const prompt = getBriefPrompt(locale, item.serviceSlug);
            const answer = answers.find((entry) => entry.itemId === item.id);
            if (!answer) return null;

            const price = item.price + item.addons.reduce((sum, addon) => sum + addon.price, 0);

            return (
              <article key={item.id} className="rounded-sm border border-white/6 bg-card p-5 sm:p-6">
                <div className="grid gap-4 border-b border-white/6 pb-5 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <div className="section-label mb-2">{item.serviceName}</div>
                    <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl">
                      {item.packageName}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                      {prompt.description}
                    </p>
                  </div>
                  <div className="w-fit rounded-sm border border-gold/25 bg-gold/10 px-4 py-2 font-display text-xl font-black text-gold">
                    {price} zł
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <BriefField
                    disabled={isSubmitting}
                    label={locale === "en" ? "Brand / company" : "Marka / firma"}
                    value={answer.brandName}
                    onChange={(value) => updateAnswer(item.id, "brandName", value)}
                    placeholder={locale === "en" ? "Brand or company name" : "Nazwa marki albo firmy"}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    label={locale === "en" ? "Deadline" : "Termin"}
                    value={answer.deadline}
                    onChange={(value) => updateAnswer(item.id, "deadline", value)}
                    placeholder={prompt.deadlinePlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    label={locale === "en" ? "Goal" : "Cel projektu"}
                    value={answer.projectGoal}
                    onChange={(value) => updateAnswer(item.id, "projectGoal", value)}
                    placeholder={prompt.goalPlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    label={locale === "en" ? "Target audience" : "Odbiorcy"}
                    value={answer.audience}
                    onChange={(value) => updateAnswer(item.id, "audience", value)}
                    placeholder={prompt.audiencePlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    label={locale === "en" ? "Visual direction" : "Klimat wizualny"}
                    value={answer.visualDirection}
                    onChange={(value) => updateAnswer(item.id, "visualDirection", value)}
                    placeholder={prompt.visualPlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    label={locale === "en" ? "Scope / content" : "Zakres / treści"}
                    value={answer.contentScope}
                    onChange={(value) => updateAnswer(item.id, "contentScope", value)}
                    placeholder={prompt.contentPlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    compact
                    label={locale === "en" ? "References" : "Inspiracje / linki"}
                    value={answer.references}
                    onChange={(value) => updateAnswer(item.id, "references", value)}
                    placeholder={prompt.referencesPlaceholder}
                  />
                  <BriefField
                    disabled={isSubmitting}
                    textarea
                    compact
                    label={locale === "en" ? "Extra notes" : "Dodatkowe uwagi"}
                    value={answer.additionalNotes}
                    onChange={(value) => updateAnswer(item.id, "additionalNotes", value)}
                    placeholder={prompt.notesPlaceholder}
                  />
                </div>

                <div className="mt-5 rounded-sm border border-white/8 bg-background/55 p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/38">
                        {locale === "en" ? "Project files" : "Pliki do projektu"}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">
                        {locale === "en"
                          ? "Attach logo files, screenshots, references or print files. Max 5 files, 8 MB each."
                          : "Dodaj logo, screeny, inspiracje albo pliki do druku. Maks. 5 plików, 8 MB każdy."}
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-sm border border-gold/35 px-5 py-3 text-xs font-black uppercase tracking-wider text-gold transition hover:bg-gold/10">
                      {locale === "en" ? "Add files" : "Dodaj pliki"}
                      <input
                        disabled={isSubmitting}
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(event) => {
                          void addFiles(item.id, event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {answer.attachments.length > 0 ? (
                    <div className="mt-4 grid gap-2">
                      {answer.attachments.map((file, fileIndex) => (
                        <div
                          key={`${file.name}-${fileIndex}`}
                          className="flex items-center justify-between gap-3 rounded-sm border border-white/8 bg-card px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">{file.name}</div>
                            <div className="text-xs text-white/45">{formatFileSize(file.size)}</div>
                          </div>
                          <button
                            disabled={isSubmitting}
                            type="button"
                            onClick={() => removeFile(item.id, fileIndex)}
                            className="shrink-0 text-xs font-black uppercase tracking-wider text-white/45 transition hover:text-gold disabled:opacity-50"
                          >
                            {locale === "en" ? "Remove" : "Usuń"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}

          <div className="sticky bottom-4 z-20 rounded-sm border border-gold/25 bg-background/95 p-4 shadow-2xl shadow-black/40 backdrop-blur md:static md:bg-gradient-to-r md:from-gold/12 md:via-card md:to-card md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="section-label mb-2">{locale === "en" ? "Final step" : "Ostatni krok"}</div>
                <h2 className="font-display text-xl font-black text-white sm:text-2xl">
                  {locale === "en" ? "Send the brief" : "Wyślij brief"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  {locale === "en"
                    ? "We get the full picture of your project and you receive an email confirmation."
                    : "Dostajemy pełny obraz Twojego projektu, a Ty potwierdzenie na maila."}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-xs font-black uppercase tracking-wider text-background disabled:opacity-60"
                >
                  <Save size={16} />
                  {isSubmitting
                    ? locale === "en"
                      ? "Saving..."
                      : "Zapisywanie..."
                    : locale === "en"
                      ? "Save brief"
                      : "Zapisz brief"}
                </button>
                <button
                  disabled={isSubmitting}
                  type="button"
                  onClick={() => navigate(getStaticPath("thankYou"))}
                  className="inline-flex items-center justify-center rounded-sm border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-white/60 transition hover:border-gold/30 hover:text-gold disabled:opacity-60"
                >
                  {locale === "en" ? "Skip for now" : "Pomiń na razie"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
