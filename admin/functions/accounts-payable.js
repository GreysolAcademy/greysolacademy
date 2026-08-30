import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const app = initializeApp({
    apiKey:"AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",
    projectId:"greysol-academy"
});

const db = getFirestore(app);


const loggedUser =
    JSON.parse(localStorage.getItem("loggedUser"));


if(!loggedUser || loggedUser.role !== "Accountant"){

    alert("Access Denied");

    window.location.href="staff-login.html";
}


document.getElementById("staffName").textContent =
    loggedUser.username;

document.getElementById("staffRole").textContent =
    loggedUser.role;

document.getElementById("avatar").textContent =
    loggedUser.username.charAt(0).toUpperCase();

document.getElementById("portalRole").textContent =
    loggedUser.role + " Portal";


/* SIDEBAR */

document.querySelectorAll(".menu-header").forEach(header=>{

    header.addEventListener("click",()=>{

        header.parentElement.classList.toggle("active");

    });

});


window.toggleSidebar=()=>{

    document.getElementById("sidebar")
        .classList.toggle("open");

    document.getElementById("overlay")
        .classList.toggle("show");

};


document.getElementById("logoutBtn").onclick=e=>{

    e.preventDefault();

    localStorage.removeItem("loggedUser");

    window.location.href="staff-login.html";

};


/* DATA */

let allBills=[];


const num=v=>Number(v||0);


const fmt=n=>"MWK "+Number(n||0).toLocaleString(
    "en-US",
    {
        minimumFractionDigits:2,
        maximumFractionDigits:2
    }
);


