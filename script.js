(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (window.__app.burgerInit) return;
        window.__app.burgerInit = true;

        var toggler = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('#navbarNav, .navbar-collapse');
        var body = document.body;

        if (!toggler || !collapse) return;

        function openMenu() {
            collapse.classList.add('show');
            toggler.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
        }

        function closeMenu() {
            collapse.classList.remove('show');
            toggler.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }

        toggler.addEventListener('click', function(e) {
            e.preventDefault();
            var isOpen = toggler.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('click', function(e) {
            var isOpen = toggler.getAttribute('aria-expanded') === 'true';
            if (isOpen && !collapse.contains(e.target) && !toggler.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            var isOpen = toggler.getAttribute('aria-expanded') === 'true';
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        var navLinks = collapse.querySelectorAll('.nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    closeMenu();
                }
            });
        }

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 768) {
                closeMenu();
            }
        }, 250));
    }

    function initScrollSpy() {
        if (window.__app.scrollSpyInit) return;
        window.__app.scrollSpyInit = true;

        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        function highlightNav() {
            var scrollY = window.pageYOffset;
            var headerHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 80;

            sections.forEach(function(section) {
                var sectionTop = section.offsetTop - headerHeight - 100;
                var sectionBottom = sectionTop + section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(highlightNav, 100));
        highlightNav();
    }

    function initSmoothScroll() {
        if (window.__app.smoothScrollInit) return;
        window.__app.smoothScrollInit = true;

        document.addEventListener('click', function(e) {
            var target = e.target.closest('a[href^="#"]:not([href="#"]):not([href="#!"])');
            if (!target) return;

            var href = target.getAttribute('href');
            if (href === '#' || href === '#!') return;

            var targetId = href.replace('#', '');
            var targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                var header = document.querySelector('.navbar');
                var headerHeight = header ? header.offsetHeight : 80;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    function initScrollAnimations() {
        if (window.__app.scrollAnimInit) return;
        window.__app.scrollAnimInit = true;

        var animElements = document.querySelectorAll('.card, .accordion-item, h2, h3, .lead, .btn');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animElements.forEach(function(el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                observer.observe(el);
            });
        }
    }

    function initButtonEffects() {
        if (window.__app.buttonEffectsInit) return;
        window.__app.buttonEffectsInit = true;

        var buttons = document.querySelectorAll('.btn, .c-button, .nav-link, a.text-decoration-none');

        buttons.forEach(function(btn) {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'all 0.3s ease-out';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });

            btn.addEventListener('mousedown', function(e) {
                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.5)';
                ripple.style.pointerEvents = 'none';
                ripple.style.animation = 'ripple 0.6s ease-out';

                var container = this;
                var originalPosition = container.style.position;
                if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
                    container.style.position = 'relative';
                }
                container.style.overflow = 'hidden';

                container.appendChild(ripple);

                setTimeout(function() {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });

        var style = document.createElement('style');
        style.textContent = '@keyframes ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(2); opacity: 0; } }';
        document.head.appendChild(style);
    }

    function initCardAnimations() {
        if (window.__app.cardAnimInit) return;
        window.__app.cardAnimInit = true;

        var cards = document.querySelectorAll('.card, .c-card, .accordion-item');

        cards.forEach(function(card) {
            card.style.transition = 'all 0.4s ease-out';

            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
    }

    function initImageAnimations() {
        if (window.__app.imageAnimInit) return;
        window.__app.imageAnimInit = true;

        var images = document.querySelectorAll('img');

        images.forEach(function(img) {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            img.style.opacity = '0';
            img.style.transform = 'scale(0.95)';
            img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

            if (img.complete) {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            } else {
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1)';
                });
            }

            img.addEventListener('error', function() {
                if (this.dataset.fallbackApplied) return;
                this.dataset.fallbackApplied = 'true';
                var svgPlaceholder = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f8f9fa"/><text x="200" y="150" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="18">Bild nicht verfügbar</text></svg>');
                this.src = svgPlaceholder;
                this.style.objectFit = 'contain';
            });
        });
    }

    function initFormValidation() {
        if (window.__app.formValidInit) return;
        window.__app.formValidInit = true;

        var form = document.getElementById('kontaktForm');
        if (!form) return;

        var validators = {
            vorname: {
                pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
                message: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen, nur Buchstaben)'
            },
            nachname: {
                pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
                message: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen, nur Buchstaben)'
            },
            email: {
                pattern: /^[^s@]+@[^s@]+.[^s@]+$/,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
            },
            telefon: {
                pattern: /^[ds+-()]{10,20}$/,
                message: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)'
            },
            nachricht: {
                minLength: 10,
                message: 'Die Nachricht muss mindestens 10 Zeichen lang sein'
            }
        };

        function showError(field, message) {
            field.classList.add('is-invalid');
            var feedback = field.nextElementSibling;
            if (!feedback || !feedback.classList.contains('invalid-feedback')) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                field.parentNode.appendChild(feedback);
            }
            feedback.textContent = message;
            feedback.style.display = 'block';
        }

        function clearError(field) {
            field.classList.remove('is-invalid');
            var feedback = field.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'none';
            }
        }

        function validateField(field) {
            var fieldName = field.getAttribute('name') || field.getAttribute('id');
            var value = field.value.trim();
            var validator = validators[fieldName];

            clearError(field);

            if (field.hasAttribute('required') && !value) {
                showError(field, 'Dieses Feld ist erforderlich');
                return false;
            }

            if (value && validator) {
                if (validator.pattern && !validator.pattern.test(value)) {
                    showError(field, validator.message);
                    return false;
                }
                if (validator.minLength && value.length < validator.minLength) {
                    showError(field, validator.message);
                    return false;
                }
            }

            return true;
        }

        var inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });

        var checkbox = form.querySelector('#datenschutz');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    clearError(this);
                }
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var isValid = true;
            var firstInvalidField = null;

            inputs.forEach(function(input) {
                if (!validateField(input)) {
                    isValid = false;
                    if (!firstInvalidField) {
                        firstInvalidField = input;
                    }
                }
            });

            if (checkbox && checkbox.hasAttribute('required') && !checkbox.checked) {
                showError(checkbox, 'Sie müssen die Datenschutzerklärung akzeptieren');
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = checkbox;
                }
            }

            if (!isValid) {
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';

            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                window.location.href = 'thank_you.html';
            }, 1500);
        });
    }

    function initAccordion() {
        if (window.__app.accordionInit) return;
        window.__app.accordionInit = true;

        var buttons = document.querySelectorAll('.accordion-button');

        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                var targetId = this.getAttribute('data-bs-target');
                if (!targetId) return;

                var target = document.querySelector(targetId);
                if (!target) return;

                var isExpanded = this.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    this.classList.add('collapsed');
                    target.classList.remove('show');
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    this.classList.remove('collapsed');
                    target.classList.add('show');
                }
            });
        });
    }

    function initScrollToTop() {
        if (window.__app.scrollTopInit) return;
        window.__app.scrollTopInit = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: var(--color-primary); color: white; border: none; font-size: 24px; cursor: pointer; opacity: 0; visibility: hidden; transition: all 0.3s ease-out; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);';

        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100));

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
            this.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.5)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
        });
    }

    function initCountUp() {
        if (window.__app.countUpInit) return;
        window.__app.countUpInit = true;

        var statNumbers = document.querySelectorAll('[data-count]');
        if (statNumbers.length === 0) return;

        function animateCount(element) {
            var target = parseInt(element.getAttribute('data-count'));
            var duration = 2000;
            var start = 0;
            var increment = target / (duration / 16);
            var current = start;

            function updateCount() {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    element.textContent = target;
                }
            }

            updateCount();
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !entry.target.dataset.counted) {
                        entry.target.dataset.counted = 'true';
                        animateCount(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            statNumbers.forEach(function(el) {
                observer.observe(el);
            });
        }
    }

    function initModalLinks() {
        if (window.__app.modalLinksInit) return;
        window.__app.modalLinksInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

        privacyLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href').indexOf('#') === -1) return;

                e.preventDefault();

                var modal = document.createElement('div');
                modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease-out;';

                var modalContent = document.createElement('div');
                modalContent.style.cssText = 'background: white; padding: 40px; border-radius: 16px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; transform: scale(0.9); transition: transform 0.3s ease-out;';
                modalContent.innerHTML = '<h3>Datenschutz</h3><p>Bitte besuchen Sie unsere vollständige Datenschutzseite für weitere Informationen.</p><button style="margin-top: 20px; padding: 12px 24px; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">Schließen</button>';

                modal.appendChild(modalContent);
                document.body.appendChild(modal);

                setTimeout(function() {
                    modal.style.opacity = '1';
                    modalContent.style.transform = 'scale(1)';
                }, 10);

                function closeModal() {
                    modal.style.opacity = '0';
                    modalContent.style.transform = 'scale(0.9)';
                    setTimeout(function() {
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    }, 300);
                }

                modalContent.querySelector('button').addEventListener('click', closeModal);
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        closeModal();
                    }
                });
            });
        });
    }

    function initHeaderScroll() {
        if (window.__app.headerScrollInit) return;
        window.__app.headerScrollInit = true;

        var header = document.querySelector('.navbar');
        if (!header) return;

        var lastScroll = 0;

        window.addEventListener('scroll', throttle(function() {
            var currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '';
            }

            lastScroll = currentScroll;
        }, 100));
    }

    window.__app.init = function() {
        initBurgerMenu();
        initScrollSpy();
        initSmoothScroll();
        initScrollAnimations();
        initButtonEffects();
        initCardAnimations();
        initImageAnimations();
        initFormValidation();
        initAccordion();
        initScrollToTop();
        initCountUp();
        initModalLinks();
        initHeaderScroll();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.navbar {
  transition: box-shadow 0.3s ease-out, background-color 0.3s ease-out;
  animation: fadeIn 0.5s ease-out;
}

.navbar-collapse {
  transition: max-height 0.4s ease-in-out;
}

@media (max-width: 767px) {
  .navbar-collapse {
    height: calc(100vh - var(--header-h));
    max-height: 0;
    overflow-y: auto;
  }

  .navbar-collapse.show {
    max-height: calc(100vh - var(--header-h));
  }
}

.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease-out, left 0.3s ease-out;
}

