// Basic script structure
console.log("Portfolio script loaded");

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    lerp: 0.1, // Linear Interpolation for buttery smoothness in production
    wheelMultiplier: 1,
    smoothWheel: true,
    infinite: false,
})

// Ensure ScrollTrigger refreshes after all assets are loaded (fixes GitHub offset issues)
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// Synchronize Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

// Use GSAP's ticker to drive Lenis
// This is the ONLY loop we need. Removing the separate raf() function fixes the "vibration"
gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})

// Disable lag smoothing to prevent desync during heavy animations
gsap.ticker.lagSmoothing(0)

// --- Premium Splash Screen Logic ---
const splashScreen = document.querySelector('.splash-screen');
const splashLogoMark = document.querySelector('.splash-logo .logo-mark');
const loaderBar = document.querySelector('.loader-bar');
const loadingText = document.querySelector('.loading-percentage');

if (splashScreen) {
    // Disable scrolling during splash
    lenis.stop();

    const splashTl = gsap.timeline({
        onComplete: () => {
            lenis.start();
        }
    });

    // 1. Logo Entrance
    splashTl.to(splashLogoMark, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.5
    });

    // 2. Loading Progress
    let progress = { value: 0 };
    splashTl.to(progress, {
        value: 100,
        duration: 2.5,
        ease: "power1.inOut",
        onUpdate: () => {
            const current = Math.ceil(progress.value);
            if (loadingText) loadingText.textContent = current;
            if (loaderBar) loaderBar.style.width = current + "%";
        }
    }, "-=0.2");

    // 3. Cinematic Exit (Original Curtain Reveal)
    splashTl.to(splashScreen, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: () => {
            splashScreen.style.display = 'none'; // Ensure it's gone
        }
    });

    // 4. Hero Content Entrance
    splashTl.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.6");
}



// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        if (newTheme === 'light') {
            htmlElement.setAttribute('data-theme', 'light');
        } else {
            htmlElement.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', newTheme);
    });
}

// Mobile Menu Logic
const mobileToggle = document.querySelector('.mobile-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');

if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mainNav.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (mainNav.classList.contains('active')) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            lenis.start();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target) && mainNav.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            lenis.start();
        }
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

    // --- Contact Form EmailJS Integration ---
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm?.querySelector('.btn-submit');
    const btnSpan = submitBtn?.querySelector('span');

    if (contactForm && submitBtn) {
        // Initialize EmailJS with your Public Key
        // REPLACE 'YOUR_PUBLIC_KEY' with your actual public key from EmailJS
        (function () {
            emailjs.init("i2EHqpxiiu2DbUCH9");
        })();

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Set loading state
            submitBtn.disabled = true;
            if (btnSpan) btnSpan.textContent = 'Sending...';

            // REPLACE 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
            const serviceID = 'service_3nu3o26';
            const templateID = 'template_17a2hpy';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    // Success State
                    submitBtn.disabled = false;
                    submitBtn.classList.add('success');
                    if (btnSpan) btnSpan.textContent = 'Message Sent!';
                    contactForm.reset();

                    // Revert button after 5 seconds
                    setTimeout(() => {
                        submitBtn.classList.remove('success');
                        if (btnSpan) btnSpan.textContent = 'Send Message';
                    }, 5000);
                }, (err) => {
                    // Error State
                    submitBtn.disabled = false;
                    if (btnSpan) btnSpan.textContent = 'Error! Try Again';
                    console.error('EmailJS Error:', err);
                    alert("Oops! Something went wrong. Please try again or email me directly at tanvirahmed1294@gmail.com");
                });
        });
    }

    // --- Particle Background Animation ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray;

        // Mouse interaction
        let mouse = {
            x: null,
            y: null,
            radius: 150
        }

        window.addEventListener('mousemove', function (event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        // Clear mouse position when leaving window to stop effect
        window.addEventListener('mouseout', function () {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Get color based on theme
        function getParticleColor() {
            const isDark = !document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') !== 'light';
            return isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
        }

        function getLineColor() {
            const isDark = !document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') !== 'light';
            return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        }

        // Create particle
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1; // Size between 1 and 3
                this.speedX = (Math.random() * 1.5) - 0.75;
                this.speedY = (Math.random() * 1.5) - 0.75;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                if (mouse.x != undefined && mouse.y != undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        // Gently move particles away/towards mouse for interactive feel
                        // This makes them "flee" slightly or expand around the cursor
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = mouse.radius;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * 3; // Strength
                        const directionY = forceDirectionY * force * 3;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }

                // Wrap around screen
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;

                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = getParticleColor();
                ctx.globalAlpha = 0.5; // Slight transparency for dot
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0; // Reset
            }
        }

        function initParticles() {
            particlesArray = [];
            // Responsive number of particles
            const numberOfParticles = (canvas.width * canvas.height) / 15000;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                // Draw connections
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = getLineColor();
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }

                // Draw connection to mouse
                if (mouse.x != undefined && mouse.y != undefined) {
                    let dx = particlesArray[i].x - mouse.x;
                    let dy = particlesArray[i].y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        ctx.beginPath();
                        ctx.strokeStyle = getLineColor(); // Keep it subtle
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
            // Use GSAP ticker to sync with other animations or just RAF
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        // Handle Resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        // Optional: Re-init on theme toggle to change colors instantly
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                    // Force redraw with new colors
                    // Not strictly necessary as getParticleColor is called every frame, 
                    // but good for explicit updates if we cached colors.
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    }

    // --- Custom Cursor Logic for About Section ---
    const customCursor = document.querySelector('.custom-cursor');
    const aboutSectionCursor = document.querySelector('.about-section');

    if (customCursor && aboutSectionCursor) {
        // Center the cursor initially (GSAP handles transform)
        gsap.set(customCursor, { xPercent: -50, yPercent: -50 });

        // Create quickTo setters for performance
        const xTo = gsap.quickTo(customCursor, "x", { duration: 0.2, ease: "power3" });
        const yTo = gsap.quickTo(customCursor, "y", { duration: 0.2, ease: "power3" });

        // Track global mouse movement
        window.addEventListener('mousemove', (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });

        // Show cursor when entering About section
        aboutSectionCursor.addEventListener('mouseenter', () => {
            gsap.to(customCursor, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        // Hide cursor when leaving About section
        aboutSectionCursor.addEventListener('mouseleave', () => {
            gsap.to(customCursor, {
                opacity: 0,
                scale: 0.5,
                duration: 0.3,
                ease: "power2.in"
            });
        });
    }
});
