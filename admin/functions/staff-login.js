/* =========================================================
   FIREBASE
========================================================= */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

    getFirestore,

    collection,

    query,

    where,

    getDocs,

    getDoc,

    doc,

    updateDoc

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyAgoW4EU_hvrWHSxJciW0qUWeUXOr-msgw",

    authDomain:
        "greysol-academy.firebaseapp.com",

    projectId:
        "greysol-academy",

    storageBucket:
        "greysol-academy.firebasestorage.app",

    messagingSenderId:
        "700477093508",

    appId:
        "1:700477093508:web:d1f95a63483b8e9ab934d1",

    measurementId:
        "G-XY8XSZJ9HE"

};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);



/* =========================================================
   ELEMENTS
========================================================= */

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const errorMessage =
    document.getElementById("error");

const togglePassword =
    document.getElementById("togglePassword");

const eyeIcon =
    document.getElementById("eyeIcon");

const forgotContainer =
    document.getElementById("forgotContainer");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const resetModal =
    document.getElementById("resetModal");

const resetUsername =
    document.getElementById("resetUsername");

const resetEmail =
    document.getElementById("resetEmail");

const resetPhone =
    document.getElementById("resetPhone");

const resetError =
    document.getElementById("resetError");

const verificationStep =
    document.getElementById("verificationStep");

const passwordStep =
    document.getElementById("passwordStep");

const successStep =
    document.getElementById("successStep");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const passwordError =
    document.getElementById("passwordError");



/* =========================================================
   FAILED LOGIN ATTEMPTS
========================================================= */

let failedAttempts = 0;


/* =========================================================
   VERIFIED USER FOR PASSWORD RESET
========================================================= */

let verifiedUserId = null;


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

togglePassword.addEventListener(
    "click",
    function () {

        const isPassword =
            passwordInput.type === "password";


        if (isPassword) {

            passwordInput.type = "text";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

            togglePassword.setAttribute(
                "title",
                "Hide password"
            );


            eyeIcon.innerHTML = `

                <path
                    d="M3 3l18 18"
                ></path>

                <path
                    d="M10.6 5.1
                       A10.8 10.8 0 0 1 12 5
                       c6.5 0 10 7 10 7
                       a18.3 18.3 0 0 1-3.1 4.2"
                ></path>

                <path
                    d="M6.2 6.2
                       C3.5 8.1 2 12 2 12
                       s3.5 7 10 7
                       c1.8 0 3.4-.5 4.8-1.2"
                ></path>

            `;

        }

        else {

            passwordInput.type = "password";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

            togglePassword.setAttribute(
                "title",
                "Show password"
            );


            eyeIcon.innerHTML = `

                <path
                    d="M2 12s3.5-7 10-7
                       10 7 10 7-3.5 7-10 7
                       S2 12 2 12z"
                ></path>

                <circle
                    cx="12"
                    cy="12"
                    r="3"
                ></circle>

            `;

        }

    }
);



/* =========================================================
   LOGIN BUTTON
========================================================= */

loginBtn.addEventListener(
    "click",
    loginUser
);



/* =========================================================
   ENTER KEY LOGIN
========================================================= */

passwordInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            loginUser();

        }

    }
);


usernameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            passwordInput.focus();

        }

    }
);



/* =========================================================
   LOGIN FUNCTION
========================================================= */

async function loginUser() {

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value.trim();


    errorMessage.textContent = "";


    if (
        username === "" ||
        password === ""
    ) {

        errorMessage.textContent =
            "Please enter your username and password.";

        return;

    }


    loginBtn.disabled = true;

    loginBtn.textContent =
        "Signing in...";


    try {

        /*
         * Your existing login system:
         *
         * users.username
         * users.password
         */

        const q = query(

            collection(db, "users"),

            where(
                "username",
                "==",
                username
            ),

            where(
                "password",
                "==",
                password
            )

        );


        const snapshot =
            await getDocs(q);


        /* -----------------------------------------
           WRONG PASSWORD
        ----------------------------------------- */

        if (snapshot.empty) {

            failedAttempts++;


            errorMessage.textContent =
                "Invalid username or password.";


            /*
             * After two failed attempts,
             * show password recovery option.
             */

            if (failedAttempts >= 2) {

                forgotContainer.classList.add("show");

            }


            return;

        }


        /* -----------------------------------------
           SUCCESSFUL LOGIN
        ----------------------------------------- */

        failedAttempts = 0;

        forgotContainer.classList.remove("show");


        const user =
            snapshot.docs[0].data();


        /* -----------------------------------------
           ACCOUNT STATUS
        ----------------------------------------- */

        if (
            user.status !== "Active"
        ) {

            errorMessage.textContent =
                "Your account is inactive. Please contact the administrator.";

            return;

        }


        /* -----------------------------------------
           SAVE LOGIN SESSION
        ----------------------------------------- */

        localStorage.setItem(

            "loggedUser",

            JSON.stringify({

                username:
                    user.username,

                role:
                    user.role,

                staffID:
                    user.staffID,

                permissions:
                    user.permissions || {}

            })

        );


        /* -----------------------------------------
           ROLE REDIRECT
        ----------------------------------------- */

        switch (user.role) {


            case "Administrator":

                window.location.href =
                    "admin-dashboard.html";

                break;


            case "Head Teacher":

                window.location.href =
                    "headteacher-dashboard.html";

                break;


            case "Bursar":

            case "Accountant":

                window.location.href =
                    "accounting-dashboard.html";

                break;


            case "Teacher":

            case "Class Teacher":

                window.location.href =
                    "teacher-dashboard.html";

                break;


            default:

                window.location.href =
                    "admin-dashboard.html";

                break;

        }

    }

    catch (err) {

        console.error(
            "Login error:",
            err
        );


        errorMessage.textContent =
            "Unable to connect to the server. Please try again.";

    }

    finally {

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Login";

    }

}



