import { useRef, useState } from "react";
import { Camera, Download, Printer } from "lucide-react";
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

  const buildCanvas = async (): Promise<HTMLCanvasElement> => {
    const scale = window.devicePixelRatio || 2;
    const padding = frame.padding * scale;
    const gap = frame.gap * scale;
    const photoW = 260 * scale;
    const photoH = 195 * scale;
    const bottomBar = 50 * scale;
    const radius = frame.radius * scale;
    const outerRadius = frame.outerRadius * scale;
    const borderW = frame.borderWidth * scale;
    const accent = frame.accentBars ? 6 * scale : 0;

    const cols = layout.cols;
    const rows = layout.rows;

    const canvas = document.createElement("canvas");
    canvas.width = padding * 2 + cols * photoW + (cols - 1) * gap;
    canvas.height =
      padding + accent * 2 + rows * (photoH + gap) - gap + bottomBar + padding;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";

    // Outer rounded background (clipped)
    if (outerRadius > 0) {
      ctx.beginPath();
      const r = Math.min(outerRadius, canvas.width / 2, canvas.height / 2);
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
    if (borderW > 0) {
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, canvas.width - borderW, canvas.height - borderW);
    }

    // Top accent bar
    if (frame.accentBars) {
      ctx.fillStyle = isLightColor(effectiveBg) ? "#000000" : "#ffffff";
      ctx.fillRect(padding, padding, canvas.width - padding * 2, accent);
    }

    // Photos
    for (let i = 0; i < photos.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const img = new Image();
      img.src = photos[i];
      await new Promise((r) => {
        img.onload = r;
        img.onerror = r;
      });

      const destX = padding + col * (photoW + gap);
      const destY = padding + accent + row * (photoH + gap);

      const srcAspect = img.naturalWidth / img.naturalHeight;
      const destAspect = photoW / photoH;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcAspect > destAspect) {
        sw = img.naturalHeight * destAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / destAspect;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.save();
      // Clip rounded corners on photo
      if (radius > 0) {
        ctx.beginPath();
        const r = Math.min(radius, photoW / 2, photoH / 2);
        ctx.moveTo(destX + r, destY);
        ctx.arcTo(destX + photoW, destY, destX + photoW, destY + photoH, r);
        ctx.arcTo(destX + photoW, destY + photoH, destX, destY + photoH, r);
        ctx.arcTo(destX, destY + photoH, destX, destY, r);
        ctx.arcTo(destX, destY, destX + photoW, destY, r);
        ctx.closePath();
        ctx.clip();
      }
      // Apply filter
      ctx.filter = filterCss;
      ctx.drawImage(img, sx, sy, sw, sh, destX, destY, photoW, photoH);
      ctx.filter = "none";
      ctx.restore();
    }

    // Bottom accent bar
    if (frame.accentBars) {
      ctx.fillStyle = isLightColor(effectiveBg) ? "#000000" : "#ffffff";
      ctx.fillRect(
        padding,
        canvas.height - bottomBar - accent / 2,
        canvas.width - padding * 2,
        accent,
      );
    }

    // Header text (if any)
    await document.fonts.load(`${20 * scale}px 'Krona One'`);
    if (frame.headerText) {
      ctx.font = `${14 * scale}px 'Krona One', sans-serif`;
      ctx.fillStyle = isLightColor(effectiveBg) ? "#222222" : "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(frame.headerText, canvas.width / 2, padding / 3);
    }

    // Watermark "plivin.co"
    ctx.font = `${20 * scale}px 'Krona One', sans-serif`;
    ctx.fillStyle = isLightColor(effectiveBg) ? "#333333" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("plivin.co", canvas.width / 2, canvas.height - bottomBar / 2);

    // Stickers
    for (const sticker of customization.stickers) {
      const sx = (sticker.x / 100) * canvas.width;
      const sy = (sticker.y / 100) * canvas.height;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${sticker.size * scale}px serif`;
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

      // iOS Safari: use Web Share API since <a download> doesn't work reliably
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
          // user cancelled or share failed → fallback below
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

      // iOS fallback: open in new tab so user can long-press → Save Image
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
        <body style="margin:0;display:flex;justify-content:center;align-items:center;">
          <img src="${url}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    w.document.close();
  };

  /* ===============================
     UI GRID
  =============================== */
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
    gap: `${frame.gap}px`,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* STRIP */}
      <div
        ref={stripRef}
        className="relative shadow-lg overflow-hidden"
        style={{
          width: layout.cols === 1 ? 280 : 420,
          backgroundColor: effectiveBg,
          padding: `${frame.padding}px`,
          borderRadius: `${frame.outerRadius}px`,
          border:
            frame.borderWidth > 0
              ? `${frame.borderWidth}px solid ${frame.borderColor}`
              : undefined,
        }}
      >
        {/* Top accent bar */}
        {frame.accentBars && (
          <div
            className="mb-2 h-1.5 w-full"
            style={{
              backgroundColor: isLightColor(effectiveBg) ? "#000000" : "#ffffff",
            }}
          />
        )}

        {/* Header text */}
        {frame.headerText && (
          <div
            className="mb-2 text-center"
            style={{
              fontFamily: "'Krona One', sans-serif",
              fontSize: "11px",
              color: isLightColor(effectiveBg) ? "#222222" : "#ffffff",
            }}
          >
            {frame.headerText}
          </div>
        )}

        {/* Photos */}
        <div style={gridStyle}>
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-full object-cover"
              style={{
                aspectRatio: "4/3",
                borderRadius: `${frame.radius}px`,
                filter: filterCss,
              }}
            />
          ))}
        </div>

        {/* Bottom accent bar */}
        {frame.accentBars && (
          <div
            className="mt-2 h-1.5 w-full"
            style={{
              backgroundColor: isLightColor(effectiveBg) ? "#000000" : "#ffffff",
            }}
          />
        )}

        {/* Watermark */}
        <div
          className="text-center py-2"
          style={{
            fontFamily: "'Krona One', sans-serif",
            fontSize: "14px",
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

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleDownload}
          className="rounded-full bg-primary px-6 py-2.5 text-white font-semibold"
        >
          <Download size={18} className="inline mr-2" />
          Download
        </button>

        <button
          onClick={handlePrint}
          className="rounded-full border px-6 py-2.5 font-semibold"
        >
          <Printer size={18} className="inline mr-2" />
          Print
        </button>

        <button
          onClick={onReset}
          className="rounded-full border px-6 py-2.5 font-semibold"
        >
          <Camera size={18} className="inline mr-2" />
          Foto Lagi
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
        x: initX + (dx / parent.width) * 100,
        y: initY + (dy / parent.height) * 100,
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

    const centerX = e.clientX;
    const centerY = e.clientY;

    const startRotation = sticker.rotation;

    const move = (ev: PointerEvent) => {
      const angle =
        Math.atan2(ev.clientY - centerY, ev.clientX - centerX) *
        (180 / Math.PI);

      onUpdate(sticker.id, {
        rotation: startRotation + angle,
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
        size: Math.max(16, startSize + diff * 0.2),
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
