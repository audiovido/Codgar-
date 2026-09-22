// Vibrant & Crystal Clear AI Completion Chime for Codgar AI Response
export function playSoftChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 3-Note Crystal Arpeggio: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) + Sparkle C6 (1046.5Hz)
    const notes = [
      { time: now, freq: 523.25, duration: 0.45 },
      { time: now + 0.07, freq: 659.25, duration: 0.50 },
      { time: now + 0.14, freq: 783.99, duration: 0.65 },
      { time: now + 0.20, freq: 1046.50, duration: 0.70 },
    ];

    notes.forEach((note) => {
      // Main tone (soft sine wave)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.time);

      gain.gain.setValueAtTime(0.0001, note.time);
      gain.gain.linearRampToValueAtTime(0.06, note.time + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration);

      osc.connect(gain);

      // Soft glass shimmer overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(note.freq * 2, note.time);

      overtoneGain.gain.setValueAtTime(0.0001, note.time);
      overtoneGain.gain.linearRampToValueAtTime(0.015, note.time + 0.02);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration * 0.6);

      overtone.connect(overtoneGain);

      gain.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(note.time);
      overtone.start(note.time);

      osc.stop(note.time + note.duration);
      overtone.stop(note.time + note.duration);
    });
  } catch (e) {
    console.warn('[Audio] Crystal chime notice error:', e);
  }
}
