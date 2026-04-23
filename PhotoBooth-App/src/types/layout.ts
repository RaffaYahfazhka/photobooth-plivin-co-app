export interface LayoutOption {
  id: string;
  label: string;
  cols: number;
  rows: number;
  totalPhotos: number;
}

export const LAYOUTS: LayoutOption[] = [
  { id: "1x4", label: "1×4 Strip", cols: 1, rows: 4, totalPhotos: 4 },
  { id: "2x2", label: "2×2 Grid", cols: 2, rows: 2, totalPhotos: 4 },
  { id: "2x3", label: "2×3 Grid", cols: 2, rows: 3, totalPhotos: 6 },
  { id: "2x4", label: "2×4 Grid", cols: 2, rows: 4, totalPhotos: 8 },
];

export const BG_COLORS = [
  { id: "black", label: "Hitam", value: "#1a1a1a" },
  { id: "white", label: "Putih", value: "#ffffff" },
  { id: "pink", label: "Pink", value: "#f8b4c8" },
  { id: "navy", label: "Navy", value: "#1e3a5f" },
  { id: "sage", label: "Sage", value: "#a8b5a0" },
  { id: "cream", label: "Cream", value: "#f5e6d3" },
  { id: "lavender", label: "Lavender", value: "#c4b7d4" },
  { id: "red", label: "Merah", value: "#c0392b" },
];

export const STICKERS = [
  "✨", "💖", "🌟", "🦋", "🌸", "💫", "⭐", "🎀",
  "❤️", "🔥", "🌈", "💜", "🎉", "🍀", "👑", "💎",
  "🐻", "🐱", "🦄", "🌙", "☀️", "🎵", "💐", "🧸",
];

export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // font size in px
  rotation: number; // degree
}

export interface StripFrame {
  id: string;
  label: string;
  // visual style
  bgColor?: string; // optional override
  padding: number; // px (preview scale)
  gap: number; // px between photos
  radius: number; // photo corner radius px
  outerRadius: number; // strip corner radius px
  borderWidth: number;
  borderColor: string;
  headerText?: string;
  footerText?: string; // overrides default plivin.co watermark when set
  accentBars?: boolean; // top/bottom accent bars
}

export const STRIP_FRAMES: StripFrame[] = [
  {
    id: "classic",
    label: "Classic",
    padding: 12,
    gap: 6,
    radius: 2,
    outerRadius: 0,
    borderWidth: 0,
    borderColor: "#000",
  },
  {
    id: "polaroid",
    label: "Polaroid",
    padding: 18,
    gap: 10,
    radius: 0,
    outerRadius: 4,
    borderWidth: 0,
    borderColor: "#fff",
    bgColor: "#ffffff",
  },
  {
    id: "minimal",
    label: "Minimal",
    padding: 20,
    gap: 12,
    radius: 8,
    outerRadius: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  {
    id: "retro",
    label: "Retro",
    padding: 16,
    gap: 6,
    radius: 0,
    outerRadius: 0,
    borderWidth: 4,
    borderColor: "#000",
    accentBars: true,
    headerText: "★ MEMORIES ★",
  },
  {
    id: "rounded",
    label: "Rounded",
    padding: 14,
    gap: 8,
    radius: 14,
    outerRadius: 24,
    borderWidth: 0,
    borderColor: "#000",
  },
  {
    id: "noir",
    label: "Noir",
    padding: 16,
    gap: 8,
    radius: 0,
    outerRadius: 0,
    borderWidth: 0,
    borderColor: "#000",
    bgColor: "#0a0a0a",
    accentBars: true,
  },
];

export type StripFilterType =
  | "normal"
  | "bw"
  | "country"
  | "vintage"
  | "soft"
  | "intax"
  | "dv";

export const STRIP_FILTER_CSS: Record<StripFilterType, string> = {
  normal: "none",
  bw: "grayscale(1) contrast(1.1)",
  country: "sepia(0.4) saturate(1.3) brightness(1.05)",
  vintage: "sepia(0.6) contrast(0.9) brightness(0.95) saturate(0.8)",
  soft: "brightness(1.08) contrast(0.92) saturate(0.9)",
  intax: "contrast(1.1) saturate(1.2) brightness(1.05)",
  dv: "grayscale(0.3) contrast(1.3) brightness(0.9) saturate(0.7)",
};

export interface StripCustomization {
  bgColor: string;
  stickers: StickerItem[];
  frameId: string;
  filter: StripFilterType;
}

/* ======================================
   ✅ BOOTH PACKAGES
====================================== */

export const BASIC_FILTERS: StripFilterType[] = ["normal", "bw", "soft"];
export const ALL_FILTERS: StripFilterType[] = ["normal", "bw", "country", "vintage", "soft", "intax", "dv"];

export interface BoothPackage {
  id: string;
  name: string;
  price: number;          // in IDR
  maxRetakes: number;
  allowedLayouts: string[];  // layout IDs e.g. ["1x4", "2x2"]
  allowedFilters: StripFilterType[];
  features: string[];
  popular?: boolean;
}

export const BOOTH_PACKAGES: BoothPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 10000,
    maxRetakes: 0,
    allowedLayouts: ["1x4", "2x2"],
    allowedFilters: BASIC_FILTERS,
    features: [
      "1x Photo Strip (4 foto)",
      "3 filter (Normal, BW, Soft)",
      "Layout 1×4 atau 2×2",
      "Download digital",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 20000,
    maxRetakes: 1,
    allowedLayouts: ["1x4", "2x2", "2x3"],
    allowedFilters: ALL_FILTERS,
    popular: true,
    features: [
      "1x Photo Strip (4-6 foto)",
      "Semua filter tersedia",
      "Layout 1×4, 2×2, atau 2×3",
      "1x Retake",
      "Download digital",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 35000,
    maxRetakes: 2,
    allowedLayouts: ["1x4", "2x2", "2x3", "2x4"],
    allowedFilters: ALL_FILTERS,
    features: [
      "1x Photo Strip (4-8 foto)",
      "Semua filter tersedia",
      "Semua layout tersedia",
      "2x Retake",
      "Download digital",
    ],
  },
];

export type BoothStep = "welcome" | "package" | "payment" | "setup" | "capture" | "customize";

export interface BoothSession {
  step: BoothStep;
  selectedPackage: BoothPackage | null;
  isPaid: boolean;
  retakesUsed: number;
}

export const INITIAL_SESSION: BoothSession = {
  step: "welcome",
  selectedPackage: null,
  isPaid: false,
  retakesUsed: 0,
};

