import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({apiKey:"AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",projectId:"greysol-academy"});
const db = getFirestore(app);
const loader = document.getElementById("mainLoader");

// ROLE CHECK
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
const userRole = (loggedUser?.role || "").toString().trim().toLowerCase();
if(!loggedUser || userRole!== "accountant"){
  alert("Access Denied. This page is for Accountants only.");
  window.location.href = "staff-login.html";
}
document.getElementById("staffName").innerHTML = loggedUser.username;
document.getElementById("staffRole").innerHTML = loggedUser.role;

document.getElementById("logoutBtn").onclick = (e) => {
  e.preventDefault();
  localStorage.removeItem("loggedUser");
  window.location.href = "staff-login.html";
}

// MODAL CONTROLS
const salesModal = document.getElementById("salesModal");
const vatModal = document.getElementById("vatModal");

document.getElementById("editSalesBtn").onclick = ()=> salesModal.classList.add("show");
document.getElementById("closeSalesModal").onclick = ()=> salesModal.classList.remove("show");
document.getElementById("cancelSalesBtn").onclick = ()=> salesModal.classList.remove("show");

document.getElementById("editVatBtn").onclick = ()=> vatModal.classList.add("show");
document.getElementById("closeVatModal").onclick = ()=> vatModal.classList.remove("show");
document.getElementById("cancelVatBtn").onclick = ()=> vatModal.classList.remove("show");

// LOAD COA + SETTINGS
let chartOfAccounts = [];
async function loadCOA(){
  loader.classList.remove("hidden");
  try{
    const snap = await getDocs(collection(db,"chartOfAccounts"));
    chartOfAccounts = snap.docs.map(d=>({id:d.id,...d.data()}));
    chartOfAccounts.sort((a,b)=>a.accountCode.localeCompare(b.accountCode));
    populateDropdowns();
    await loadSettings();
  }catch(error){ showError(error.message); }
  finally{ loader.classList.add("hidden"); }
}

function populateDropdowns(){
  const selects = [
    'receivableAccountDisplay','revenueAccountDisplay','cashAccountDisplay','discountAccountDisplay','vatAccountDisplay',
    'receivableAccountInput','revenueAccountInput','cashAccountInput','discountAccountInput','vatAccountInput'
  ];
  selects.forEach(id=>{
    const select = document.getElementById(id);
    chartOfAccounts.forEach(acc=>{
      select.innerHTML += `<option value="${acc.accountCode}">${acc.accountCode} - ${acc.accountName}</option>`;
    });
  });
}

// LOAD SETTINGS
const settingsRef = doc(db,"settings","accounting");

async function loadSettings(){
  const snap = await getDoc(settingsRef);
  if(snap.exists()){
    const s = snap.data();
    document.getElementById("receivableAccountDisplay").value = s.receivableAccount || "";
    document.getElementById("revenueAccountDisplay").value = s.revenueAccount || "";
    document.getElementById("cashAccountDisplay").value = s.cashAccount || "";
    document.getElementById("discountAccountDisplay").value = s.discountAccount || "";
    document.getElementById("vatRateDisplay").value = s.vatRate || 16.5;
    document.getElementById("vatAccountDisplay").value = s.vatAccount || "";
  }
}

// SAVE SALES ACCOUNTS FROM MODAL
document.getElementById("saveSalesBtn").onclick = async () => {
  const receivable = document.getElementById("receivableAccountInput").value;
  const revenue = document.getElementById("revenueAccountInput").value;
  const cash = document.getElementById("cashAccountInput").value;
  const discount = document.getElementById("discountAccountInput").value;

  if(!receivable || !revenue || !cash){
    showError("Please select Receivable, Revenue and Cash accounts");
    return;
  }

  document.getElementById("saveSalesBtn").disabled = true;
  document.getElementById("saveSalesBtn").innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try{
    await setDoc(settingsRef,{
      receivableAccount: receivable,
      revenueAccount: revenue,
      cashAccount: cash,
      discountAccount: discount,
      updatedBy: loggedUser.username,
      updatedAt: new Date()
    }, {merge: true});
    
    // Update display fields
    document.getElementById("receivableAccountDisplay").value = receivable;
    document.getElementById("revenueAccountDisplay").value = revenue;
    document.getElementById("cashAccountDisplay").value = cash;
    document.getElementById("discountAccountDisplay").value = discount;
    
    showSuccess("Sales accounts updated successfully");
    salesModal.classList.remove("show");
  }catch(error){ showError(error.message); }
  document.getElementById("saveSalesBtn").disabled = false;
  document.getElementById("saveSalesBtn").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Sales Accounts';
}

// SAVE VAT SETTINGS FROM MODAL
document.getElementById("saveVatBtn").onclick = async () => {
  const vatRate = Number(document.getElementById("vatRateInput").value) || 0;
  const vatAccount = document.getElementById("vatAccountInput").value;

  document.getElementById("saveVatBtn").disabled = true;
  document.getElementById("saveVatBtn").innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try{
    await setDoc(settingsRef,{
      vatRate: vatRate,
      vatAccount: vatAccount,
      updatedBy: loggedUser.username,
      updatedAt: new Date()
    }, {merge: true});
    
    document.getElementById("vatRateDisplay").value = vatRate;
    document.getElementById("vatAccountDisplay").value = vatAccount;
    
    showSuccess("VAT settings updated successfully");
    vatModal.classList.remove("show");
  }catch(error){ showError(error.message); }
  document.getElementById("saveVatBtn").disabled = false;
  document.getElementById("saveVatBtn").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save VAT';
}

// Prefill modals when opening
document.getElementById("editSalesBtn").addEventListener("click", ()=>{
  document.getElementById("receivableAccountInput").value = document.getElementById("receivableAccountDisplay").value;
  document.getElementById("revenueAccountInput").value = document.getElementById("revenueAccountDisplay").value;
  document.getElementById("cashAccountInput").value = document.getElementById("cashAccountDisplay").value;
  document.getElementById("discountAccountInput").value = document.getElementById("discountAccountDisplay").value;
})

document.getElementById("editVatBtn").addEventListener("click", ()=>{
  document.getElementById("vatRateInput").value = document.getElementById("vatRateDisplay").value;
  document.getElementById("vatAccountInput").value = document.getElementById("vatAccountDisplay").value;
})

function showSuccess(msg){
  document.getElementById("successMsg").innerText = msg;
  document.getElementById("successMsg").style.display = "block";
  document.getElementById("errorMsg").style.display = "none";
  setTimeout(()=>document.getElementById("successMsg").style.display = "none",3000);
}
function showError(msg){
  document.getElementById("errorMsg").innerText = msg;
  document.getElementById("errorMsg").style.display = "block";
  document.getElementById("successMsg").style.display = "none";
}

loadCOA();
