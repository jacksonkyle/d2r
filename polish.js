// polish.js — site-wide UX polish: scroll-to-top button + sticky quote CTA
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        // --- Scroll to top button ---
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'scroll-top';
        btn.setAttribute('aria-label', 'Scroll to top of page');
        btn.innerHTML = '↑';
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(btn);

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    btn.classList.toggle('is-visible', window.scrollY > 400);
                    ticking = false;
                });
                ticking = true;
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });

        // --- Sticky Get a Quote CTA on mobile ---
        // Skip on checkout (transactional flow) and the thank-you page.
        const path = location.pathname;
        const skipCta = /checkout\.html$/i.test(path) || /thanks\.html$/i.test(path);
        if (!skipCta) {
            const cta = document.createElement('a');
            cta.href = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === ''
                ? '#contact'
                : 'index.html#contact';
            cta.className = 'sticky-cta';
            cta.textContent = 'Get a Quote';
            cta.setAttribute('aria-label', 'Get a quote — jump to contact form');
            document.body.appendChild(cta);

            // Hide the CTA when the user is actually inside the contact form on the index page.
            const contactSection = document.getElementById('contact');
            if (contactSection && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (e) {
                        document.body.classList.toggle('cta-hidden', e.isIntersecting);
                    });
                }, { rootMargin: '0px 0px -30% 0px' });
                observer.observe(contactSection);
            }
        }

        // --- Animated stat counters ---
        const counters = document.querySelectorAll('.stat-num[data-count]');
        if (counters.length && 'IntersectionObserver' in window) {
            const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const animateCount = function (el) {
                const target = parseInt(el.getAttribute('data-count'), 10) || 0;
                if (reduceMotion) {
                    el.textContent = String(target);
                    return;
                }
                const duration = 1400;
                const start = performance.now();
                const tick = function (now) {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
                    el.textContent = String(Math.round(target * eased));
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            };
            const obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        animateCount(e.target);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.4 });
            counters.forEach(function (c) {
                c.textContent = '0';
                obs.observe(c);
            });
        }
    });
})();
