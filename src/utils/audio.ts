export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Premium glass "ding" synthesis
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05); // Quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // Long tail fade out

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (err) {
    console.error("Audio playback failed:", err);
  }
};
