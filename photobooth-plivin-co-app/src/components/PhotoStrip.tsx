import { useRef, useState } from "react";
import { Camera, Download } from "lucide-react";
import {
  LayoutOption,
  StripCustomization,
  StickerItem,
  STRIP_FRAMES,
  STRIP_FILTER_CSS,
} from "@/types/layout";

interface Props {
  photos: string[];
  layout: LayoutOption;
  customization: StripCustomization;
  onReset: () => void;
  onChangeCustomization: (c: StripCustomization) => void;
}

const isLightColor = (hex: string) => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

const PhotoStrip = ({
  photos,
  layout,
  customization,
  onReset,
  onChangeCustomization,
}: Props) => {
  const stripRef = useRef<HTMLDivElement>(null);

  /* ===============================
     UPDATE STICKER STATE
  =============================== */
  const updateSticker = (id: string, data: Partial<StickerItem>) => {
    const updated = customization.stickers.map((s) =>
      s.id === id ? { ...s, ...data } : s
    );

    onChangeCustomization({
      ...customization,
      stickers: updated,
    });
  };

  /* ===============================
     EXPORT CANVAS (ROTATION SUPPORT)
  =============================== */
  const frame =
    STRIP_FRAMES.find((f) => f.id === customization.frameId) ?? STRIP_FRAMES[0];
  const effectiveBg = frame.bgColor ?? customization.bgColor;
  const filterCss = STRIP_FILTER_CSS[customization.filter];

  // ======================================
  // 📏 UNIFIED DIMENSIONS
  // ======================================
  // We use a base width for the photo and scale everything from there.
  // This ensures the aspect ratio is IDENTICAL between preview and canvas.
  const BASE_PHOTO_W = 600;
  const BASE_PHOTO_H = 450; // 4:3
  const BASE_BOTTOM_BAR = 120;
  const BASE_ACCENT = frame.accentBars ? 15 : 0;
  const BASE_ACCENT_GAP = frame.accentBars ? 12 : 0;
  const BASE_HEADER_SPACE = frame.headerText ? 60 : 0;

  const cols = layout.cols;
  const rows = layout.rows;

  const stripWidth = frame.padding * 2 + cols * BASE_PHOTO_W + (cols - 1) * frame.gap;
  const stripHeight =
    frame.padding * 2 +
    BASE_HEADER_SPACE +
    (BASE_ACCENT + BASE_ACCENT_GAP) * (frame.accentBars ? 2 : 0) +
    rows * BASE_PHOTO_H +
    (rows - 1) * frame.gap +
    BASE_BOTTOM_BAR;

  // For the preview UI, we scale down the master dimensions
  const PREVIEW_WIDTH = layout.cols === 1 ? 300 : 450;
  const previewScale = PREVIEW_WIDTH / stripWidth;

  /* ===============================
     EXPORT CANVAS (ROTATION SUPPORT)
  =============================== */
  const buildCanvas = async (): Promise<HTMLCanvasElement> => {
    // Quality scale for the final image (e.g. 2x for retina-like quality)
    const q = 2; 
    const canvas = document.createElement("canvas");
    canvas.width = stripWidth * q;
    canvas.height = stripHeight * q;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const s = (val: number) => val * q;

    // Outer rounded background (clipped)
    if (frame.outerRadius > 0) {
      ctx.beginPath();
      const r = s(frame.outerRadius);
      ctx.moveTo(r, 0);
      ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
      ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
      ctx.arcTo(0, canvas.height, 0, 0, r);
      ctx.arcTo(0, 0, canvas.width, 0, r);
      ctx.closePath();
      ctx.clip();
    }

    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    if (frame.borderWidth > 0) {
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = s(frame.borderWidth);
      ctx.strokeRect(
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        canvas.width - ctx.lineWidth,
        canvas.height - ctx.lineWidth
      );
    }

    // Top accent bar
    let currentY = s(frame.padding);
    if (frame.accentBars) {
      ctx.fillStyle = isLightColor(effectiveBg) ? "#000000" : "#ffffff";
      ctx.fillRect(s(frame.padding), currentY, canvas.width - s(frame.padding * 2), s(BASE_ACCENT));
      currentY += s(BASE_ACCENT + BASE_ACCENT_GAP);
    }

    // Header text
    if (frame.headerText) {
      await document.fonts.load(`${s(30)}px 'Krona One'`);
      ctx.font = `${s(22)}px 'Krona One', sans-serif`;
      ctx.fillStyle = isLightColor(effectiveBg) ? "#222222" : "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frame.headerText, canvas.width / 2, currentY + s(BASE_HEADER_SPACE / 2));
      currentY += s(BASE_HEADER_SPACE);
    }

    // Photos
    for (let i = 0; i < photos.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const img = new Image();
      img.src = photos[i];
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      const x = s(frame.padding + col * (BASE_PHOTO_W + frame.gap));
      const y = currentY + s(row * (BASE_PHOTO_H + frame.gap));

      const srcAspect = img.naturalWidth / img.naturalHeight;
      const destAspect = BASE_PHOTO_W / BASE_PHOTO_H;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      
      if (srcAspect > destAspect) {
        sw = img.naturalHeight * destAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / destAspect;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.save();
      if (frame.radius > 0) {
        const r = s(frame.radius);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + s(BASE_PHOTO_W), y, x + s(BASE_PHOTO_W), y + s(BASE_PHOTO_H), r);
        ctx.arcTo(x + s(BASE_PHOTO_W), y + s(BASE_PHOTO_H), x, y + s(BASE_PHOTO_H), r);
        ctx.arcTo(x, y + s(BASE_PHOTO_H), x, y, r);
        ctx.arcTo(x, y, x + s(BASE_PHOTO_W), y, r);
        ctx.closePath();
        ctx.clip();
      }
      ctx.filter = filterCss;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, s(BASE_PHOTO_W), s(BASE_PHOTO_H));
      ctx.filter = "none";
      ctx.restore();
    }

    const photosEndHeight = currentY + s(rows * BASE_PHOTO_H + (rows - 1) * frame.gap);

    // Bottom accent bar
    if (frame.accentBars) {
      ctx.fillStyle = isLightColor(effectiveBg) ? "#000000" : "#ffffff";
      ctx.fillRect(
        s(frame.padding),
        photosEndHeight + s(BASE_ACCENT_GAP),
        canvas.width - s(frame.padding * 2),
        s(BASE_ACCENT)
      );
    }

    // Watermark "plivin.co"
    ctx.font = `${s(32)}px 'Krona One', sans-serif`;
    ctx.fillStyle = isLightColor(effectiveBg) ? "#333333" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("plivin.co", canvas.width / 2, canvas.height - s(BASE_BOTTOM_BAR / 2));

    // Stickers
    for (const sticker of customization.stickers) {
      const sx = (sticker.x / 100) * canvas.width;
      const sy = (sticker.y / 100) * canvas.height;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      
      // Scale sticker size proportionally
      // In UI, sticker.size is in px relative to the preview.
      // So we convert it to "master" size then to "canvas" size.
      const masterSize = sticker.size / previewScale;
      ctx.font = `${s(masterSize)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    }

    return canvas;
  };

  /* ===============================
     DOWNLOAD + PRINT
  =============================== */
  const handleDownload = async () => {
    const canvas = await buildCanvas();

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const fileName = `plivin-photostrip-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files: File[]; title?: string }) => Promise<void>;
      };
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share!({ files: [file], title: "Plivin Photostrip" });
          return;
        } catch {
          // fallback
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(url, "_blank");
      }

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, "image/png");
  };

  const handlePrint = async () => {
    const canvas = await buildCanvas();
    const url = canvas.toDataURL("image/png");

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Print Photostrip</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${url}" onload="window.print();setTimeout(()=>window.close(), 500);" />
        </body>
      </html>
    `);
    w.document.close();
  };

  /* ===============================
     UI PREVIEW RENDER
  =============================== */
  const scale = (val: number) => val * previewScale;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* STRIP CONTAINER (PREVIEW) */}
      <div
        ref={stripRef}
        className="relative shadow-2xl transition-all duration-300"
        style={{
          width: PREVIEW_WIDTH,
          height: stripHeight * previewScale,
          backgroundColor: effectiveBg,
          padding: `${scale(frame.padding)}px`,
          borderRadius: `${scale(frame.outerRadius)}px`,
          border:
            frame.borderWidth > 0
              ? `${scale(frame.borderWidth)}px solid ${frame.borderColor}`
              : undefined,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        {frame.accentBars && (
          <div
            className="w-full"
            style={{
              height: scale(BASE_ACCENT),
              backgroundColor: isLightColor(effectiveBg) ? "#000000" : "#ffffff",
              marginBottom: scale(BASE_ACCENT_GAP),
            }}
          />
        )}

        {/* Header text */}
        {frame.headerText && (
          <div
            className="flex items-center justify-center text-center"
            style={{
              height: scale(BASE_HEADER_SPACE),
              fontFamily: "'Krona One', sans-serif",
              fontSize: `${scale(22)}px`,
              color: isLightColor(effectiveBg) ? "#222222" : "#ffffff",
            }}
          >
            {frame.headerText}
          </div>
        )}

        {/* Photos Grid */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gap: `${scale(frame.gap)}px`,
          }}
        >
          {photos.map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden w-full"
              style={{
                aspectRatio: "4/3",
                borderRadius: `${scale(frame.radius)}px`,
              }}
            >
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: filterCss,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom accent bar */}
        {frame.accentBars && (
          <div
            className="w-full"
            style={{
              height: scale(BASE_ACCENT),
              backgroundColor: isLightColor(effectiveBg) ? "#000000" : "#ffffff",
              marginTop: scale(BASE_ACCENT_GAP),
            }}
          />
        )}

        {/* Watermark */}
        <div
          className="flex items-center justify-center"
          style={{
            height: scale(BASE_BOTTOM_BAR),
            fontFamily: "'Krona One', sans-serif",
            fontSize: `${scale(32)}px`,
            color: isLightColor(effectiveBg) ? "#333333" : "#ffffff",
          }}
        >
          plivin.co
        </div>

        {/* Stickers */}
        {customization.stickers.map((s) => (
          <StickerPro key={s.id} sticker={s} onUpdate={updateSticker} />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownload}
          className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
        >
          <Download size={20} className="transition-transform group-hover:-translate-y-0.5" />
          Download
        </button>


        <button
          onClick={onReset}
          className="rounded-full bg-foreground px-8 py-3 text-background font-bold transition-all hover:opacity-90 active:scale-95"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

/* ======================================
   ✅ STICKER PRO COMPONENT
====================================== */
const StickerPro = ({
  sticker,
  onUpdate,
}: {
  sticker: StickerItem;
  onUpdate: (id: string, data: Partial<StickerItem>) => void;
}) => {
  const [selected, setSelected] = useState(false);

  /* ===============================
     DRAG MOVE
  =============================== */
  const handleMove = (e: React.PointerEvent) => {
    e.preventDefault();
    const parent = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = sticker.x;
    const initY = sticker.y;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onUpdate(sticker.id, {
        x: Math.max(0, Math.min(100, initX + (dx / parent.width) * 100)),
        y: Math.max(0, Math.min(100, initY + (dy / parent.height) * 100)),
      });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /* ===============================
     ROTATE DRAG HANDLE
  =============================== */
  const handleRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const move = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * (180 / Math.PI);
      onUpdate(sticker.id, { rotation: angle + 90 });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /* ===============================
     RESIZE DRAG HANDLE
  =============================== */
  const handleResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const startSize = sticker.size;

    const move = (ev: PointerEvent) => {
      const diff = ev.clientY - startY;
      onUpdate(sticker.id, {
        size: Math.max(16, startSize + diff * 0.5),
      });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      onClick={() => setSelected(true)}
      onPointerDown={handleMove}
      className="absolute select-none cursor-grab"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
        fontSize: `${sticker.size}px`,
      }}
    >
      {sticker.emoji}

      {/* Handles */}
      {selected && (
        <>
          {/* Rotate handle */}
          <div
            onPointerDown={handleRotate}
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border cursor-pointer"
          />

          {/* Resize handle */}
          <div
            onPointerDown={handleResize}
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full border cursor-se-resize"
          />
        </>
      )}
    </div>
  );
};

export default PhotoStrip;
