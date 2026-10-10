import { useCallback, useEffect, useRef, useState } from "react";

import { Expand, LogOut, ScanLine, Wifi, WifiOff } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { AttendanceScanFeedback } from "@/features/attendance-kiosk/components/AttendanceScanFeedback";

import { QrCameraScanner } from "@/features/attendance-kiosk/components/QrCameraScanner";

import { useAttendanceScan } from "@/features/attendance-kiosk/hooks/useAttendanceScan";

import { playKioskTone } from "@/features/attendance-kiosk/lib/kiosk-audio";

import type { AttendanceScanResponse } from "@/features/attendance-kiosk/types/attendance-scan.types";

import { getApiErrorMessage } from "@/utils/api-error";

import type { KioskCameraDevice } from "@/features/attendance-kiosk/components/QrCameraScanner";

import { useKeyboardQrScanner } from "@/features/attendance-kiosk/hooks/useKeyboardQrScanner";

import { useOnlineStatus } from "@/features/attendance-kiosk/hooks/useOnlineStatus";

import { useScreenWakeLock } from "@/features/attendance-kiosk/hooks/useScreenWakeLock";

import { useKioskPreferencesStore } from "@/features/attendance-kiosk/store/kiosk-preferences.store";
import { KioskSettingsDialog } from "@/features/attendance-kiosk/components/KioskSettingsDialog";

export function AttendanceKioskPage() {
  const navigate = useNavigate();

  const {
    mutateAsync: scanQr,

    isPending,
  } = useAttendanceScan();

  const [lastResult, setLastResult] = useState<AttendanceScanResponse | null>(
    null,
  );

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [locked, setLocked] = useState(false);

  const lockRef = useRef(false);

  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameras, setCameras] = useState<KioskCameraDevice[]>([]);

  const isOnline = useOnlineStatus();

  const cameraDeviceId = useKioskPreferencesStore(
    (state) => state.cameraDeviceId,
  );

  const soundEnabled = useKioskPreferencesStore((state) => state.soundEnabled);

  const vibrationEnabled = useKioskPreferencesStore(
    (state) => state.vibrationEnabled,
  );

  const keepScreenAwake = useKioskPreferencesStore(
    (state) => state.keepScreenAwake,
  );

  const keyboardScannerEnabled = useKioskPreferencesStore(
    (state) => state.keyboardScannerEnabled,
  );

  useScreenWakeLock(keepScreenAwake);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  const unlockAfterFeedback = useCallback(() => {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
    }

    unlockTimerRef.current = setTimeout(() => {
      lockRef.current = false;

      setLocked(false);
    }, 2500);
  }, []);

  const handleScan = useCallback(
    async (qr: string) => {
      if (lockRef.current) {
        return;
      }

      lockRef.current = true;

      setLocked(true);

      setConnectionError(null);

      try {
        if (!navigator.onLine) {
          setConnectionError(
            "El dispositivo se encuentra sin conexión de red.",
          );

          lockRef.current = false;

          setLocked(false);

          return;
        }

        const result = await scanQr({
          qr,
        });

        setLastResult(result);

        if (result.accepted) {
          if (
            result.attendance?.status === "late" ||
            result.attendance?.status === "early"
          ) {
            if (soundEnabled) {
              playKioskTone("warning");
            }
            if (vibrationEnabled) {
              navigator.vibrate?.([80, 60, 80]);
            }
          } else {
            if (soundEnabled) {
              playKioskTone("success");
            }

            if (vibrationEnabled) {
              navigator.vibrate?.(100);
            }
          }
        } else {
          if (soundEnabled) {
            playKioskTone(result.result === "duplicate" ? "warning" : "error");
          }
          if (vibrationEnabled) {
            navigator.vibrate?.([150, 80, 150]);
          }
        }
      } catch (error) {
        setConnectionError(
          getApiErrorMessage(
            error,
            "No fue posible comunicarse con el servidor.",
          ),
        );

        if (soundEnabled) {
          playKioskTone("error");
        }
      } finally {
        unlockAfterFeedback();
      }
    },
    [scanQr, unlockAfterFeedback],
  );

  useKeyboardQrScanner({
    enabled: keyboardScannerEnabled && !locked && !isPending,

    onScan: handleScan,
  });

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();

        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      // Algunos navegadores/tablets
      // pueden impedir fullscreen.
    }
  };

  return (
    <main className="min-h-dvh bg-muted/30">
      {/* Header */}

      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ScanLine className="size-5" />
            </div>

            <div>
              <h1 className="font-semibold">Kiosco de asistencia</h1>

              <p className="text-xs text-muted-foreground">
                Escanea tu código QR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={
                isOnline
                  ? "flex items-center gap-1.5 text-sm text-emerald-600"
                  : "flex items-center gap-1.5 text-sm text-destructive"
              }
            >
              {isOnline ? (
                <Wifi className="size-4" />
              ) : (
                <WifiOff className="size-4" />
              )}

              <span className="hidden md:inline">
                {isOnline ? "En línea" : "Sin conexión"}
              </span>
            </div>

            <KioskSettingsDialog cameras={cameras} />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Expand className="size-4" />

              <span className="hidden sm:inline">Pantalla completa</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <LogOut className="size-4" />

              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Kiosk */}

      <div className="mx-auto grid max-w-400 gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        {/* Camera */}

        <section>
          <QrCameraScanner
            disabled={locked || isPending || !isOnline}
            cameraDeviceId={cameraDeviceId}
            onCameraDevicesChange={setCameras}
            onScan={handleScan}
          />
        </section>

        {/* Feedback */}

        <section>
          <AttendanceScanFeedback
            result={lastResult}
            processing={isPending}
            error={connectionError}
          />
        </section>
      </div>

      <footer className="px-4 pb-5 text-center text-xs text-muted-foreground">
        Mantén el código QR visible y evita moverlo mientras se realiza la
        lectura.
      </footer>
    </main>
  );
}
