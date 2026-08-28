/*
===========================================================
 GREYSOL ACADEMY - GLOBAL TODO NOTIFICATION ENGINE
===========================================================

This file should be loaded on EVERY accounting page.

It provides:

1. 5-minute Todo reminders
2. Due-time Todo reminders
3. Browser notifications
4. In-page notification popup
5. User-specific Todo filtering
6. Duplicate notification prevention
7. Works regardless of which accounting page is open

Firestore collection:
    todos

Expected Todo structure:

{
    title: "Prepare bank reconciliation",
    description: "Reconcile the main bank account",
    date: "2026-08-17",
    time: "14:30",
    createdBy: "Mayesero",
    assignedTo: "Mayesero",
    completed: false,
    status: "pending",
    createdAt: ...
}

===========================================================
*/

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyAgoW4eu_hvrWHSxJciW0qUWeUXOr-msgw",
    projectId: "greysol-academy"
};

const app = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   CURRENT USER
========================================================= */

let loggedUser = null;

try {
    loggedUser = JSON.parse(
        localStorage.getItem("loggedUser")
    );
} catch (error) {
    loggedUser = null;
}

if (!loggedUser) {
    console.warn(
        "Global Todo Notification Engine: No logged-in user."
    );
}


/* =========================================================
   USER IDENTIFIERS
========================================================= */

function getCurrentUsername() {

    if (!loggedUser) return "";

    return String(
        loggedUser.username ||
        loggedUser.fullName ||
        loggedUser.name ||
        loggedUser.email ||
        ""
    ).trim();
}


const currentUsername = getCurrentUsername();


/* =========================================================
   NOTIFICATION PERMISSION
========================================================= */

async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        console.warn(
            "This browser does not support notifications."
        );
        return "unsupported";
    }

    if (Notification.permission === "granted") {
        return "granted";
    }

    if (Notification.permission === "denied") {
        return "denied";
    }

    try {

        const permission =
            await Notification.requestPermission();

        return permission;

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );

        return "denied";
    }
}


/* =========================================================
   REQUEST PERMISSION AFTER USER INTERACTION
========================================================= */

function setupNotificationPermission() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "default") {
        return;
    }

    /*
       Browsers are more likely to allow notification
       permission when requested after user interaction.

       We wait for the first click anywhere on the page.
    */

    const request = () => {

        requestNotificationPermission();

        document.removeEventListener(
            "click",
            request
        );

    };

    document.addEventListener(
        "click",
        request,
        { once: true }
    );
}

setupNotificationPermission();


/* =========================================================
   NOTIFICATION STORAGE
========================================================= */

function getNotificationStorage() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "greysolTodoNotifications"
            )
        ) || {};

    } catch {

        return {};

    }
}


function saveNotificationStorage(data) {

    try {

        localStorage.setItem(
            "greysolTodoNotifications",
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Unable to save notification history.",
            error
        );

    }
}


/* =========================================================
   CHECK WHETHER REMINDER WAS ALREADY SHOWN
========================================================= */

function reminderAlreadyShown(todoId, type) {

    const storage =
        getNotificationStorage();

    const key =
        `${todoId}_${type}`;

    return !!storage[key];
}


/* =========================================================
   MARK REMINDER AS SHOWN
========================================================= */

function markReminderShown(todoId, type) {

    const storage =
        getNotificationStorage();

    const key =
        `${todoId}_${type}`;

    storage[key] = {
        shownAt: Date.now()
    };

    saveNotificationStorage(storage);
}


/* =========================================================
   CLEAN OLD NOTIFICATION HISTORY
========================================================= */

function cleanNotificationStorage() {

    const storage =
        getNotificationStorage();

    const now =
        Date.now();

    const maxAge =
        7 * 24 * 60 * 60 * 1000;

    let changed = false;

    Object.keys(storage).forEach(key => {

        if (
            !storage[key] ||
            !storage[key].shownAt ||
            now - storage[key].shownAt > maxAge
        ) {

            delete storage[key];
            changed = true;

        }

    });

    if (changed) {
        saveNotificationStorage(storage);
    }
}


/* =========================================================
   TODO DATE/TIME
========================================================= */

