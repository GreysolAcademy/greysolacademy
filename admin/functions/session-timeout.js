(() => {

    const LIMIT = 30 * 60 * 1000; // 30 seconds for testing

    const ACTIVITY_KEY = "greysolLastActivity";
    const RETURN_PAGE_KEY = "greysolReturnPage";

    const getUser = () => {

        try {

            return JSON.parse(
                localStorage.getItem("loggedUser") ||
                sessionStorage.getItem("loggedUser") ||
                "null"
            );

        } catch (error) {

            return null;

        }

    };


    // --------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------

    if (!getUser()) {

        console.log("Idle logout: No logged-in user.");

        return;

    }


    // --------------------------------------------------
    // RECORD ACTIVITY
    // --------------------------------------------------

    const recordActivity = () => {

        if (!getUser()) return;

        localStorage.setItem(
            ACTIVITY_KEY,
            Date.now().toString()
        );

    };


    // --------------------------------------------------
    // USER ACTIVITY EVENTS
    // --------------------------------------------------

    [
        "click",
        "keydown",
        "mousemove",
        "mousedown",
        "scroll",
        "touchstart",
        "touchmove",
        "wheel"
    ].forEach(eventName => {

        window.addEventListener(
            eventName,
            recordActivity,
            {
                passive: true
            }
        );

    });


    // --------------------------------------------------
    // INITIAL ACTIVITY
    // --------------------------------------------------

    if (!localStorage.getItem(ACTIVITY_KEY)) {

        recordActivity();

    }


    // --------------------------------------------------
    // CROSS-TAB ACTIVITY
    // --------------------------------------------------

    window.addEventListener("storage", event => {

        // Another tab updated the activity timestamp
        if (event.key === ACTIVITY_KEY) {

            console.log(
                "✓ Activity detected in another tab."
            );

        }


        // Another tab logged out
        if (
            event.key === "loggedUser" &&
            event.newValue === null
        ) {

            console.log(
                "✓ Logout detected from another tab."
            );

            window.location.replace(
                "staff-login.html"
            );

        }

    });


    // --------------------------------------------------
    // SESSION TIMEOUT CHECK
    // --------------------------------------------------

    setInterval(() => {

        const user = getUser();

        if (!user) return;


        const lastActivity = parseInt(
            localStorage.getItem(ACTIVITY_KEY) || "0",
            10
        );


        if (!lastActivity) {

            recordActivity();

            return;

        }


        const idleTime =
            Date.now() - lastActivity;


        console.log(
            "Idle time:",
            Math.floor(idleTime / 1000),
            "seconds"
        );


        // --------------------------------------------------
        // EXPIRED
        // --------------------------------------------------

        if (idleTime >= LIMIT) {

            console.log(
                "⏰ SESSION EXPIRED"
            );


            // Save page so login can return here
            localStorage.setItem(
                RETURN_PAGE_KEY,
                window.location.pathname
            );


            // Remove login session
            localStorage.removeItem(
                "loggedUser"
            );

            sessionStorage.removeItem(
                "loggedUser"
            );

            localStorage.removeItem(
                ACTIVITY_KEY
            );


            // Redirect
            window.location.replace(
                "staff-login.html?session=expired"
            );

        }

    }, 2000);


    console.log(
        "✓ Cross-tab idle logout ACTIVE —",
        LIMIT / 1000,
        "seconds"
    );

})();
