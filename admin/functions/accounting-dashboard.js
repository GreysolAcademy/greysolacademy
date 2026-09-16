
/* =========================================================
   AUTHENTICATION
========================================================= */

const loggedUser =
  JSON.parse(localStorage.getItem("loggedUser"));

if(
  !loggedUser ||
  loggedUser.role !== "Accountant"
){

  alert("Access Denied. Accountants Only.");

  window.location.href =
    "staff-login.html";
}

/* =========================================================
   USER DISPLAY
========================================================= */

document.getElementById("staffName").textContent =
  loggedUser?.username || "Accountant";

document.getElementById("staffRole").textContent =
  loggedUser?.role || "Accountant";

document.getElementById("portalRole").textContent =
  (loggedUser?.role || "Accountant") +
  " Portal";

document.getElementById("avatar").textContent =
  (loggedUser?.username || "A")
  .charAt(0)
  .toUpperCase();

/* =========================================================
   SIDEBAR
========================================================= */

document.querySelectorAll(".menu-header")
.forEach(header=>{

  header.addEventListener("click",()=>{

    header
      .parentElement
      .classList
      .toggle("active");

  });

});

function toggleSidebar(){

  document
    .getElementById("sidebar")
    .classList
    .toggle("open");

  document
    .getElementById("overlay")
    .classList
    .toggle("show");

}

/* =========================================================
   LOGOUT
========================================================= */

document
  .getElementById("logoutBtn")
  .addEventListener("click",e=>{

    e.preventDefault();

    localStorage.removeItem("loggedUser");

    window.location.href =
      "staff-login.html";

  });

/* =========================================================
   QUICK CREATE MENU
========================================================= */

const quickCreateBtn =
  document.getElementById("quickCreateBtn");

const quickCreateMenu =
  document.getElementById("quickCreateMenu");

quickCreateBtn.addEventListener("click",e=>{

  e.stopPropagation();

  quickCreateMenu.classList.toggle("show");

});

document.addEventListener("click",e=>{

  if(
    !quickCreateMenu.contains(e.target) &&
    !quickCreateBtn.contains(e.target)
  ){

    quickCreateMenu.classList.remove("show");

  }

});

/* =========================================================
   HELPERS
========================================================= */

const fmt =
  n =>
  "MWK " +
  Number(n || 0)
  .toLocaleString(
    "en-US",
    {
      maximumFractionDigits:0
    }
  );

const num =
  v =>
  Number(v || 0);

const money =
  n =>
  Math.abs(Number(n || 0));

let allInvoices=[];
let allExpenses=[];
let allReceipts=[];
let allBills=[];
let allJournals=[];
let allAccounts=[];
let allTodos=[];

let incomeExpenseChart=null;

let selectedPeriod="year";

/* =========================================================
   DATE VALUE
========================================================= */

function dateValue(x){

  const raw =
    x?.date ||
    x?.transactionDate ||
    x?.postingDate ||
    x?.invoiceDate ||
    x?.expenseDate ||
    x?.paymentDate ||
    x?.billDate ||
    x?.createdAt ||
    x?.created;

  if(!raw){
    return new Date();
  }

  try{

    if(
      typeof raw?.toDate ===
      "function"
    ){

      return raw.toDate();

    }

    if(raw?.seconds){

      return new Date(
        raw.seconds * 1000
      );

    }

    const d =
      new Date(raw);

    return isNaN(d)
      ? new Date()
      : d;

  }catch{

    return new Date();

  }

}

/* =========================================================
   PERIOD
========================================================= */

function periodRange(period){

  const now =
    new Date();

  let start,end;

  if(period==="month"){

    start =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    end =
      new Date(
        now.getFullYear(),
        now.getMonth()+1,
        0,
        23,
        59,
        59,
        999
      );

  }

  else if(period==="lastMonth"){

    start =
      new Date(
        now.getFullYear(),
        now.getMonth()-1,
        1
      );

    end =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

  }

  else if(period==="quarter"){

    const q =
      Math.floor(
        now.getMonth()/3
      ) * 3;

    start =
      new Date(
        now.getFullYear(),
        q,
        1
      );

    end =
      new Date(
        now.getFullYear(),
        q+3,
        0,
        23,
        59,
        59,
        999
      );

  }

  else{

    start =
      new Date(
        now.getFullYear(),
        0,
        1
      );

    end =
      new Date(
        now.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
      );

  }

  return {
    start,
    end
  };

}

