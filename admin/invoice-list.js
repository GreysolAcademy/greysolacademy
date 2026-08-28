import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getFirestore,

collection,

getDocs,

deleteDoc,

doc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";





// FIREBASE CONFIGURATION

const firebaseConfig = {

apiKey: "AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",

authDomain: "greysol-academy.firebaseapp.com",

projectId: "greysol-academy",

storageBucket: "greysol-academy.firebasestorage.app",

messagingSenderId: "700477093508",

appId: "1:700477093508:web:d1f95a63483b8e9ab934d1",

measurementId: "G-XY8XSZJ9HE"

};





const app = initializeApp(firebaseConfig);


const db = getFirestore(app);





let invoices = [];






// LOAD INVOICES

async function loadInvoices(){


try{


const snapshot = await getDocs(

collection(db,"invoices")

);



invoices=[];



snapshot.forEach((item)=>{


invoices.push({

id:item.id,

...item.data()

});


});





displayInvoices(invoices);


updateSummary(invoices);



}

catch(error){


console.error(error);


alert(error.message);


}



}







// DISPLAY TABLE

function displayInvoices(data){



const table = 

document.getElementById("invoiceTable");



table.innerHTML="";





if(data.length===0){


table.innerHTML = `

<tr>

<td colspan="9">

No invoices found

</td>

</tr>

`;


return;


}







data.forEach(invoice=>{





let statusClass="unpaid";


if(invoice.status==="Paid"){

statusClass="paid";

}


else if(invoice.status==="Partial"){

statusClass="partial";

}







table.innerHTML += `



<tr>


<td>

${invoice.invoiceNumber || invoice.id.substring(0,8)}

</td>



<td>

<b>${invoice.studentName || "-"}</b>

<br>

${invoice.studentID || ""}

</td>




<td>

${invoice.class || "Not Assigned"}

</td>




<td>

${invoice.term || "-"}

</td>




<td>

MWK ${Number(invoice.totalAmount || 0).toLocaleString()}

</td>



<td>

MWK ${Number(invoice.amountPaid || 0).toLocaleString()}

</td>



<td>

MWK ${Number(invoice.balance || 0).toLocaleString()}

</td>



<td>

<span class="status ${statusClass}">

${invoice.status || "Unpaid"}

</span>

</td>





<td>


<button 

class="action-btn view"

onclick="viewInvoice('${invoice.id}')">

View

</button>



<button 

class="action-btn print"

onclick="printInvoice('${invoice.id}')">

Print

</button>




<button 

class="action-btn delete"

onclick="deleteInvoice('${invoice.id}')">

Delete

</button>



</td>



</tr>



`;




});



}








// SUMMARY CARDS

function updateSummary(data){



let totalInvoices=data.length;


let totalBilled=0;

let totalPaid=0;

let totalBalance=0;



data.forEach(invoice=>{


totalBilled += Number(invoice.totalAmount)||0;


totalPaid += Number(invoice.amountPaid)||0;


totalBalance += Number(invoice.balance)||0;



});






document.getElementById("totalInvoices").innerHTML =

totalInvoices;



document.getElementById("totalBilled").innerHTML =

"MWK " + totalBilled.toLocaleString();



document.getElementById("totalPaid").innerHTML =

"MWK " + totalPaid.toLocaleString();



document.getElementById("totalBalance").innerHTML =

"MWK " + totalBalance.toLocaleString();



}








// SEARCH

document

.getElementById("search")

.addEventListener(

"input",

function(){


filterInvoices();


}

);







// CLASS FILTER

document

.getElementById("classFilter")

.addEventListener(

"change",

function(){


filterInvoices();


}

);







// STATUS FILTER

document

.getElementById("statusFilter")

.addEventListener(

"change",

function(){


filterInvoices();


}

);








function filterInvoices(){



let search =

document.getElementById("search").value.toLowerCase();



let selectedClass =

document.getElementById("classFilter").value;



let selectedStatus =

document.getElementById("statusFilter").value;







let filtered = invoices.filter(invoice=>{



let matchSearch =


(invoice.studentName || "")

.toLowerCase()

.includes(search)



||

(invoice.studentID || "")

.toLowerCase()

.includes(search);







let matchClass =


selectedClass===""

||

invoice.class===selectedClass;







let matchStatus =


selectedStatus===""

||

invoice.status===selectedStatus;







return matchSearch && matchClass && matchStatus;



});







displayInvoices(filtered);



}









// DELETE INVOICE


window.deleteInvoice = async function(id){



if(!confirm("Delete this invoice?")){

return;

}



try{


await deleteDoc(

doc(db,"invoices",id)

);



alert("Invoice deleted");


loadInvoices();



}

catch(error){


alert(error.message);


}



}








// VIEW INVOICE

window.viewInvoice=function(id){


localStorage.setItem(

"selectedInvoice",

id

);



window.location.href="invoice-view.html";


}








// PRINT INVOICE

window.printInvoice=function(id){



localStorage.setItem(

"selectedInvoice",

id

);



window.location.href="invoice-view.html";


}









// START

loadInvoices();