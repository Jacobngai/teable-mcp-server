/* =========================================
   RESULT MARKETING - SHARED JAVASCRIPT
   ========================================= */

const ResultMarketing = {
    // Configuration
    config: {
        founderPricingDeadline: '2025-02-28T23:59:59',
        stripeLink: 'https://buy.stripe.com/cNibJ069Y4g1aFgaaw2Nq03',
        activities: [
            { text: 'Agent from Johor Bahru just signed up', time: '3 min ago' },
            { text: 'Property agent from PJ booked a demo', time: '7 min ago' },
            { text: 'Insurance agent from KL saved 50 contacts', time: '12 min ago' },
            { text: 'Direct sales leader from Penang joined', time: '18 min ago' },
            { text: 'New customer from Selangor activated', time: '23 min ago' },
        ],
        slotsThisWeek: 7,
        totalSlotsPerWeek: 10,
    },

    // Initialize all components
    init() {
        this.initCountdown();
        this.initActivityPopup();
        this.initSlotsCounter();
        this.initMobileNav();
        this.initSmoothScroll();
        this.initLeadCapture();
    },

    // =========================================
    // COUNTDOWN TIMER
    // =========================================
    initCountdown() {
        const countdownElements = document.querySelectorAll('.countdown-timer');
        if (countdownElements.length === 0) return;

        const deadline = new Date(this.config.founderPricingDeadline).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = deadline - now;

            if (distance < 0) {
                countdownElements.forEach(el => {
                    el.innerHTML = 'Offer Expired';
                });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElements.forEach(el => {
                el.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            });
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    },

    // =========================================
    // ACTIVITY POPUP (Purchase Notifications)
    // =========================================
    initActivityPopup() {
        // Don't show on mobile (too intrusive)
        if (window.innerWidth < 768) return;

        // Purchase notifications with masked names (mix of Base and Enterprise)
        const purchases = [
            { name: "Ah*** T.", location: "Petaling Jaya", time: "2 min ago", plan: "base" },
            { name: "Nu*** A.", location: "Shah Alam", time: "3 min ago", plan: "base" },
            { name: "Kev*** L.", location: "Mont Kiara", time: "5 min ago", plan: "enterprise" },
            { name: "Sit*** M.", location: "Bangsar", time: "7 min ago", plan: "base" },
            { name: "Raj*** K.", location: "Klang", time: "9 min ago", plan: "base" },
            { name: "Jas*** T.", location: "KLCC", time: "12 min ago", plan: "enterprise" },
            { name: "Far*** A.", location: "Johor Bahru", time: "15 min ago", plan: "base" },
            { name: "Mic*** W.", location: "Subang Jaya", time: "18 min ago", plan: "base" },
            { name: "Zar*** H.", location: "Puchong", time: "21 min ago", plan: "enterprise" },
            { name: "Dan*** C.", location: "Damansara", time: "24 min ago", plan: "base" },
            { name: "Pri*** N.", location: "Cyberjaya", time: "28 min ago", plan: "base" },
            { name: "Ahm*** F.", location: "Cheras", time: "32 min ago", plan: "base" },
            { name: "Wen*** G.", location: "Kepong", time: "35 min ago", plan: "enterprise" },
            { name: "Lak*** D.", location: "Ampang", time: "38 min ago", plan: "base" },
            { name: "Has*** I.", location: "Kajang", time: "42 min ago", plan: "base" },
            { name: "Jen*** K.", location: "Setapak", time: "45 min ago", plan: "base" },
            { name: "Gan*** P.", location: "Rawang", time: "48 min ago", plan: "enterprise" },
            { name: "Nor*** Y.", location: "Seremban", time: "52 min ago", plan: "base" },
        ];

        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'activity-popup';
        document.body.appendChild(popup);

        let index = 0;

        const showPurchase = () => {
            const purchase = purchases[index];
            const isEnterprise = purchase.plan === 'enterprise';
            const planName = isEnterprise ? 'AI Connector Enterprise' : 'AI Connector';
            const price = isEnterprise ? 'RM 498/year' : 'RM 299/year';

            popup.innerHTML = `
                <div class="purchase-notification${isEnterprise ? ' enterprise' : ''}">
                    <span class="activity-dot"></span>
                    <div class="purchase-content">
                        <div class="purchase-name">${purchase.name}</div>
                        <div class="purchase-action">purchased <strong>${planName}</strong></div>
                        <div class="purchase-price">${price}</div>
                    </div>
                    <div class="purchase-meta">
                        <span class="purchase-location">${purchase.location}</span>
                        <span class="purchase-time">${purchase.time}</span>
                    </div>
                </div>
            `;

            popup.classList.add('show');

            setTimeout(() => {
                popup.classList.remove('show');
            }, 5000);

            index = (index + 1) % purchases.length;
        };

        // Show first purchase after 8 seconds
        setTimeout(() => {
            showPurchase();
            // Then show every 15 seconds
            setInterval(showPurchase, 15000);
        }, 8000);
    },

    // =========================================
    // SLOTS COUNTER
    // =========================================
    initSlotsCounter() {
        const slotsElements = document.querySelectorAll('.slots-count');
        slotsElements.forEach(el => {
            el.textContent = this.config.slotsThisWeek;
        });

        const totalElements = document.querySelectorAll('.slots-total');
        totalElements.forEach(el => {
            el.textContent = this.config.totalSlotsPerWeek;
        });
    },

    // =========================================
    // MOBILE NAVIGATION
    // =========================================
    initMobileNav() {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (!toggle || !navLinks) return;

        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            toggle.classList.toggle('active');
        });
    },

    // =========================================
    // SMOOTH SCROLL
    // =========================================
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // =========================================
    // LEAD CAPTURE MODAL
    // =========================================
    initLeadCapture() {
        // Create modal HTML
        const modalHtml = `
            <div id="leadModal" class="lead-modal">
                <div class="lead-modal-content">
                    <button class="lead-modal-close">&times;</button>
                    <h3>Talk to Us on WhatsApp</h3>
                    <p>Leave your details and we'll reach out to help you get started.</p>
                    <form id="leadForm">
                        <div class="form-group">
                            <label for="leadName">Your Name</label>
                            <input type="text" id="leadName" name="name" placeholder="e.g. Ahmad" required>
                        </div>
                        <div class="form-group">
                            <label for="leadPhone">Phone Number</label>
                            <input type="tel" id="leadPhone" name="phone" placeholder="e.g. 012-345 6789" required>
                        </div>
                        <button type="submit" class="cta-primary" style="width: 100%; justify-content: center;">
                            <span id="leadBtnText">Chat on WhatsApp</span>
                        </button>
                    </form>
                    <p class="lead-modal-note">We'll respond within 24 hours</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('leadModal');
        const form = document.getElementById('leadForm');
        const closeBtn = modal.querySelector('.lead-modal-close');

        // Open modal when clicking "Talk to Us" buttons
        document.querySelectorAll('[data-lead-capture]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('show');
            });
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnText = document.getElementById('leadBtnText');
            const name = document.getElementById('leadName').value.trim();
            const phone = document.getElementById('leadPhone').value.trim();
            const source = window.location.pathname;

            btnText.textContent = 'Sending...';

            try {
                const response = await fetch('https://teable-mcp-server-production.up.railway.app/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, source })
                });

                const data = await response.json();

                if (data.success && data.whatsappUrl) {
                    // Redirect to WhatsApp
                    window.open(data.whatsappUrl, '_blank');
                    modal.classList.remove('show');
                    form.reset();
                    btnText.textContent = 'Chat on WhatsApp';
                } else {
                    throw new Error('Failed to save');
                }
            } catch (error) {
                console.error('Lead capture error:', error);
                // Still redirect to WhatsApp even if API fails
                const whatsappUrl = 'https://wa.me/60175740795?text=' + encodeURIComponent(`Hi, saya ${name}. Saya berminat dengan AI Connector.`);
                window.open(whatsappUrl, '_blank');
                modal.classList.remove('show');
                form.reset();
                btnText.textContent = 'Chat on WhatsApp';
            }
        });
    }
};

// =========================================
// COST CALCULATOR
// =========================================
const CostCalculator = {
    init() {
        const form = document.getElementById('cost-calculator');
        if (!form) return;

        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        this.calculate();
    },

    calculate() {
        const events = parseInt(document.getElementById('calc-events')?.value) || 0;
        const namecards = parseInt(document.getElementById('calc-namecards')?.value) || 0;
        const followups = parseInt(document.getElementById('calc-followups')?.value) || 0;

        const leadsLost = namecards - followups;
        const closingRate = 0.1; // 10%
        const missedSales = leadsLost * closingRate;
        const avgPolicyValue = 200; // RM per month
        const monthlyCost = missedSales * avgPolicyValue;
        const yearlyCost = monthlyCost * 12;

        // Update results
        const leadsLostEl = document.getElementById('result-leads-lost');
        const monthlyCostEl = document.getElementById('result-monthly-cost');
        const yearlyCostEl = document.getElementById('result-yearly-cost');
        const roiEl = document.getElementById('result-roi');

        if (leadsLostEl) leadsLostEl.textContent = Math.max(0, leadsLost);
        if (monthlyCostEl) monthlyCostEl.textContent = `RM ${Math.max(0, monthlyCost).toFixed(0)}`;
        if (yearlyCostEl) yearlyCostEl.textContent = `RM ${Math.max(0, yearlyCost).toFixed(0)}`;
        if (roiEl && yearlyCost > 0) {
            const roi = ((yearlyCost - 299) / 299 * 100).toFixed(0);
            roiEl.textContent = `${roi}%`;
        }
    }
};

// =========================================
// YES LADDER (Pre-suasion Questions)
// =========================================
const YesLadder = {
    questions: [
        "Do you sometimes forget client details?",
        "Have you ever lost a lead because you didn't follow up?",
        "Do you wish you could remember every conversation?",
        "Would an extra 2-3 cases per month change your life?"
    ],
    currentIndex: 0,
    yesCount: 0,

    init() {
        const container = document.getElementById('yes-ladder');
        if (!container) return;

        this.container = container;
        this.showQuestion();
    },

    showQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.showResult();
            return;
        }

        const question = this.questions[this.currentIndex];
        this.container.innerHTML = `
            <div class="yes-ladder-question">
                <p>${question}</p>
                <div class="yes-ladder-buttons">
                    <button class="yes-btn" onclick="YesLadder.answer(true)">Yes</button>
                    <button class="no-btn" onclick="YesLadder.answer(false)">No</button>
                </div>
            </div>
        `;
    },

    answer(isYes) {
        if (isYes) this.yesCount++;
        this.currentIndex++;
        this.showQuestion();
    },

    showResult() {
        if (this.yesCount >= 3) {
            this.container.innerHTML = `
                <div class="yes-ladder-result">
                    <p><strong>You said "yes" ${this.yesCount} times.</strong></p>
                    <p>What if you could solve all of that... for less than RM1/day?</p>
                    <a href="${ResultMarketing.config.stripeLink}" class="cta-primary">Yes, Show Me How</a>
                </div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="yes-ladder-result">
                    <p>Looks like you've got things under control!</p>
                    <p>But if you ever need help managing client relationships, we're here.</p>
                    <a href="#features" class="cta-secondary">Learn More</a>
                </div>
            `;
        }
    }
};

// =========================================
// INITIALIZE ON DOM READY
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    ResultMarketing.init();
    CostCalculator.init();
    YesLadder.init();
});

// =========================================
// UTILITY FUNCTIONS
// =========================================

// Track CTA clicks (for analytics)
function trackCTA(ctaName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'CTA',
            'event_label': ctaName
        });
    }
    console.log('CTA clicked:', ctaName);
}

// Format currency
function formatRM(amount) {
    return `RM ${amount.toLocaleString()}`;
}
