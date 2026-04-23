import { ArrowLeft, Check, Crown, Star, Zap } from "lucide-react";
import { BoothPackage, BOOTH_PACKAGES } from "@/types/layout";

interface Props {
  onSelect: (pkg: BoothPackage) => void;
  onBack: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  basic: <Zap size={22} />,
  standard: <Star size={22} />,
  premium: <Crown size={22} />,
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const PackageSelector = ({ onSelect, onBack }: Props) => {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow transition-all hover:bg-secondary/80 sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
      >
        <ArrowLeft size={14} />
        Kembali
      </button>

      <div className="flex flex-col items-center gap-1.5">
        <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
          Pilih Paket
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pilih paket yang sesuai kebutuhanmu
        </p>
      </div>

      {/* Package Cards — stack on mobile, row on sm+ */}
      <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-2xl sm:flex-row sm:gap-4">
        {BOOTH_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative flex flex-1 flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all hover:shadow-lg sm:gap-3 sm:p-5 ${
              pkg.popular
                ? "border-foreground bg-foreground text-background shadow-xl sm:scale-105"
                : "border-border bg-card text-foreground hover:border-foreground/30"
            }`}
          >
            {/* Popular badge */}
            {pkg.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-0.5 text-[9px] font-bold text-foreground shadow sm:text-[10px]">
                ⭐ POPULAR
              </div>
            )}

            {/* Icon */}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                pkg.popular ? "bg-background/20" : "bg-secondary"
              }`}
            >
              {ICONS[pkg.id]}
            </div>

            {/* Name & Price */}
            <div className="text-center">
              <h3 className="font-display text-base font-bold sm:text-lg">
                {pkg.name}
              </h3>
              <p
                className={`text-lg font-bold sm:text-xl ${
                  pkg.popular ? "text-background" : "text-foreground"
                }`}
              >
                {formatPrice(pkg.price)}
              </p>
            </div>

            {/* Features */}
            <ul className="flex w-full flex-col gap-1 text-left sm:gap-1.5">
              {pkg.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] sm:gap-2 sm:text-xs"
                >
                  <Check
                    size={12}
                    className={`mt-0.5 shrink-0 ${
                      pkg.popular
                        ? "text-background/70"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      pkg.popular
                        ? "text-background/90"
                        : "text-muted-foreground"
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => onSelect(pkg)}
              className={`mt-1 w-full rounded-full py-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 sm:mt-2 sm:py-2.5 ${
                pkg.popular
                  ? "bg-background text-foreground"
                  : "bg-foreground text-background"
              }`}
            >
              Pilih {pkg.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageSelector;
