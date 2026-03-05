/**
 * Plays notification sound using Web Audio API.
 * Soft, bell-like two-tone ding (similar to iOS).
 */

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  peakVol = 0.28
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakVol, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Play notification sound when new notification arrives.
 */
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    playTone(ctx, 1318.5, now, 0.18, 0.28);
    playTone(ctx, 1567.98, now + 0.13, 0.35, 0.22);
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
}
