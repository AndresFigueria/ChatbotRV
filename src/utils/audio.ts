let sharedCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedCtx = new AudioContextClass();
    }
  }
  return sharedCtx;
};

// Auto-unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        // Remove listeners once successfully unlocked
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
      }).catch((err) => {
        console.error("Failed to resume AudioContext during unlock:", err);
      });
    } else if (ctx && ctx.state === 'running') {
      // Already running, clean up listeners
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    }
  };
  document.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('touchstart', unlock);
}

export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Proactively try to resume if suspended (e.g. if the user interacted but it didn't unlock)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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
