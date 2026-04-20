import { useRef, useState, useCallback, useEffect } from "react";

export type FilterType = "normal" | "bw" | "country" | "vintage" | "soft" | "intax" | "dv";

export const FILTER_CSS: Record<FilterType, string> = {
  normal: "none",
  bw: "grayscale(1) contrast(1.1)",
  country: "sepia(0.4) saturate(1.3) brightness(1.05)",
  vintage: "sepia(0.6) contrast(0.9) brightness(0.95) saturate(0.8)",
  soft: "brightness(1.08) contrast(0.92) saturate(0.9) blur(0.3px)",
  intax: "contrast(1.1) saturate(1.2) brightness(1.05)",
  dv: "grayscale(0.3) contrast(1.3) brightness(0.9) saturate(0.7)",
};

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch (e) {
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsReady(false);
  }, [stream]);

  const capturePhoto = useCallback(
    (filter: FilterType): string | null => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = FILTER_CSS[filter];
      // No mirror - draw directly
      ctx.drawImage(video, 0, 0);
      ctx.filter = "none";
      return canvas.toDataURL("image/png");
    },
    []
  );

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  return { videoRef, canvasRef, startCamera, stopCamera, capturePhoto, isReady, error };
}
