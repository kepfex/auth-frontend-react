import { useEffect, useRef } from "react";

interface UseKeyboardQrScannerOptions {
  enabled: boolean;

  onScan: (value: string) => void | Promise<void>;
}

export const useKeyboardQrScanner = ({
  enabled,
  onScan,
}: UseKeyboardQrScannerOptions) => {
  const bufferRef = useRef("");

  const lastKeyAtRef = useRef(0);

  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();

      /*
       * Lectores físicos escriben muy rápido.
       * Si pasa demasiado tiempo entre teclas,
       * consideramos que es escritura humana.
       */
      if (now - lastKeyAtRef.current > 120) {
        bufferRef.current = "";
      }

      lastKeyAtRef.current = now;

      if (event.key === "Enter") {
        const value = bufferRef.current.trim();

        bufferRef.current = "";

        if (value.length >= 8) {
          event.preventDefault();

          void onScanRef.current(value);
        }

        return;
      }

      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        bufferRef.current += event.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
};