function inPeriod(d,range){

  return (
    d >= range.start &&
    d <= range.end
  );

}

/* =========================================================
   AMOUNTS
========================================================= */

function amount(x){

  return num(
    x?.amount ??
    x?.totalAmount ??
    x?.total ??
    x?.grandTotal ??
    x?.netAmount ??
    0
  );

}

function invoiceBalance(x){

  const total =
    amount(x);

  if(
    x?.balance !== undefined
  ){

    return Math.max(
      0,
      num(x.balance)
    );

  }

  const paid =
    num(
      x?.paid ??
      x?.amountPaid ??
      0
    );

  return Math.max(
    0,
    total-paid
  );

}

function billBalance(x){

  const total =
    amount(x);

  if(
    x?.balance !== undefined
  ){

    return Math.max(
      0,
      num(x.balance)
    );

  }

  const paid =
    num(
      x?.paid ??
      x?.amountPaid ??
      0
    );

  return Math.max(
    0,
    total-paid
  );

}

/* =========================================================
   ACCOUNT HELPERS
========================================================= */

function accountType(a){

  return String(
    a?.type ||
    a?.accountType ||
    a?.category ||
    ""
  )
  .toLowerCase();

}

function accountDetailType(a){

  return String(
    a?.detailType ||
    a?.detail_type ||
    a?.accountDetailType ||
    a?.subType ||
    a?.subtype ||
    ""
  )
  .toLowerCase();

}

function accountName(a){

  return (
    a?.name ||
    a?.accountName ||
    a?.title ||
    "Unnamed Account"
  );

}

/* =========================================================
   IMPORTANT:
   ONLY BANK / CASH ACCOUNTS
========================================================= */

function isCashAccount(a){

  const type =
    accountType(a);

  const detail =
    accountDetailType(a);

  /*
     We deliberately DO NOT use account name
     here.

     This prevents accounts such as:
     - Bank Charges
     - Bank Fees
     - Bank Charges Expense

     from being interpreted as actual bank accounts.
  */

  const validTypes = [
    "bank",
    "cash"
  ];

  const validDetails = [
    "bank",
    "cash",
    "bank account",
    "cash account"
  ];

  return (
    validTypes.includes(type) ||
    validDetails.includes(detail)
  );

}

/* =========================================================
   REVENUE
========================================================= */

function isRevenueAccount(a){

  const t =
    accountType(a);

  const n =
    accountName(a)
    .toLowerCase();

  return (
    t.includes("income") ||
    t.includes("revenue") ||
    n.includes("revenue") ||
    n.includes("sales") ||
    n.includes("fees")
  );

}

/* =========================================================
   EXPENSE
========================================================= */

function isExpenseAccount(a){

  const t =
    accountType(a);

  const n =
    accountName(a)
    .toLowerCase();

  return (
    t.includes("expense") ||
    n.includes("expense") ||
    n.includes("electricity") ||
    n.includes("salary") ||
    n.includes("rent")
  );

}

/* =========================================================
   COST
========================================================= */

function isCostAccount(a){

  const n =
    accountName(a)
    .toLowerCase();

  return (
    n.includes("cost of") ||
    n.includes("cost of goods") ||
    n.includes("direct cost")
  );

}

/* =========================================================
   JOURNAL LINES
========================================================= */

function journalLines(j){

  return Array.isArray(j?.lines)
    ? j.lines
    : Array.isArray(j?.entries)
      ? j.entries
      : [];

}

function lineAmount(l){

  return (
    num(l?.debit) +
    num(l?.credit)
  ) ||
  num(l?.amount);

}

function lineAccountName(l){

  return (
    l?.accountName ||
    l?.account ||
    l?.accountTitle ||
    ""
  );

}

function lineAccountCode(l){

  return (
    l?.accountCode ||
    l?.code ||
    ""
  );

}

/* =========================================================
   CALCULATE JOURNALS
========================================================= */

