import { Camera, Sparkles } from "lucide-react";

interface Props {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: Props) => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 py-8 sm:gap-8">
      {/* Decorative sparkles */}
      <div className="flex items-center gap-3 animate-pulse">
        <Sparkles className="text-muted-foreground" size={14} />
        <Sparkles className="text-foreground" size={18} />
        <Sparkles className="text-muted-foreground" size={14} />
      </div>

      {/* Logo / Brand */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg sm:h-20 sm:w-20"
          style={{ background: "var(--gradient-button)" }}
        >
          <Camera className="text-primary-foreground" size={30} />
        </div>

        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "'Krona One', sans-serif" }}
        >
          plivin.co
        </h1>

        <p className="max-w-xs text-center text-xs text-muted-foreground sm:text-sm">
          Photo Booth Experience — Ambil foto keren, pilih filter, dan dapatkan
          photo strip digital kamu!
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {["📸 Foto Otomatis", "🎨 7+ Filter", "✨ Custom Strip", "📥 Download"].map(
          (f) => (
            <span
              key={f}
              className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-secondary-foreground sm:px-4 sm:py-1.5 sm:text-xs"
            >
              {f}
            </span>
          )
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="group flex items-center gap-2.5 rounded-full px-8 py-3.5 font-display text-base font-bold text-primary-foreground shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95 sm:px-10 sm:py-4 sm:text-lg"
        style={{ background: "var(--gradient-button)" }}
      >
        <Camera
          size={20}
          className="transition-transform group-hover:rotate-12"
        />
        Mulai Sekarang
      </button>

      {/* Bottom info */}
      <p className="text-[10px] text-muted-foreground sm:text-[11px]">
        Powered by <span className="font-bold">Plivin.Co</span> • Self-service
        Photo Booth
      </p>
    </div>
  );
};

export default WelcomeScreen;
