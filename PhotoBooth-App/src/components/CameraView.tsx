import { useEffect, useState, useCallback } from "react";
import { Camera, Sparkles, Upload } from "lucide-react";
import { useCamera, FilterType, FILTER_CSS } from "@/hooks/useCamera";
import FilterSelector from "./FilterSelector";
import LayoutSelector from "./LayoutSelector";
import StripCustomizer from "./StripCustomizer";
import PhotoStrip from "./PhotoStrip";
import { LayoutOption, LAYOUTS, StripCustomization } from "@/types/layout";
import { toast } from "sonner";
import { savePhoto } from "@/lib/photoStorage";

const CameraView = () => {
  const { videoRef, canvasRef, startCamera, capturePhoto, isReady, error } =
    useCamera();

  const [filter, setFilter] = useState<FilterType>("normal");
  const [layout, setLayout] = useState<LayoutOption>(LAYOUTS[0]);

  const [customization, setCustomization] = useState<StripCustomization>({
    bgColor: "#1a1a1a",
    stickers: [],
    frameId: "classic",
    filter: "normal",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [captureIndex, setCaptureIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // ✅ NEW: countdown select option (1–10)
  const [timerOption, setTimerOption] = useState(3);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // ===============================
  // ✅ CAMERA CAPTURE WITH SELECT TIMER
  // ===============================
  const startCapture = useCallback(() => {
    if (isCapturing) return;

    setIsCapturing(true);
    setPhotos([]);
    setCaptureIndex(0);

    let photosTaken = 0;
    const total = layout.totalPhotos;

    const captureNext = () => {
      if (photosTaken >= total) {
        setIsCapturing(false);
        setCountdown(null);
        return;
      }

      let count = timerOption;
      setCountdown(count);
      setCaptureIndex(photosTaken + 1);

      const interval = setInterval(() => {
        count--;

        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);

          setCountdown(null);
          setFlash(true);
          setTimeout(() => setFlash(false), 200);

          const photo = capturePhoto(filter);
          if (photo) {
            setPhotos((prev) => [...prev, photo]);
            // Save to cloud storage in background
            savePhoto(photo, layout.id);
          }

          photosTaken++;
          setTimeout(captureNext, 800);
        }
      }, 1000);
    };

    captureNext();
  }, [isCapturing, capturePhoto, filter, layout.totalPhotos, timerOption]);

  // ===============================
  // ✅ MULTIPLE UPLOAD (4 PHOTO ONLY)
  // ===============================
  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length !== 4) {
      toast.error("Upload harus tepat 4 foto ya bro!", {
        position: "top-center",
        style: {
          background: "hsl(var(--foreground))",
          color: "hsl(var(--background))",
          fontWeight: "700",
          borderRadius: "16px",
          padding: "14px 22px",
          textAlign: "center",
        },
      });

      return;
    }

    const uploadedPhotos: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          uploadedPhotos.push(reader.result.toString());

          // kalau udah 4 langsung masuk
          if (uploadedPhotos.length === 4) {
            setPhotos(uploadedPhotos);
          }
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleReset = () => {
    setPhotos([]);
    setCaptureIndex(0);
    setIsCapturing(false);

    window.location.reload();
  };

  // ===============================
  // ✅ RESULT STRIP PAGE
  // ===============================
  if (photos.length === layout.totalPhotos && !isCapturing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <h2 className="font-display text-lg font-bold text-foreground">
            Customize Strip
          </h2>
          <Sparkles className="text-primary" size={20} />
        </div>

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          <PhotoStrip
            photos={photos}
            layout={layout}
            customization={customization}
            onReset={handleReset}
            onChangeCustomization={setCustomization}
          />

          <StripCustomizer
            customization={customization}
            onChange={setCustomization}
          />
        </div>
      </div>
    );
  }

  // ===============================
  // ✅ MAIN CAMERA PAGE
  // ===============================
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary" size={24} />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Photo Booth
        </h1>
        <Sparkles className="text-primary" size={24} />
      </div>

      {/* ✅ TIMER SELECT */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-muted-foreground">
          Pilih Countdown Timer
        </p>

        <select
          value={timerOption}
          onChange={(e) => setTimerOption(Number(e.target.value))}
          className="rounded-lg border px-4 py-2 text-sm shadow-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} detik
            </option>
          ))}
        </select>
      </div>

      {/* ✅ UPLOAD MULTIPLE PHOTO */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-muted-foreground">
          Upload 4 Foto Langsung Jadi Strip
        </p>

        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-bold shadow hover:brightness-110">
          <Upload size={18} />
          Upload 4 Photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUploadPhotos}
          />
        </label>
      </div>

      {/* CAMERA VIEW */}
      <div
        className="relative overflow-hidden rounded-2xl bg-card shadow-xl"
        style={{ maxWidth: 500, width: "100%" }}
      >
        <div className="h-2 w-full" style={{ background: "var(--gradient-pink)" }} />

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="block w-full"
            style={{
              filter: FILTER_CSS[filter],
              transform: "scaleX(-1)",
            }}
          />

          {flash && (
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-primary-foreground/80" />
          )}

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <span className="font-display text-7xl font-bold text-primary-foreground drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}

          {isCapturing && (
            <div className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {captureIndex}/{layout.totalPhotos}
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4">
              <p className="text-center text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <div className="h-2 w-full" style={{ background: "var(--gradient-pink)" }} />
      </div>

      {/* START BUTTON */}
      <button
        onClick={startCapture}
        disabled={!isReady || isCapturing}
        className="flex items-center gap-2 rounded-full px-8 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
        style={{ background: "var(--gradient-button)" }}
      >
        <Camera size={22} />
        {isCapturing ? "Capturing..." : "Start Capture"}
      </button>

      <LayoutSelector selected={layout} onSelect={setLayout} />
      <FilterSelector selected={filter} onSelect={setFilter} />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