function calculateFromJournals(range){

  let revenue=0;
  let expenses=0;
  let cost=0;
  let cash=0;

  const cashAccounts =
    allAccounts.filter(
      isCashAccount
    );

  const cashCodes =
    cashAccounts.map(a=>
      String(
        a.code ||
        a.accountCode ||
        a.id ||
        ""
      ).trim()
    );

  allJournals
    .filter(j=>
      inPeriod(
        dateValue(j),
        range
      )
    )
    .forEach(j=>{

      if(
        String(
          j.status || "posted"
        ).toLowerCase()==="draft"
      ){

        return;

      }

      journalLines(j)
      .forEach(l=>{

        const name =
          lineAccountName(l)
          .toLowerCase();

        const code =
          String(
            lineAccountCode(l)
          ).trim();

        const debit =
          num(l.debit);

        const credit =
          num(l.credit);

        const matched =
          allAccounts.find(a=>
            (
              l.accountId &&
              a.id === l.accountId
            ) ||
            (
              accountName(a)
              .toLowerCase()===name
            ) ||
            (
              String(a.code||"")
              === code
            )
          );

        if(matched){

          if(
            isRevenueAccount(matched)
          ){

            revenue +=
              credit-debit;

          }

          else if(
            isCostAccount(matched)
          ){

            cost +=
              debit-credit;

          }

          else if(
            isExpenseAccount(matched)
          ){

            expenses +=
              debit-credit;

          }

        }

        /*
          Cash is calculated ONLY if the
          journal line belongs to an actual
          Bank/Cash account from the COA.
        */

        if(
          code &&
          cashCodes.includes(code)
        ){

          cash +=
            debit-credit;

        }

      });

    });

  return {
    revenue:Math.max(0,revenue),
    expenses:Math.max(0,expenses),
    cost:Math.max(0,cost),
    cash:Math.max(0,cash)
  };

}

/* =========================================================
   CASH BALANCES
========================================================= */

function calculateCashBalances(){

  const map =
    new Map();

  /*
    ONLY accounts classified as Bank/Cash
    are inserted into the map.
  */

  allAccounts
    .filter(isCashAccount)
    .forEach(account=>{

      const code =
        String(
          account.code ||
          account.accountCode ||
          account.id ||
          ""
        ).trim();

      if(!code){
        return;
      }

      map.set(
        code,
        {
          account,
          balance:0
        }
      );

    });

  allJournals
    .forEach(journal=>{

      if(
        String(
          journal.status ||
          "posted"
        ).toLowerCase()==="draft"
      ){

        return;

      }

      journalLines(journal)
      .forEach(line=>{

        const lineCode =
          String(
            line.accountCode ||
            line.code ||
            ""
          ).trim();

        if(
          !lineCode ||
          !map.has(lineCode)
        ){

          return;

        }

        const debit =
          num(line.debit);

        const credit =
          num(line.credit);

        map.get(
          lineCode
        ).balance +=
          debit-credit;

      });

    });

  return [
    ...map.values()
  ];

}

/* =========================================================
   KPI
========================================================= */

function updateKPIs(){

  const range =
    periodRange(
      selectedPeriod
    );

  const journal =
    calculateFromJournals(
      range
    );

  const invoiceOutstanding =
    allInvoices.reduce(
      (s,x)=>
        s + invoiceBalance(x),
      0
    );

  const billOutstanding =
    allBills.reduce(
      (s,x)=>
        s + billBalance(x),
      0
    );

  let revenue =
    journal.revenue;

  let expenses =
    journal.expenses;

  let cost =
    journal.cost;

  if(!revenue){

    revenue =
      allReceipts
      .filter(x=>
        inPeriod(
          dateValue(x),
          range
        )
      )
      .reduce(
        (s,x)=>
          s + amount(x),
        0
      );

  }

  if(!expenses){

    expenses =
      allExpenses
      .filter(x=>
        inPeriod(
          dateValue(x),
          range
        )
      )
      .reduce(
        (s,x)=>
          s + amount(x),
        0
      );

  }

  const cashItems =
    calculateCashBalances();

  const cashTotal =
    cashItems.reduce(
      (s,x)=>
        s+x.balance,
      0
    );

  const net =
    revenue-cost-expenses;

  document.getElementById(
    "cashTotal"
  ).textContent =
    fmt(cashTotal);

  document.getElementById(
    "receivableTotal"
  ).textContent =
    fmt(invoiceOutstanding);

  document.getElementById(
    "payableTotal"
  ).textContent =
    fmt(billOutstanding);

  document.getElementById(
    "profitTotal"
  ).textContent =
    fmt(net);

  document.getElementById(
    "profitFoot"
  ).textContent =
    net>=0
      ? "Profit for selected period"
      : "Loss for selected period";

  document.getElementById(
    "profitFoot"
  ).className =
    "kpi-foot " +
    (
      net>=0
        ? "positive"
        : "negative"
    );

  document.getElementById(
    "pnlRevenue"
  ).textContent =
    fmt(revenue);

  document.getElementById(
    "pnlCost"
  ).textContent =
    fmt(cost);

  document.getElementById(
    "pnlGross"
  ).textContent =
    fmt(revenue-cost);

  document.getElementById(
    "pnlExpenses"
  ).textContent =
    fmt(expenses);

  document.getElementById(
    "pnlNet"
  ).textContent =
    fmt(net);

  const labels={
    month:"This Month",
    lastMonth:"Last Month",
    quarter:"This Quarter",
    year:"This Year"
  };

  document.getElementById(
    "chartPeriod"
  ).textContent =
    labels[selectedPeriod];

  document.getElementById(
    "pnlPeriod"
  ).textContent =
    labels[selectedPeriod];

  document.getElementById(
    "periodDescription"
  ).textContent =
    labels[selectedPeriod] +
    " financial position and activity";

}

