/* =========================================================
   GREYSOL ACADEMY - AUTO LOGOUT ON IDLE
========================================================= */
(function(){

const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute - change to 30*60*1000 for 30min
const LAST_ACTIVITY_KEY = "greysolLastActivity";
const RETURN_PAGE_KEY = "greysolReturnPage";

function getLoggedUser(){
  try{ return JSON.parse(localStorage.getItem("loggedUser")); } catch { return null; }
}

function saveCurrentPage(){
  const page = window.location.pathname.split("/").pop();
  if(page && page !== "staff-login.html"){
    localStorage.setItem(RETURN_PAGE_KEY, window.location.href);
  }
}

function doLogout(){
  saveCurrentPage();
  localStorage.removeItem("loggedUser");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  window.location.replace("staff-login.html?session=expired");
}

function recordActivity(){
  if(!getLoggedUser()) return;
  // throttle - only save once per 2 seconds to avoid spam
  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
  if(Date.now() - last > 2000){
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }
}

function checkTimeout(){
  const user = getLoggedUser();
  if(!user) return;
  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
  if(Date.now() - last >= INACTIVITY_LIMIT){
    alert("Session expired due to inactivity.");
    doLogout();
  }
}

// --- START ---
const user = getLoggedUser();
if(!user){
  // not logged in, do nothing
  return;
}

// if no timestamp, create one
if(!localStorage.getItem(LAST_ACTIVITY_KEY)){
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}
saveCurrentPage();

// activity listeners - use throttled version
["click","mousedown","keydown","scroll","touchstart"].forEach(evt=>{
  document.addEventListener(evt, recordActivity, {passive:true});
});

// check every 5 seconds
setInterval(checkTimeout, 5000);

// also check on visibility change (when user comes back to tab)
document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState === "visible") checkTimeout();
});

// sync across tabs
window.addEventListener("storage", (e)=>{
  if(e.key === "loggedUser" && !e.newValue){
    window.location.replace("staff-login.html");
  }
});

})();
