/* Layout for the 16:9 film. Times are shared by every format (the sound is cut to them); only
 * positions and sizes live here. Positions are stage pixels; phone positions are the phone's centre. */
(window.I8_FORMATS ||= {})["16x9"] = {
  width: 1920,
  height: 1080,
  hook: {
    eyebrow: [150, 300],
    head: [150, 352],
    headSize: 132,
    card: [1130, 290],
  },
  brand: {
    mark: [960, 455],
    markSize: 300,
    word: [960, 760],
    phone: { x: 1290, y: 560, s: 0.96 },
    copy: [150, 330],
    copyWidth: 820,
  },
  measure: {
    scale: { x: 1100, y: 190, w: 640 },
    chip: [1470, 820],
  },
  app: {
    phone: { x: 1290, y: 560, s: 1 },
    copy: [150, 230],
    copyWidth: 820,
    counter: [150, 600],
    coach: [150, 820],
    callouts: { x: 1540, y: 255, gap: 86 },
  },
  pair: {
    goals: { x: 760, y: 590, s: 0.86 },
    hist: { x: 1220, y: 590, s: 0.86 },
    cap1: [130, 470],
    cap2: [1480, 470],
  },
  end: {
    copy: [150, 190],
    phone: { x: 1430, y: 560, s: 0.92 },
    scale: { x: 1090, y: 620, w: 430 },
    fine: [150, 1010],
  },
};