/* =========================================================
   RENDER BANKS
========================================================= */

function renderBanks(){

  const items =
    calculateCashBalances();

  const el =
    document.getElementById(
      "bankList"
    );

  document.getElementById(
    "bankCount"
  ).textContent =
    items.length +
    " account" +
    (
      items.length===1
        ? ""
        : "s"
    );

  if(!items.length){

    el.innerHTML=`
      <div class="empty">
        No Bank or Cash accounts found
        in Chart of Accounts.
      </div>
    `;

    return;

  }

  items.sort(
    (a,b)=>
      b.balance-a.balance
  );

  el.innerHTML =
    items
    .slice(0,7)
    .map(x=>{

      const account =
        x.account;

      const code =
        String(
          account.code ||
          account.accountCode ||
          account.id ||
          ""
        );

      const name =
        accountName(account);

      return `

        <div
          class="bank-row"
          ondblclick="
            openAccountLedger(
              '${encodeURIComponent(code)}'
            )
          "
          title="Double-click to open General Ledger"
        >

          <div class="bank-left">

            <div class="bank-icon">
              <i class="fa-solid fa-building-columns"></i>
            </div>

            <div>

              <div class="bank-name">
                ${name}
              </div>

              <div class="bank-code">
                ${code || "Cash / Bank"}
              </div>

            </div>

          </div>

          <div class="bank-right">

            <div class="bank-meta">

              <div class="bank-balance">
                ${fmt(x.balance)}
              </div>

              <div class="bank-status">
                Double-click to view ledger
              </div>

            </div>

            <i
              class="fa-solid fa-chevron-right bank-arrow">
            </i>

          </div>

        </div>

      `;

    })
    .join("");

  const total =
    items.reduce(
      (sum,x)=>
        sum+x.balance,
      0
    );

  el.innerHTML += `

    <div class="total-row">

      <span>
        Total Cash & Bank
      </span>

      <span>
        ${fmt(total)}
      </span>

    </div>

  `;

}

/* =========================================================
   LEDGER
========================================================= */

function openAccountLedger(
  accountCode
){

  if(!accountCode){
    return;
  }

  window.location.href =
    "ledger.html?account=" +
    accountCode;

}

/* =========================================================
   AGING
========================================================= */

function agingData(
  items,
  balanceFn
){

  const buckets=[
    0,
    0,
    0,
    0
  ];

  const today =
    new Date();

  today.setHours(
    23,59,59,999
  );

  items.forEach(x=>{

    const bal =
      balanceFn(x);

    if(bal<=0){
      return;
    }

    const d =
      dateValue(x);

    const days =
      Math.max(
        0,
        Math.floor(
          (
            today-d
          ) /
          86400000
        )
      );

    if(days<=30)
      buckets[0]+=bal;

    else if(days<=60)
      buckets[1]+=bal;

    else if(days<=90)
      buckets[2]+=bal;

    else
      buckets[3]+=bal;

  });

  return buckets;

}

function renderAging(
  target,
  buckets,
  totalLabel
){

  const total =
    buckets.reduce(
      (a,b)=>
        a+b,
      0
    );

  const max =
    Math.max(
      ...buckets,
      1
    );

  const names=[
    "Current / 0–30 days",
    "31–60 days",
    "61–90 days",
    "90+ days"
  ];

  document.getElementById(
    target
  ).innerHTML =

    buckets
    .map(
      (v,i)=>`

        <div class="aging-row">

          <div class="aging-label">

            <span>
              ${names[i]}
            </span>

            <span>
              ${fmt(v)}
            </span>

          </div>

          <div class="progress">

            <span
              style="
                width:${Math.min(
                  100,
                  v/max*100
                )}%;
                background:${
                  i===3
                    ? "#c0392b"
                    : i===2
                      ? "#f39c12"
                      : "#1769aa"
                };
              ">
            </span>

          </div>

        </div>

      `
    )
    .join("") +

    `

      <div class="aging-summary">

        <span>
          ${totalLabel}
        </span>

        <strong>
          ${fmt(total)}
        </strong>

      </div>

    `;

}