/* =========================================================
   OPEN RESET MODAL
========================================================= */

forgotPasswordBtn.addEventListener(
    "click",
    function () {

        resetError.textContent = "";

        resetUsername.value =
            usernameInput.value.trim();

        resetEmail.value = "";

        resetPhone.value = "";

        newPassword.value = "";

        confirmPassword.value = "";

        verifiedUserId = null;


        verificationStep.classList.add("active");

        passwordStep.classList.remove("active");

        successStep.classList.remove("show");


        resetModal.classList.add("show");

    }
);



/* =========================================================
   CLOSE RESET MODAL
========================================================= */

document.getElementById(
    "cancelResetBtn"
).addEventListener(
    "click",
    closeResetModal
);


document.getElementById(
    "cancelPasswordBtn"
).addEventListener(
    "click",
    closeResetModal
);


function closeResetModal() {

    resetModal.classList.remove("show");

    resetError.textContent = "";

    passwordError.textContent = "";

    verifiedUserId = null;

}



/* =========================================================
   VERIFY USER INFORMATION
========================================================= */

document.getElementById(
    "verifyDetailsBtn"
).addEventListener(
    "click",
    verifyAccountDetails
);



async function verifyAccountDetails() {


    const username =
        resetUsername.value.trim();

    const email =
        resetEmail.value.trim().toLowerCase();

    const phone =
        resetPhone.value.trim();


    resetError.textContent = "";


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (
        username === "" ||
        email === "" ||
        phone === ""
    ) {

        resetError.textContent =
            "Please enter your username, email and phone number.";

        return;

    }


    const verifyButton =
        document.getElementById(
            "verifyDetailsBtn"
        );


    verifyButton.disabled = true;

    verifyButton.textContent =
        "Verifying...";


    try {


        /* =================================================
           STEP 1
           FIND USER ACCOUNT BY USERNAME
        ================================================= */

        const userQuery = query(

            collection(db, "users"),

            where(
                "username",
                "==",
                username
            )

        );


        const userSnapshot =
            await getDocs(userQuery);


        if (
            userSnapshot.empty
        ) {

            throw new Error(
                "verification_failed"
            );

        }


        /*
         * Get the actual users document.
         */

        const userDoc =
            userSnapshot.docs[0];


        const user =
            userDoc.data();



        /* =================================================
           STEP 2
           CHECK USER ACCOUNT STATUS
        ================================================= */

        if (
            user.status !== "Active"
        ) {

            throw new Error(
                "verification_failed"
            );

        }



        /* =================================================
           STEP 3
           IMPORTANT:
           
           users.staffID contains the FIRESTORE
           DOCUMENT ID of the staff record.
           
           Example:
           
           users
              username: "john"
              staffID: "abc123xyz"
           
           staff
              abc123xyz
                  firstName: "John"
                  email: "..."
                  phone: "..."
        ================================================= */

        if (
            !user.staffID
        ) {

            throw new Error(
                "verification_failed"
            );

        }


        const staffRef =
            doc(
                db,
                "staff",
                user.staffID
            );


        const staffSnapshot =
            await getDoc(
                staffRef
            );


        if (
            !staffSnapshot.exists()
        ) {

            throw new Error(
                "verification_failed"
            );

        }


        const staff =
            staffSnapshot.data();



        /* =================================================
           STEP 4
           GET REGISTERED EMAIL AND PHONE
        ================================================= */

        const registeredEmail =
            String(
                staff.email || ""
            )
            .trim()
            .toLowerCase();


        const registeredPhone =
            String(
                staff.phone || ""
            )
            .trim();



        /* =================================================
           STEP 5
           COMPARE EMAIL
        ================================================= */

        if (
            registeredEmail !== email
        ) {

            throw new Error(
                "verification_failed"
            );

        }



        /* =================================================
           STEP 6
           COMPARE PHONE
           
           We normalize spaces, +, -, brackets.
           
           Example:
           
           +265 991 123 456
           
           becomes:
           
           265991123456
        ================================================= */

        const normalizePhone =
            value =>
                String(value || "")
                    .replace(/\D/g, "");


        const enteredPhone =
            normalizePhone(phone);


        const actualPhone =
            normalizePhone(
                registeredPhone
            );


        if (
            enteredPhone !== actualPhone
        ) {

            throw new Error(
                "verification_failed"
            );

        }



        /* =================================================
           EVERYTHING MATCHES
        ================================================= */

        verifiedUserId =
            userDoc.id;


        verificationStep.classList.remove(
            "active"
        );

        passwordStep.classList.add(
            "active"
        );


        passwordError.textContent = "";


        newPassword.focus();


    }

    catch (error) {

        console.error(
            "Password reset verification:",
            error
        );


        resetError.textContent =
            "The information could not be verified. Please check your username, registered email and phone number.";

    }

    finally {

        verifyButton.disabled = false;

        verifyButton.textContent =
            "Verify";

    }

}



