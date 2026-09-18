/* =========================================================
   ALTOS ACADEMY
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       PAGE LOADER
    ===================================================== */

    const pageLoader =
        document.getElementById("pageLoader");

    if (pageLoader) {

        window.addEventListener("load", () => {

            setTimeout(() => {

                pageLoader.classList.add("loaded");

            }, 600);

        });

    }


    /* =====================================================
       TYPING EFFECT
    ===================================================== */

    const typingText =
        document.getElementById("typingText");

    if (typingText) {

        const phrases = [
            "Inspiring Excellence",
            "Shaping Tomorrow",
            "Empowering Young Minds",
            "Building Future Leaders"
        ];

        let phraseIndex = 0;
        let characterIndex = 0;

        let deleting = false;

        const typeSpeed = 80;
        const deleteSpeed = 45;
        const pauseTime = 1800;


        function typeEffect() {

            const currentPhrase =
                phrases[phraseIndex];


            if (!deleting) {

                typingText.textContent =
                    currentPhrase.substring(
                        0,
                        characterIndex + 1
                    );

                characterIndex++;


                if (
                    characterIndex ===
                    currentPhrase.length
                ) {

                    deleting = true;

                    setTimeout(
                        typeEffect,
                        pauseTime
                    );

                    return;

                }

            } else {

                typingText.textContent =
                    currentPhrase.substring(
                        0,
                        characterIndex - 1
                    );

                characterIndex--;


                if (characterIndex === 0) {

                    deleting = false;

                    phraseIndex =
                        (phraseIndex + 1) %
                        phrases.length;

                }

            }


            setTimeout(
                typeEffect,
                deleting
                    ? deleteSpeed
                    : typeSpeed
            );

        }


        typeEffect();

    }


    /* =====================================================
       HERO SLIDER
    ===================================================== */

    const heroSlides =
        document.querySelectorAll(".hero-slide");

    const heroDots =
        document.querySelectorAll(".hero-dot");

    const heroPrev =
        document.getElementById("heroPrev");

    const heroNext =
        document.getElementById("heroNext");


    if (heroSlides.length) {

        let currentSlide = 0;

        let heroInterval;


        function showSlide(index) {

            currentSlide =
                (index + heroSlides.length) %
                heroSlides.length;


            heroSlides.forEach(
                (slide, i) => {

                    slide.classList.toggle(
                        "active",
                        i === currentSlide
                    );

                }
            );


            heroDots.forEach(
                (dot, i) => {

                    dot.classList.toggle(
                        "active",
                        i === currentSlide
                    );

                }
            );

        }


        function nextSlide() {

            showSlide(currentSlide + 1);

        }


        function previousSlide() {

            showSlide(currentSlide - 1);

        }


        function startHeroSlider() {

            clearInterval(heroInterval);

            heroInterval =
                setInterval(
                    nextSlide,
                    6000
                );

        }


        heroNext?.addEventListener(
            "click",
            () => {

                nextSlide();
                startHeroSlider();

            }
        );


        heroPrev?.addEventListener(
            "click",
            () => {

                previousSlide();
                startHeroSlider();

            }
        );


        heroDots.forEach(
            dot => {

                dot.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                dot.dataset.slide
                            );

                        showSlide(index);

                        startHeroSlider();

                    }
                );

            }
        );


        const heroSection =
            document.querySelector(".hero-section");


        heroSection?.addEventListener(
            "mouseenter",
            () => clearInterval(heroInterval)
        );


        heroSection?.addEventListener(
            "mouseleave",
            startHeroSlider
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "ArrowRight"
                ) {

                    nextSlide();
                    startHeroSlider();

                }

                if (
                    event.key === "ArrowLeft"
                ) {

                    previousSlide();
                    startHeroSlider();

                }

            }
        );


        showSlide(0);
        startHeroSlider();

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const mainNav =
        document.getElementById("mainNav");


    if (
        mobileMenuButton &&
        mainNav
    ) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const open =
                    mainNav.classList.toggle(
                        "mobile-open"
                    );

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    open ? "true" : "false"
                );

            }
        );


        mainNav.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mainNav.classList.remove(
                            "mobile-open"
                        );

                        mobileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    const siteHeader =
        document.getElementById("siteHeader");


    function updateHeader() {

        if (!siteHeader) return;

        siteHeader.classList.toggle(
            "scrolled",
            window.scrollY > 20
        );

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const navLinks =
        document.querySelectorAll(
            ".main-nav .nav-link"
        );


    function updateActiveNavigation() {

        const currentPath =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentPath === "" ||
            currentPath === "index.html"
        ) {

            navLinks.forEach(link => {

                const href =
                    link.getAttribute("href");

                link.classList.toggle(
                    "active",
                    href === "index.html"
                );

            });

            return;

        }


        if (currentPath === "about.html") {

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") ===
                    "about.html"
                );

            });

            return;

        }


        if (
            currentPath === "registration.html"
        ) {

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") ===
                    "registration.html"
                );

            });

            return;

        }


        navLinks.forEach(
            link => link.classList.remove(
                "active"
            )
        );

    }


    updateActiveNavigation();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    if (revealElements.length) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "revealed"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: .12
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(element);

            }
        );

    }


    /* =====================================================
       STAGGER CARD ANIMATIONS
    ===================================================== */

    const cardGroups = [
        ".why-grid",
        ".academic-grid",
        ".student-life-grid",
        ".news-grid",
        ".about-values-grid",
        ".about-info-grid",
        ".teacher-chart"
    ];


    cardGroups.forEach(selector => {

        const group =
            document.querySelector(selector);

        if (!group) return;

        const cards =
            group.children;

        Array.from(cards).forEach(
            (card, index) => {

                card.style.transitionDelay =
                    `${index * 70}ms`;

            }
        );

    });


    /* =====================================================
       ACADEMIC ORBIT
    ===================================================== */

    const orbitContainer =
        document.querySelector(
            ".orbit-container"
        );

    const orbitTrack =
        document.querySelector(
            ".orbit-track"
        );

    const orbitItems =
        document.querySelectorAll(
            ".orbit-item"
        );

    const orbitInners =
        document.querySelectorAll(
            ".orbit-item-inner"
        );


    if (
        orbitContainer &&
        orbitTrack &&
        orbitItems.length
    ) {

        function pauseOrbit() {

            orbitTrack.style.animationPlayState =
                "paused";

            orbitInners.forEach(inner => {

                inner.style.animationPlayState =
                    "paused";

            });

        }


        function resumeOrbit() {

            orbitTrack.style.animationPlayState =
                "running";

            orbitInners.forEach(inner => {

                inner.style.animationPlayState =
                    "running";

            });

        }


        orbitItems.forEach(item => {

            item.addEventListener(
                "mouseenter",
                pauseOrbit
            );

            item.addEventListener(
                "mouseleave",
                resumeOrbit
            );

            item.addEventListener(
                "focus",
                pauseOrbit
            );

            item.addEventListener(
                "blur",
                resumeOrbit
            );

        });

    }


    /* =====================================================
       WHY ALTOS FEATURE MODAL
    ===================================================== */

    const featureModal =
        document.getElementById(
            "featureModal"
        );

    const featureModalBack =
        document.getElementById(
            "featureModalBack"
        );

    const featureModalTitle =
        document.getElementById(
            "featureModalTitle"
        );

    const featureModalDescription =
        document.getElementById(
            "featureModalDescription"
        );

    const featureModalIcon =
        document.getElementById(
            "featureModalIcon"
        );

    const featureModalPoints =
        document.getElementById(
            "featureModalPoints"
        );


    const featureData = {

        "academic-excellence": {

            title:
                "Academic Excellence",

            icon:
                "fa-solid fa-book-open-reader",

            description:
                "Academic excellence at Altos Academy is about more than marks. It is about building strong foundations, developing disciplined learning habits, encouraging curiosity and helping learners make meaningful progress.",

            points: [
                "Strong academic foundations",
                "Disciplined study habits",
                "Curiosity and continuous learning",
                "Meaningful academic progress"
            ]

        },


        "character-discipline": {

            title:
                "Character & Discipline",

            icon:
                "fa-solid fa-scale-balanced",

            description:
                "Character and discipline help learners understand that their choices matter. We encourage responsibility, respect, integrity and accountability in the way students approach learning and relationships.",

            points: [
                "Integrity and honesty",
                "Respect for others",
                "Personal responsibility",
                "Accountability for choices"
            ]

        },


        "creativity-thinking": {

            title:
                "Creativity & Thinking",

            icon:
                "fa-solid fa-lightbulb",

            description:
                "Learners need the confidence to ask questions, examine ideas and develop solutions. Creativity and critical thinking encourage independent thought and purposeful problem solving.",

            points: [
                "Critical thinking",
                "Problem solving",
                "Curiosity and questioning",
                "Independent thought"
            ]

        },


        "leadership": {

            title:
                "Leadership",

            icon:
                "fa-solid fa-people-group",

            description:
                "Leadership is developed through responsibility, communication, initiative and service. Students are encouraged to build confidence and understand how their actions can positively influence others.",

            points: [
                "Responsibility",
                "Communication",
                "Initiative",
                "Service and confidence"
            ]

        }

    };


    function openFeatureModal(key) {

        if (
            !featureModal ||
            !featureData[key]
        ) return;


        const data =
            featureData[key];


        featureModalTitle.textContent =
            data.title;

        featureModalDescription.textContent =
            data.description;


        featureModalIcon.innerHTML =
            `<i class="${data.icon}"></i>`;


        featureModalPoints.innerHTML =
            data.points.map(
                point => `
                    <div class="feature-modal-point">
                        <i class="fa-solid fa-check"></i>
                        ${point}
                    </div>
                `
            ).join("");


        featureModal.classList.add(
            "active"
        );

        featureModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        featureModalBack?.focus();

    }


    function closeFeatureModal() {

        if (!featureModal) return;

        featureModal.classList.remove(
            "active"
        );

        featureModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    document.querySelectorAll(
        ".feature-read-more"
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openFeatureModal(
                    link.dataset.feature
                );

            }
        );

    });


    featureModalBack?.addEventListener(
        "click",
        closeFeatureModal
    );


    /* =====================================================
       EMPLOYEE TEAM MODAL
    ===================================================== */

    const teamModal =
        document.getElementById(
            "teamModal"
        );

    const teamModalBack =
        document.getElementById(
            "teamModalBack"
        );

    const teamModalImage =
        document.getElementById(
            "teamModalImage"
        );

    const teamModalName =
        document.getElementById(
            "teamModalName"
        );

    const teamModalRole =
        document.getElementById(
            "teamModalRole"
        );

    const teamModalBio =
        document.getElementById(
            "teamModalBio"
        );

    const teamModalDetails =
        document.getElementById(
            "teamModalDetails"
        );


    const teamData = {

        mayesero: {

            name:
                "Mayesero Solomon",

            role:
                "PRINCIPAL",

            image:
                "images/team/mayesero-solomon.jpg",

            bio:
                "This profile provides space for the official background of Mayesero Solomon, Principal of Altos Academy.",

            details: [
                "Principal — Altos Academy",
                "Official biography can be added here.",
                "Qualifications and professional background can be added here."
            ]

        },


        daniel: {

            name:
                "Daniel Kaphale",

            role:
                "ACCOUNTANT",

            image:
                "images/team/daniel-kaphale.jpg",

            bio:
                "This profile provides space for the official background of Daniel Kaphale, Accountant at Altos Academy.",

            details: [
                "Accountant — Altos Academy",
                "Official biography can be added here.",
                "Qualifications and professional background can be added here."
            ]

        },


        blessing: {

            name:
                "Blessing Mwale",

            role:
                "HEADTEACHER",

            image:
                "images/team/blessing-mwale.jpg",

            bio:
                "This profile provides space for the official background of Blessing Mwale, Headteacher at Altos Academy.",

            details: [
                "Headteacher — Altos Academy",
                "Official biography can be added here.",
                "Qualifications and professional background can be added here."
            ]

        },


        allie: {

            name:
                "Allie Malota",

            role:
                "TEACHER",

            image:
                "images/team/allie-malota.jpg",

            bio:
                "This profile provides space for the official background of Allie Malota, Teacher at Altos Academy.",

            details: [
                "Teacher — Altos Academy",
                "Official biography can be added here.",
                "Teaching area and professional background can be added here."
            ]

        }

    };


    /* Add ten teacher placeholders */

    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const number =
            String(i).padStart(2, "0");

        const key =
            `teacher-${number}`;


        teamData[key] = {

            name:
                `Teacher ${number}`,

            role:
                "TEACHER",

            image:
                `images/team/teacher-${number}.jpg`,

            bio:
                "This profile is ready for the teacher's official biography. Add the teacher's name, teaching area, qualifications, experience and background when the information is available.",

            details: [
                "Teacher — Altos Academy",
                "Profile information pending.",
                "Add teaching area, qualifications and experience here."
            ]

        };

    }


    function openTeamModal(key) {

        if (
            !teamModal ||
            !teamData[key]
        ) return;


        const person =
            teamData[key];


        teamModalName.textContent =
            person.name;

        teamModalRole.textContent =
            person.role;

        teamModalBio.textContent =
            person.bio;


        teamModalImage.src =
            person.image;

        teamModalImage.alt =
            person.name;


        teamModalDetails.innerHTML =
            person.details.map(
                detail => `
                    <div class="team-detail">
                        <i class="fa-solid fa-circle-check"></i>
                        ${detail}
                    </div>
                `
            ).join("");


        teamModal.classList.add(
            "active"
        );

        teamModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        teamModalBack?.focus();

    }


    function closeTeamModal() {

        if (!teamModal) return;

        teamModal.classList.remove(
            "active"
        );

        teamModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    document.querySelectorAll(
        ".team-member"
    ).forEach(member => {

        member.addEventListener(
            "click",
            () => {

                openTeamModal(
                    member.dataset.team
                );

            }
        );

    });


    teamModalBack?.addEventListener(
        "click",
        closeTeamModal
    );


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");

                if (
                    !href ||
                    href === "#"
                ) return;


                const target =
                    document.querySelector(href);


                if (!target) return;


                event.preventDefault();


                const headerHeight =
                    siteHeader
                        ? siteHeader.offsetHeight
                        : 0;


                const targetTop =
                    target.getBoundingClientRect()
                        .top
                    +
                    window.scrollY
                    -
                    headerHeight;


                window.scrollTo({
                    top: targetTop,
                    behavior: "smooth"
                });

            }
        );

    });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.getElementById(
            "backToTop"
        );


    function updateBackToTop() {

        if (!backToTop) return;

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 500
        );

    }


    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );


    backToTop?.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );

    const formMessage =
        document.getElementById(
            "formMessage"
        );


    contactForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (formMessage) {

                formMessage.textContent =
                    "Thank you. Your message has been received.";

                formMessage.classList.add(
                    "show"
                );

            }


            contactForm.reset();

        }
    );


    /* =====================================================
       PREVENT IMAGE DRAGGING
    ===================================================== */

    document.querySelectorAll("img")
        .forEach(img => {

            img.setAttribute(
                "draggable",
                "false"
            );

        });


    /* =====================================================
       ESCAPE KEY
       
       IMPORTANT:
       Modals intentionally DO NOT close with Escape.
       They only close through the Back button.
    ===================================================== */


    /* =====================================================
       MOBILE RESIZE SAFETY
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900 &&
                mainNav
            ) {

                mainNav.classList.remove(
                    "mobile-open"
                );

                mobileMenuButton?.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear =
        document.getElementById(
            "currentYear"
        );


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

});
