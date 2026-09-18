/* =========================================================
   ALTOS ACADEMY
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   PAGE LOADER
========================================================= */

window.addEventListener("load", () => {

    const loader = document.querySelector(".page-loader");

    setTimeout(() => {

        if (loader) {
            loader.classList.add("hidden");
        }

    }, 600);

});



/* =========================================================
   TYPING HERO EFFECT
========================================================= */

const typingText = document.getElementById("typingText");

const typingPhrases = [

    "Inspiring Excellence",

    "Shaping Tomorrow",

    "Empowering Young Minds",

    "Building Future Leaders"

];

let phraseIndex = 0;

let characterIndex = 0;

let isDeleting = false;



function typeEffect() {

    if (!typingText) return;


    const currentPhrase =
        typingPhrases[phraseIndex];


    if (!isDeleting) {

        characterIndex++;

        typingText.textContent =
            currentPhrase.substring(
                0,
                characterIndex
            );


        if (
            characterIndex ===
            currentPhrase.length
        ) {

            isDeleting = true;

            setTimeout(
                typeEffect,
                1800
            );

            return;

        }

    } else {

        characterIndex--;

        typingText.textContent =
            currentPhrase.substring(
                0,
                characterIndex
            );


        if (characterIndex === 0) {

            isDeleting = false;

            phraseIndex++;

            if (
                phraseIndex >=
                typingPhrases.length
            ) {

                phraseIndex = 0;

            }

        }

    }


    const speed =
        isDeleting
            ? 45
            : 80;


    setTimeout(
        typeEffect,
        speed
    );

}


setTimeout(
    typeEffect,
    1000
);



/* =========================================================
   HERO SLIDER
========================================================= */

const heroSlides =
    document.querySelectorAll(".hero-slide");

const heroDots =
    document.querySelectorAll(
        ".hero-dots button"
    );

const heroPrev =
    document.getElementById("heroPrev");

const heroNext =
    document.getElementById("heroNext");


let currentSlide = 0;

let heroTimer;



function showHeroSlide(index) {

    if (!heroSlides.length) return;


    if (index >= heroSlides.length) {

        index = 0;

    }


    if (index < 0) {

        index =
            heroSlides.length - 1;

    }


    heroSlides.forEach(
        slide => {

            slide.classList.remove(
                "active"
            );

        }
    );


    heroDots.forEach(
        dot => {

            dot.classList.remove(
                "active"
            );

        }
    );


    heroSlides[index]
        .classList.add("active");


    if (heroDots[index]) {

        heroDots[index]
            .classList.add("active");

    }


    currentSlide = index;

}



function nextHeroSlide() {

    showHeroSlide(
        currentSlide + 1
    );

}



function previousHeroSlide() {

    showHeroSlide(
        currentSlide - 1
    );

}



function startHeroSlider() {

    clearInterval(heroTimer);


    heroTimer =
        setInterval(
            nextHeroSlide,
            6000
        );

}



function resetHeroSlider() {

    startHeroSlider();

}



if (heroNext) {

    heroNext.addEventListener(
        "click",
        () => {

            nextHeroSlide();

            resetHeroSlider();

        }
    );

}



if (heroPrev) {

    heroPrev.addEventListener(
        "click",
        () => {

            previousHeroSlide();

            resetHeroSlider();

        }
    );

}



heroDots.forEach(
    (dot, index) => {

        dot.addEventListener(
            "click",
            () => {

                showHeroSlide(index);

                resetHeroSlider();

            }
        );

    }
);


startHeroSlider();



/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const mobileNav =
    document.getElementById(
        "mobileNav"
    );


if (
    mobileMenuBtn &&
    mobileNav
) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            mobileNav.classList.toggle(
                "open"
            );

            mobileMenuBtn.classList.toggle(
                "active"
            );

        }
    );


    const mobileLinks =
        mobileNav.querySelectorAll(
            "a"
        );


    mobileLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove(
                        "open"
                    );

                    mobileMenuBtn.classList.remove(
                        "active"
                    );

                }
            );

        }
    );

}



/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

const header =
    document.querySelector(
        ".main-header"
    );


window.addEventListener(
    "scroll",
    () => {

        if (!header) return;


        if (window.scrollY > 40) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }
);



/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const sections =
    document.querySelectorAll(
        "section[id]"
    );

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


