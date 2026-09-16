/* =========================================================
   GREYSOL ACADEMY
   SESSION IDLE TIMEOUT
   TRIAL VERSION: 1 MINUTE
========================================================= */

const INACTIVITY_LIMIT = 10 * 1000;

const LAST_ACTIVITY_KEY = "greysolLastActivity";
const RETURN_PAGE_KEY = "greysolReturnPage";
const SESSION_EXPIRED_KEY = "greysolSessionExpired";


/* =========================================================
   GET LOGGED USER
========================================================= */

function getLoggedUser() {

    try {

        return JSON.parse(
            localStorage.getItem("loggedUser")
        );

    } catch (error) {

        return null;

    }

}


/* =========================================================
   RECORD ACTIVITY
========================================================= */

function recordActivity() {

    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        return;
    }

    localStorage.setItem(
        LAST_ACTIVITY_KEY,
        Date.now().toString()
    );

}


/* =========================================================
   SAVE CURRENT PAGE
========================================================= */

function saveCurrentPage() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    if (
        currentPage &&
        currentPage !== "staff-login.html"
    ) {

        localStorage.setItem(
            RETURN_PAGE_KEY,
            currentPage
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutDueToInactivity() {

    /*
       Prevent repeated logout processing.
    */

    if (
        localStorage.getItem(
            SESSION_EXPIRED_KEY
        ) === "true"
    ) {

        return;

    }


    /*
       Mark session as expired.
    */

    localStorage.setItem(
        SESSION_EXPIRED_KEY,
        "true"
    );


    /*
       Remember the page the user was using.
    */

    saveCurrentPage();


    /*
       Remove login session.
    */

    localStorage.removeItem(
        "loggedUser"
    );


    /*
       Remove activity timestamp.
    */

    localStorage.removeItem(
        LAST_ACTIVITY_KEY
    );


    /*
       Send user to login page.
    */

    window.location.replace(
        "staff-login.html?session=expired"
    );

}


/* =========================================================
   CHECK FOR INACTIVITY
========================================================= */

function checkSessionTimeout() {

    const loggedUser = getLoggedUser();

    /*
       Nothing to check if nobody is logged in.
    */

    if (!loggedUser) {
        return;
    }


    const lastActivity = Number(
        localStorage.getItem(
            LAST_ACTIVITY_KEY
        )
    );


    /*
       If this is a new session,
       create the timestamp.
    */

    if (!lastActivity) {

        recordActivity();

        return;

    }


    const inactiveTime =
        Date.now() - lastActivity;


    /*
       Has the user been inactive
       for at least 1 minute?
    */

    if (
        inactiveTime >=
        INACTIVITY_LIMIT
    ) {

        logoutDueToInactivity();

    }

}


/* =========================================================
   USER ACTIVITY
========================================================= */

const activityEvents = [

    "click",
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "touchmove",
    "wheel"

];


activityEvents.forEach(function(eventName) {

    document.addEventListener(
        eventName,
        recordActivity,
        {
            passive: true
        }
    );

});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeSessionTimeout() {

    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        return;
    }


    /*
       Start activity tracking.
    */

    if (
        !localStorage.getItem(
            LAST_ACTIVITY_KEY
        )
    ) {

        recordActivity();

    }


    /*
       Remember current page.
    */

    saveCurrentPage();


    /*
       Check immediately.
    */

    checkSessionTimeout();


    /*
       Continue checking every 5 seconds.
    */

    setInterval(
        checkSessionTimeout,
        5000
    );

}


/* =========================================================
   CROSS-TAB SYNCHRONIZATION
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        /*
           If another tab logs out,
           log this page out too.
        */

        if (
            event.key === "loggedUser" &&
            !event.newValue
        ) {

            window.location.replace(
                "staff-login.html"
            );

        }


        /*
           If another tab records activity,
           check the shared session.
        */

        if (
            event.key === LAST_ACTIVITY_KEY
        ) {

            checkSessionTimeout();

        }

    }
);


/* =========================================================
   START
========================================================= */

initializeSessionTimeout();
