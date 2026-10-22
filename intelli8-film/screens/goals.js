/* Goals tab: "Lose Weight" + Change goal, the weight slider card (start dot → knob → dashed target
 * ring), the target-date / projection card with its pace note and Adjust, the muscle-mass row,
 * Edit target and the tab bar (Goals active).
 *
 * seek(p, { press = 0, adjust = 0 }):
 *   0.00–0.30  title, Change goal and the weight card rise in (staggered); knob rests on the start dot
 *   0.25–0.70  navy fill + knob travel from the start dot to today's position (ease in-out) while
 *              "Now" counts down 73.60 → 72.40 kg in step with the knob
 *   0.60–0.85  target date / projected card rises in (0.60–0.78), then its pace note + Adjust (0.67–0.85)
 *   0.80–1.00  muscle-mass row (0.80–0.94), then Edit target (0.86–1.00)
 *   press  (0..1) dips Edit target for a tap (deepest at 0.5); adjust (0..1) does the same for Adjust.
 */
(() => {
  const START = 73.6, NOW = 72.4, TARGET = 68.0;
  // Slider geometry inside the weight card (card-local px): start dot and target ring centres.
  const X0 = 16, X1 = 340.5;
  const xOf = (kg) => X0 + ((START - kg) / (START - TARGET)) * (X1 - X0);

  const ARROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h11"/><path d="M9.2 3.7L13.5 8l-4.3 4.3"/></svg>`;
  const RING = `<svg class="dot d-target" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fff"/><circle cx="7" cy="7" r="6" fill="none" stroke="var(--app-navy)" stroke-width="2.1" stroke-linecap="round" stroke-dasharray="0.01 3.417"/></svg>`;

  I8.screens.goals = (root, h) => {
    root.classList.add("scr-goals");
    root.innerHTML =
      h.status() +
      `<div class="title">Lose Weight</div>
       <div class="change">Change goal</div>
       <div class="card c-weight">
         <div class="caps">Weight</div>
         <div class="now">Now <b>${h.fmt(NOW, 2)} kg</b></div>
         <div class="slider">
           <div class="track"></div>
           <div class="fill"></div>
           ${RING}
           <div class="dot d-start"></div>
           <div class="dot d-knob"></div>
         </div>
         <div class="lab l-start">Start ${h.fmt(START, 2)} kg · Aug 13</div>
         <div class="lab l-target">Target ${h.fmt(TARGET, 2)} kg</div>
       </div>
       <div class="card c-plan">
         <div class="col col-a"><div class="caps">Target date</div><div class="v">Nov 5</div></div>
         <div class="vsep"></div>
         <div class="col col-b"><div class="caps">Projected</div><div class="v">Week of Feb 28</div></div>
         <div class="note">
           <p>Your current pace lands about 17 weeks after Nov 5.</p>
           <div class="adjust">Adjust</div>
         </div>
       </div>
       <div class="card c-muscle">
         <div class="arrow">${ARROW}</div>
         <div class="mtext">Muscle Mass <b>58.1 kg</b> <i>· holding</i></div>
       </div>
       <div class="btn primary edit">Edit target</div>` +
      h.tabs("goals") +
      h.home();

    const $ = (s) => root.querySelector(s);
    const title = $(".title"), change = $(".change");
    const cWeight = $(".c-weight"), cPlan = $(".c-plan"), cMuscle = $(".c-muscle");
    const note = $(".note"), adjust = $(".adjust"), edit = $(".edit");
    const fill = $(".fill"), knob = $(".d-knob"), nowNum = $(".now b");

    const rise = (el, t, dy) => {
      el.style.opacity = t.toFixed(3);
      el.style.transform = t < 1 ? `translateY(${((1 - t) * dy).toFixed(2)}px)` : "none";
    };
    const dip = (el, press, base) => {
      const d = Math.sin(Math.PI * h.clamp(press));
      el.style.transform = `${base} scale(${(1 - d * 0.03).toFixed(4)})`;
      el.style.filter = d > 0.01 ? `brightness(${(1 - d * 0.12).toFixed(3)})` : "none";
    };

    return {
      seek(p, { press = 0, adjust: pressAdjust = 0 } = {}) {
        // 0–0.30: header and the weight card
        rise(title, h.ease.glide(h.prog(p, 0, 0.18)), 10);
        rise(change, h.ease.glide(h.prog(p, 0.03, 0.21)), 10);
        rise(cWeight, h.ease.glide(h.prog(p, 0.08, 0.3)), 16);

        // 0.25–0.70: fill + knob travel, "Now" counts down with them
        const t = h.ease.inOut(h.prog(p, 0.25, 0.7));
        const kg = h.lerp(START, NOW, t);
        const x = xOf(kg);
        fill.style.width = `${(x - X0).toFixed(2)}px`;
        knob.style.transform = `translateX(${x.toFixed(2)}px)`;
        nowNum.textContent = `${h.fmt(Math.round(kg * 100) / 100, 2)} kg`;

        // 0.60–0.85: projection card, then its note
        rise(cPlan, h.ease.glide(h.prog(p, 0.6, 0.78)), 16);
        const pn = h.ease.glide(h.prog(p, 0.67, 0.85));
        rise(note, pn, 8);

        // 0.80–1.00: muscle row, then Edit target
        rise(cMuscle, h.ease.glide(h.prog(p, 0.8, 0.94)), 14);
        const pe = h.ease.glide(h.prog(p, 0.86, 1));
        edit.style.opacity = pe.toFixed(3);
        dip(edit, press, `translateY(${((1 - pe) * 16).toFixed(2)}px)`);
        dip(adjust, pressAdjust, "");
      },
    };
  };
})();
