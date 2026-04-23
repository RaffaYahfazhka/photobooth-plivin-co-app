import { useEffect, useState, useCallback, useRef } from "react";
import { Camera, Sparkles, RotateCcw, Lock, Upload, Download } from "lucide-react";
import { useCamera, FilterType, FILTER_CSS } from "@/hooks/useCamera";
import FilterSelector from "./FilterSelector";
import LayoutSelector from "./LayoutSelector";
import StripCustomizer from "./StripCustomizer";
import PhotoStrip from "./PhotoStrip";
import {
  LayoutOption,
  LAYOUTS,
  StripCustomization,
  BoothSession,
} from "@/types/layout";
import { savePhoto } from "@/lib/photoStorage";

interface Props {
  boothSession: BoothSession;
  onRetake: () => void;
  onDone: () => void;
  onReset: () => void;
}

const CameraView = ({ boothSession, onRetake, onDone, onReset }: Props) => {
  const { videoRef, canvasRef, startCamera, capturePhoto, isReady, error, stream } =
    useCamera();

  const pkg = boothSession.selectedPackage!;
  const retakesRemaining = pkg.maxRetakes - boothSession.retakesUsed;

  const allowedLayouts = LAYOUTS.filter((l) =>
    pkg.allowedLayouts.includes(l.id)
  );

  const [filter, setFilter] = useState<FilterType>("normal");
  const [layout, setLayout] = useState<LayoutOption>(allowedLayouts[0]);
  const [filterLocked, setFilterLocked] = useState(false);

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
  const [timerOption, setTimerOption] = useState(3);

  // Per-photo retake state
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);

  // Freeze frame preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Video recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedVideos, setRecordedVideos] = useState<string[]>([]);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // ===============================
  // CAMERA CAPTURE (full session)
  // ===============================
  const startCapture = useCallback(() => {
    if (isCapturing) return;

    setIsCapturing(true);
    setFilterLocked(true);
    setPhotos([]);
    setRecordedVideos([]); // Reset videos
    setCaptureIndex(0);

    let photosTaken = 0;
    const total = layout.totalPhotos;

    const captureNext = () => {
      if (photosTaken >= total) {
        setIsCapturing(false);
        setCountdown(null);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        return;
      }

      let count = timerOption;
      setCountdown(count);
      setCaptureIndex(photosTaken + 1);

      if (stream) {
        let currentChunks: Blob[] = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) currentChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const type = currentChunks[0]?.type || 'video/webm';
          const blob = new Blob(currentChunks, { type });
          const url = URL.createObjectURL(blob);
          setRecordedVideos(prev => [...prev, url]);
        };
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }

          setFlash(true);
          setTimeout(() => setFlash(false), 200);

          const photo = capturePhoto(filter);
          if (photo) {
            setPhotos((prev) => [...prev, photo]);
            savePhoto(photo, layout.id);
            
            // Show preview screen
            setPreviewImage(photo);
            setTimeout(() => {
              setPreviewImage(null);
              photosTaken++;
              captureNext();
            }, 1500);
          } else {
            photosTaken++;
            captureNext();
          }
        }
      }, 1000);
    };

    captureNext();
  }, [isCapturing, capturePhoto, filter, layout.totalPhotos, layout.id, timerOption, stream]);

  // ===============================
  // UPLOAD PHOTOS
  // ===============================
  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalNeeded = layout.totalPhotos;
    if (files.length !== totalNeeded) {
      alert(`Mohon pilih tepat ${totalNeeded} foto sesuai dengan layout yang dipilih.`);
      // Reset the input value
      e.target.value = '';
      return;
    }

    const newPhotos: string[] = [];
    let loaded = 0;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPhotos[idx] = ev.target.result as string;
        }
        loaded++;
        if (loaded === files.length) {
          setFilterLocked(true);
          setPhotos(Array.from(newPhotos)); // Ensure it's a standard dense array
          setIsCapturing(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ===============================
  // PER-PHOTO RETAKE
  // ===============================
  const startRetakeSingle = (index: number) => {
    if (retakesRemaining <= 0) return;
    setRetakeIndex(index);
    setIsRetaking(true);
  };

  const handleUploadSingleRetake = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || retakeIndex === null) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPhotos((prev) => {
          const updated = [...prev];
          updated[retakeIndex] = ev.target.result as string;
          return updated;
        });
        onRetake(); // consume 1 retake
        setIsRetaking(false);
        setRetakeIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const captureSingleRetake = useCallback(() => {
    if (retakeIndex === null) return;

    setCountdown(timerOption);
    let count = timerOption;

    if (stream) {
      let currentChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) currentChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const type = currentChunks[0]?.type || 'video/webm';
        const blob = new Blob(currentChunks, { type });
        const url = URL.createObjectURL(blob);
        setRecordedVideos(prev => {
          const newArr = [...prev];
          newArr[retakeIndex!] = url;
          return newArr;
        });
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    }

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        const photo = capturePhoto(filter);
        if (photo) {
          setPhotos((prev) => {
            const updated = [...prev];
            updated[retakeIndex] = photo;
            return updated;
          });
          
          setPreviewImage(photo);
          setTimeout(() => {
            setPreviewImage(null);
            onRetake(); // consume 1 retake
            setIsRetaking(false);
            setRetakeIndex(null);
          }, 1500);
        }
      }
    }, 1000);
  }, [retakeIndex, timerOption, capturePhoto, filter, onRetake, stream]);

  const cancelRetake = () => {
    setIsRetaking(false);
    setRetakeIndex(null);
  };

  const handleFinish = () => {
    onReset();
  };

  const allowedCameraFilters: FilterType[] = pkg.allowedFilters as FilterType[];

  // ===============================
  // RETAKE SINGLE PHOTO MODE
  // ===============================
  if (isRetaking && retakeIndex !== null) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-4">
        <div className="flex flex-col items-center gap-1">
          <h2 className="font-display text-lg font-bold text-foreground">
            Foto Ulang #{retakeIndex + 1}
          </h2>
          <span className="text-xs text-muted-foreground">
            Retake tersisa setelah ini: {retakesRemaining - 1}x
          </span>
        </div>

        {/* Camera */}
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-card shadow-xl"
          style={{ maxWidth: 420 }}
        >
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-pink)" }} />
          <div className="relative">
            <video
              ref={(node) => {
                (videoRef as any).current = node;
                if (node && stream && node.srcObject !== stream) {
                  node.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              muted
              className="block w-full"
              style={{
                filter: FILTER_CSS[filter],
                transform: "scaleX(-1)",
              }}
            />
            {previewImage && (
              <div className="absolute inset-0 z-10 bg-black">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {flash && (
              <div className="pointer-events-none absolute inset-0 z-20 animate-pulse bg-primary-foreground/80" />
            )}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                <span className="font-display text-6xl font-bold text-primary-foreground drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            )}
          </div>
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-pink)" }} />
        </div>

        {/* Buttons */}
        <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">
          <button
            onClick={captureSingleRetake}
            disabled={!isReady || countdown !== null}
            className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 disabled:opacity-50 sm:w-auto"
            style={{ background: "var(--gradient-button)" }}
          >
            <Camera size={18} />
            Ambil Foto
          </button>

          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary/20 bg-secondary px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary/80 sm:w-auto">
            <Upload size={16} />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadSingleRetake}
            />
          </label>

          <button
            onClick={cancelRetake}
            className="w-full rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold transition-all hover:bg-secondary sm:w-auto"
          >
            Batal
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ===============================
  // RESULT STRIP PAGE (CUSTOMIZE)
  // ===============================
  if (photos.length === layout.totalPhotos && !isCapturing) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center gap-5 px-4 py-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={18} />
          <h2 className="font-display text-lg font-bold text-foreground">
            Customize Strip
          </h2>
          <Sparkles className="text-primary" size={18} />
        </div>

        {/* Per-photo retake thumbnails */}
        {retakesRemaining > 0 && (
          <div className="w-full max-w-md">
            <p className="mb-2 text-center text-xs font-semibold text-muted-foreground">
              Tap foto yang ingin diulang ({retakesRemaining}x retake tersisa)
            </p>
            <div className="flex justify-center gap-2 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => startRetakeSingle(i)}
                  className="group relative shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary"
                  style={{ width: 64, height: 48 }}
                >
                  <img
                    src={src}
                    alt={`Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                    style={{ filter: FILTER_CSS[filter] }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-all group-hover:bg-foreground/40">
                    <RotateCcw
                      size={16}
                      className="text-white opacity-0 transition-all group-hover:opacity-100"
                    />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-foreground/60 px-1 text-[8px] font-bold text-white">
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {retakesRemaining <= 0 && (
          <span className="rounded-full bg-secondary px-4 py-1.5 text-[11px] font-semibold text-muted-foreground">
            Retake tidak tersedia
          </span>
        )}

        <div className="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center">
          <PhotoStrip
            photos={photos}
            layout={layout}
            customization={customization}
            onReset={handleFinish}
            onChangeCustomization={setCustomization}
          />
          
          <div className="flex flex-col gap-5 w-full max-w-sm lg:max-w-xs">
            <StripCustomizer
              customization={customization}
              onChange={setCustomization}
            />

            {/* BEHIND THE SCENES VIDEO */}
            {recordedVideos.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="flex w-full items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Camera size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold">Behind The Scenes</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">Video per-take berhasil direkam!</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {recordedVideos.map((url, i) => (
                    <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-secondary shadow-sm">
                      <span className="absolute top-1 left-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">#{i + 1}</span>
                      <video
                        src={url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ filter: FILTER_CSS[filter], transform: "scaleX(-1)" }}
                      />
                      <a
                        href={url}
                        download={`photobooth_bts_take_${i + 1}.webm`}
                        className="absolute bottom-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white shadow backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
                        title={`Download Video Take #${i + 1}`}
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // MAIN CAMERA PAGE
  // ===============================
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Photo Booth
          </h1>
          <Sparkles className="text-primary" size={20} />
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
          Paket {pkg.name} • Retake: {retakesRemaining}x
        </span>
      </div>

      {/* Timer select */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Timer</span>
        <select
          value={timerOption}
          onChange={(e) => setTimerOption(Number(e.target.value))}
          className="rounded-lg border bg-card px-3 py-1.5 text-sm shadow-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}s
            </option>
          ))}
        </select>
      </div>

      {/* Camera view */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-card shadow-xl"
        style={{ maxWidth: 480 }}
      >
        <div className="h-1.5 w-full" style={{ background: "var(--gradient-pink)" }} />

        <div className="relative">
          <video
            ref={(node) => {
              (videoRef as any).current = node;
              if (node && stream && node.srcObject !== stream) {
                node.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            muted
            className="block w-full"
            style={{
              filter: FILTER_CSS[filter],
              transform: "scaleX(-1)",
            }}
          />

          {previewImage && (
            <div className="absolute inset-0 z-10 bg-black">
              <img
                src={previewImage}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {flash && (
            <div className="pointer-events-none absolute inset-0 z-20 animate-pulse bg-primary-foreground/80" />
          )}

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <span className="font-display text-6xl font-bold text-primary-foreground drop-shadow-lg sm:text-7xl">
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

        <div className="h-1.5 w-full" style={{ background: "var(--gradient-pink)" }} />
      </div>

      {/* Action Buttons */}
      <div className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-md sm:flex-row sm:justify-center">
        {/* Start button */}
        <button
          onClick={startCapture}
          disabled={!isReady || isCapturing}
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-display font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 sm:w-auto sm:px-8 sm:text-base md:text-lg"
          style={{ background: "var(--gradient-button)" }}
        >
          <Camera size={18} className="sm:size-5" />
          {isCapturing ? "Capturing..." : "Start Capture"}
        </button>

        {/* Upload button */}
        {!isCapturing && (
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-primary/20 bg-secondary px-5 py-3 text-sm font-display font-bold text-foreground transition-all hover:bg-secondary/80 sm:w-auto sm:px-6 md:text-base">
            <Upload size={16} className="sm:size-5" />
            <span>Upload Foto</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleUploadPhotos}
            />
          </label>
        )}
      </div>

      {/* Layout (only before capture) */}
      {!filterLocked && (
        <LayoutSelector
          selected={layout}
          onSelect={setLayout}
          allowedLayouts={allowedLayouts}
        />
      )}

      {/* Filter (locked after first capture) */}
      {filterLocked ? (
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground">
          <Lock size={12} />
          Filter: {filter === "normal" ? "Normal" : filter.toUpperCase()} (terkunci)
        </div>
      ) : (
        <FilterSelector
          selected={filter}
          onSelect={setFilter}
          allowedFilters={allowedCameraFilters}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
