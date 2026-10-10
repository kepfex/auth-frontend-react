import { Camera, Keyboard, MonitorUp, Settings2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

import { useKioskPreferencesStore } from "../store/kiosk-preferences.store";

import type { KioskCameraDevice } from "./QrCameraScanner";

interface Props {
  cameras: KioskCameraDevice[];
}

export function KioskSettingsDialog({ cameras }: Props) {
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

  const setCameraDeviceId = useKioskPreferencesStore(
    (state) => state.setCameraDeviceId,
  );

  const setSoundEnabled = useKioskPreferencesStore(
    (state) => state.setSoundEnabled,
  );

  const setVibrationEnabled = useKioskPreferencesStore(
    (state) => state.setVibrationEnabled,
  );

  const setKeepScreenAwake = useKioskPreferencesStore(
    (state) => state.setKeepScreenAwake,
  );

  const setKeyboardScannerEnabled = useKioskPreferencesStore(
    (state) => state.setKeyboardScannerEnabled,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Settings2 className="size-4" />
          Configuración
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configuración del kiosco</DialogTitle>

          <DialogDescription>
            Estas preferencias se guardan únicamente en este dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Cámara */}

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Camera className="size-4" />
              Cámara
            </div>

            <Select
              value={cameraDeviceId ?? "automatic"}
              onValueChange={(value) =>
                setCameraDeviceId(value === "automatic" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="automatic">
                  Automática / cámara posterior
                </SelectItem>

                {cameras.map((camera) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sonido */}

          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Volume2 className="size-4" />
                Feedback sonoro
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Reproduce una señal al procesar una marcación.
              </p>
            </div>

            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          {/* Vibración */}

          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="font-medium">Vibración</div>

              <p className="mt-1 text-sm text-muted-foreground">
                Utiliza vibración cuando el dispositivo la soporte.
              </p>
            </div>

            <Switch
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>

          {/* Wake Lock */}

          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <MonitorUp className="size-4" />
                Mantener pantalla activa
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Intenta evitar que la tablet apague la pantalla durante el uso
                del kiosco.
              </p>
            </div>

            <Switch
              checked={keepScreenAwake}
              onCheckedChange={setKeepScreenAwake}
            />
          </div>

          {/* Keyboard scanner */}

          <div className="flex items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Keyboard className="size-4" />
                Lector USB/Bluetooth
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Permite lectores que funcionan como teclado y finalizan con
                Enter.
              </p>
            </div>

            <Switch
              checked={keyboardScannerEnabled}
              onCheckedChange={setKeyboardScannerEnabled}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
