const el = document.getElementById("wave-hand");
if (!el) throw new Error("wave-hand element not found");

function wave() {
  el.classList.remove("is-waving");
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add("is-waving");
}

// On load
wave();

// On scroll (debounced via IntersectionObserver — re-waves when greeting comes back into view)
let hasLeft = false;
const observer = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting) {
      hasLeft = true;
    } else if (hasLeft) {
      hasLeft = false;
      wave();
    }
  },
  { threshold: 0.5 }
);

observer.observe(el);
