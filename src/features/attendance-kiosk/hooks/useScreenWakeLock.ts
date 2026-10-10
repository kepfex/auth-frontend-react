import { useEffect } from "react";

interface WakeLockSentinelLike {
  release: () => Promise<void>;

  released: boolean;
}

interface WakeLockLike {
  request: (type: "screen") => Promise<WakeLockSentinelLike>;
}

export const useScreenWakeLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let sentinel: WakeLockSentinelLike | null = null;

    let disposed = false;

    const requestLock = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const navigatorWithWakeLock = navigator as Navigator & {
        wakeLock?: WakeLockLike;
      };

      if (!navigatorWithWakeLock.wakeLock) {
        return;
      }

      try {
        sentinel = await navigatorWithWakeLock.wakeLock.request("screen");

        if (disposed) {
          await sentinel.release();
        }
      } catch {
        /*
         * Wake Lock no es crítico.
         * El kiosco puede funcionar sin él.
         */
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void requestLock();
      }
    };

    void requestLock();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;

      document.removeEventListener("visibilitychange", handleVisibility);

      void sentinel?.release();
    };
  }, [enabled]);
};