/* =========================================================
   TRANSACTIONS
========================================================= */

function renderTransactions(){

  const data=[];

  allInvoices.forEach(x=>

    data.push({
      d:dateValue(x),
      ref:
        x.invoiceNo ||
        x.reference ||
        x.id,
      desc:
        x.studentName
          ? `Invoice — ${x.studentName}`
          : "Customer invoice",
      type:"Invoice",
      status:
        x.status ||
        "Posted",
      amount:
        amount(x)
    })

  );

  allReceipts.forEach(x=>

    data.push({
      d:dateValue(x),
      ref:
        x.receiptNo ||
        x.reference ||
        x.id,
      desc:
        x.studentName
          ? `Payment — ${x.studentName}`
          : "Customer payment",
      type:"Payment",
      status:
        x.status ||
        "Posted",
      amount:
        amount(x)
    })

  );

  allExpenses.forEach(x=>

    data.push({
      d:dateValue(x),
      ref:
        x.expenseNo ||
        x.reference ||
        x.id,
      desc:
        x.description ||
        "Expense",
      type:"Expense",
      status:
        x.status ||
        "Posted",
      amount:
        amount(x)
    })

  );

  allBills.forEach(x=>

    data.push({
      d:dateValue(x),
      ref:
        x.billNo ||
        x.reference ||
        x.id,
      desc:
        x.supplierName
          ? `Bill — ${x.supplierName}`
          : "Supplier bill",
      type:"Bill",
      status:
        x.status ||
        "Posted",
      amount:
        amount(x)
    })

  );

  allJournals.forEach(x=>

    data.push({
      d:dateValue(x),
      ref:
        x.journalNo ||
        x.reference ||
        x.id,
      desc:
        x.description ||
        "Journal entry",
      type:"Journal",
      status:
        x.status ||
        "Posted",
      amount:
        journalLines(x)
        .reduce(
          (s,l)=>
            s+num(l.debit),
          0
        )
    })

  );

  data.sort(
    (a,b)=>
      b.d-a.d
  );

  const el =
    document.getElementById(
      "transactionTable"
    );

  if(!data.length){

    el.innerHTML=`
      <tr>
        <td
          colspan="6"
          class="empty">
          No transactions found.
        </td>
      </tr>
    `;

    return;

  }

  el.innerHTML =
    data
    .slice(0,10)
    .map(x=>{

      const s =
        String(x.status)
        .toLowerCase();

      const cls =
        s.includes("draft")
          ? "badge-orange"
          : s.includes("cancel")
            ? "badge-red"
            : x.type==="Payment"
              ? "badge-green"
              : "badge-blue";

      return `

        <tr>

          <td>
            ${x.d.toLocaleDateString("en-GB")}
          </td>

          <td class="ref">
            ${x.ref}
          </td>

          <td>
            ${x.desc}
          </td>

          <td>
            ${x.type}
          </td>

          <td>

            <span
              class="badge ${cls}">
              ${x.status}
            </span>

          </td>

          <td class="amount">
            ${fmt(x.amount)}
          </td>

        </tr>

      `;

    })
    .join("");

}

/* =========================================================
   ALERTS
========================================================= */

