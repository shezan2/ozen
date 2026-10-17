/* 9:16 vertical (Reels, Stories, TikTok, Shorts): 1080×1920.
 * Layout for one output format: every number film.js needs that depends on the frame's shape.
 * Times are shared by all formats (the sound is cut to them), so keyframe times must not change;
 * only poses, sizes and positions differ. Easing names refer to E in film.js. CSS for the format
 * lives in formats/9x16.css, scoped under html.f-9x16.
 *
 * Platform UI covers the top 14%, the bottom 35% and the sides, so everything that must be read
 * sits in x 65–1015, y 250–1250; only decorative imagery runs beyond it. The site is shown at a
 * narrow (mobile) width: a portrait hero that fills the frame, a stacked pricing column and a
 * single-column enquiry form; the promise and the end card stack down the frame. */
(() => {
  const W = 1080;
  const H = 1920;
  const CTA = { top: 1084, w: 460, h: 118, r: 16 }; // r matches .cta in 9x16.css
  const END = { inset: 24, r: 44 };

  (window.OZEN_FORMATS ||= {})["9x16"] = {
    width: W,
    height: H,

    logo1: { w: 840, dy: -210 }, // opening wordmark, centred on the safe area (y ≈ 750)

    // A narrow browser. The hero card (browser.w - 32 = 728 wide) is a little taller than the
    // frame, so at full bleed (fill = 1080 / 728) its rounded corners fall just outside it.
    browser: { w: 760, h: 1440 },
    heroH: 1344,
    headlineSize: 116, // page px; ≈ 172 px on frame at full bleed
    heroPush: 1.028,

    // Pricing: one column of three wide cards (title, big price, two-line note).
    card: { w: 664, h: 250, gap: 16, cols: 1, x0: 48, pageY: 1500 },
    scrollTo: -1320, // shows the hero's last sliver, the intro line, the cards and "Scale"

    // Pull back to the browser filling most of the frame width, cards centred in the safe area;
    // then the site recedes up and back behind the enquiry flow.
    browserKeys: [
      [5.55, { x: 0, y: -128, z: 0, rx: 9, ry: -8, rz: 1.6, s: 1.08 }, "dolly"],
      [7.55, { x: -6, y: -140, z: 60, rx: 8, ry: -11, rz: 1.8, s: 1.08 }, "inOutSine"],
      [8.25, { x: 110, y: -470, z: -760, rx: 11, ry: -16, rz: 2.4, s: 1.08 }, "dolly"],
      [9.75, { x: 116, y: -484, z: -800, rx: 11, ry: -17, rz: 2.5, s: 1.08 }, "linear"],
    ],
    // The form swings in from the right to centre stage (y ≈ 470–1240) ...
    formKeys: [
      [7.55, { x: 1250, y: -60, z: 160, rx: 8, ry: -38, rz: 2, s: 1 }],
      [8.3, { x: 0, y: -112, z: 90, rx: 4, ry: -6, rz: -0.4, s: 1 }, "glide"],
      [9.75, { x: -6, y: -120, z: 110, rx: 3, ry: -4, rz: -0.6, s: 1 }, "linear"],
    ],
    // ... the info card from the left to the top left, tucked behind the form's top edge ...
    infoKeys: [
      [7.65, { x: -1200, y: -540, z: -120, rx: 6, ry: 26, rz: 0, s: 1 }],
      [8.4, { x: -226, y: -590, z: -150, rx: 6, ry: 12, rz: 0.6, s: 1 }, "glide"],
      [9.75, { x: -234, y: -596, z: -150, rx: 6, ry: 13, rz: 0.6, s: 1 }, "linear"],
    ],
    // ... and the chip pops in at the top right, over the info card.
    chipKeys: [
      [9.12, { x: 166, y: -610, z: 260, rx: 0, ry: -6, rz: 0, s: 0.6 }],
      [9.62, { x: 156, y: -566, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "lift"],
      [9.75, { x: 154, y: -570, z: 260, rx: 0, ry: -6, rz: 0, s: 1 }, "linear"],
    ],
    rigExit: -1500,

    cta: { top: CTA.top, w: CTA.w, h: CTA.h },
    endLogo: { w: 820, top: 340 },
    endCard: END,
    cursor: {
      formFrom: [1010, 1560], // from the lower right
      ctaFrom: [980, 1580],
      ctaAt: [70, 74],
    },

    // Per-frame touches for this frame shape.
    adjust(t, { el, E, lerp, prog, tw, tf, blur }) {
      // Depth of field: the receded site sits much larger in this frame than in 16:9, so it is
      // softened further (same timing and ease as film.js) to keep it a backdrop to the form.
      // The lifted cards are blurred one by one; a filter on their layer would flatten its 3D.
      if (t >= 7.6 && t < 10.3) {
        const dof = tw(t, 7.6, 8.3, 0, 5.4, E.inOutSine);
        blur(el.bview, dof);
        blur(el.chrome, dof);
        for (const c of el.poplayer.children) blur(c, dof);
      }

      // "Before work begins." wraps to two lines here, so it rises from further down to stay
      // hidden in its mask until its entry (same timing and ease as film.js).
      if (t >= 9.7 && t < 12.65) {
        const p = prog(t, 10.16, 10.99);
        const sink = lerp(0, -24, E.inCubic(prog(t, 11.62, 12.16)));
        tf(el.st2, { y: lerp(340, 0, E.glide(p)) + sink });
      }

      // The end card opens out of the button exactly as it is at the hand-off: still slightly
      // pressed in (the press releases at 11.61) and with the button's 16 px corners.
      if (t >= 11.58) {
        const p = E.dolly(prog(t, 11.58, 12.3));
        const k = 1 - Math.sin(Math.PI * prog(t, 11.43, 11.61)) * 0.05;
        const from = { x: W / 2 - (CTA.w * k) / 2, y: CTA.top + (CTA.h * (1 - k)) / 2, w: CTA.w * k, h: CTA.h * k };
        Object.assign(el.endcard.style, {
          left: `${lerp(from.x, END.inset, p).toFixed(2)}px`,
          top: `${lerp(from.y, END.inset, p).toFixed(2)}px`,
          width: `${lerp(from.w, W - 2 * END.inset, p).toFixed(2)}px`,
          height: `${lerp(from.h, H - 2 * END.inset, p).toFixed(2)}px`,
          borderRadius: `${lerp(CTA.r * k, END.r, p).toFixed(2)}px`,
        });
      }
    },
  };
})();
