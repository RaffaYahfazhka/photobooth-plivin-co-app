import {
  BG_COLORS,
  STICKERS,
  STRIP_FRAMES,
  STRIP_FILTER_CSS,
  StripCustomization,
  StickerItem,
  StripFilterType,
} from "@/types/layout";
import { Palette, Smile, Frame, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Props {
  customization: StripCustomization;
  onChange: (c: StripCustomization) => void;
}

const FILTERS: { key: StripFilterType; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "bw", label: "BW" },
  { key: "country", label: "Country" },
  { key: "vintage", label: "Vintage" },
  { key: "soft", label: "Soft" },
  { key: "intax", label: "Intax" },
  { key: "dv", label: "DV" },
];

const StripCustomizer = ({ customization, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState<"frame" | "bg" | "filter" | "sticker">("frame");

  const addSticker = (emoji: string) => {
    const newSticker: StickerItem = {
      id: crypto.randomUUID(),
      emoji,
      x: 80,
      y: 80,
      size: 32,
      rotation: 0,
    };
    onChange({ ...customization, stickers: [...customization.stickers, newSticker] });
  };

  const removeSticker = (id: string) => {
    onChange({
      ...customization,
      stickers: customization.stickers.filter((s) => s.id !== id),
    });
  };

  const clearStickers = () => onChange({ ...customization, stickers: [] });

  const hideBgTab = customization.frameId === "polaroid" || customization.frameId === "noir";

  const tabs = [
    { id: "frame" as const, icon: <Frame size={16} />, label: "Model" },
    !hideBgTab ? { id: "bg" as const, icon: <Palette size={16} />, label: "Warna" } : null,
    { id: "filter" as const, icon: <SlidersHorizontal size={16} />, label: "Filter" },
    { id: "sticker" as const, icon: <Smile size={16} />, label: "Stiker" },
  ].filter(Boolean) as { id: "frame" | "bg" | "filter" | "sticker"; icon: JSX.Element; label: string }[];

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Tabs */}
      <div className="mb-3 flex gap-1 rounded-full bg-secondary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Frame model */}
      {activeTab === "frame" && (
        <div className="grid grid-cols-3 gap-2">
          {STRIP_FRAMES.map((f) => {
            const isActive = customization.frameId === f.id;
            const previewBg = f.bgColor ?? customization.bgColor;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ ...customization, frameId: f.id })}
                className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    : "hover:bg-secondary"
                }`}
              >
                {/* mini preview */}
                <div
                  className="flex h-16 w-12 flex-col items-center justify-center gap-[3px] border"
                  style={{
                    backgroundColor: previewBg,
                    borderColor: f.borderColor,
                    borderWidth: Math.min(f.borderWidth, 2),
                    borderRadius: f.outerRadius / 2,
                    padding: 3,
                  }}
                >
                  {f.accentBars && (
                    <div className="h-[2px] w-full bg-foreground/70" />
                  )}
                  <div
                    className="w-full flex-1 bg-foreground/30"
                    style={{ borderRadius: f.radius / 2 }}
                  />
                  <div
                    className="w-full flex-1 bg-foreground/30"
                    style={{ borderRadius: f.radius / 2 }}
                  />
                  {f.accentBars && (
                    <div className="h-[2px] w-full bg-foreground/70" />
                  )}
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Background */}
      {activeTab === "bg" && (
        <div className="flex flex-wrap justify-center gap-2">
          {BG_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => onChange({ ...customization, bgColor: color.value })}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                customization.bgColor === color.value
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "hover:bg-secondary"
              }`}
            >
              <div
                className="h-8 w-8 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {color.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filter */}
      {activeTab === "filter" && (
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const isActive = customization.filter === f.key;
            
            const bgColors: Record<string, string> = {
              normal: "linear-gradient(to bottom right, #ff7e5f, #feb47b)",
              bw: "linear-gradient(to bottom right, #7f8c8d, #bdc3c7)",
              country: "linear-gradient(to bottom right, #d4a373, #faedcd)",
              vintage: "linear-gradient(to bottom right, #cba153, #7c5c20)",
              soft: "linear-gradient(to bottom right, #fdfbfb, #ebedee)",
              intax: "linear-gradient(to bottom right, #a1c4fd, #c2e9fb)",
              dv: "linear-gradient(to bottom right, #ff9a9e, #fecfef)",
            };

            return (
              <button
                key={f.key}
                onClick={() => onChange({ ...customization, filter: f.key })}
                className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    : "hover:bg-secondary"
                }`}
              >
                <div
                  className="h-12 w-12 rounded-md border border-border shadow-sm"
                  style={{
                    background: bgColors[f.key] || bgColors.normal,
                  }}
                />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stickers */}
      {activeTab === "sticker" && (
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-1">
            {STICKERS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="rounded-lg p-1.5 text-xl transition-all hover:bg-secondary hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>

          {customization.stickers.length > 0 && (
            <div className="pt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Klik ❌ untuk hapus stiker
              </p>
              <div className="flex flex-wrap gap-1">
                {customization.stickers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => removeSticker(s.id)}
                    className="rounded-md bg-secondary px-2 py-1 text-sm hover:bg-destructive/20"
                  >
                    {s.emoji} ❌
                  </button>
                ))}
              </div>
              <button
                onClick={clearStickers}
                className="text-[10px] font-medium text-muted-foreground hover:text-destructive"
              >
                Hapus semua
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StripCustomizer;
