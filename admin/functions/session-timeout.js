/* =========================================================
   GREYSOL ACADEMY - IDLE LOGOUT - FINAL FIX
========================================================= */
(function(){
console.log("[Session Timeout] Loaded");

const INACTIVITY_LIMIT = 10 * 1000; // 10 sec for test. Change to 15*60*1000 for 15min later
const LAST_ACTIVITY_KEY = "greysolLastActivity";
const RETURN_PAGE_KEY = "greysolReturnPage";

function getLoggedUser(){
  try{
    // check BOTH storages
    const a = localStorage.getItem("loggedUser");
    const b = sessionStorage.getItem("loggedUser");
    return JSON.parse(a || b || "null");
  }catch(e){ return null; }
}

function savePage(){
  const page = window.location.href;
  if(!page.includes("staff-login.html")){
    localStorage.setItem(RETURN_PAGE_KEY, page);
  }
}

function forceLogout(reason){
  console.log("[Session Timeout] Logging out:", reason);
  savePage();
  localStorage.removeItem("loggedUser");
  sessionStorage.removeItem("loggedUser");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  alert("Session expired due to inactivity");
  window.location.replace("staff-login.html?session=expired");
}

let lastSave = 0;
function recordActivity(){
  const user = getLoggedUser();
  if(!user) return;
  const now = Date.now();
  if(now - lastSave > 1000){ // throttle 1 sec
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    sessionStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    lastSave = now;
    console.log("[Session Timeout] Activity recorded");
  }
}

function checkTimeout(){
  const user = getLoggedUser();
  if(!user){
    console.log("[Session Timeout] No user, skipping");
    return;
  }
  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || sessionStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
  const diff = Date.now() - last;
  console.log(`[Session Timeout] Idle for ${diff/1000}s / limit ${INACTIVITY_LIMIT/1000}s`);
  if(diff >= INACTIVITY_LIMIT){
    forceLogout("idle " + diff + "ms");
  }
}

// INIT
const user = getLoggedUser();
console.log("[Session Timeout] User:", user);
if(!user){
  console.log("[Session Timeout] Not logged in, timeout disabled");
  return;
}

const existing = localStorage.getItem(LAST_ACTIVITY_KEY) || sessionStorage.getItem(LAST_ACTIVITY_KEY);
if(!existing){
  const now = Date.now().toString();
  localStorage.setItem(LAST_ACTIVITY_KEY, now);
  sessionStorage.setItem(LAST_ACTIVITY_KEY, now);
}
savePage();

["click","keydown","mousemove","touchstart","scroll"].forEach(ev=>{
  window.addEventListener(ev, recordActivity, {passive:true});
});

setInterval(checkTimeout, 3000);
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible") checkTimeout(); });

console.log("[Session Timeout] Active - Will logout after", INACTIVITY_LIMIT/1000, "seconds idle");

})();