/* =========================================================
   CHANGE PASSWORD
========================================================= */

document.getElementById(
    "changePasswordBtn"
).addEventListener(
    "click",
    changePassword
);



async function changePassword() {


    const password =
        newPassword.value;

    const confirm =
        confirmPassword.value;


    passwordError.textContent = "";


    /* -----------------------------------------
       MAKE SURE VERIFICATION HAPPENED
    ----------------------------------------- */

    if (
        !verifiedUserId
    ) {

        passwordError.textContent =
            "Please verify your account first.";

        return;

    }


    /* -----------------------------------------
       PASSWORD REQUIRED
    ----------------------------------------- */

    if (
        password === "" ||
        confirm === ""
    ) {

        passwordError.textContent =
            "Please enter and confirm your new password.";

        return;

    }


    /* -----------------------------------------
       MINIMUM PASSWORD LENGTH
    ----------------------------------------- */

    if (
        password.length < 6
    ) {

        passwordError.textContent =
            "Password must be at least 6 characters.";

        return;

    }


    /* -----------------------------------------
       PASSWORD MATCH
    ----------------------------------------- */

    if (
        password !== confirm
    ) {

        passwordError.textContent =
            "The passwords do not match.";

        return;

    }


    const changeButton =
        document.getElementById(
            "changePasswordBtn"
        );


    changeButton.disabled = true;

    changeButton.textContent =
        "Changing...";


    try {


        /* =================================================
           GET THE EXISTING USERS DOCUMENT
        ================================================= */

        const userRef =
            doc(
                db,
                "users",
                verifiedUserId
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        if (
            !userSnapshot.exists()
        ) {

            throw new Error(
                "User account no longer exists."
            );

        }


        const user =
            userSnapshot.data();


        /* -----------------------------------------
           MAKE SURE ACCOUNT IS STILL ACTIVE
        ----------------------------------------- */

        if (
            user.status !== "Active"
        ) {

            throw new Error(
                "This account is inactive."
            );

        }


        /* =================================================
           UPDATE PASSWORD
           
           This intentionally matches your current
           login system, which stores:
           
           users.password
        ================================================= */

        await updateDoc(

            userRef,

            {

                password:
                    password,

                updatedAt:
                    new Date()

            }

        );


        /* =================================================
           SUCCESS
        ================================================= */

        passwordStep.classList.remove(
            "active"
        );

        successStep.classList.add(
            "show"
        );


        verifiedUserId = null;


    }

    catch (error) {

        console.error(
            "Password change error:",
            error
        );


        passwordError.textContent =
            error.message ||
            "Unable to change your password. Please try again.";

    }

    finally {

        changeButton.disabled = false;

        changeButton.textContent =
            "Change Password";

    }

}



/* =========================================================
   RETURN TO LOGIN
========================================================= */

document.getElementById(
    "returnLoginBtn"
).addEventListener(
    "click",
    function () {

        resetModal.classList.remove(
            "show"
        );


        usernameInput.value =
            resetUsername.value;


        passwordInput.value = "";


        passwordInput.focus();


        errorMessage.textContent =
            "Your password has been changed successfully.";

        errorMessage.style.color =
            "#16a085";


        forgotContainer.classList.remove(
            "show"
        );


        failedAttempts = 0;


        setTimeout(
            function () {

                errorMessage.textContent = "";

                errorMessage.style.color =
                    "#c62828";

            },
            4000
        );

    }
);



/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

resetModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === resetModal
        ) {

            closeResetModal();

        }

    }
);

