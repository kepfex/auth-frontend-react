import { create } from "zustand";

import { persist } from "zustand/middleware";

interface KioskPreferencesState {
  cameraDeviceId: string | null;

  soundEnabled: boolean;

  vibrationEnabled: boolean;

  keepScreenAwake: boolean;

  keyboardScannerEnabled: boolean;

  setCameraDeviceId: (deviceId: string | null) => void;

  setSoundEnabled: (enabled: boolean) => void;

  setVibrationEnabled: (enabled: boolean) => void;

  setKeepScreenAwake: (enabled: boolean) => void;

  setKeyboardScannerEnabled: (enabled: boolean) => void;
}

export const useKioskPreferencesStore = create<KioskPreferencesState>()(
  persist(
    (set) => ({
      cameraDeviceId: null,

      soundEnabled: true,

      vibrationEnabled: true,

      keepScreenAwake: true,

      keyboardScannerEnabled: true,

      setCameraDeviceId: (cameraDeviceId) =>
        set({
          cameraDeviceId,
        }),

      setSoundEnabled: (soundEnabled) =>
        set({
          soundEnabled,
        }),

      setVibrationEnabled: (vibrationEnabled) =>
        set({
          vibrationEnabled,
        }),

      setKeepScreenAwake: (keepScreenAwake) =>
        set({
          keepScreenAwake,
        }),

      setKeyboardScannerEnabled: (keyboardScannerEnabled) =>
        set({
          keyboardScannerEnabled,
        }),
    }),

    {
      name: "attendance-kiosk-preferences",
    },
  ),
);
