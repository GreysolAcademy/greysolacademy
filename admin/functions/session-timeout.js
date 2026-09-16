<script>
(() => {
  const LIMIT = 30 * 1000; // 30 sec trial
  const KEY = "greysolLastActivity";
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("loggedUser") || sessionStorage.getItem("loggedUser") || "null"); } catch { return null; }
  };
  if (!getUser()) { console.log("Idle: No user"); return; }
  
  const touch = () => localStorage.setItem(KEY, Date.now().toString());
  
  ["click","keydown","mousemove","touchstart","scroll"].forEach(ev => {
    window.addEventListener(ev, touch, {passive:true});
  });
  window.addEventListener("storage", e => {
    if (e.key === KEY) console.log("Other tab active - timer reset");
  });
  
  touch();
  
  setInterval(() => {
    if (!getUser()) return;
    const last = parseInt(localStorage.getItem(KEY) || "0", 10);
    const idle = Date.now() - last;
    if (idle >= LIMIT && last > 0) {
      alert("Session expired - idle " + Math.floor(idle/1000) + "s");
      localStorage.setItem("greysolReturnPage", location.href);
      localStorage.removeItem("loggedUser");
      sessionStorage.removeItem("loggedUser");
      localStorage.removeItem(KEY);
      location.replace("../staff-login.html?session=expired");
    }
  }, 2000);
  
  console.log("✓ Idle logout ACTIVE - cross-tab -", LIMIT/1000 + "s");
})();
</script>
</body>
</html>
