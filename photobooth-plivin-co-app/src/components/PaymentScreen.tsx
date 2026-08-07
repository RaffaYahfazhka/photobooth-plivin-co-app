import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Clock, QrCode, Wallet, CreditCard, PlusCircle } from "lucide-react";
import { BoothPackage } from "@/types/layout";

interface Props {
  selectedPackage: BoothPackage;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const TOP_UP_OPTIONS = [25000, 50000, 100000, 150000, 200000];

const PaymentScreen = ({ selectedPackage, onPaymentSuccess, onBack }: Props) => {
  const [credit, setCredit] = useState(() => {
    // Load from local storage
    const saved = localStorage.getItem("pb_credit");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [view, setView] = useState<"select_method" | "qris_package" | "top_up_select" | "qris_topup" | "success">("select_method");
  
  // Specific states for flows
  const [topUpNominal, setTopUpNominal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync credit to explicit localstorage
  const updateCredit = (newVal: number) => {
    setCredit(newVal);
    localStorage.setItem("pb_credit", newVal.toString());
  };

  // Timer for QRIS views
  useEffect(() => {
    if ((view !== "qris_package" && view !== "qris_topup") || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, view]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handlePayCredit = async () => {
    if (credit < selectedPackage.price) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateCredit(credit - selectedPackage.price);
    setIsProcessing(false);
    setView("success");
    setTimeout(() => onPaymentSuccess(), 1500);
  };

  const startTopUp = (nominal: number) => {
    setTopUpNominal(nominal);
    setTimeLeft(300);
    setView("qris_topup");
  };

  const simulateQRISPayment = async (isTopUp: boolean) => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);

    if (isTopUp) {
      updateCredit(credit + topUpNominal);
      setView("select_method"); // return to select method after top up
    } else {
      setView("success");
      setTimeout(() => onPaymentSuccess(), 1500);
    }
  };

  // --- VIEWS ---

  if (view === "success") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 sm:h-24 sm:w-24">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Pembayaran Berhasil!
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Mempersiapkan Photo Booth...
          </p>
        </div>
      </div>
    );
  }

  if (view === "qris_topup" || view === "qris_package") {
    const isTopUp = view === "qris_topup";
    const title = isTopUp ? "Top Up Saldo Credit" : "Pembayaran QRIS";
    const amount = isTopUp ? topUpNominal : selectedPackage.price;

    if (timeLeft <= 0) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 p-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-lg sm:p-8">
            <Clock size={40} className="text-destructive" />
            <h2 className="font-display text-base font-bold text-destructive sm:text-lg">
              Waktu Habis
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Sesi QRIS telah berakhir.
            </p>
            <button
              onClick={() => setView("select_method")}
              className="mt-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-all hover:scale-105"
            >
              Kembali
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 p-4">
        <button
          onClick={() => setView(isTopUp ? "top_up_select" : "select_method")}
          className="fixed left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow transition-all hover:bg-secondary/80 sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
        >
          <ArrowLeft size={14} />
          Batal
        </button>

        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg sm:gap-5 sm:p-6">
          <div className="text-center">
            <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Scan QR code di bawah untuk {isTopUp ? "top up" : "membayar"}
            </p>
          </div>

          <div className="flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="text-xs font-semibold text-secondary-foreground sm:text-sm">
              Total Tagihan
            </span>
            <span className="font-display text-base font-bold text-foreground sm:text-lg">
              {formatPrice(amount)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background sm:h-52 sm:w-52">
              <div className="grid grid-cols-8 grid-rows-8 gap-[2px]">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3.5 w-3.5 rounded-[1px] sm:h-4 sm:w-4 sm:rounded-[2px] ${
                      [0,1,2,3,4,5,6,7,8,14,15,16,22,23,24,30,31,40,41,42,43,48,49,55,56,57,58,59,60,61,62,63,9,18,27,36,45,54,13,20,29,34,47,50].includes(i)
                        ? "bg-foreground"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <div className="absolute flex h-9 w-9 items-center justify-center rounded-lg bg-background shadow sm:h-10 sm:w-10">
                <QrCode size={18} className="text-foreground" />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground sm:text-[10px]">
              QRIS • Dummy Mode
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 sm:px-4 sm:py-1.5">
            <Clock size={12} className="text-muted-foreground" />
            <span className={`text-xs font-bold sm:text-sm ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => simulateQRISPayment(isTopUp)}
            disabled={isProcessing}
            className="w-full rounded-full bg-foreground py-2.5 text-sm font-bold text-background transition-all hover:scale-105 active:scale-95 disabled:opacity-50 sm:py-3"
          >
            {isProcessing ? "Memproses..." : "Simulasi Bayar QRIS"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "top_up_select") {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 p-4">
        <button
          onClick={() => setView("select_method")}
          className="fixed left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow transition-all hover:bg-secondary/80 sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>

        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
          <div className="flex items-center justify-center gap-3">
            <Wallet size={24} className="text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Top Up Credit</h2>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Pilih nominal top up (Pembayaran via QRIS Dummy)
          </p>

          <div className="grid w-full grid-cols-2 gap-3 mt-2">
            {TOP_UP_OPTIONS.map((nom) => (
              <button
                key={nom}
                onClick={() => startTopUp(nom)}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-secondary/30 p-3 hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
              >
                <span className="font-bold">{formatPrice(nom)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW: select_method ---
  const canAfford = credit >= selectedPackage.price;

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 p-4">
      <button
        onClick={onBack}
        className="fixed left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow transition-all hover:bg-secondary/80 sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
      >
        <ArrowLeft size={14} />
        Kembali ke Paket
      </button>

      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground">Checkout</h2>
          <p className="text-sm text-muted-foreground mt-1">Pilih metode pembayaran</p>
        </div>

        {/* Invoice Summary */}
        <div className="flex flex-col gap-3 rounded-2xl bg-secondary/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Paket Pilihan</span>
            <span className="text-sm font-bold">{selectedPackage.name}</span>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <span className="font-bold">Total Tagihan</span>
            <span className="font-display text-lg font-bold text-foreground">
              {formatPrice(selectedPackage.price)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-4">
          {/* Method 1: Credit */}
          <div className={`relative flex flex-col gap-3 rounded-2xl border-2 p-4 transition-all ${
            canAfford ? "border-primary/20 bg-primary/5" : "border-border bg-card"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className={canAfford ? "text-primary" : "text-muted-foreground"} size={20} />
                <span className="font-bold">Saldo Credit</span>
              </div>
              <span className="font-bold">{formatPrice(credit)}</span>
            </div>

            {canAfford ? (
              <button
                onClick={handlePayCredit}
                disabled={isProcessing}
                className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "Memproses..." : "Bayar pakai Credit"}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-destructive">
                  Saldo tidak cukup untuk paket ini.
                </span>
                <button
                  onClick={() => setView("top_up_select")}
                  className="flex items-center justify-center gap-1.5 w-full rounded-full border-2 border-foreground bg-card py-2 text-sm font-bold text-foreground transition-all hover:bg-secondary active:scale-95"
                >
                  <PlusCircle size={16} />
                  Top Up Saldo
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-border" />
            <span className="text-xs font-semibold text-muted-foreground">ATAU</span>
            <hr className="flex-1 border-border" />
          </div>

          {/* Method 2: QRIS Direct */}
          <button
            onClick={() => {
              setTimeLeft(300);
              setView("qris_package");
            }}
            className="flex items-center justify-between rounded-2xl border-2 border-border bg-card p-4 transition-all hover:border-foreground/30 active:scale-95"
          >
            <div className="flex items-center gap-2">
              <QrCode size={20} />
              <span className="font-bold">Bayar via QRIS</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Langsung bayar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
