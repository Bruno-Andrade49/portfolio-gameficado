export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export const THEME_COLORS: Record<Theme, string> = { light: "#f4efe8", dark: "#0f0d0e" };

export const themeScript = `(function(){var d=document.documentElement;function a(t){d.dataset.theme=t;d.style.colorScheme=t;if(document.querySelectorAll){var ms=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<ms.length;i++)ms[i].content=t==="light"?"${THEME_COLORS.light}":"${THEME_COLORS.dark}";}}try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var m=window.matchMedia("(prefers-color-scheme: light)");if(s==="light"||s==="dark"){a(s);return;}a(m.matches?"light":"dark");m.addEventListener("change",function(e){var c=null;try{c=localStorage.getItem("${THEME_STORAGE_KEY}");}catch(x){}if(c!=="light"&&c!=="dark")a(e.matches?"light":"dark");});}catch(e){a("dark");}})();`;
