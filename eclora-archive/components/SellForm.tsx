"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ConditionGrade } from "@/lib/types";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  lineId: string;
  category: string;
  brand: string;
  model: string;
  condition: ConditionGrade | "";
  purchaseDate: string;
  notes: string;
  privacy: boolean;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  lineId: "",
  category: "",
  brand: "",
  model: "",
  condition: "",
  purchaseDate: "",
  notes: "",
  privacy: false,
};

const MAX_IMAGES = 5;

export function SellForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [images, setImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categoryOptions: { value: string; label: string }[] = [
    { value: "handbags", label: t.categories.handbags },
    { value: "shoulder-bags", label: t.categories["shoulder-bags"] },
    { value: "small-leather-goods", label: t.categories["small-leather-goods"] },
    { value: "jewelry", label: t.categories.jewelry },
    { value: "watches", label: t.categories.watches },
  ];

  const conditionOptions: ConditionGrade[] = ["S", "A", "AB", "B"];

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const remainingSlots = MAX_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, Math.max(remainingSlots, 0));
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...next]);
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    const requiredMsg = `${t.sell.requiredMark}`;

    if (!values.name.trim()) nextErrors.name = requiredMsg;
    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = requiredMsg;
    }
    if (!values.phone.trim()) nextErrors.phone = requiredMsg;
    if (!values.category) nextErrors.category = requiredMsg;
    if (!values.brand.trim()) nextErrors.brand = requiredMsg;
    if (!values.condition) nextErrors.condition = requiredMsg;
    if (!values.privacy) nextErrors.privacy = requiredMsg;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  }

  function resetForm() {
    setValues(initialValues);
    setImages([]);
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-sage-200 bg-sage-50 px-6 py-14 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-sage-600" strokeWidth={1.25} />
        <h2 className="mt-4 font-display text-xl text-ink">{t.sell.formSuccessTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
          {t.sell.formSuccessBody}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-ink hover:border-stone-400"
        >
          {t.sell.formSuccessBack}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t.sell.formName} error={errors.name} required>
          <input
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label={t.sell.formEmail} error={errors.email} required>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label={t.sell.formPhone} error={errors.phone} required>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label={t.sell.formLine}>
          <input
            type="text"
            value={values.lineId}
            onChange={(e) => update("lineId", e.target.value)}
            className={inputClass(false)}
          />
        </Field>

        <Field label={t.sell.formCategory} error={errors.category} required>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass(!!errors.category)}
          >
            <option value="">{t.sell.selectPlaceholder}</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.sell.formBrand} error={errors.brand} required>
          <input
            type="text"
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            className={inputClass(!!errors.brand)}
          />
        </Field>
        <Field label={t.sell.formModel}>
          <input
            type="text"
            value={values.model}
            onChange={(e) => update("model", e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label={t.sell.formCondition} error={errors.condition} required>
          <select
            value={values.condition}
            onChange={(e) => update("condition", e.target.value as ConditionGrade)}
            className={inputClass(!!errors.condition)}
          >
            <option value="">{t.sell.selectPlaceholder}</option>
            {conditionOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade} — {t.conditionLabels[grade]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.sell.formPurchaseDate}>
          <input
            type="month"
            value={values.purchaseDate}
            onChange={(e) => update("purchaseDate", e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label={t.sell.formNotes}>
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder={t.sell.formNotesPlaceholder}
          rows={4}
          className={inputClass(false)}
        />
      </Field>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          {t.sell.formUpload}
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-stone-300 px-4 py-8 text-center hover:border-stone-400">
          <Upload className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
          <span className="text-sm text-stone-500">{t.sell.formUploadHint}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={images.length >= MAX_IMAGES}
          />
        </label>
        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {images.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label={`Remove ${image.name}`}
                  className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={values.privacy}
            onChange={(e) => update("privacy", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-ink focus:ring-sage-500"
          />
          {t.sell.formPrivacy}
        </label>
        {errors.privacy ? (
          <p className="mt-1 text-xs text-wine-400">{errors.privacy}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? t.sell.formSubmitting : t.sell.formSubmit}
      </button>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-wine-300 focus:border-wine-400 focus:ring-wine-300"
      : "border-stone-300 focus:border-ink focus:ring-ink"
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-1 text-wine-400">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-wine-400">{error}</p> : null}
    </div>
  );
}
