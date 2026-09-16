/* =========================================================
   GREYSOL ACADEMY
   GLOBAL SESSION / IDLE TIMEOUT
========================================================= */

/*
   TRIAL:
   1 minute = 60 * 1000

   PRODUCTION:
   30 minutes = 30 * 60 * 1000

   When ready, simply change:
   const INACTIVITY_LIMIT = 60 * 1000;

   to:
   const INACTIVITY_LIMIT = 30 * 60 * 1000;
*/

const INACTIVITY_LIMIT = 60 * 1000;


/* =========================================================
   STORAGE KEYS
========================================================= */

const SESSION_ACTIVITY_KEY = "greysolLastActivity";
const SESSION_RETURN_PAGE_KEY = "greysolReturnPage";
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
   RECORD USER ACTIVITY
========================================================= */

function recordActivity() {

    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        return;
    }

    localStorage.setItem(
        SESSION_ACTIVITY_KEY,
        Date.now().toString()
    );
}


/* =========================================================
   SAVE CURRENT PAGE
========================================================= */

function saveCurrentPage() {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (
        currentPage &&
        currentPage !== "staff-login.html"
    ) {

        localStorage.setItem(
            SESSION_RETURN_PAGE_KEY,
            currentPage
        );
    }
}


/* =========================================================
   LOGOUT DUE TO INACTIVITY
========================================================= */

function logoutDueToInactivity() {

    /*
       Prevent multiple tabs from repeatedly
       running the logout process.
    */

    const alreadyExpired =
        localStorage.getItem(SESSION_EXPIRED_KEY);

    if (alreadyExpired === "true") {
        return;
    }


    /* Mark session as expired */

    localStorage.setItem(
        SESSION_EXPIRED_KEY,
        "true"
    );


    /* Remember the page */

    saveCurrentPage();


    /* Remove logged-in account */

    localStorage.removeItem("loggedUser");


    /* Remove activity timestamp */

    localStorage.removeItem(
        SESSION_ACTIVITY_KEY
    );


    /*
       Redirect to login.

       location.replace prevents the user from
       simply pressing Back to return to the
       protected page.
    */

    window.location.replace(
        "staff-login.html?session=expired"
    );
}


/* =========================================================
   CHECK SESSION
========================================================= */

function checkSessionTimeout() {

    const loggedUser = getLoggedUser();

    /*
       If nobody is logged in, there is no session
       to monitor.
    */

    if (!loggedUser) {
        return;
    }


    const lastActivity =
        Number(
            localStorage.getItem(
                SESSION_ACTIVITY_KEY
            )
        );


    /*
       If no activity timestamp exists,
       create one.
    */

    if (!lastActivity) {

        recordActivity();

        return;
    }


    const inactiveTime =
        Date.now() - lastActivity;


    /*
       Session has expired.
    */

    if (inactiveTime >= INACTIVITY_LIMIT) {

        logoutDueToInactivity();

    }

}


/* =========================================================
   USER ACTIVITY EVENTS
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
        { passive: true }
    );

});


/* =========================================================
   INITIALIZE SESSION
========================================================= */

function initializeSessionTimeout() {

    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        return;
    }


    /*
       If the user has just logged in,
       create an activity timestamp.
    */

    if (
        !localStorage.getItem(
            SESSION_ACTIVITY_KEY
        )
    ) {

        recordActivity();

    }


    /*
       Save the current page.
    */

    saveCurrentPage();


    /*
       Check immediately.
    */

    checkSessionTimeout();


    /*
       Check every 5 seconds.

       This means the logout does not depend
       on the page being refreshed.
    */

    setInterval(
        checkSessionTimeout,
        5000
    );

}


/* =========================================================
   CROSS-TAB SESSION SYNCHRONIZATION
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        /*
           Another tab changed loggedUser.
        */

        if (event.key === "loggedUser") {

            if (!event.newValue) {

                /*
                   Another tab logged out.
                   Log this page out too.
                */

                window.location.replace(
                    "staff-login.html"
                );

            }

        }


        /*
           Another tab updated activity.
        */

        if (
            event.key ===
            SESSION_ACTIVITY_KEY
        ) {

            checkSessionTimeout();

        }

    }
);


/* =========================================================
   START
========================================================= */

initializeSessionTimeout();
