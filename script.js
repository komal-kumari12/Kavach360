document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('active')) {
            navList.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav') && navList.classList.contains('active')) {
            navList.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if open
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formValues = {};
            
            for (let [key, value] of formData.entries()) {
                formValues[key] = value;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call with timeout
            setTimeout(() => {
                // Show success message
                this.innerHTML = `
                    <div class="form-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>Message Sent Successfully!</h3>
                        <p>Thank you for contacting us. We will get back to you shortly.</p>
                    </div>
                `;
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    this.reset();
                    this.innerHTML = `
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="subject">Subject</label>
                            <input type="text" id="subject" name="subject" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" name="message" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    `;
                }, 5000);
                
            }, 2000);
        });
    }

    // Animated counters for statistics (if added later)
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (counters.length === 0) return;
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = Math.ceil(target / (duration / 16)); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    return;
                }
                
                counter.textContent = current.toLocaleString();
                requestAnimationFrame(updateCounter);
            };
            
            updateCounter();
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
                
                // If this is the stats section, animate counters
                if (entry.target.classList.contains('stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.feature-card, .step, .about-content, .download-card').forEach(el => {
        observer.observe(el);
    });

    // Add animation classes to elements
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Safety score simulation (for demo purposes)
    const safetyScoreDemo = document.querySelector('.safety-score-demo');
    if (safetyScoreDemo) {
        const scoreValue = safetyScoreDemo.querySelector('.score-value');
        const scoreBar = safetyScoreDemo.querySelector('.score-bar-fill');
        
        if (scoreValue && scoreBar) {
            let score = 65; // Starting score
            
            // Update score display
            function updateScore() {
                scoreValue.textContent = score;
                scoreBar.style.width = `${score}%`;
                
                // Update color based on score
                if (score < 50) {
                    scoreBar.style.backgroundColor = '#ff4d4d'; // Red
                } else if (score < 75) {
                    scoreBar.style.backgroundColor = '#ffaa00'; // Orange
                } else {
                    scoreBar.style.backgroundColor = '#00c853'; // Green
                }
            }
            
            // Simulate score changes
            updateScore();
            
            // Simulate score changes every 5 seconds
            setInterval(() => {
                // Random score change between -5 and +5
                const change = Math.floor(Math.random() * 11) - 5;
                score += change;
                
                // Keep score within 0-100 range
                score = Math.max(0, Math.min(100, score));
                
                updateScore();
            }, 5000);
        }
    }

    // Geofencing demo animation (if added later)
    const geofencingDemo = document.querySelector('.geofencing-demo');
    if (geofencingDemo) {
        const tourist = geofencingDemo.querySelector('.tourist-marker');
        const safeZone = geofencingDemo.querySelector('.safe-zone');
        const alertBox = geofencingDemo.querySelector('.alert-box');
        
        if (tourist && safeZone && alertBox) {
            let isInSafeZone = true;
            let touristX = 50; // Starting position (percentage)
            let touristY = 50;
            let direction = { x: 1, y: 1 };
            
            // Update tourist position
            function updatePosition() {
                // Move tourist
                touristX += direction.x * 0.5;
                touristY += direction.y * 0.5;
                
                // Bounce off edges
                if (touristX <= 10 || touristX >= 90) direction.x *= -1;
                if (touristY <= 10 || touristY >= 90) direction.y *= -1;
                
                // Update position
                tourist.style.left = `${touristX}%`;
                tourist.style.top = `${touristY}%`;
                
                // Check if tourist is in safe zone
                const safeZoneRect = safeZone.getBoundingClientRect();
                const touristRect = tourist.getBoundingClientRect();
                
                const inSafeZone = (
                    touristRect.left >= safeZoneRect.left &&
                    touristRect.right <= safeZoneRect.right &&
                    touristRect.top >= safeZoneRect.top &&
                    touristRect.bottom <= safeZoneRect.bottom
                );
                
                // Show/hide alert if status changes
                if (inSafeZone !== isInSafeZone) {
                    isInSafeZone = inSafeZone;
                    
                    if (!isInSafeZone) {
                        alertBox.classList.add('active');
                        tourist.classList.add('danger');
                    } else {
                        alertBox.classList.remove('active');
                        tourist.classList.remove('danger');
                    }
                }
            }
            
            // Update position every 50ms
            setInterval(updatePosition, 50);
        }
    }
});