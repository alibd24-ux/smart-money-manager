let audioCtx: AudioContext | null = null;

export function playSiren(muted = false): void {
  if (muted) return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = audioCtx || new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t0 = audioCtx.currentTime + 0.02;
    for (let i = 0; i < 3; i++) {
      const st = t0 + i * 0.45;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, st);
      osc.frequency.setValueAtTime(880, st + 0.14);
      osc.frequency.setValueAtTime(587, st + 0.15);

      gain.gain.setValueAtTime(0.0001, st);
      gain.gain.exponentialRampToValueAtTime(0.22, st + 0.04);
      gain.gain.setValueAtTime(0.22, st + 0.36);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.42);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(st);
      osc.stop(st + 0.44);
    }
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function haptic(ms = 15): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch {
    // Ignore environments where vibration is unavailable
  }
}

export function alarmVibration(): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([250, 100, 250, 100, 300]);
    }
  } catch {
    // Ignore
  }
}
