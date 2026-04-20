import { FilterType } from "@/hooks/useCamera";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "bw", label: "BW" },
  { key: "country", label: "Country" },
  { key: "vintage", label: "Vintage" },
  { key: "soft", label: "Soft" },
  { key: "intax", label: "Intax" },
  { key: "dv", label: "DV" },
];

const PREVIEW_COLORS: Record<string, string> = {
  normal: "linear-gradient(to bottom right, #ff7e5f, #feb47b)",
  bw: "linear-gradient(to bottom right, #7f8c8d, #bdc3c7)",
  country: "linear-gradient(to bottom right, #d4a373, #faedcd)",
  vintage: "linear-gradient(to bottom right, #cba153, #7c5c20)",
  soft: "linear-gradient(to bottom right, #fdfbfb, #ebedee)",
  intax: "linear-gradient(to bottom right, #a1c4fd, #c2e9fb)",
  dv: "linear-gradient(to bottom right, #ff9a9e, #fecfef)",
};

interface Props {
  selected: FilterType;
  onSelect: (f: FilterType) => void;
}

const FilterSelector = ({ selected, onSelect }: Props) => (
  <div className="flex flex-col items-center gap-2 py-5 mb-7">
    <p className="text-sm font-medium text-muted-foreground">Choose a filter</p>
    <div className="flex flex-wrap justify-center gap-2">
      {FILTERS.map(({ key, label }) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all ${
              isActive
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:bg-secondary"
            }`}
          >
            <div
              className="h-12 w-12 rounded-md border border-border shadow-sm"
              style={{
                background: PREVIEW_COLORS[key] || PREVIEW_COLORS.normal,
              }}
            />
            <span
              className={`text-[10px] font-semibold ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default FilterSelector;
