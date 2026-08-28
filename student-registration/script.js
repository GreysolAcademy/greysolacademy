import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",
  authDomain: "greysol-academy.firebaseapp.com",
  projectId: "greysol-academy"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================
// LOAD SUBJECTS FROM FIREBASE - MOVED TO TOP
// ===============================
async function loadSubjects(){
  const container = document.getElementById("subjectsContainer");
  if(!container) return;

  try{
    const snapshot = await getDocs(query(collection(db,"subjects"), where("status","==","Active")));
    container.innerHTML="";
    if(snapshot.empty){ container.innerHTML = `<p style="color:red">No subjects available.</p>`; return; }

    snapshot.forEach(docSnap=>{
      const subject = docSnap.data();
      const isEnglish = subject.subjectName.trim().toLowerCase()==="english";
      container.innerHTML += `
        <label>
          <input type="checkbox" name="subjects" value="${subject.subjectName}" data-id="${subject.subjectID}" ${isEnglish ? "checked readonly" : ""}>
          ${subject.subjectName} ${isEnglish ? "(Compulsory)" : ""}
        </label>
      `;
    });
  }
  catch(error){ 
    console.error(error); 
    container.innerHTML = `<p style="color:red">Failed to load subjects.</p>`; 
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  loadSubjects(); // NOW IT EXISTS

  let currentStep = 0;
  const steps = document.querySelectorAll(".form-step");
  const progressItems = document.querySelectorAll(".progress-steps li");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const submitBtn = document.getElementById("submitBtn");
  const mobileStep = document.getElementById("mobileStep");
  const progressFill = document.querySelector(".progress-fill");
  const form = document.getElementById("studentForm");
  const previewBox = document.getElementById("previewBox");

  // FORM FIELDS
  const firstName = document.getElementById("firstName");
  const middleName = document.getElementById("middleName");
  const surname = document.getElementById("surname");
  const dob = document.getElementById("dob");
  const gender = document.getElementById("gender");
  const guardianName = document.getElementById("guardianName");
  const guardianPhone = document.getElementById("guardianPhone");
  const guardianEmail = document.getElementById("guardianEmail");
  const address = document.getElementById("address");
  const classApplying = document.getElementById("classApplying");
  const previousSchool = document.getElementById("previousSchool");
  const previousClass = document.getElementById("previousClass");
  const admissionYear = document.getElementById("admissionYear");
  const bloodGroup = document.getElementById("bloodGroup");
  const emergencyName = document.getElementById("emergencyName");
  const emergencyPhone = document.getElementById("emergencyPhone");
  const medical = document.getElementById("medical");
  const relationshipEl = document.getElementById("relationship");

  function showStep(step){
    steps.forEach((item,index)=>{ item.classList.toggle("active", index===step); });
    progressItems.forEach((item,index)=>{ item.classList.toggle("active", index<=step); });
    mobileStep.textContent = step + 1;
    progressFill.style.width = ((step+1)/steps.length)*100 + "%";
    backBtn.style.display = step===0? "none" : "inline-block";
    if(step === steps.length-1){ nextBtn.style.display = "none"; submitBtn.style.display = "inline-block"; }
    else{ nextBtn.style.display = "inline-block"; submitBtn.style.display = "none"; }
  }
  showStep(currentStep);

  nextBtn.addEventListener("click",()=>{ if(validateStep()){ currentStep++; showStep(currentStep); } });
  backBtn.addEventListener("click",()=>{ currentStep--; showStep(currentStep); });

  function validateStep(){
    let fields = steps[currentStep].querySelectorAll("input[required],select[required],textarea[required]");
    let valid = true;
    fields.forEach(field=>{ if(field.value.trim()===""){ field.style.border = "2px solid red"; valid=false; } else{ field.style.border = "1px solid #ccc"; } });

    if(currentStep===0){
      let password = document.getElementById("password").value;
      let confirmPassword = document.getElementById("confirmPassword").value;
      if(password!==confirmPassword){ alert("Passwords do not match"); valid=false; }
    }
    if(currentStep===2){
      let selectedSubjects = document.querySelectorAll('input[name="subjects"]:checked');
      let count = selectedSubjects.length;
      if(count < 6){ alert("Please select at least 6 subjects including English."); valid=false; }
      if(count > 9){ alert("You can select a maximum of 9 subjects."); valid=false; }
    }
    return valid;
  }

  // ===============================
  // GENERATE STUDENT ID - UPDATED TO AUTO INCREMENT
  // ===============================
  async function generateStudentID(){
    let first = firstName.value.trim().toUpperCase();
    let last = surname.value.trim().toUpperCase();
    let code = "GST" + last.substring(0,3) + first.substring(0,2); // GSTCHACHA
    
    // Check all students that start with this code
    let snapshot = await getDocs(collection(db,"students"));
    let numbers=[]; 
    snapshot.forEach(docSnap=>{ 
      let sid = docSnap.data().studentID || "";
      if(sid.startsWith(code)){
        let number = parseInt(sid.slice(-2)) || 0; 
        numbers.push(number); 
      }
    });
    let nextNumber = numbers.length===0 ? 1 : Math.max(...numbers)+1;
    let formatted = String(nextNumber).padStart(2,"0");
    
    // Email also auto increment: chacharo01@greysolacademy.com
    let baseEmail = firstName.value.trim().toLowerCase() + surname.value.trim().toLowerCase();
    let emailNumbers = [];
    snapshot.forEach(docSnap=>{
      let em = docSnap.data().loginEmail || "";
      if(em.startsWith(baseEmail)){
        let match = em.match(/\d+/);
        let num = match ? parseInt(match[0]) : 0;
        emailNumbers.push(num);
      }
    });
    let nextEmailNum = emailNumbers.length===0 ? 1 : Math.max(...emailNumbers)+1;
    let loginEmail = baseEmail + String(nextEmailNum).padStart(2,"0") + "@greysolacademy.com";

    return { studentID: code + formatted, idCode: code, loginEmail: loginEmail };
  }

  // PREVIEW BUTTON
  document.getElementById("previewBtn").addEventListener("click", async()=>{
    const generated = await generateStudentID();
    document.getElementById("studentID").value = generated.studentID; // Show in readonly field
    previewBox.innerHTML = `<h3>Student Registration Summary</h3><p><b>Student ID:</b><br>${generated.studentID}</p><p><b>Login Email:</b><br>${generated.loginEmail}</p><hr><p><b>Name:</b><br>${firstName.value} ${middleName.value} ${surname.value}</p><p><b>DOB:</b><br>${dob.value}</p><p><b>Gender:</b><br>${gender.value}</p><hr><h4>Parent</h4><p>${guardianName.value}<br>${guardianPhone.value}</p><hr><h4>Academic</h4><p><b>Class:</b><br>${classApplying.value}</p><p><b>Subjects:</b><br>${Array.from(document.querySelectorAll('input[name="subjects"]:checked')).map(s=>s.value).join(", ")}</p>`;
  });

  // SUBMIT
  submitBtn.disabled = false;
  form.addEventListener("submit", async(e)=>{
    e.preventDefault();
    for(let i=0;i<steps.length-1;i++){ currentStep=i; if(!validateStep()){ showStep(i); alert("Please complete all required fields."); return; } }
    try{
      const generated = await generateStudentID();
      const studentID = generated.studentID;
      const idCode = generated.idCode;
      const loginEmail = generated.loginEmail; // NOW AUTO INCREMENTED
      const password = document.getElementById("password").value;
      
      document.getElementById("studentID").value = studentID;

      const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
      const user = userCredential.user;
      const selectedSubjects = Array.from(document.querySelectorAll('input[name="subjects"]:checked')).map(subject=>subject.value);
      const relationship = relationshipEl? relationshipEl.value : "Parent";

      await setDoc( doc(db,"students", studentID), {
        uid:user.uid, studentID:studentID, idCode:idCode, loginEmail:loginEmail,
        firstName:firstName.value, middleName:middleName.value, surname:surname.value,
        dateOfBirth:dob.value, gender:gender.value, guardianName:guardianName.value, relationship:relationship,
        guardianPhone:guardianPhone.value, guardianEmail:guardianEmail.value, address:address.value,
        classApplying:classApplying.value, previousSchool:previousSchool.value, previousClass:previousClass.value, admissionYear:admissionYear.value,
        subjects:selectedSubjects, bloodGroup:bloodGroup.value, emergencyName:emergencyName.value, emergencyPhone:emergencyPhone.value, medical:medical.value,
        createdAt:new Date()
      });
      showSuccessPopup(studentID, password, loginEmail);
    }
    catch(error){ console.error("SUBMIT ERROR:", error); alert(error.message); }
  });

  function showSuccessPopup(studentID,password,loginEmail){
    const popup = document.createElement("div");
    popup.innerHTML = `<div class="success-overlay"><div class="success-box"><h2>Registration Successful</h2><p>Your account has been created.</p><hr><p><b>Student ID:</b><br>${studentID}</p><p><b>Login Email:</b><br>${loginEmail}</p><p><b>Password:</b><br>${password}</p><hr><p>Use your Student ID and Password to login.</p><button id="loginRedirect">Continue to Login</button></div></div>`;
    document.body.appendChild(popup);
    document.getElementById("loginRedirect").onclick = ()=>{ window.location.href = "../login.html"; };
  }

  // CLEAR
  document.getElementById("clearBtn").addEventListener("click",()=>{ if(confirm("Clear all information?")){ form.reset(); currentStep=0; showStep(currentStep); previewBox.innerHTML = "Your information will appear here before submission."; } });

});