const escapeHtml=v=>
    String(v??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");


function getDate(value){

    if(!value) return null;

    if(value?.toDate)
        return value.toDate();

    if(value instanceof Date)
        return value;

    return new Date(value);

}


function isOverdue(bill){

    const balance=num(bill.balance);

    if(balance<=0)
        return false;

    if(!bill.dueDate)
        return false;

    const due=getDate(bill.dueDate);

    if(!due || isNaN(due))
        return false;

    const today=new Date();

    today.setHours(23,59,59,999);

    return due<today;

}


function getStatus(bill){

    const balance=num(bill.balance);

    if(balance<=0)
        return "Paid";

    if(isOverdue(bill))
        return "Overdue";

    if(balance<num(bill.totalAmount))
        return "Partially Paid";

    return "Unpaid";

}


function badgeClass(status){

    if(status==="Paid")
        return "badge-paid";

    if(status==="Partially Paid")
        return "badge-partial";

    if(status==="Overdue")
        return "badge-overdue";

    return "badge-unpaid";

}


/* LOAD BILLS */

async function loadData(){

    try{

        const snap=
            await getDocs(collection(db,"bills"));

        allBills=
            snap.docs.map(d=>({
                id:d.id,
                ...d.data()
            }));

        populateSuppliers();

        render();

    }catch(err){

        console.error(err);

        document.getElementById("payablesTable").innerHTML=`
            <tr>
                <td colspan="10" class="empty error">
                    Error loading payables: ${escapeHtml(err.message)}
                </td>
            </tr>
        `;

    }finally{

        document.getElementById("pageLoader").style.display="none";

    }

}


/* SUPPLIERS */

function populateSuppliers(){

    const select=
        document.getElementById("supplierFilter");

    const suppliers=[
        ...new Set(
            allBills
            .map(b=>b.supplierName)
            .filter(Boolean)
        )
    ].sort();

    suppliers.forEach(s=>{

        const option=
            document.createElement("option");

        option.value=s;
        option.textContent=s;

        select.appendChild(option);

    });

}


/* RENDER */

function render(){

    const search=
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const supplier=
        document.getElementById("supplierFilter").value;

    const status=
        document.getElementById("statusFilter").value;

    const dueBefore=
        document.getElementById("dueDateFilter").value;


    const outstanding=
        allBills.filter(b=>num(b.balance)>0);


    let filtered=
        outstanding.filter(b=>{

            const billNo=b.billNo||"";
            const supplierName=b.supplierName||"";
            const grn=b.grnNo||"";

            const searchable=
                `${billNo} ${supplierName} ${grn}`
                .toLowerCase();

            if(search && !searchable.includes(search))
                return false;

            if(supplier && supplierName!==supplier)
                return false;

            const currentStatus=getStatus(b);

            if(status && currentStatus!==status)
                return false;

            if(dueBefore && b.dueDate){

                const due=getDate(b.dueDate);

                const filterDate=
                    new Date(dueBefore);

                filterDate.setHours(
                    23,59,59,999
                );

                if(due>filterDate)
                    return false;

            }

            return true;

        });


    updateSummary(outstanding);

    document.getElementById("payableCount")
        .textContent=filtered.length+" records";


    if(!filtered.length){

        document.getElementById("payablesTable").innerHTML=`
            <tr>
                <td colspan="10" class="empty">
                    No outstanding payables found.
                </td>
            </tr>
        `;

        return;

    }


    filtered.sort((a,b)=>{

        const ad=getDate(a.dueDate);
        const bd=getDate(b.dueDate);

        return (ad||0)-(bd||0);

    });


    document.getElementById("payablesTable").innerHTML=
        filtered.map(b=>{

            const total=num(b.totalAmount);

            const balance=num(b.balance);

            const paid=
                Math.max(0,total-balance);

            const status=getStatus(b);

            const billDate=getDate(b.date);
            const dueDate=getDate(b.dueDate);


            return `
                <tr>

                    <td class="ref">
                        ${escapeHtml(b.billNo)}
                    </td>

                    <td>
                        ${billDate && !isNaN(billDate)
                            ? billDate.toLocaleDateString("en-GB")
                            : "-"
                        }
                    </td>

                    <td>
                        ${dueDate && !isNaN(dueDate)
                            ? dueDate.toLocaleDateString("en-GB")
                            : "-"
                        }
                    </td>

                    <td>
                        ${escapeHtml(b.supplierName)}
                    </td>

                    <td>
                        ${escapeHtml(b.grnNo)}
                    </td>

                    <td class="amount">
                        ${fmt(total)}
                    </td>

                    <td class="amount">
                        ${fmt(paid)}
                    </td>

                    <td class="amount">
                        ${fmt(balance)}
                    </td>

                    <td>
                        <span class="badge ${badgeClass(status)}">
                            ${status}
                        </span>
                    </td>

                    <td>

                        <button
                            class="btn btn-green"
                            onclick="payBill('${b.id}')">

                            <i class="fa-solid fa-money-check-dollar"></i>
                            Pay

                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* SUMMARY */

function updateSummary(outstanding){

    let total=0;
    let overdue=0;
    let partial=0;

    outstanding.forEach(b=>{

        const balance=num(b.balance);

        total+=balance;

        if(isOverdue(b))
            overdue+=balance;

        if(
            balance>0 &&
            balance<num(b.totalAmount)
        )
            partial+=balance;

    });


    document.getElementById("totalBills")
        .textContent=outstanding.length;

    document.getElementById("totalPayable")
        .textContent=fmt(total);

    document.getElementById("overdueAmount")
        .textContent=fmt(overdue);

    document.getElementById("partialAmount")
        .textContent=fmt(partial);

}


/* PAY BILL */

window.payBill=id=>{

    const bill=
        allBills.find(b=>b.id===id);

    if(!bill)
        return;


    if(num(bill.balance)<=0){

        alert("This bill has already been fully paid.");

        return;

    }


    window.location.href=
        `create-payment-voucher.html?billId=${encodeURIComponent(id)}`;

};


/* FILTERS */

[
    "searchInput",
    "supplierFilter",
    "statusFilter",
    "dueDateFilter"
].forEach(id=>{

    document.getElementById(id)
        .addEventListener("input",render);

    document.getElementById(id)
        .addEventListener("change",render);

});


loadData();

    /* =========================================================
   AUTO LOGOUT AFTER 30 MINUTES OF INACTIVITY
========================================================= */

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let idleTimer;

function resetIdleTimer() {
    clearTimeout(idleTimer);

    idleTimer = setTimeout(async () => {
        try {
            if (typeof auth !== "undefined" && auth.currentUser) {
                await signOut(auth);
            }

            // Redirect to login page
            window.location.href = "loginform.html";

        } catch (error) {
            console.error("Automatic logout failed:", error);

            // Still redirect to login
            window.location.href = "loginform.html";
        }
    }, IDLE_TIMEOUT);
}


/* User activity that resets the timer */
[
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click"
].forEach(event => {
    document.addEventListener(event, resetIdleTimer, {
        passive: true
    });
});


/* Start the timer when the page loads */
resetIdleTimer();
