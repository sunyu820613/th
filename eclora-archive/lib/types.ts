export type Locale = "ja" | "zh";

export type ConditionGrade = "S" | "A" | "AB" | "B";

export type CategorySlug = "handbags" | "shoulder-bags" | "small-leather-goods" | "jewelry" | "watches";

export type ExternalChannel = "rakuten" | "yahoo" | "ebay";

export interface LocalizedText {
  ja: string;
  zh: string;
}

export interface Product {
  slug: string;
  category: Exclude<CategorySlug, "watches">;
  brand: string;
  name: LocalizedText;
  price: number; // JPY
  condition: ConditionGrade;
  color: LocalizedText;
  colorKey: string;
  material: LocalizedText;
  size: LocalizedText;
  accessories: LocalizedText;
  itemNumber: string;
  channels: ExternalChannel[];
  images: PlaceholderImage[];
  description: LocalizedText;
  isNew?: boolean;
}

export interface PlaceholderImage {
  gradientFrom: string;
  gradientTo: string;
  label: string;
}
