import { useState } from "react";
import { LayoutOption, LAYOUTS, BoothSession } from "@/types/layout";
import { ChevronRight, LayoutList, Grid2X2, Rows3, Grid3X3, ArrowLeft } from "lucide-react";

interface Props {
  session: BoothSession;
  onSelect: (layout: LayoutOption) => void;
  onBack: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  "1x4": <LayoutList size={24} />,
  "2x2": <Grid2X2 size={24} />,
  "2x3": <Rows3 size={24} />,
  "2x4": <Grid3X3 size={24} />,
};

const SIZES: Record<string, string> = {
  "1x4": "2 x 6 inch",
  "2x2": "4 x 6 inch",
  "2x3": "4 x 6 inch",
  "2x4": "4 x 6 inch",
};

const EXAMPLES: Record<string, string[]> = {
  "1x4": [
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
  ],
  "2x2": [
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
  ],
  "2x3": [
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
  ],
  "2x4": [
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
    "bg-primary/20 aspect-[4/3] rounded-sm",
  ],
};

const LayoutSelectionScreen = ({ session, onSelect, onBack }: Props) => {
  const pkg = session.selectedPackage;
  if (!pkg) return null;

  const allowedLayouts = LAYOUTS.filter((l) => pkg.allowedLayouts.includes(l.id));
  const [selectedLayout, setSelectedLayout] = useState<LayoutOption>(allowedLayouts[0]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <div className="mb-8 flex flex-col gap-2 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Pilih Layout Foto
          </h2>
          <p className="text-sm text-muted-foreground">
            Pilih susunan foto untuk dicetak. Layout menentukan jumlah foto yang akan diambil.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {allowedLayouts.map((layout) => {
            const isSelected = selectedLayout.id === layout.id;
            
            return (
              <div
                key={layout.id}
                onClick={() => setSelectedLayout(layout)}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {ICONS[layout.id]}
                      </div>
                      <h3 className="font-bold text-lg">{layout.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {layout.totalPhotos} Foto • Ukuran {SIZES[layout.id]}
                    </p>
                  </div>
                  
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                  }`}>
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Photo Strip / Grid Preview Visualization */}
                <div className="flex justify-center w-full rounded-xl bg-white p-4 shadow-inner border border-black/5">
                  <div 
                    className="grid gap-1.5 p-2 bg-gray-100 rounded-md border"
                    style={{
                      gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                      width: layout.cols === 1 ? '100px' : '160px',
                    }}
                  >
                    {EXAMPLES[layout.id].map((classes, i) => (
                      <div key={i} className={classes} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => onSelect(selectedLayout)}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-lg font-bold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
            style={{ background: "var(--gradient-button)" }}
          >
            Lanjutkan
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelectionScreen;
