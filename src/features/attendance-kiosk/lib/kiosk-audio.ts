type KioskTone = "success" | "warning" | "error";

let audioContext: AudioContext | null = null;

export const prepareKioskAudio = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
};

export const playKioskTone = (tone: KioskTone) => {
  if (!audioContext || audioContext.state !== "running") {
    return;
  }

  const oscillator = audioContext.createOscillator();

  const gain = audioContext.createGain();

  const now = audioContext.currentTime;

  const frequency = tone === "success" ? 880 : tone === "warning" ? 620 : 280;

  oscillator.frequency.setValueAtTime(frequency, now);

  oscillator.type = "sine";

  gain.gain.setValueAtTime(0.12, now);

  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  oscillator.connect(gain);

  gain.connect(audioContext.destination);

  oscillator.start(now);

  oscillator.stop(now + 0.18);
};
