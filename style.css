/* =========================================================
   ALTOS ACADEMY
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PAGE LOADER
    ===================================================== */

    const pageLoader = document.getElementById("pageLoader");

    setTimeout(() => {

        if(pageLoader){
            pageLoader.classList.add("hidden");
        }

    }, 600);


    /* =====================================================
       TYPING EFFECT
    ===================================================== */

    const typingText = document.getElementById("typingText");

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


    function typeWriter(){

        if(!typingText) return;

        const currentPhrase = phrases[phraseIndex];

        if(!deleting){

            characterIndex++;

            typingText.textContent =
                currentPhrase.substring(0, characterIndex);

            if(characterIndex === currentPhrase.length){

                deleting = true;

                setTimeout(typeWriter, pauseTime);

                return;
            }

        }else{

            characterIndex--;

            typingText.textContent =
                currentPhrase.substring(0, characterIndex);

            if(characterIndex === 0){

                deleting = false;

                phraseIndex =
                    (phraseIndex + 1) % phrases.length;
            }
        }

        setTimeout(
            typeWriter,
            deleting ? deleteSpeed : typeSpeed
        );
    }


    setTimeout(typeWriter, 900);


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

    let currentSlide = 0;
    let heroTimer;


    function showSlide(index){

        if(!heroSlides.length) return;

        if(index < 0){
            index = heroSlides.length - 1;
        }

        if(index >= heroSlides.length){
            index = 0;
        }

        currentSlide = index;

        heroSlides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === currentSlide
            );

        });


        heroDots.forEach((dot, i) => {

            dot.classList.toggle(
                "active",
                i === currentSlide
            );

        });
    }


    function nextSlide(){

        showSlide(currentSlide + 1);

    }


    function previousSlide(){

        showSlide(currentSlide - 1);

    }


    function startHeroTimer(){

        clearInterval(heroTimer);

        heroTimer =
            setInterval(nextSlide, 6000);
    }


    function stopHeroTimer(){

        clearInterval(heroTimer);

    }


    if(heroNext){

        heroNext.addEventListener(
            "click",
            () => {

                nextSlide();
                startHeroTimer();

            }
        );

    }


    if(heroPrev){

        heroPrev.addEventListener(
            "click",
            () => {

                previousSlide();
                startHeroTimer();

            }
        );

    }


    heroDots.forEach(dot => {

        dot.addEventListener(
            "click",
            () => {

                const slide =
                    Number(dot.dataset.slide);

                showSlide(slide);

                startHeroTimer();

            }
        );

    });


    const heroSection =
        document.querySelector(".hero-section");


    if(heroSection){

        heroSection.addEventListener(
            "mouseenter",
            stopHeroTimer
        );

        heroSection.addEventListener(
            "mouseleave",
            startHeroTimer
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if(event.key === "ArrowRight"){
                nextSlide();
                startHeroTimer();
            }

            if(event.key === "ArrowLeft"){
                previousSlide();
                startHeroTimer();
            }

        }
    );


    showSlide(0);
    startHeroTimer();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileToggle =
        document.getElementById("mobileMenuToggle");

    const mainNav =
        document.getElementById("mainNav");


    function closeMobileMenu(){

        if(!mainNav || !mobileToggle) return;

        mainNav.classList.remove("open");

        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if(mobileToggle && mainNav){

        mobileToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    mainNav.classList.toggle("open");

                mobileToggle.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );

    }


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    const siteHeader =
        document.getElementById("siteHeader");


    function updateHeader(){

        if(!siteHeader) return;

        siteHeader.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive:true }
    );

    updateHeader();


    /* =====================================================
       TEAM SECTION REVEAL
       Team remains hidden until About is navigated to.
    ===================================================== */

    const aboutSection =
        document.getElementById("about");

    const teamSection =
        document.getElementById("our-team");


    function revealTeamSection(){

        if(!teamSection) return;

        teamSection.classList.add("is-visible");

    }


    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');


    internalLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");

                if(!targetId || targetId === "#"){
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if(!target){
                    return;
                }

                event.preventDefault();


                /* -----------------------------------------
                   ABOUT NAVIGATION
                ----------------------------------------- */

                if(targetId === "#about"){

                    revealTeamSection();

                }


                /* -----------------------------------------
                   TEAM DIRECT NAVIGATION
                ----------------------------------------- */

                if(targetId === "#our-team"){

                    revealTeamSection();

                }


                closeMobileMenu();


                const headerHeight =
                    siteHeader
                        ? siteHeader.offsetHeight
                        : 0;

                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.pageYOffset -
                    headerHeight -
                    10;


                window.scrollTo({
                    top:targetPosition,
                    behavior:"smooth"
                });

            }
        );

    });


    /* =====================================================
       SHOW TEAM WHEN PAGE IS DIRECTLY LOADED WITH #ABOUT
    ===================================================== */

    if(
        window.location.hash === "#about" ||
        window.location.hash === "#our-team"
    ){

        revealTeamSection();

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const navLinks =
        document.querySelectorAll(".nav-link");

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    function updateActiveNav(){

        const scrollPosition =
            window.scrollY + 180;

        let currentSection = "home";


        sections.forEach(section => {

            const top =
                section.offsetTop;

            const height =
                section.offsetHeight;

            if(
                scrollPosition >= top &&
                scrollPosition < top + height
            ){

                currentSection =
                    section.id;

            }

        });


        navLinks.forEach(link => {

            const href =
                link.getAttribute("href");

            link.classList.toggle(
                "active",
                href === `#${currentSection}`
            );

        });


        /* Team belongs to About */

        if(
            currentSection === "our-team"
        ){

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === "#about"
                );

            });

        }

    }


    window.addEventListener(
        "scroll",
        updateActiveNav,
        { passive:true }
    );

    updateActiveNav();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if(entry.isIntersecting){

                        entry.target.classList.add("visible");

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold:.12
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =====================================================
       WHY ALTOS MODAL
    ===================================================== */

    const featureModal =
        document.getElementById("featureModal");

    const featureModalBack =
        document.getElementById("featureModalBack");

    const featureModalIcon =
        document.getElementById("featureModalIcon");

    const featureModalLabel =
        document.getElementById("featureModalLabel");

    const featureModalTitle =
        document.getElementById("featureModalTitle");

    const featureModalDescription =
        document.getElementById("featureModalDescription");

    const featureModalPoints =
        document.getElementById("featureModalPoints");


    const featureData = {

        academic:{

            title:"Academic Excellence",

            icon:"fa-solid fa-book-open-reader",

            description:
                "Academic excellence at Altos Academy is about more than marks. It is about building strong foundations, developing disciplined study habits, encouraging curiosity and helping every learner understand their own progress.",

            points:[
                "Strong academic foundations",
                "Disciplined study habits",
                "Curiosity and active learning",
                "Continuous improvement"
            ]

        },


        character:{

            title:"Character & Discipline",

            icon:"fa-solid fa-scale-balanced",

            description:
                "Character and discipline provide the foundation for responsible learning. Students are encouraged to understand accountability, respect others, act with integrity and take responsibility for their choices.",

            points:[
                "Personal accountability",
                "Respect for others",
                "Integrity in action",
                "Responsibility and self-discipline"
            ]

        },


        creativity:{

            title:"Creativity & Thinking",

            icon:"fa-solid fa-lightbulb",

            description:
                "Learning becomes deeper when students are encouraged to ask questions, investigate ideas and think independently. Creativity and critical thinking help learners approach unfamiliar problems with confidence.",

            points:[
                "Critical thinking",
                "Problem solving",
                "Curiosity and exploration",
                "Independent thought"
            ]

        },


        leadership:{

            title:"Leadership",

            icon:"fa-solid fa-people-group",

            description:
                "Leadership is developed through responsibility, communication, initiative and service. Students are encouraged to develop confidence while understanding that leadership also means contributing positively to others.",

            points:[
                "Responsibility",
                "Communication",
                "Initiative",
                "Service and confidence"
            ]

        }

    };


    function openFeatureModal(key, trigger){

        if(
            !featureModal ||
            !featureData[key]
        ){
            return;
        }

        const data =
            featureData[key];


        featureModalIcon.innerHTML =
            `<i class="${data.icon}"></i>`;

        featureModalLabel.textContent =
            "WHY ALTOS ACADEMY";

        featureModalTitle.textContent =
            data.title;

        featureModalDescription.textContent =
            data.description;


        featureModalPoints.innerHTML =
            data.points.map(point => {

                return `
                    <div class="feature-point">
                        <i class="fa-solid fa-check"></i>
                        ${point}
                    </div>
                `;

            }).join("");


        featureModal.classList.add("active");

        featureModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        featureModalBack._trigger =
            trigger;


        setTimeout(() => {

            featureModalBack.focus();

        }, 50);

    }


    function closeFeatureModal(){

        if(!featureModal) return;

        featureModal.classList.remove("active");

        featureModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );


        if(
            featureModalBack._trigger
        ){

            featureModalBack._trigger.focus();

            featureModalBack._trigger =
                null;

        }

    }


    document
        .querySelectorAll(".why-read-more")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openFeatureModal(
                        link.dataset.feature,
                        link
                    );

                }
            );

        });


    if(featureModalBack){

        featureModalBack.addEventListener(
            "click",
            closeFeatureModal
        );

    }


    /* =====================================================
       TEAM MODAL
    ===================================================== */

    const teamModal =
        document.getElementById("teamModal");

    const teamModalBack =
        document.getElementById("teamModalBack");

    const teamModalInitials =
        document.getElementById("teamModalInitials");

    const teamModalRole =
        document.getElementById("teamModalRole");

    const teamModalName =
        document.getElementById("teamModalName");

    const teamModalBio =
        document.getElementById("teamModalBio");

    const teamModalPoints =
        document.getElementById("teamModalPoints");


    const teamData = {

        mayesero:{

            name:"Mayesero Solomon",

            role:"PRINCIPAL",

            initials:"MS",

            bio:
                "Mayesero Solomon serves as the Principal of Altos Academy. This profile area is designed to present the Principal’s official background, educational journey, leadership experience and vision for the Academy. The detailed biography can be added here as the official profile information is provided.",

            points:[
                "School leadership",
                "Educational direction",
                "Academic and institutional development"
            ]

        },


        daniel:{

            name:"Daniel Kaphale",

            role:"ACCOUNTANT",

            initials:"DK",

            bio:
                "Daniel Kaphale serves as the Accountant at Altos Academy. This profile area is designed to present his official professional background, educational journey, experience and contribution to the Academy. The detailed biography can be added here using the official information supplied by the school.",

            points:[
                "Financial administration",
                "Financial reporting and accountability",
                "Support for institutional operations"
            ]

        },


        blessing:{

            name:"Blessing Mwale",

            role:"HEADTEACHER",

            initials:"BM",

            bio:
                "Blessing Mwale serves as the Headteacher at Altos Academy. This profile area is designed to present the official background, educational journey, leadership experience and educational philosophy of the Headteacher. The detailed biography can be added here when the official profile is provided.",

            points:[
                "Academic leadership",
                "Teaching and learning coordination",
                "Student and school development"
            ]

        },


        allie:{

            name:"Allie Malota",

            role:"TEACHER",

            initials:"AM",

            bio:
                "Allie Malota is a Teacher at Altos Academy. This profile area is reserved for the official professional background, educational qualifications, teaching experience and subject responsibilities. The detailed biography can be added here when the official profile information is available.",

            points:[
                "Teaching and learning",
                "Student development",
                "Classroom support"
            ]

        },


        teacher01:{
            name:"Teacher 01",
            role:"TEACHER",
            initials:"T1",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher02:{
            name:"Teacher 02",
            role:"TEACHER",
            initials:"T2",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher03:{
            name:"Teacher 03",
            role:"TEACHER",
            initials:"T3",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher04:{
            name:"Teacher 04",
            role:"TEACHER",
            initials:"T4",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher05:{
            name:"Teacher 05",
            role:"TEACHER",
            initials:"T5",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher06:{
            name:"Teacher 06",
            role:"TEACHER",
            initials:"T6",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher07:{
            name:"Teacher 07",
            role:"TEACHER",
            initials:"T7",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher08:{
            name:"Teacher 08",
            role:"TEACHER",
            initials:"T8",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher09:{
            name:"Teacher 09",
            role:"TEACHER",
            initials:"T9",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        },

        teacher10:{
            name:"Teacher 10",
            role:"TEACHER",
            initials:"T10",
            bio:"This profile is reserved for a future member of the teaching team. Add the teacher's official name, educational background, teaching experience and subject information here.",
            points:["Profile pending"]
        }

    };


    function openTeamModal(key, trigger){

        if(
            !teamModal ||
            !teamData[key]
        ){
            return;
        }

        const data =
            teamData[key];


        teamModalInitials.textContent =
            data.initials;

        teamModalRole.textContent =
            data.role;

        teamModalName.textContent =
            data.name;

        teamModalBio.textContent =
            data.bio;


        teamModalPoints.innerHTML =
            data.points.map(point => {

                return `
                    <div class="team-modal-point">
                        <i class="fa-solid fa-check"></i>
                        ${point}
                    </div>
                `;

            }).join("");


        teamModal.classList.add("active");

        teamModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        teamModalBack._trigger =
            trigger;


        setTimeout(() => {

            teamModalBack.focus();

        }, 50);

    }


    function closeTeamModal(){

        if(!teamModal) return;

        teamModal.classList.remove("active");

        teamModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );


        if(
            teamModalBack._trigger
        ){

            teamModalBack._trigger.focus();

            teamModalBack._trigger =
                null;

        }

    }


    document
        .querySelectorAll(".team-node")
        .forEach(node => {

            node.addEventListener(
                "click",
                () => {

                    openTeamModal(
                        node.dataset.person,
                        node
                    );

                }
            );

        });


    if(teamModalBack){

        teamModalBack.addEventListener(
            "click",
            closeTeamModal
        );

    }


    /* =====================================================
       IMPORTANT:
       MODALS ONLY CLOSE THROUGH THEIR BACK BUTTON.
       ESCAPE DOES NOT CLOSE THEM.
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if(event.key === "Escape"){

                if(
                    featureModal &&
                    featureModal.classList.contains("active")
                ){

                    event.preventDefault();

                    return;
                }


                if(
                    teamModal &&
                    teamModal.classList.contains("active")
                ){

                    event.preventDefault();

                    return;
                }

            }

        }
    );


    /* =====================================================
       ORBIT PAUSE
       Rotation pauses when the user hovers/focuses
       an individual feature.
    ===================================================== */

    const orbitTrack =
        document.querySelector(".orbit-track");

    const orbitItems =
        document.querySelectorAll(".orbit-item");

    const orbitInners =
        document.querySelectorAll(".orbit-item-inner");


    function pauseOrbit(){

        if(!orbitTrack) return;

        orbitTrack.style.animationPlayState =
            "paused";

        orbitInners.forEach(inner => {

            inner.style.animationPlayState =
                "paused";

        });

    }


    function resumeOrbit(){

        if(!orbitTrack) return;

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


    /* =====================================================
       CONTACT FORM
       Front-end visual confirmation only.
    ===================================================== */

    const contactForm =
        document.getElementById("contactForm");


    if(contactForm){

        contactForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const button =
                    contactForm.querySelector("button");

                if(!button) return;


                const originalText =
                    button.innerHTML;


                button.innerHTML =
                    `<i class="fa-solid fa-check"></i> Message Sent`;

                button.disabled = true;


                setTimeout(() => {

                    button.innerHTML =
                        originalText;

                    button.disabled = false;

                    contactForm.reset();

                }, 2500);

            }
        );

    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.getElementById("backToTop");


    function updateBackToTop(){

        if(!backToTop) return;

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 500
        );

    }


    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive:true }
    );


    if(backToTop){

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top:0,
                    behavior:"smooth"
                });

            }
        );

    }


    updateBackToTop();


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear =
        document.getElementById("currentYear");


    if(currentYear){

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       PREVENT IMAGE DRAGGING
    ===================================================== */

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.setAttribute(
                "draggable",
                "false"
            );

        });


    /* =====================================================
       MOBILE RESIZE SAFETY
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if(
                window.innerWidth > 900
            ){

                closeMobileMenu();

            }

        }
    );

});