function getTodoDateTime(todo) {

    /*
       Supports:

       date + time
       todoDate + todoTime
       dueDate + dueTime
       timestamp-like Firestore values
    */

    let dateValue =
        todo.date ||
        todo.todoDate ||
        todo.dueDate;

    let timeValue =
        todo.time ||
        todo.todoTime ||
        todo.dueTime;

    if (
        !dateValue &&
        todo.dateTime
    ) {

        dateValue =
            todo.dateTime;

    }


    /*
       Firestore Timestamp
    */

    if (
        dateValue &&
        typeof dateValue.toDate === "function"
    ) {

        const date =
            dateValue.toDate();

        if (timeValue) {

            const parts =
                String(timeValue)
                    .split(":");

            if (parts.length >= 2) {

                date.setHours(
                    Number(parts[0]),
                    Number(parts[1]),
                    0,
                    0
                );
            }
        }

        return date;
    }


    /*
       JavaScript Date
    */

    if (dateValue instanceof Date) {

        const date =
            new Date(dateValue);

        if (timeValue) {

            const parts =
                String(timeValue)
                    .split(":");

            if (parts.length >= 2) {

                date.setHours(
                    Number(parts[0]),
                    Number(parts[1]),
                    0,
                    0
                );
            }
        }

        return date;
    }


    /*
       Date string
    */

    if (dateValue) {

        let dateString =
            String(dateValue).trim();

        /*
           If date is already a datetime string,
           use it directly.
        */

        if (
            dateString.includes("T") ||
            dateString.includes(" ")
        ) {

            const direct =
                new Date(dateString);

            if (!isNaN(direct.getTime())) {
                return direct;
            }
        }


        /*
           Normal date + time
        */

        if (timeValue) {

            const combined =
                `${dateString}T${timeValue}`;

            const date =
                new Date(combined);

            if (!isNaN(date.getTime())) {
                return date;
            }
        }


        const date =
            new Date(dateString);

        if (!isNaN(date.getTime())) {

            if (timeValue) {

                const parts =
                    String(timeValue)
                        .split(":");

                if (parts.length >= 2) {

                    date.setHours(
                        Number(parts[0]),
                        Number(parts[1]),
                        0,
                        0
                    );
                }
            }

            return date;
        }
    }


    return null;
}


/* =========================================================
   CHECK IF TODO BELONGS TO CURRENT USER
========================================================= */

function belongsToCurrentUser(todo) {

    if (!currentUsername) {
        return false;
    }


    const assignedTo =
        String(
            todo.assignedTo ||
            todo.assignedToUser ||
            todo.assignedUser ||
            todo.user ||
            ""
        ).trim();


    /*
       If assignedTo exists, use it.
    */

    if (assignedTo) {

        return (
            assignedTo.toLowerCase() ===
            currentUsername.toLowerCase()
        );

    }


    /*
       If no assignedTo exists, use createdBy.
       This keeps compatibility with Todos created
       under the older structure.
    */

    const createdBy =
        String(
            todo.createdBy ||
            ""
        ).trim();

    if (createdBy) {

        return (
            createdBy.toLowerCase() ===
            currentUsername.toLowerCase()
        );

    }


    return false;
}


/* =========================================================
   CHECK WHETHER TODO IS COMPLETED
========================================================= */

function isCompleted(todo) {

    if (
        todo.completed === true ||
        todo.isCompleted === true
    ) {
        return true;
    }


    const status =
        String(
            todo.status ||
            ""
        ).toLowerCase()
        .trim();

    return (
        status === "completed" ||
        status === "complete" ||
        status === "done" ||
        status === "cancelled" ||
        status === "canceled"
    );
}


/* =========================================================
   FETCH USER TODOS
========================================================= */

