// functions/timer.js - LINK THIS TO ALL PAGES

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes - change as you want
const WARNING_BEFORE = 0; // show message immediately when expired
let timeoutId;
let countdownId;

function getLoader(){
  return document.getElementById("pageLoader");
}

function showExpiredMessage(reason = "Your session expired"){
  const loader = getLoader();
  if(!loader) return;
  loader.style.display = "flex";
  loader.innerHTML = `
    <div style="text-align:center;padding:20px">
      <i class="fa-solid fa-circle-exclamation" style="font-size:64px;color:var(--navy,#001f3f)"></i>
      <h3 style="margin:15px 0 5px;color:var(--navy,#001f3f);font-family:'Segoe UI',Arial">${reason}</h3>
      <p style="color:#666;font-family:'Segoe UI',Arial">Redirecting to login in <span id="expireCountdown">3</span>s...</p>
    </div>
  `;
  
  let sec = 3;
  countdownId = setInterval(()=>{
    sec--;
    const el = document.getElementById("expireCountdown");
    if(el) el.innerText = sec;
    if(sec <= 0){
      clearInterval(countdownId);
      localStorage.removeItem("loggedUser");
      window.location.href = "staff-login.html";
    }
  }, 1000);
}

function resetTimer(){
  clearTimeout(timeoutId);
  timeoutId = setTimeout(()=>{
    showExpiredMessage("Your session expired");
  }, SESSION_TIMEOUT);
}

function checkAlreadyExpired(){
  const loggedUser = localStorage.getItem("loggedUser");
  if(!loggedUser){
    showExpiredMessage("Your session expired");
    return true;
  }
  return false;
}

// For Firebase rate limit - call this from anywhere: window.showRateLimit(60)
window.showRateLimit = function(seconds = 60, reason = "Your session expired"){
  const loader = getLoader();
  if(!loader) return;
  loader.style.display = "flex";
  
  let sec = seconds;
  loader.innerHTML = `
    <div style="text-align:center;padding:20px">
      <i class="fa-solid fa-clock" style="font-size:64px;color:#f39c12"></i>
      <h3 style="margin:15px 0 5px;color:var(--navy)">${reason}</h3>
      <p style="color:#666">Too many requests. Retrying in <span id="expireCountdown">${sec}</span>s...</p>
    </div>
  `;
  
  countdownId = setInterval(()=>{
    sec--;
    const el = document.getElementById("expireCountdown");
    if(el) el.innerText = sec;
    if(sec <= 0){
      clearInterval(countdownId);
      location.reload(); // auto refresh, no OK needed
    }
  }, 1000);
}

// Auto start on every page
if(!checkAlreadyExpired()){
  resetTimer();
  // Reset on any user activity
  ['click','mousemove','keydown','scroll','touchstart'].forEach(evt=>{
    document.addEventListener(evt, resetTimer, {passive:true});
  });
}

console.log("Session timer active: 30min");
