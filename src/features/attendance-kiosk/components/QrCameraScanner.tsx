import { useEffect, useRef, useState } from "react";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

import { Camera, CameraOff, LoaderCircle, ScanLine } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import { prepareKioskAudio } from "../lib/kiosk-audio";

// ─────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────

interface QrCameraScannerProps {
  disabled?: boolean;

  onScan: (value: string) => void | Promise<void>;
}

type CameraState = "idle" | "starting" | "active" | "error";

// ─────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────

export function QrCameraScanner({
  disabled = false,
  onScan,
}: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const controlsRef = useRef<IScannerControls | null>(null);

  const disabledRef = useRef(disabled);

  const onScanRef = useRef(onScan);

  const lastScanRef = useRef<{
    value: string;
    timestamp: number;
  }>({
    value: "",
    timestamp: 0,
  });

  const [cameraState, setCameraState] = useState<CameraState>("idle");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * Solo sincronizamos refs.
   * No sincronizamos estado/formularios
   * mediante effects.
   */
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  /*
   * Liberar cámara al desmontar.
   */
  useEffect(() => {
    return () => {
      controlsRef.current?.stop();

      controlsRef.current = null;
    };
  }, []);

  // ───────────────────────────────────────────────────
  // Start
  // ───────────────────────────────────────────────────

  const startCamera = async () => {
    if (cameraState === "starting" || cameraState === "active") {
      return;
    }

    setErrorMessage(null);

    if (!window.isSecureContext) {
      setCameraState("error");

      setErrorMessage("La cámara requiere una conexión HTTPS segura.");

      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");

      setErrorMessage("Este navegador no permite acceder a la cámara.");

      return;
    }

    if (!videoRef.current) {
      return;
    }

    setCameraState("starting");

    try {
      /*
       * El gesto del usuario que inicia la
       * cámara también habilita el audio.
       */
      await prepareKioskAudio();

      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 120,

        delayBetweenScanSuccess: 500,
      });

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,

          video: {
            facingMode: {
              ideal: "environment",
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },
        },

        videoRef.current,

        (result) => {
          if (!result || disabledRef.current) {
            return;
          }

          const value = result.getText().trim();

          if (!value) {
            return;
          }

          /*
           * Protección local contra el mismo QR
           * permaneciendo frente a la cámara.
           *
           * Laravel sigue siendo la autoridad
           * definitiva para duplicados.
           */
          const now = Date.now();

          const previous = lastScanRef.current;

          if (previous.value === value && now - previous.timestamp < 4000) {
            return;
          }

          lastScanRef.current = {
            value,
            timestamp: now,
          };

          void onScanRef.current(value);
        },
      );

      controlsRef.current = controls;

      setCameraState("active");
    } catch (error) {
      controlsRef.current?.stop();

      controlsRef.current = null;

      setCameraState("error");

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage(
          "El permiso de cámara fue rechazado. Habilítalo desde la configuración del navegador.",
        );

        return;
      }

      if (error instanceof DOMException && error.name === "NotFoundError") {
        setErrorMessage("No se encontró una cámara disponible.");

        return;
      }

      setErrorMessage("No fue posible iniciar la cámara.");
    }
  };

  // ───────────────────────────────────────────────────
  // Stop
  // ───────────────────────────────────────────────────

  const stopCamera = () => {
    controlsRef.current?.stop();

    controlsRef.current = null;

    setCameraState("idle");
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="size-full object-cover"
        />

        {/* Scan frame */}

        {cameraState === "active" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative aspect-square w-[58%] max-w-80 rounded-3xl border-2 border-white/80">
              <span className="absolute left-0 top-0 size-8 -translate-x-0.5 -translate-y-0.5 border-l-4 border-t-4 border-white" />

              <span className="absolute right-0 top-0 size-8 translate-x-0.5 -translate-y-0.5 border-r-4 border-t-4 border-white" />

              <span className="absolute bottom-0 left-0 size-8 -translate-x-0.5 translate-y-0.5 border-b-4 border-l-4 border-white" />

              <span className="absolute bottom-0 right-0 size-8 translate-x-0.5 translate-y-0.5 border-b-4 border-r-4 border-white" />

              <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 bg-white/80" />
            </div>
          </div>
        )}

        {/* Idle */}

        {cameraState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 p-6 text-center">
            <Camera className="size-14 text-muted-foreground" />

            <div>
              <p className="text-lg font-semibold">Cámara desactivada</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Activa la cámara para comenzar a registrar asistencias.
              </p>
            </div>

            <Button type="button" size="lg" onClick={startCamera}>
              <Camera className="size-5" />
              Activar cámara
            </Button>
          </div>
        )}

        {/* Starting */}

        {cameraState === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90">
            <LoaderCircle className="size-10 animate-spin" />

            <p className="font-medium">Iniciando cámara...</p>
          </div>
        )}

        {/* Busy */}

        {cameraState === "active" && disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <div className="flex items-center gap-2 rounded-full bg-background px-5 py-3 font-medium shadow-lg">
              <LoaderCircle className="size-5 animate-spin" />
              Procesando...
            </div>
          </div>
        )}
      </div>

      {/* State */}

      {cameraState === "active" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ScanLine className="size-4" />
            Apunta el código QR hacia el centro.
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopCamera}
          >
            <CameraOff className="size-4" />
            Detener
          </Button>
        </div>
      )}

      {cameraState === "error" && errorMessage && (
        <Alert variant="destructive">
          <CameraOff className="size-4" />

          <AlertTitle>Cámara no disponible</AlertTitle>

          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
