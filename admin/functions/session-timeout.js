<script>
/* GREYSOL IDLE LOGOUT - CROSS TAB FIX - 30 SEC TRIAL */
(function(){
  const LIMIT = 30 * 1000;
  const KEY = "greysolLastActivity";

  function getUser(){
    try{ return JSON.parse(localStorage.getItem("loggedUser") || sessionStorage.getItem("loggedUser") || "null"); }catch{ return null; }
  }

  function logout(){
    localStorage.setItem("greysolReturnPage", location.href);
    localStorage.removeItem("loggedUser");
    sessionStorage.removeItem("loggedUser");
    localStorage.removeItem(KEY);
    location.replace("../staff-login.html?session=expired");
  }

  if(!getUser()) return;

  // ALWAYS write to localStorage so other tabs see it
  function touch(){
    const now = Date.now().toString();
    localStorage.setItem(KEY, now);
  }

  // activity in THIS tab
  ["click","keydown","mousemove","touchstart","scroll"].forEach(e=>{
    window.addEventListener(e, touch, {passive:true});
  });

  // activity in OTHER tab - listen to storage event
  window.addEventListener("storage", (e)=>{
    if(e.key === KEY && e.newValue){
      console.log("Other tab active, resetting timer");
    }
    if(e.key === "loggedUser" && !e.newValue){
      location.replace("../staff-login.html");
    }
  });

  touch(); // init

  setInterval(()=>{
    if(!getUser()) return;
    const stored = Number(localStorage.getItem(KEY) || 0);
    const idle = Date.now() - stored;
    console.log("Idle:", Math.floor(idle/1000)+"s - checking localStorage from all tabs");
    if(stored && idle >= LIMIT){
      alert("Session expired - idle 30s (all tabs)");
      logout();
    }
  }, 3000);

  console.log("✓ Cross-tab idle logout ACTIVE");
})();
</script>