async function loadUserTodos() {

    if (!currentUsername) {
        return [];
    }


    try {

        /*
           We read the collection and filter locally.

           This supports both:

           assignedTo
           createdBy

           and avoids requiring a composite Firestore
           index.
        */

        const snapshot =
            await getDocs(
                collection(db, "todos")
            );


        const todos =
            snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));


        return todos.filter(todo => {

            if (isCompleted(todo)) {
                return false;
            }

            return belongsToCurrentUser(todo);

        });

    } catch (error) {

        console.error(
            "Unable to load Todos:",
            error
        );

        return [];

    }
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTodoTime(date) {

    return date.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatTodoDate(date) {

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   IN-PAGE NOTIFICATION CONTAINER
========================================================= */

function createNotificationContainer() {

    if (
        document.getElementById(
            "globalTodoNotificationContainer"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.id =
        "globalTodoNotificationStyles";


    style.textContent = `

        #globalTodoNotificationContainer{

            position:fixed;

            top:82px;

            right:20px;

            width:360px;

            max-width:calc(100vw - 30px);

            z-index:999999;

            display:flex;

            flex-direction:column;

            gap:10px;

            pointer-events:none;

        }


        .global-todo-notification{

            pointer-events:auto;

            background:#ffffff;

            border:1px solid #e5e9ef;

            border-left:5px solid #001f3f;

            border-radius:12px;

            box-shadow:
                0 10px 30px rgba(0,0,0,.16);

            padding:15px;

            animation:
                globalTodoSlideIn
                .3s ease;

        }


        .global-todo-notification.reminder{

            border-left-color:#f39c12;

        }


        .global-todo-notification.due{

            border-left-color:#c0392b;

        }


        .global-todo-notification-header{

            display:flex;

            align-items:center;

            gap:10px;

        }


        .global-todo-notification-icon{

            width:34px;

            height:34px;

            border-radius:50%;

            display:flex;

            align-items:center;

            justify-content:center;

            background:#f3f6fa;

            color:#001f3f;

            flex:0 0 34px;

        }


        .global-todo-notification.due
        .global-todo-notification-icon{

            background:#fbeceb;

            color:#c0392b;

        }


        .global-todo-notification.reminder
        .global-todo-notification-icon{

            background:#fff4df;

            color:#f39c12;

        }


        .global-todo-notification-title{

            flex:1;

            font-size:12px;

            font-weight:800;

            color:#001f3f;

        }


        .global-todo-notification-close{

            border:0;

            background:none;

            cursor:pointer;

            color:#9ca3af;

            font-size:15px;

        }


        .global-todo-notification-body{

            margin-top:10px;

            font-size:12px;

            line-height:1.5;

            color:#4b5563;

        }


        .global-todo-notification-body strong{

            color:#1f2937;

        }


        .global-todo-notification-footer{

            margin-top:10px;

            display:flex;

            align-items:center;

            justify-content:space-between;

            gap:10px;

        }


        .global-todo-notification-time{

            font-size:10px;

            color:#6b7280;

        }


        .global-todo-notification-btn{

            border:0;

            background:#001f3f;

            color:#fff;

            border-radius:7px;

            padding:7px 10px;

            font-size:10px;

            font-weight:700;

            cursor:pointer;

        }


        @keyframes globalTodoSlideIn{

            from{

                opacity:0;

                transform:
                    translateX(30px);

            }

            to{

                opacity:1;

                transform:
                    translateX(0);

            }

        }


        @media(max-width:600px){

            #globalTodoNotificationContainer{

                top:75px;

                right:10px;

                left:10px;

                width:auto;

            }

        }

    `;


    document.head.appendChild(style);


    const container =
        document.createElement("div");

    container.id =
        "globalTodoNotificationContainer";


    document.body.appendChild(container);
}


/* =========================================================
   IN-PAGE NOTIFICATION
========================================================= */

function showInPageNotification(
    todo,
    type
) {

    createNotificationContainer();


    const container =
        document.getElementById(
            "globalTodoNotificationContainer"
        );


    const date =
        getTodoDateTime(todo);


    const isDue =
        type === "due";


    const notification =
        document.createElement("div");


    notification.className =
        `global-todo-notification ${
            isDue ? "due" : "reminder"
        }`;


    notification.innerHTML = `

        <div class="
            global-todo-notification-header
        ">

            <div class="
                global-todo-notification-icon
            ">

                <i class="fa-solid ${
                    isDue
                    ? "fa-bell"
                    : "fa-clock"
                }"></i>

            </div>


            <div class="
                global-todo-notification-title
            ">

                ${
                    isDue
                    ? "Todo Due"
                    : "Todo Reminder"
                }

            </div>


            <button
                class="
                    global-todo-notification-close
                "
                type="button"
            >

                ×

            </button>

        </div>


        <div class="
            global-todo-notification-body
        ">

            <strong>
                ${escapeHtml(
                    todo.title ||
                    "Untitled Todo"
                )}
            </strong>

            <br>

            ${
                isDue
                ? "This Todo is due now."
                : "This Todo is due in approximately 5 minutes."
            }

            ${
                todo.description
                ? `<br><br>${escapeHtml(
                    todo.description
                )}`
                : ""
            }

        </div>


        <div class="
            global-todo-notification-footer
        ">

            <span class="
                global-todo-notification-time
            ">

                ${
                    date
                    ? `${formatTodoDate(date)}
                       at
                       ${formatTodoTime(date)}`
                    : ""
                }

            </span>


            <button
                class="
                    global-todo-notification-btn
                "
                type="button"
            >

                View Todo

            </button>

        </div>

    `;


    const closeButton =
        notification.querySelector(
            ".global-todo-notification-close"
        );


    closeButton.addEventListener(
        "click",
        () => notification.remove()
    );


    const viewButton =
        notification.querySelector(
            ".global-todo-notification-btn"
        );


    viewButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "todo.html";

        }
    );


    container.appendChild(
        notification
    );


    /*
       Automatically remove after 20 seconds.
    */

    setTimeout(() => {

        if (
            notification &&
            notification.parentNode
        ) {
            notification.remove();
        }

    }, 20000);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   BROWSER NOTIFICATION
========================================================= */

async function showBrowserNotification(
    todo,
    type
) {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {
        return;
    }


    const isDue =
        type === "due";


    const title =
        isDue
        ? "⏰ Todo Due"
        : "🔔 Todo Reminder";


    const body =
        isDue
        ? `${todo.title || "Todo"} is due now.`
        : `${todo.title || "Todo"} is due in 5 minutes.`;


    try {

        const notification =
            new Notification(
                title,
                {
                    body,
                    icon:
                        "../images/logo1 - Copy.png",
                    tag:
                        `todo-${todo.id}-${type}`,
                    renotify:
                        false
                }
            );


        notification.onclick = () => {

            window.focus();

            window.location.href =
                "todo.html";

            notification.close();

        };


    } catch (error) {

        console.error(
            "Browser notification failed:",
            error
        );

    }
}


/* =========================================================
   SHOW BOTH NOTIFICATIONS
========================================================= */

async function notifyTodo(
    todo,
    type
) {

    if (
        reminderAlreadyShown(
            todo.id,
            type
        )
    ) {
        return;
    }


    /*
       Mark FIRST.

       This prevents multiple copies from appearing
       if several pages are opened at the same time.
    */

    markReminderShown(
        todo.id,
        type
    );


    showInPageNotification(
        todo,
        type
    );


    await showBrowserNotification(
        todo,
        type
    );
}


/* =========================================================
   CHECK TODOS
========================================================= */

async function checkTodoReminders() {

    if (!currentUsername) {
        return;
    }


    const todos =
        await loadUserTodos();


    const now =
        Date.now();


    todos.forEach(todo => {

        const todoDate =
            getTodoDateTime(todo);


        if (!todoDate) {
            return;
        }


        const todoTime =
            todoDate.getTime();


        const difference =
            todoTime - now;


        /*
           -------------------------------------------
           5 MINUTE REMINDER
           -------------------------------------------

           We allow a 5-minute window so that the
           reminder is not missed if the browser
           checks at 4:59 or 5:01.
        */

        const fiveMinutes =
            5 * 60 * 1000;


        const fiveMinuteWindow =
            60 * 1000;


        if (
            difference >=
                fiveMinutes - fiveMinuteWindow
            &&
            difference <=
                fiveMinutes + fiveMinuteWindow
        ) {

            notifyTodo(
                todo,
                "5min"
            );

        }


        /*
           -------------------------------------------
           DUE-TIME REMINDER
           -------------------------------------------

           We allow a one-minute window.
        */

        const dueWindow =
            60 * 1000;


        if (
            difference <= 0 &&
            difference >= -dueWindow
        ) {

            notifyTodo(
                todo,
                "due"
            );

        }

    });
}


/* =========================================================
   INITIALISE
========================================================= */

function initialiseGlobalTodoNotifications() {

    cleanNotificationStorage();

    createNotificationContainer();

    /*
       First check.
    */

    checkTodoReminders();


    /*
       Check every 30 seconds.

       This means we don't depend on the user
       remaining on one specific page.
    */

    setInterval(
        checkTodoReminders,
        30000
    );


    /*
       When the browser tab becomes active again,
       immediately check.
    */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                checkTodoReminders();

            }

        }
    );


    /*
       Also check when the window regains focus.
    */

    window.addEventListener(
        "focus",
        () => {

            checkTodoReminders();

        }
    );

}


initialiseGlobalTodoNotifications();


/* =========================================================
   OPTIONAL GLOBAL API
========================================================= */

window.GreysolTodoNotifications = {

    check: checkTodoReminders,

    requestPermission:
        requestNotificationPermission

};