function updateActiveNav() {

    let currentSection = "";


    sections.forEach(
        section => {

            const sectionTop =
                section.offsetTop - 150;

            const sectionHeight =
                section.offsetHeight;

            if (
                window.scrollY >=
                    sectionTop &&
                window.scrollY <
                    sectionTop +
                    sectionHeight
            ) {

                currentSection =
                    section.getAttribute(
                        "id"
                    );

            }

        }
    );


    navLinks.forEach(
        link => {

            link.classList.remove(
                "active"
            );


            const href =
                link.getAttribute(
                    "href"
                );


            if (
                href ===
                `#${currentSection}`
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNav
);



/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".section-heading, " +
        ".about-grid, " +
        ".why-card, " +
        ".academic-card, " +
        ".life-main, " +
        ".life-card, " +
        ".value-item, " +
        ".values-image, " +
        ".news-card, " +
        ".contact-info, " +
        ".contact-form-wrapper"
    );


revealElements.forEach(
    element => {

        element.classList.add(
            "reveal"
        );

    }
);


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList.add(
                                "active"
                            );

                        revealObserver
                            .unobserve(
                                entry.target
                            );

                    }

                }
            );

        },
        {
            threshold: 0.12
        }
    );


revealElements.forEach(
    element => {

        revealObserver.observe(
            element
        );

    }
);



/* =========================================================
   STAGGERED CARD ANIMATION
========================================================= */

const staggerGroups = [

    ".why-grid",

    ".academic-grid",

    ".news-grid",

    ".highlights-grid"

];


staggerGroups.forEach(
    selector => {

        const container =
            document.querySelector(
                selector
            );


        if (!container) return;


        const cards =
            container.children;


        Array.from(cards).forEach(
            (card, index) => {

                card.style.transitionDelay =
                    `${index * 0.08}s`;

            }
        );

    }
);



/* =========================================================
   SMOOTH INTERNAL LINKS
========================================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(
    link => {

        link.addEventListener(
            "click",
            function(event) {

                const targetId =
                    this.getAttribute(
                        "href"
                    );


                if (
                    targetId === "#" ||
                    !targetId
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) return;


                event.preventDefault();


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                const targetPosition =
                    target.getBoundingClientRect()
                        .top +
                    window.scrollY -
                    headerHeight;


                window.scrollTo({

                    top:
                        targetPosition,

                    behavior:
                        "smooth"

                });

            }
        );

    }
);



/* =========================================================
   BACK TO TOP
========================================================= */

const backToTop =
    document.getElementById(
        "backToTop"
    );


window.addEventListener(
    "scroll",
    () => {

        if (!backToTop) return;


        if (
            window.scrollY >
            500
        ) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }
);


if (backToTop) {

    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}



/* =========================================================
   CURRENT YEAR
========================================================= */

const currentYear =
    document.getElementById(
        "currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}



/* =========================================================
   CONTACT FORM
========================================================= */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const submitButton =
                contactForm.querySelector(
                    ".form-submit"
                );


            if (!submitButton) return;


            const originalText =
                submitButton.innerHTML;


            submitButton.innerHTML =
                `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Sending...
                `;


            submitButton.disabled =
                true;


            /*
             * This is currently a visual
             * frontend submission.
             *
             * Later we can connect this
             * to PHP/MySQL, Firebase,
             * Formspree or another backend.
             */


            setTimeout(
                () => {

                    submitButton.innerHTML =
                        `
                        <i class="fa-solid fa-check"></i>
                        Message Received
                        `;


                    submitButton.style.background =
                        "#38a9e8";


                    submitButton.style.color =
                        "#031b2e";


                    contactForm.reset();


                    setTimeout(
                        () => {

                            submitButton.innerHTML =
                                originalText;


                            submitButton.disabled =
                                false;


                            submitButton.style.background =
                                "";


                            submitButton.style.color =
                                "";

                        },
                        2500
                    );


                },
                1000
            );

        }
    );

}



/* =========================================================
   IMAGE PROTECTION / DRAG PREVENTION
========================================================= */

document.querySelectorAll(
    "img"
).forEach(
    image => {

        image.addEventListener(
            "dragstart",
            event => {

                event.preventDefault();

            }
        );

    }
);



/* =========================================================
   HERO PAUSE WHEN MOUSE IS OVER IT
========================================================= */

const hero =
    document.querySelector(
        ".hero"
    );


if (hero) {

    hero.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                heroTimer
            );

        }
    );


    hero.addEventListener(
        "mouseleave",
        () => {

            startHeroSlider();

        }
    );

}



/* =========================================================
   KEYBOARD ACCESSIBILITY FOR HERO
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            previousHeroSlide();

            resetHeroSlider();

        }


        if (
            event.key === "ArrowRight"
        ) {

            nextHeroSlide();

            resetHeroSlider();

        }

    }
);



/* =========================================================
   MOBILE RESIZE SAFETY
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900 &&
            mobileNav
        ) {

            mobileNav.classList.remove(
                "open"
            );

        }

    }
);



/* =========================================================
   INITIALISE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showHeroSlide(0);

        updateActiveNav();

    }
);
