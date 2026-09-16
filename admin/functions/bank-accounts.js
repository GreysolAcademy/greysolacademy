// ROLE CHECK + USER INFO
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
if(!loggedUser || loggedUser.role!== "Accountant"){
  alert("Access Denied. Accountants Only.");
  window.location.href="staff-login.html";
}
document.getElementById("staffName").textContent = loggedUser?.username || "Accountant";
document.getElementById("staffRole").textContent = loggedUser?.role || "Accountant";
document.getElementById("portalRole").textContent = (loggedUser?.role || "Accountant") + " Portal";
document.getElementById("avatar").textContent = (loggedUser?.username || "A").charAt(0).toUpperCase();
document.getElementById("openingDate").valueAsDate = new Date();

// SIDEBAR JS
document.querySelectorAll(".menu-header").forEach(header => {
  header.addEventListener("click", () => {
    const clickedGroup = header.parentElement;
    document.querySelectorAll(".menu-group").forEach(group => {if (group !== clickedGroup) group.classList.remove("active")});
    clickedGroup.classList.toggle("active");
  });
});
document.getElementById("logoutBtn").addEventListener("click",e=>{e.preventDefault();localStorage.removeItem("loggedUser");window.location.href="staff-login.html"});
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open");document.getElementById("overlay").classList.toggle("show")}
</script>

<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({apiKey:"AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",projectId:"greysol-academy"});
const db = getFirestore(app);

let accounts = [];
let displayedAccounts = [];
const modal = document.getElementById("accountModal");
const loader = document.getElementById("mainLoader");

document.getElementById("openModalBtn").onclick = () => {
  document.getElementById("modalTitle").innerText = "Add Bank Account";
  document.getElementById("accountId").value = "";
  document.getElementById("accountCode").value = "";
  document.getElementById("accountName").value = "";
  document.getElementById("bankName").value = "";
  document.getElementById("accountNumber").value = "";
  document.getElementById("branch").value = "";
  document.getElementById("openingBalance").value = "0";
  document.getElementById("openingDate").valueAsDate = new Date();
  document.getElementById("codeError").style.display = "none";
  modal.style.display = "flex";
}
document.getElementById("closeModalBtn").onclick = () => modal.style.display = "none";

async function loadAccounts(){
  loader.classList.remove("hidden");
  try{
    const snap = await getDocs(collection(db,"chartOfAccounts"));
    accounts = snap.docs.map(d=>({id:d.id,...d.data()})).filter(acc=>acc.accountDetailType === "Bank");
    displayedAccounts = accounts;
    displayAccounts();
  }catch(error){
    console.error(error);
    alert("Error loading accounts: " + error.message);
  }finally{
    loader.classList.add("hidden"); // ALWAYS HIDE LOADER
  }
}

document.getElementById("searchInput").addEventListener("keyup", function(){
  const searchTerm = this.value.toLowerCase();
  displayedAccounts = accounts.filter(acc => {
    return (acc.accountCode || "").toLowerCase().includes(searchTerm) ||
           (acc.accountName || "").toLowerCase().includes(searchTerm) ||
           (acc.bankName || "").toLowerCase().includes(searchTerm) ||
           (acc.accountNumber || "").toLowerCase().includes(searchTerm);
  });
  displayAccounts();
});

const fmt = n => "MWK " + Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2});

function openLedger(code, name){
  const params = new URLSearchParams({
    account: code,
    accountName: name
  });
  window.location.href = `ledger.html?${params.toString()}`;
}

