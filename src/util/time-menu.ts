export function initMenu(menuId: string) {
  if (typeof window === "undefined") return; 
  const menu = document.getElementById(menuId);
  if (!menu) return;

  let timer: ReturnType<typeof setTimeout>;
  let firstInteraction = false;

  function showMenu() {
    if (!menu) return;
    menu.classList.remove("translate-x-full");
    clearTimeout(timer);

    timer = setTimeout(() => {
      if (menu) menu.classList.add("translate-x-full");
    }, 1100);
  }

  function onUserMove() {
    if (!firstInteraction) {
      firstInteraction = true;
      showMenu();
    } else {
      showMenu();
    }
  }

  menu.classList.add("translate-x-full");

  window.addEventListener("scroll", onUserMove);
  window.addEventListener("resize", onUserMove);
  window.addEventListener("mousemove", onUserMove);   
  window.addEventListener("touchstart", onUserMove); 
}
