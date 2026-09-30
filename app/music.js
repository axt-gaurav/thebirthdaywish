// Call from a tap handler: iOS only allows audio that starts inside a user gesture.
export function playMusic(src) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const audio = new Audio(src);
  audio.loop = true;
  audio.play().catch(() => synthSong(ctx)); // no music file? play a built-in tune
}

// Happy Birthday: [midi note, beats]
const SONG = [
  [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
  [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3],
];
const BEAT = .45;

function synthSong(ctx) {
  let t = ctx.currentTime + .1;
  for (const [note, len] of SONG) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440 * 2 ** ((note - 69) / 12);
    gain.gain.setValueAtTime(.001, t);
    gain.gain.exponentialRampToValueAtTime(.25, t + .03);
    gain.gain.exponentialRampToValueAtTime(.001, t + len * BEAT);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + len * BEAT);
    t += len * BEAT;
  }
  setTimeout(() => synthSong(ctx), (t - ctx.currentTime + BEAT) * 1000);
}
