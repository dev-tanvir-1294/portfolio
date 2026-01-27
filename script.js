// Basic script structure
console.log("Portfolio script loaded");

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved user preference, if any, on load of voters
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else if (systemTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Simple mobile toggle placeholder
const mobileToggle = document.querySelector('.mobile-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');

if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
        // Toggle active class for animation
        mobileToggle.classList.toggle('active');
        mainNav.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Hero Text Rotation (GSAP)
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);

    const texts = document.querySelectorAll(".hero-name");

    // Initial State: Put the first one in view, others below
    gsap.set(texts, { opacity: 0, y: "100%" });

    // Create a timeline that repeats infinitely
    const tl = gsap.timeline({ repeat: -1 });

    texts.forEach((text, index) => {
        // Duration of one full cycle item display
        const duration = 2;
        const stagger = 3; // Time to stay on screen

        tl.to(text, {
            opacity: 1,
            y: "0%",
            duration: 0.8,
            ease: "power2.out"
        })
            .to(text, {
                opacity: 0,
                y: "-100%", // Move up and out
                duration: 0.8,
                ease: "power2.in",
                delay: 2 // Wait before moving out
            });
    });

    // Marquee Animation L->R
    // 3 sets of items. To move Left -> Right continuously:
    // We start shifted left by 1/3 (-33.333%) and animate to 0.
    // This makes the items appear to flow to the right.
    gsap.fromTo(".marquee-track",
        {
            xPercent: -33.333
        },
        {
            xPercent: 0,
            ease: "none",
            duration: 20,
            repeat: -1
        }
    );

    // About Section scrollytelling effect (Desktop Only)
    const aboutSection = document.querySelector('.about-section');
    const imgStack = document.querySelectorAll('.stack-img');
    const aboutContentInner = document.querySelector('.about-content-inner');
    const aboutRight = document.querySelector('.about-right');
    const aboutImageWrapper = document.querySelector('.about-image-wrapper');

    let mm = gsap.matchMedia();

    mm.add("(min-width: 969px)", () => {
        // Initial state: hide the inner text content (Desktop)
        gsap.set(aboutContentInner, { opacity: 0, y: 150 });

        // Create a pinned timeline with Center-Pinning
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: aboutSection,
                start: "center center",
                end: "+=500%",
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // ACT 1: Image Gallery Cycle
        imgStack.forEach((img, i) => {
            if (i === 0) return;
            aboutTl.to(imgStack[i - 1], {
                opacity: 0,
                scale: 0.9,
                duration: 2,
                ease: "power2.inOut"
            }, "+=1.2")
                .to(img, {
                    opacity: 1,
                    scale: 1,
                    duration: 2,
                    ease: "power2.inOut"
                }, "<");
        });

        // ACT 2: Image Section Scrolls UP (Stats STAY)
        aboutTl.to({}, { duration: 1 });

        aboutTl.to(aboutImageWrapper, {
            y: -500,
            opacity: 0,
            duration: 4,
            ease: "power2.in"
        });

        // ACT 3: About Text Content Arrives from BOTTOM
        aboutTl.to(aboutContentInner, {
            opacity: 1,
            y: 0,
            duration: 4,
            ease: "power2.out"
        }, "-=3.5");

        aboutTl.to({}, { duration: 2 });
    });

    mm.add("(max-width: 968px)", () => {
        // Simple entrance animations for Mobile
        gsap.set([aboutImageWrapper, aboutContentInner, aboutRight], { opacity: 1, y: 0 });

        gsap.from(".about-image-wrapper", {
            scrollTrigger: {
                trigger: ".about-image-wrapper",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out"
        });

        gsap.from(".about-content-inner", {
            scrollTrigger: {
                trigger: ".about-content-inner",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out"
        });

        gsap.from(".about-right", {
            scrollTrigger: {
                trigger: ".about-right",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out"
        });
    });


    // Animated Counter for Stats
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));

        // Set initial value to 0
        stat.textContent = '0';

        // Animate to target value when scrolled into view
        gsap.to(stat, {
            textContent: target,
            duration: 2.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: stat,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true
            },
            onUpdate: function () {
                stat.textContent = Math.ceil(this.targets()[0].textContent);
            }
        });
    });

    // Project Filter Functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    // Show card with animation
                    gsap.to(card, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: "power2.out",
                        onStart: () => {
                            card.classList.remove('hidden');
                            card.style.display = 'block';
                        }
                    });
                } else {
                    // Hide card with animation
                    gsap.to(card, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            card.classList.add('hidden');
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });

    // Skills Circular Progress Animation
    const progressCircles = document.querySelectorAll('.progress-ring-circle');
    const progressNumbers = document.querySelectorAll('.skill-progress .progress-number');

    progressCircles.forEach((circle, index) => {
        const percent = parseInt(circle.getAttribute('data-percent'));
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;

        // Set initial state
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;

        // Create gradient for stroke
        if (index === 0) {
            const svg = circle.closest('svg');
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'gradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('style', 'stop-color:#6366f1;stop-opacity:1');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('style', 'stop-color:#a855f7;stop-opacity:1');

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.insertBefore(defs, svg.firstChild);
        }

        // Animate on scroll
        gsap.to(circle, {
            strokeDashoffset: offset,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: circle,
                start: "top 80%",
                once: true
            }
        });
    });

    // Animate skill percentage numbers
    progressNumbers.forEach(number => {
        const target = parseInt(number.getAttribute('data-target'));

        gsap.to(number, {
            textContent: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: number,
                start: "top 80%",
                once: true
            },
            onUpdate: function () {
                number.textContent = Math.ceil(number.textContent);
            }
        });
    });

    // Cinematic Testimonials Contained Split Animation (Refined)
    const splitContainer = document.querySelector('.testimonials-split-container');
    const mainHero = document.querySelector('.main-hero-layer');
    const splitItems = document.querySelectorAll('.split-item');
    const leftItem = document.querySelector('#item-left');
    const centerItem = document.querySelector('#item-center');
    const rightItem = document.querySelector('#item-right');

    if (splitContainer && leftItem && centerItem && rightItem) {
        // Main timeline with Center-Pinning
        const splitTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".testimonials-section",
                start: "center center", // Pin when the section is centered
                end: "+=1500",           // Stay centered for more scroll
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // 1. Initial State Sync
        splitTl.set(leftItem, { xPercent: 100 })
            .set(rightItem, { xPercent: -100 });

        // 2. The Reveal: Fade out main hero layer while starting the split
        // This ensures main.png is seen first, then it "shatters" into slices
        splitTl.to(mainHero, {
            opacity: 0,
            duration: 1,
            ease: "power1.inOut"
        }, 0);

        // 3. The Split
        splitTl.to([leftItem, rightItem], {
            xPercent: 0,
            duration: 2,
            ease: "power2.inOut"
        }, 0.5); // Start splitting shortly after fade begins

        // 4. Transformation to Cards
        splitItems.forEach((item, i) => {
            const wrapper = item.querySelector('.slice-image-wrapper');
            const card = item.querySelector('.testimonial-card');

            splitTl.to(wrapper, {
                opacity: 0,
                scale: 0.95,
                duration: 1.5,
                ease: "power2.in"
            }, 2.5 + (i * 0.1))
                .to(card, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 2,
                    ease: "back.out(1.7)"
                }, 3 + (i * 0.2));
        });

        // Small pause at the end
        splitTl.to({}, { duration: 1 });
    }

    // Update copyright year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
