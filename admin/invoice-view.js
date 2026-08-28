import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getFirestore,

doc,

getDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// FIREBASE CONFIG

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







// GET SELECTED INVOICE ID

const invoiceID =

localStorage.getItem("selectedInvoice");





if(!invoiceID){


alert("No invoice selected");


window.location.href="invoice-list.html";


}







// LOAD INVOICE

async function loadInvoice(){



try{



const invoiceRef =

doc(db,"invoices",invoiceID);





const snapshot =

await getDoc(invoiceRef);






if(!snapshot.exists()){


alert("Invoice not found");


return;


}







const invoice = snapshot.data();







// HEADER DETAILS


document.getElementById("invoiceNumber").innerHTML =

invoice.invoiceNumber || invoiceID.substring(0,8);





let createdDate="-";


if(invoice.createdAt){


if(invoice.createdAt.toDate){


createdDate =

invoice.createdAt.toDate()
.toLocaleDateString();


}

else{


createdDate =

new Date(invoice.createdAt)
.toLocaleDateString();


}


}





document.getElementById("invoiceDate").innerHTML =

createdDate;









// STUDENT DETAILS


document.getElementById("studentName").innerHTML =

invoice.studentName || "-";



document.getElementById("studentID").innerHTML =

invoice.studentID || "-";



document.getElementById("studentClass").innerHTML =

invoice.class || "Not Assigned";







// ACADEMIC DETAILS


document.getElementById("academicYear").innerHTML =

invoice.academicYear || "-";



document.getElementById("term").innerHTML =

invoice.term || "-";









// STATUS


const status =

invoice.status || "Unpaid";



const statusBox =

document.getElementById("status");



statusBox.innerHTML=status;



statusBox.className="status";





if(status==="Paid"){


statusBox.classList.add("paid");


}

else if(status==="Partial"){


statusBox.classList.add("partial");


}

else{


statusBox.classList.add("unpaid");


}









// ITEMS


const itemsTable =

document.getElementById("itemsTable");



itemsTable.innerHTML="";





if(invoice.items && invoice.items.length>0){



invoice.items.forEach(item=>{



itemsTable.innerHTML += `


<tr>

<td>

${item.description}

</td>


<td>

MWK ${Number(item.amount)
.toLocaleString()}

</td>


</tr>


`;



});



}

else{


itemsTable.innerHTML = `

<tr>

<td colspan="2">

No invoice items found

</td>

</tr>

`;


}









// TOTALS


document.getElementById("totalAmount").innerHTML =

"MWK " +

Number(invoice.totalAmount || 0)
.toLocaleString();





document.getElementById("amountPaid").innerHTML =

"MWK " +

Number(invoice.amountPaid || 0)
.toLocaleString();





document.getElementById("balance").innerHTML =

"MWK " +

Number(invoice.balance || 0)
.toLocaleString();







}

catch(error){


console.error(error);


alert(error.message);


}



}







loadInvoice();