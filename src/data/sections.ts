export interface Section {
  id: string;
  number: string;
  label: string;
  accent: string;
}

export const sections: Section[] = [
  { id: "hero", number: "00", label: "Hero", accent: "#FF5F1F" },
  { id: "hello", number: "01", label: "Hello", accent: "#8B5CF6" },
  { id: "work", number: "02", label: "Work", accent: "#22C55E" },
  { id: "about", number: "03", label: "About", accent: "#EC4899" },
  { id: "contact", number: "04", label: "Contact", accent: "#3B82F6" },
];

export interface WorkCategory {
  id: string;
  number: string;
  label: string;
  accent: string;
}

export const workCategories: WorkCategory[] = [
  { id: "explainer", number: "02a", label: "Explainer Videos", accent: "#FF5F1F" },
  { id: "creative-direction", number: "02b", label: "Creative Direction", accent: "#8B5CF6" },
  { id: "editorial", number: "02c", label: "Editorial", accent: "#22C55E" },
  { id: "ui-product", number: "02d", label: "UI / Product Demo", accent: "#EC4899" },
  { id: "advertising", number: "02e", label: "Advertising", accent: "#3B82F6" },
  { id: "entertainment", number: "02f", label: "Entertainment & Arts", accent: "#FF5F1F" },
  { id: "nightlife", number: "02g", label: "Nightlife", accent: "#8B5CF6" },
];
