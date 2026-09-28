"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface Values {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initial: Values = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof Values, boolean>> = {};
    if (!values.name.trim()) nextErrors.name = true;
    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = true;
    if (!values.message.trim()) nextErrors.message = true;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-sage-200 bg-sage-50 px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-sage-600" strokeWidth={1.25} />
        <h2 className="mt-3 font-display text-lg text-ink">{t.contact.formSuccessTitle}</h2>
        <p className="mt-2 text-sm text-stone-600">{t.contact.formSuccessBody}</p>
      </div>
    );
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full rounded-md border bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-1 ${
      hasError
        ? "border-wine-300 focus:border-wine-400 focus:ring-wine-300"
        : "border-stone-300 focus:border-ink focus:ring-ink"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t.contact.formName}</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={fieldClass(errors.name)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t.contact.formEmail}</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className={fieldClass(errors.email)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t.contact.formSubject}</label>
        <input
          type="text"
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
          className={fieldClass(false)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">{t.contact.formMessage}</label>
        <textarea
          rows={5}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          className={fieldClass(errors.message)}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper hover:bg-stone-800 sm:w-auto"
      >
        {t.contact.formSubmit}
      </button>
    </form>
  );
}