.nav-link:hover::before,
.nav-link.active::before {
  width: 100%;
  left: 0;
}

.btn, .c-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
}

.btn::before, .c-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease-out, height 0.6s ease-out;
}

.btn:hover::before, .c-button:hover::before {
  width: 300px;
  height: 300px;
}

.btn:hover, .c-button:hover {
  transform: translateY(-2px);
}

.btn:active, .c-button:active {
  transform: translateY(0);
}

.card, .c-card {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.4s ease-out;
}

.card:hover, .c-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-img-top {
  transition: transform 0.6s ease-out;
}

.card:hover .card-img-top {
  transform: scale(1.1);
}

img {
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.accordion-item {
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
}

.accordion-item:nth-child(1) { animation-delay: 0.1s; }
.accordion-item:nth-child(2) { animation-delay: 0.2s; }
.accordion-item:nth-child(3) { animation-delay: 0.3s; }

.accordion-button {
  transition: all 0.3s ease-out;
}

.accordion-button:hover {
  background-color: var(--color-neutral-50);
  transform: translateX(5px);
}

.accordion-button::after {
  transition: transform 0.3s ease-out;
}

.accordion-button:not(.collapsed)::after {
  transform: rotate(180deg);
}

.accordion-collapse {
  transition: max-height 0.5s ease-in-out, opacity 0.3s ease-out;
  opacity: 0;
}

.accordion-collapse.show {
  opacity: 1;
}

.form-control, .form-select, .c-input {
  transition: all 0.3s ease-out;
}

.form-control:focus, .form-select:focus, .c-input:focus {
  transform: translateY(-2px);
}

.form-check-input {
  transition: all 0.3s ease-out;
}

.form-check-input:checked {
  animation: pulse 0.3s ease-out;
}

.invalid-feedback {
  animation: fadeIn 0.3s ease-out;
}

#hero, .hero-section {
  animation: fadeIn 1s ease-out;
  position: relative;
  overflow: hidden;
}

#hero::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

.breadcrumb-item {
  animation: slideInRight 0.5s ease-out;
  animation-fill-mode: both;
}

.breadcrumb-item:nth-child(1) { animation-delay: 0.1s; }
.breadcrumb-item:nth-child(2) { animation-delay: 0.2s; }
.breadcrumb-item:nth-child(3) { animation-delay: 0.3s; }

a {
  position: relative;
  transition: color 0.3s ease-out;
}

footer a, .l-footer a {
  position: relative;
  display: inline-block;
}

footer a::after, .l-footer a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s ease-out;
}

footer a:hover::after, .l-footer a:hover::after {
  width: 100%;
}

.scroll-to-top {
  animation: fadeIn 0.3s ease-out;
}

h1, h2, h3, h4, h5, h6 {
  animation: fadeInUp 0.8s ease-out;
}

p {
  animation: fadeIn 1s ease-out;
}

.lead {
  animation: fadeInUp 0.9s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.badge {
  animation: scaleIn 0.4s ease-out;
}

.table {
  animation: fadeInUp 0.7s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
