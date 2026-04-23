import { LayoutOption, LAYOUTS } from "@/types/layout";
import { Grid2X2, Grid3X3, Rows3, LayoutList } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  "1x4": <LayoutList size={18} />,
  "2x2": <Grid2X2 size={18} />,
  "2x3": <Rows3 size={18} />,
  "2x4": <Grid3X3 size={18} />,
};

interface Props {
  selected: LayoutOption;
  onSelect: (layout: LayoutOption) => void;
  allowedLayouts?: LayoutOption[];
}

const LayoutSelector = ({ selected, onSelect, allowedLayouts }: Props) => {
  const layouts = allowedLayouts ?? LAYOUTS;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">Layout</p>
      <div className="flex flex-wrap justify-center gap-2">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
              selected.id === layout.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/50"
            }`}
          >
            {ICONS[layout.id]}
            {layout.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