function renderAlerts(){

  const overdueInv =
    allInvoices.filter(x=>
      invoiceBalance(x)>0 &&
      Math.floor(
        (
          new Date() -
          dateValue(x)
        ) /
        86400000
      )>30
    );

  const overdueBills =
    allBills.filter(x=>
      billBalance(x)>0 &&
      Math.floor(
        (
          new Date() -
          dateValue(x)
        ) /
        86400000
      )>30
    );

  const drafts =
    allJournals.filter(x=>
      String(
        x.status || ""
      ).toLowerCase()==="draft"
    );

  const alerts=[];

  if(overdueInv.length){

    alerts.push([
      "red",
      "fa-file-circle-exclamation",
      `${overdueInv.length} overdue customer invoice${overdueInv.length>1?"s":""}`,
      "Review accounts receivable"
    ]);

  }

  if(overdueBills.length){

    alerts.push([
      "orange",
      "fa-clock",
      `${overdueBills.length} overdue supplier bill${overdueBills.length>1?"s":""}`,
      "Review accounts payable"
    ]);

  }

  if(drafts.length){

    alerts.push([
      "blue",
      "fa-pen-to-square",
      `${drafts.length} journal${drafts.length>1?"s":""} in draft`,
      "Post or review pending entries"
    ]);

  }

  if(
    !allAccounts.filter(
      isCashAccount
    ).length
  ){

    alerts.push([
      "red",
      "fa-building-columns",
      "No cash/bank accounts detected",
      "Check Chart of Accounts"
    ]);

  }

  if(!alerts.length){

    alerts.push([
      "green",
      "fa-circle-check",
      "No critical accounting alerts",
      "Your books look clear"
    ]);

  }

  const colors={
    red:[
      "#fbeceb",
      "#c0392b"
    ],
    orange:[
      "#fff4df",
      "#a76600"
    ],
    blue:[
      "#e8f1fb",
      "#1769aa"
    ],
    green:[
      "#e8f7ef",
      "#1f9d55"
    ]
  };

  document.getElementById(
    "alertList"
  ).innerHTML =

    alerts
    .slice(0,5)
    .map(a=>`

      <div class="alert">

        <div
          class="alert-icon"
          style="
            background:${colors[a[0]][0]};
            color:${colors[a[0]][1]}
          ">

          <i
            class="fa-solid ${a[1]}">
          </i>

        </div>

        <div class="alert-text">

          <strong>
            ${a[2]}
          </strong>

          <span>
            ${a[3]}
          </span>

        </div>

        <div class="alert-count">

          <i
            class="fa-solid fa-chevron-right">
          </i>

        </div>

      </div>

    `)
    .join("");

  document.getElementById(
    "alertSummary"
  ).textContent =
    alerts.length +
    " item" +
    (
      alerts.length===1
        ? ""
        : "s"
    );

}

/* =========================================================
   TODAY TODOS
========================================================= */

function renderTodayTodos(){

  const today =
    new Date()
    .toDateString();

  const rows =
    allTodos
    .filter(x=>
      dateValue(x)
      .toDateString()===today
    )
    .sort(
      (a,b)=>
        String(
          a.time||""
        )
        .localeCompare(
          String(
            b.time||""
          )
        )
    );

  document.getElementById(
    "todayCount"
  ).textContent =
    rows.length +
    " task" +
    (
      rows.length===1
        ? ""
        : "s"
    );

  document.getElementById(
    "todayTodos"
  ).innerHTML =

    rows.length

      ? rows
        .slice(0,6)
        .map(x=>`

          <div class="todo">

            <span class="todo-time">

              ${
                x.time ||
                dateValue(x)
                .toLocaleTimeString(
                  "en-US",
                  {
                    hour:"2-digit",
                    minute:"2-digit"
                  }
                )
              }

            </span>

            <span class="todo-title">

              ${
                x.title ||
                "Untitled task"
              }

            </span>

          </div>

        `)
        .join("")

      : `
        <div class="empty">
          No tasks for today.
        </div>
      `;

}

/* =========================================================
   CALENDAR
========================================================= */

let calendarDate =
  new Date();

function todoDateKey(x){

  const d =
    dateValue(x);

  return [
    d.getFullYear(),
    String(
      d.getMonth()+1
    ).padStart(2,"0"),
    String(
      d.getDate()
    ).padStart(2,"0")
  ].join("-");

}

function localDateKey(date){

  return [
    date.getFullYear(),
    String(
      date.getMonth()+1
    ).padStart(2,"0"),
    String(
      date.getDate()
    ).padStart(2,"0")
  ].join("-");

}

