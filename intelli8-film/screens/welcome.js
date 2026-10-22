/* Welcome screen. seek(p): the 8 draws in (0–0.6), heart pops, the name and line rise in, the
 * button settles; { press } (0..1) dips the button for a tap. */
I8.screens.welcome = (root, h) => {
  root.classList.add("scr-welcome");
  root.innerHTML =
    h.status() +
    `<div class="mark">${I8.logo8({ id: "wel", size: 96 })}</div>
     <div class="name">Intelli8</div>
     <div class="promise">Your full body-composition picture, every time you step on.</div>
     <div class="btn primary">Get started</div>` +
    h.home();
  const svg = root.querySelector(".logo8");
  const name = root.querySelector(".name");
  const promise = root.querySelector(".promise");
  const btn = root.querySelector(".btn");
  return {
    seek(p, { press = 0 } = {}) {
      I8.logo8Draw(svg, h.ease.inOut(h.prog(p, 0, 0.6)), h.prog(p, 0.52, 0.7));
      const pn = h.ease.glide(h.prog(p, 0.45, 0.8));
      name.style.opacity = pn;
      name.style.transform = `translateY(${(1 - pn) * 14}px)`;
      const pp = h.ease.glide(h.prog(p, 0.55, 0.9));
      promise.style.opacity = pp;
      promise.style.transform = `translateY(${(1 - pp) * 12}px)`;
      const pb = h.ease.glide(h.prog(p, 0.65, 1));
      const dip = Math.sin(Math.PI * h.clamp(press));
      btn.style.opacity = pb;
      btn.style.transform = `translateY(${(1 - pb) * 16}px) scale(${1 - dip * 0.03})`;
      btn.style.filter = dip > 0.01 ? `brightness(${1 - dip * 0.12})` : "none";
    },
  };
};
