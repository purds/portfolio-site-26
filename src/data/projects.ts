import { assetPath } from "@/lib/base-path";

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
  // --- Explainer Videos (02a) ---
  {
    id: "ibm-dive-inside",
    title: "MobileFirst App Demos",
    client: "IBM",
    year: "2017",
    category: "explainer",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    description:
      "Demo and explainer videos for IBM's MobileFirst for iOS partnership with Apple — translating complex enterprise software into clear, engaging visual narratives across multiple app products.",
    thumbnail: assetPath("/images/motion-reel-2025-thumb.webp"),
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
      "Full creative control on an explainer exploring the etymology and identity of Xicanx for BESE's \"Gimme the Word\" series. The client's design team was unavailable, so I had full ownership of the visual direction — bold typographic animation with historical image assets and cultural depth. Also delivered a reusable template that streamlined future episodes.",
    thumbnail: assetPath("/images/bese-xicanx-thumb.webp"),
    video: assetPath("/videos/bese-xicanx.mp4"),
  },

  // --- Creative Direction (02b) ---
  {
    id: "dad-new-blood",
    title: "New Blood 2018 Invite",
    client: "D&AD",
    year: "2018",
    category: "creative-direction",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D"],
    description:
      "2-day turnaround promo for the D&AD New Blood festival. Integrated student work from previous years and collaborated with past attendees for authentic personality. Recreated the year's 3D gradient brush stroke branding from scratch to match the New Blood Awards identity.",
    thumbnail: assetPath("/images/dad-new-blood-content-thumb.webp"),
    video: assetPath("/videos/dad-new-blood-content.mp4"),
  },
  {
    id: "dad-new-blood-academy",
    title: "New Blood Academy Promo",
    client: "D&AD",
    year: "2018",
    category: "creative-direction",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D"],
    description:
      "Promotional video for D&AD's New Blood Academy program — showcasing the experience, skills, networking, and job opportunities available to potential applicants.",
    thumbnail: assetPath("/images/dad-new-blood-academy-thumb.webp"),
    video: assetPath("/videos/dad-new-blood-academy.mp4"),
  },
  {
    id: "dad-closing-film",
    title: "Closing Film",
    client: "D&AD",
    year: "2018",
    category: "creative-direction",
    role: "Motion Designer",
    tools: ["After Effects"],
    description:
      "End-of-event closing film for D&AD New Blood — a celebratory recap tying together the festival's highlights.",
    thumbnail: assetPath("/images/dad-closing-film-thumb.webp"),
    video: assetPath("/videos/dad-closing-film.mp4"),
  },

  // --- Editorial (02c) ---
  {
    id: "vice-snapchat",
    title: "Snapchat Discover",
    client: "VICE",
    year: "2018",
    category: "editorial",
    role: "Editorial Animator",
    tools: ["After Effects", "Cinema 4D", "Trapcode Particular"],
    description:
      "Part of a team of 7-10 creating 6-8 ten-second looping editorial illustrations daily for VICE's Snapchat Discover channel. Fast-paced abstract visual thinking around article text across verticals including Motherboard, Tonic, and i-D. People animations built in Cinema 4D with hand-drawn effects applied in After Effects.",
    thumbnail: assetPath("/images/vice-snapchat-thumb.webp"),
    video: assetPath("/videos/vice-snapchat.mp4"),
  },

  // --- UI / Product Demo (02d) ---
  {
    id: "wwdc18-watchos",
    title: "WWDC18 WatchOS",
    client: "Apple",
    year: "2018",
    category: "ui-product",
    role: "Motion Designer",
    tools: ["After Effects"],
    description:
      "Product demo animation for Apple's WatchOS features, created for the WWDC 2018 presentation cycle.",
    thumbnail: assetPath("/images/wwdc18-watchos-thumb.webp"),
    video: assetPath("/videos/wwdc18-watchos.mp4"),
  },
  {
    id: "google-call-center",
    title: "Call Center Demo",
    client: "Google",
    year: "2019",
    category: "ui-product",
    role: "Motion Designer",
    tools: ["After Effects", "Illustrator"],
    description:
      "UI demo video for Google's call center product — clean, informative product animation translating interface flows into compelling visual narratives.",
    thumbnail: assetPath("/images/google-call-center-thumb.webp"),
    video: assetPath("/videos/google-call-center.mp4"),
  },

  // --- Advertising (02e) ---
  {
    id: "tmobile-social",
    title: "Social Underground",
    client: "T-Mobile",
    year: "2019",
    category: "advertising",
    role: "Motion Designer",
    tools: ["After Effects"],
    description:
      "Social media advertising campaign for T-Mobile — punchy, scroll-stopping motion pieces designed for high engagement across platforms.",
    thumbnail: assetPath("/images/tmobile-social-underground-thumb.webp"),
    video: assetPath("/videos/tmobile-social-underground.mp4"),
  },
  {
    id: "propel-social",
    title: "Social Campaign",
    client: "Propel",
    year: "2019",
    category: "advertising",
    role: "Motion Designer",
    tools: ["After Effects", "Illustrator"],
    description:
      "Social media campaign for Propel — fast-turnaround animated content optimized for social platforms.",
    thumbnail: assetPath("/images/propel-social-thumb.webp"),
    video: assetPath("/videos/propel-social.mp4"),
  },

  // --- Entertainment & Arts (02f) ---
  {
    id: "rebellion-ruggerbust",
    title: "Ruggerbust",
    client: "Rebellion",
    year: "2020",
    category: "entertainment",
    role: "Motion Designer / VFX",
    tools: ["After Effects", "Cinema 4D"],
    description:
      "Motion design and visual effects for Rebellion's Ruggerbust project — blending live action with animated elements.",
    thumbnail: assetPath("/images/rebellion-ruggerbust-thumb.webp"),
    video: assetPath("/videos/rebellion-ruggerbust.mp4"),
  },

  // --- Nightlife (02g) ---
  {
    id: "flamingosis-groovy",
    title: "A Groovy Thing",
    client: "Flamingosis",
    year: "2020",
    category: "nightlife",
    role: "VJ / Motion Designer",
    tools: ["After Effects", "Resolume"],
    description:
      "Live visual content and music video work for Flamingosis — vibrant, retro-flavored animation designed for both screen and stage.",
    thumbnail: assetPath("/images/flamingosis-groovy-thing-thumb.webp"),
    video: assetPath("/videos/flamingosis-groovy-thing.mp4"),
  },
  {
    id: "sundae-sauuce",
    title: "Caramel Drizzle",
    client: "Sundae Sauuce",
    year: "2020",
    category: "nightlife",
    role: "VJ / Motion Designer",
    tools: ["After Effects", "Resolume"],
    description:
      "Visual content for Sundae Sauuce's Caramel Drizzle event — immersive projected animation for nightlife and live performance.",
    thumbnail: assetPath("/images/sundae-sauuce-caramel-thumb.webp"),
    video: assetPath("/videos/sundae-sauuce-caramel.mp4"),
  },
  {
    id: "beshken-visuals",
    title: "Live Visuals",
    client: "Beshken",
    year: "2021",
    category: "nightlife",
    role: "VJ / Visual Artist",
    tools: ["Resolume", "After Effects", "Cinema 4D"],
    description:
      "Full live visual sets for Beshken performances — reactive, immersive projections blending 3D renders with real-time effects.",
    thumbnail: assetPath("/images/beshken-visuals-thumb.webp"),
    video: assetPath("/videos/beshken-visuals.mp4"),
  },
];

export function getProjectsByCategory(categoryId: string): Project[] {
  return projects.filter((p) => p.category === categoryId);
}