function renderCalendar(){

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const monthName =
    calendarDate.toLocaleDateString(
      "en-US",
      {
        month:"long",
        year:"numeric"
      }
    );

  document.getElementById(
    "calendarMonth"
  ).textContent =
    monthName;

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month+1,
      0
    );

  const startDay =
    firstDay.getDay();

  const totalDays =
    lastDay.getDate();

  const previousLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  let html="";

  /*
    Previous month dates
  */

  for(
    let i=startDay-1;
    i>=0;
    i--
  ){

    const day =
      previousLastDay-i;

    html += calendarDayHTML(
      new Date(
        year,
        month-1,
        day
      ),
      true
    );

  }

  /*
    Current month
  */

  for(
    let day=1;
    day<=totalDays;
    day++
  ){

    html += calendarDayHTML(
      new Date(
        year,
        month,
        day
      ),
      false
    );

  }

  /*
    Next month dates
  */

  const cells =
    startDay +
    totalDays;

  const remaining =
    Math.ceil(
      cells/7
    )*7-cells;

  for(
    let day=1;
    day<=remaining;
    day++
  ){

    html += calendarDayHTML(
      new Date(
        year,
        month+1,
        day
      ),
      true
    );

  }

  document.getElementById(
    "calendarGrid"
  ).innerHTML =
    html;

  document
    .querySelectorAll(
      ".calendar-day"
    )
    .forEach(dayEl=>{

      dayEl.addEventListener(
        "click",
        ()=>{

          const key =
            dayEl.dataset.date;

          const clickedDate =
            new Date(
              key+"T00:00:00"
            );

          openTodoModal(
            clickedDate
          );

        }
      );

    });

}

function calendarDayHTML(
  date,
  otherMonth
){

  const key =
    localDateKey(date);

  const todayKey =
    localDateKey(
      new Date()
    );

  const todos =
    allTodos.filter(
      x =>
        todoDateKey(x)===key
    );

  const today =
    key===todayKey;

  return `

    <div
      class="
        calendar-day
        ${otherMonth ? "other-month" : ""}
        ${today ? "today" : ""}
      "
      data-date="${key}"
      title="Click to view tasks"
    >

      <div
        class="calendar-day-number">
        ${date.getDate()}
      </div>

      ${
        todos.length
          ? `
            <div
              class="todo-dot">
            </div>

            <div
              class="todo-count">
              ${todos.length}
            </div>
          `
          : ""
      }

    </div>

  `;

}

/* =========================================================
   TODO MODAL
========================================================= */

function openTodoModal(date){

  const key =
    localDateKey(date);

  const todos =
    allTodos
    .filter(
      x =>
        todoDateKey(x)===key
    )
    .sort(
      (a,b)=>
        String(
          a.time||""
        )
        .localeCompare(
          String(
            b.time||""
          )
        )
    );

  document.getElementById(
    "modalDateTitle"
  ).textContent =
    date.toLocaleDateString(
      "en-US",
      {
        weekday:"long",
        month:"long",
        day:"numeric",
        year:"numeric"
      }
    );

  document.getElementById(
    "modalDateSubtitle"
  ).textContent =
    todos.length +
    " task" +
    (
      todos.length===1
        ? ""
        : "s"
    ) +
    " scheduled";

  const body =
    document.getElementById(
      "modalTodoBody"
    );

  if(!todos.length){

    body.innerHTML = `

      <div class="empty">

        <i
          class="fa-regular fa-calendar-check"
          style="
            font-size:30px;
            margin-bottom:10px;
            color:#9ca3af;
          ">
        </i>

        <div>
          No Todo items for this date.
        </div>

      </div>

    `;

  }

  else{

    body.innerHTML =
      todos
      .map(todo=>`

        <div class="modal-todo">

          <div class="modal-todo-icon">

            <i
              class="fa-solid fa-list-check">
            </i>

          </div>

          <div class="modal-todo-content">

            <div class="modal-todo-title">

              ${
                todo.title ||
                "Untitled task"
              }

            </div>

            <div class="modal-todo-time">

              <i
                class="fa-regular fa-clock">
              </i>

              ${
                todo.time ||
                dateValue(todo)
                .toLocaleTimeString(
                  "en-US",
                  {
                    hour:"2-digit",
                    minute:"2-digit"
                  }
                )
              }

            </div>

          </div>

        </div>

      `)
      .join("");

  }

  document.getElementById(
    "todoModal"
  ).classList.add("show");

}

function closeTodoModal(){

  document.getElementById(
    "todoModal"
  ).classList.remove("show");

}

document.getElementById(
  "closeTodoModal"
).addEventListener(
  "click",
  closeTodoModal
);

document.getElementById(
  "todoModal"
).addEventListener(
  "click",
  e=>{

    if(
      e.target.id==="todoModal"
    ){

      closeTodoModal();

    }

  }
);

/* =========================================================
   CALENDAR NAVIGATION
========================================================= */

document.getElementById(
  "previousMonth"
).addEventListener(
  "click",
  ()=>{

    calendarDate =
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth()-1,
        1
      );

    renderCalendar();

  }
);

