const btn = document.getElementById("copy-email");
const iconCopy = document.getElementById("icon-copy");
const iconCheck = document.getElementById("icon-check");

btn?.addEventListener("click", () => {
  navigator.clipboard.writeText("emanuel@emanuelzaveruka.com");
  iconCopy?.classList.add("hidden");
  iconCheck?.classList.remove("hidden");
  setTimeout(() => {
    iconCopy?.classList.remove("hidden");
    iconCheck?.classList.add("hidden");
  }, 2000);
});
