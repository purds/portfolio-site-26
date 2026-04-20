export interface Project {
  id: string;
  title: string;
  client: string;
  year: string;
  category: string;
  role: string;
  tools: string[];
  description: string;
  thumbnail: string;
  video?: string;
}

export const projects: Project[] = [
  {
    id: "ibm-dive-inside",
    title: "Dive Inside",
    client: "IBM",
    year: "2017",
    category: "explainer",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    description:
      "App demo videos for the IBM MobileFirst partnership with Apple — translating complex enterprise software into clear, engaging visual narratives.",
    thumbnail: "/images/ibm-dive-inside.webp",
    video: "/videos/ibm-dive-inside.mp4",
  },
  {
    id: "bese-xicanx",
    title: "Gimme the Word: Xicanx",
    client: "BESE",
    year: "2019",
    category: "explainer",
    role: "Creative Director / Motion Designer",
    tools: ["After Effects", "Illustrator", "Photoshop"],
    description:
      "Full creative control on an explainer video exploring the etymology and identity of Xicanx — bold typographic animation with cultural depth.",
    thumbnail: "/images/bese-xicanx.webp",
    video: "/videos/bese-xicanx.mp4",
  },
  {
    id: "dad-new-blood",
    title: "New Blood 2018 Invite",
    client: "D&AD",
    year: "2018",
    category: "creative-direction",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D"],
    description:
      "2-day turnaround promo video for the D&AD New Blood festival — integrated student work with recreated 3D gradient branding.",
    thumbnail: "/images/dad-new-blood.webp",
    video: "/videos/dad-new-blood.mp4",
  },
  {
    id: "vice-snapchat",
    title: "Snapchat Discover",
    client: "VICE",
    year: "2018",
    category: "editorial",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    description:
      "6-8 daily looping editorial illustrations for VICE's Snapchat Discover channel — high-volume creative production under tight deadlines.",
    thumbnail: "/images/vice-snapchat.webp",
    video: "/videos/vice-snapchat.mp4",
  },
  // Add more projects as content becomes available.
  // Each project must have a category matching a workCategories id from sections.ts.
];

export function getProjectsByCategory(categoryId: string): Project[] {
  return projects.filter((p) => p.category === categoryId);
}
