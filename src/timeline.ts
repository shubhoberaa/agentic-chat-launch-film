export const FPS = 60;
export const BPM = 120;
export const BEAT_FRAMES = (60 / BPM) * FPS;
export const BAR_FRAMES = BEAT_FRAMES * 4;

export const SHOTS = {
  request: { from: 0, duration: 180 },
  workflow: { from: 180, duration: 540 },
  result: { from: 720, duration: 210 },
  lockup: { from: 930, duration: 150 },
};

export const TOTAL = 1080; // 18 seconds, 9 bars at 120 BPM
export const SEND_FRAME = 142;

if (Object.values(SHOTS).some(({ from, duration }) => (from + duration) % (BEAT_FRAMES / 2) !== 0)) {
  throw new Error("Every cut must land on the 8th-note grid");
}
if (SHOTS.lockup.from + SHOTS.lockup.duration !== TOTAL) {
  throw new Error("The lockup must finish on the final frame");
}