function displayAccounts(){
  const tbody = document.getElementById("accountsTable");
  tbody.innerHTML = "";
  if(displayedAccounts.length === 0){
    tbody.innerHTML = `<tr><td colspan="8">No bank accounts found</td></tr>`;
    return;
  }
  displayedAccounts.sort((a,b)=> String(a.accountCode || "").localeCompare(String(b.accountCode || ""))).forEach(acc => {
    const tr = document.createElement("tr");
    tr.classList.add("account-row");
    tr.title = "Double click to open Ledger";
    
    tr.addEventListener("dblclick", ()=>{
      openLedger(acc.accountCode, acc.bankName || acc.accountName);
    });

    tr.innerHTML = `
      <td>${acc.accountCode || "-"}</td>
      <td>${acc.bankName || acc.accountName || "-"}</td>
      <td>${acc.accountNumber || "-"}</td>
      <td>${acc.branch || "-"}</td>
      <td><span class="badge">${acc.currency || "MWK"}</span></td>
      <td class="amount">${fmt(acc.openingBalance || 0)}</td>
      <td><span class="badge">Active</span></td>
      <td>
        <button class="btn edit" onclick="event.stopPropagation(); editAccount('${acc.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn delete" onclick="event.stopPropagation(); deleteAccount('${acc.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editAccount = (id) => {
  const acc = accounts.find(a=>a.id === id);
  document.getElementById("modalTitle").innerText = "Edit Bank Account";
  document.getElementById("accountId").value = acc.id;
  document.getElementById("accountCode").value = acc.accountCode;
  document.getElementById("accountName").value = acc.accountName;
  document.getElementById("bankName").value = acc.bankName || "";
  document.getElementById("accountNumber").value = acc.accountNumber || "";
  document.getElementById("branch").value = acc.branch || "";
  document.getElementById("currency").value = acc.currency || "MWK";
  document.getElementById("openingBalance").value = acc.openingBalance || 0;
  document.getElementById("openingDate").value = acc.openingDate || "";
  document.getElementById("codeError").style.display = "none";
  modal.style.display = "flex";
}

window.deleteAccount = async (id) => {
  if(confirm("Delete this bank account? This will delete the COA account too.")){
    await deleteDoc(doc(db,"chartOfAccounts", id));
    loadAccounts();
  }
}

function validateAccountCode(code, currentId){
  const errorEl = document.getElementById("codeError");
  errorEl.style.display = "none";
  const codeRegex = /^\d{4}$/;
  if(!codeRegex.test(code)){
    errorEl.innerText = "Account Code must be exactly 4 digits. e.g. 1101";
    errorEl.style.display = "block";
    return false;
  }
  const duplicate = accounts.find(acc => acc.accountCode === code && acc.id!== currentId);
  if(duplicate){
    errorEl.innerText = `Account Code ${code} is already taken`;
    errorEl.style.display = "block";
    return false;
  }
  return true;
}

document.getElementById("saveAccountBtn").onclick = async () => {
  const id = document.getElementById("accountId").value;
  const code = document.getElementById("accountCode").value.trim();
  const data = {
    accountCode: code,
    accountName: document.getElementById("accountName").value.trim(),
    accountType: "Asset",
    accountSubType: "Current Asset",
    accountDetailType: "Bank",
    bankName: document.getElementById("bankName").value.trim(),
    accountNumber: document.getElementById("accountNumber").value.trim(),
    branch: document.getElementById("branch").value.trim(), // FIXED: removed extra dot
    currency: document.getElementById("currency").value,
    openingBalance: Number(document.getElementById("openingBalance").value),
    openingDate: document.getElementById("openingDate").value,
    updatedBy: loggedUser.username,
    updatedAt: Timestamp.now()
  };

  if(!data.accountName ||!data.bankName ||!data.accountNumber){
    alert("Please fill Bank Name, Account Name and Account Number");
    return;
  }
  if(!validateAccountCode(code, id)){return;}

  document.getElementById("saveAccountBtn").disabled = true;
  document.getElementById("saveAccountBtn").innerText = "Saving...";

  try{
    if(id){
      await updateDoc(doc(db,"chartOfAccounts", id), data);
    } else {
      data.createdBy = loggedUser.username;
      data.createdAt = Timestamp.now();
      await addDoc(collection(db,"chartOfAccounts"), data);
    }
    modal.style.display = "none";
    loadAccounts();
  }catch(error){alert(error.message);}
  finally{
    document.getElementById("saveAccountBtn").disabled = false;
    document.getElementById("saveAccountBtn").innerText = "Save";
  }
}

loadAccounts();
