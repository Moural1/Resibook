export const THEME_STORAGE_KEY = "resibook-theme";

/* Lido no <head> antes da pintura, para o tema escuro não piscar em claro. */
export const THEME_BOOT_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
