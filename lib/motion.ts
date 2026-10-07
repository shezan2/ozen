/** Shared motion curves so every movement on the site speaks the same language. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

export const INTRO_STORAGE_KEY = "cn-intro-seen";

/** Runs before first paint: skips the intro for returning visitors and reduced-motion users. */
export const INTRO_BOOT_SCRIPT = `try{if(sessionStorage.getItem('${INTRO_STORAGE_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='seen'}catch(e){}`;