document.getElementById(
  "nextMonth"
).addEventListener(
  "click",
  ()=>{

    calendarDate =
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth()+1,
        1
      );

    renderCalendar();

  }
);

/* =========================================================
   CHART
========================================================= */

function renderChart(){

  const labels=[
    "Jan","Feb","Mar","Apr",
    "May","Jun","Jul","Aug",
    "Sep","Oct","Nov","Dec"
  ];

  const revenue =
    Array(12).fill(0);

  const expenses =
    Array(12).fill(0);

  allReceipts.forEach(x=>{

    const d =
      dateValue(x);

    revenue[
      d.getMonth()
    ] += amount(x);

  });

  allExpenses.forEach(x=>{

    const d =
      dateValue(x);

    expenses[
      d.getMonth()
    ] += amount(x);

  });

  if(incomeExpenseChart){

    incomeExpenseChart.destroy();

  }

  incomeExpenseChart =
    new Chart(
      document.getElementById(
        "incomeExpenseChart"
      ),
      {
        type:"bar",

        data:{
          labels,

          datasets:[

            {
              label:"Revenue",
              data:revenue,
              borderRadius:5
            },

            {
              label:"Expenses",
              data:expenses,
              borderRadius:5
            }

          ]

        },

        options:{
          responsive:true,
          maintainAspectRatio:false,

          plugins:{
            legend:{
              position:"top",
              labels:{
                font:{
                  size:10
                }
              }
            }
          },

          scales:{
            x:{
              grid:{
                display:false
              }
            },

            y:{
              beginAtZero:true,

              ticks:{
                callback:v=>
                  "MWK " +
                  Number(v)
                  .toLocaleString()
              }

            }

          }

        }

      }
    );

}

/* =========================================================
   FIREBASE LOAD
========================================================= */

async function loadData(){

  try{

    const {
      initializeApp
    } =
      await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
      );

    const {
      getFirestore,
      collection,
      getDocs,
      query,
      where
    } =
      await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
      );

    const app =
      initializeApp({
        apiKey:
          "AIzaSyAgoW4eu_hvrWHSxJciW0qU0WeUXOr-msgw",
        projectId:
          "greysol-academy"
      });

    const db =
      getFirestore(app);

    const read =
      async name=>{

        try{

          return (
            await getDocs(
              collection(
                db,
                name
              )
            )
          )
          .docs
          .map(
            d=>({
              id:d.id,
              ...d.data()
            })
          );

        }

        catch(e){

          console.warn(
            name,
            e
          );

          return [];

        }

      };

    [
      allInvoices,
      allExpenses,
      allReceipts,
      allBills,
      allJournals,
      allAccounts
    ] =
      await Promise.all([

        read("invoices"),

        read("expenses"),

        read("receipts"),

        read("bills"),

        read("journalEntries"),

        read("chartOfAccounts")

      ]);

    /* =====================================================
       TODOS
    ====================================================== */

    try{

      const q =
        query(
          collection(
            db,
            "todos"
          ),
          where(
            "createdBy",
            "==",
            loggedUser.username
          )
        );

      allTodos =
        (
          await getDocs(q)
        )
        .docs
        .map(
          d=>({
            id:d.id,
            ...d.data()
          })
        );

    }

    catch(e){

      console.warn(
        "Todos:",
        e
      );

      allTodos=[];

    }

    /* =====================================================
       RENDER
    ====================================================== */

    updateKPIs();

    renderBanks();

    renderAging(
      "receivableAging",
      agingData(
        allInvoices,
        invoiceBalance
      ),
      "Total Receivables"
    );

    renderAging(
      "payableAging",
      agingData(
        allBills,
        billBalance
      ),
      "Total Payables"
    );

    renderTransactions();

    renderAlerts();

    renderTodayTodos();

    renderChart();

    renderCalendar();

  }

  catch(e){

    console.error(
      "Dashboard loading error:",
      e
    );

  }

  finally{

    document.getElementById(
      "pageLoader"
    ).style.display =
      "none";

  }

}

/* =========================================================
   PERIOD CHANGE
========================================================= */

document.getElementById(
  "periodSelect"
)
.addEventListener(
  "change",
  e=>{

    selectedPeriod =
      e.target.value;

    updateKPIs();

    renderBanks();

  }
);

/* =========================================================
   FALLBACK LOADER
========================================================= */

setTimeout(
  ()=>{
    document.getElementById(
      "pageLoader"
    ).style.display="none";
  },
  10000
);

/* =========================================================
   START
========================================================= */

loadData();

