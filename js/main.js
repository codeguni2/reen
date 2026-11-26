/**
 * Reen Business Centre — Interactive UI & Low-Bandwidth Controller
 * Classic deferred script (works 100% on both file:// local preview AND http/https hosting!)
 */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '260977794427';

  // ---------------------------------------------------------------------------
  // 1. Mobile & Tablet Navigation Menu (Opens under button, auto-closes cleanly)
  // ---------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const menuToggleLabel = document.getElementById('menu-toggle-label');
  const siteMenu = document.getElementById('site-menu');
  const navBackdrop = document.getElementById('nav-backdrop');
  const desktopMedia = window.matchMedia('(min-width: 62rem)');

  function setMenuState(open) {
    if (!menuToggle || !siteMenu) return;
    const shouldOpen = Boolean(open) && !desktopMedia.matches;

    siteMenu.classList.toggle('is-open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (menuToggleLabel) {
      menuToggleLabel.textContent = shouldOpen ? 'Close' : 'Menu';
    }

    if (navBackdrop) {
      if (shouldOpen) {
        navBackdrop.hidden = false;
        requestAnimationFrame(() => navBackdrop.classList.add('is-active'));
      } else {
        navBackdrop.classList.remove('is-active');
        setTimeout(() => {
          if (!siteMenu.classList.contains('is-open')) {
            navBackdrop.hidden = true;
          }
        }, 240);
      }
    }
  }

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = siteMenu.classList.contains('is-open');
      setMenuState(!isOpen);
    });

    // Auto-close immediately whenever ANY link or CTA inside the menu is clicked
    siteMenu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link) {
        setMenuState(false);
      }
    });

    navBackdrop?.addEventListener('click', () => setMenuState(false));

    document.addEventListener('click', (event) => {
      if (!siteMenu.classList.contains('is-open')) return;
      if (!siteMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteMenu.classList.contains('is-open')) {
        setMenuState(false);
        menuToggle.focus();
      }
    });

    desktopMedia.addEventListener('change', (e) => {
      if (e.matches) setMenuState(false);
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Scroll Progress Bar & Sticky Header Elevation
  // ---------------------------------------------------------------------------
  const scrollProgress = document.getElementById('scroll-progress');
  function handleScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    header?.classList.toggle('is-scrolled', y > 16);

    if (scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
      scrollProgress.style.setProperty('--scroll-ratio', ratio.toFixed(4));
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---------------------------------------------------------------------------
  // 3. Staggered Scroll-Reveal Animations & Lazy Image Shimmer Fade
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.media-shimmer').forEach((container) => {
    const img = container.querySelector('img');
    if (!img) {
      container.classList.add('is-loaded');
      return;
    }
    if (img.complete && img.naturalWidth > 0) {
      container.classList.add('is-loaded');
    } else {
      if (img.getAttribute('loading') === 'lazy') {
        img.classList.add('lazy-fade');
      }
      const markDone = () => container.classList.add('is-loaded');
      img.addEventListener('load', markDone, { once: true });
      img.addEventListener('error', markDone, { once: true });
    }
  });

  if (
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
    'IntersectionObserver' in window
  ) {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('is-revealed');
      } else {
        el.classList.add('is-hidden-init');
        revealObserver.observe(el);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Active Nav Section Highlighting & Pre-Selected Room Booking
  // ---------------------------------------------------------------------------
  const serviceSelect = document.getElementById('service-needed');
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-select-service]');
    if (!trigger || !serviceSelect) return;

    const targetService = trigger.getAttribute('data-select-service');
    if (targetService) {
      serviceSelect.value = targetService;
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const trackedSections = ['top', 'lodge', 'dining', 'minimart', 'location', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (trackedSections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const activeHref = `#${entry.target.id}`;
            for (const link of navLinks) {
              if (link.getAttribute('href') === activeHref) {
                link.setAttribute('aria-current', 'page');
              } else {
                link.removeAttribute('aria-current');
              }
            }
          }
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );
    trackedSections.forEach((sec) => sectionObserver.observe(sec));
  }

  // ---------------------------------------------------------------------------
  // 5. Interactive Gallery Category Filtering (Smooth Animated Filter)
  // ---------------------------------------------------------------------------
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn[data-filter]'));
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item[data-category]'));

  if (filterButtons.length > 0 && galleryItems.length > 0) {
    let filterToken = 0;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-filter') || 'all';
        filterToken += 1;
        const currentToken = filterToken;

        filterButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        let visibleIndex = 0;
        galleryItems.forEach((item) => {
          const matches = selected === 'all' || item.getAttribute('data-category') === selected;

          if (matches) {
            item.classList.remove('is-filtering-out');
            item.hidden = false;
            item.classList.remove('is-filtering-in');
            // Reflow so entry animation replays cleanly
            void item.offsetWidth;
            item.style.animationDelay = `${visibleIndex * 45}ms`;
            item.classList.add('is-filtering-in');
            visibleIndex += 1;
          } else if (!item.hidden) {
            item.classList.remove('is-filtering-in');
            item.classList.add('is-filtering-out');
            setTimeout(() => {
              if (filterToken === currentToken && item.classList.contains('is-filtering-out')) {
                item.hidden = true;
                item.classList.remove('is-filtering-out');
              }
            }, 220);
          }
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Full-Featured Photo Lightbox (Click Photo, Prev/Next, Keyboard & Swipe)
  // ---------------------------------------------------------------------------
  const lightboxDialog = document.getElementById('lightbox-dialog');
  const lightboxFigure = document.getElementById('lightbox-figure');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  const allTriggers = Array.from(document.querySelectorAll('.gallery-trigger'));
  let activeTriggers = allTriggers;
  let activeIndex = 0;

  function renderLightboxSlide(index) {
    if (!lightboxImg || activeTriggers.length === 0) return;
    activeIndex = (index + activeTriggers.length) % activeTriggers.length;

    const btn = activeTriggers[activeIndex];
    const fullSrc = btn.getAttribute('data-full');
    const fallbackSrc = btn.getAttribute('data-fallback');
    const caption = btn.getAttribute('data-caption') || '';
    const catLabel = btn.getAttribute('data-cat-label') || 'Reen Business Centre';
    const thumbImg = btn.querySelector('img');

    if (lightboxTitle) lightboxTitle.textContent = catLabel;
    if (lightboxCounter) lightboxCounter.textContent = `${activeIndex + 1} / ${activeTriggers.length}`;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightboxImg.alt = thumbImg?.alt || caption;

    if (fullSrc) {
      lightboxFigure?.classList.add('is-loading');
      lightboxImg.onload = () => lightboxFigure?.classList.remove('is-loading');
      lightboxImg.onerror = () => {
        if (fallbackSrc && lightboxImg.getAttribute('src') !== fallbackSrc) {
          lightboxImg.src = fallbackSrc;
        } else {
          lightboxFigure?.classList.remove('is-loading');
        }
      };
      lightboxImg.src = fullSrc;
    }
  }

  if (lightboxDialog && allTriggers.length > 0) {
    allTriggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Navigate through currently visible gallery category
        activeTriggers = allTriggers.filter((t) => {
          const card = t.closest('.gallery-item');
          return card && !card.hidden;
        });
        if (activeTriggers.length === 0) activeTriggers = allTriggers;

        const idx = activeTriggers.indexOf(btn);
        renderLightboxSlide(idx >= 0 ? idx : 0);
        lightboxDialog.showModal();
      });
    });

    prevBtn?.addEventListener('click', () => renderLightboxSlide(activeIndex - 1));
    nextBtn?.addEventListener('click', () => renderLightboxSlide(activeIndex + 1));

    lightboxDialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderLightboxSlide(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderLightboxSlide(activeIndex + 1);
      }
    });

    // Touch swipe left / right inside lightbox
    let touchStartX = 0;
    lightboxDialog.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0]?.clientX || 0;
      },
      { passive: true }
    );
    lightboxDialog.addEventListener(
      'touchend',
      (e) => {
        const deltaX = (e.changedTouches[0]?.clientX || 0) - touchStartX;
        if (Math.abs(deltaX) > 45) {
          if (deltaX < 0) renderLightboxSlide(activeIndex + 1);
          else renderLightboxSlide(activeIndex - 1);
        }
      },
      { passive: true }
    );

    lightboxDialog.addEventListener('close', () => {
      lightboxDialog.returnValue = '';
    });

    // Click backdrop to close on all browsers (including Safari without closedBy)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      lightboxDialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, lightboxDialog);
      });
      lightboxDialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, lightboxDialog)) {
          lightboxDialog.close();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Low-Data Map Facade (0 KB map tiles until tapped)
  // ---------------------------------------------------------------------------
  const loadMapBtn = document.getElementById('load-map-btn');
  const mapStage = document.getElementById('map-stage');

  if (loadMapBtn && mapStage) {
    loadMapBtn.addEventListener('click', () => {
      const mapSrc = loadMapBtn.getAttribute('data-map-src');
      if (!mapSrc) return;

      const iframe = document.createElement('iframe');
      iframe.title = 'Interactive Map of Mansa and Samfya Road, Luapula Province, Zambia';
      iframe.src = mapSrc;
      iframe.loading = 'eager';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      mapStage.replaceChildren(iframe);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Inquiry Form -> Opens WhatsApp Directly with Pre-Filled Inquiry
  // ---------------------------------------------------------------------------
  const inquiryForm = document.getElementById('inquiry-form');
  const formFeedback = document.getElementById('form-feedback');

  if (inquiryForm) {
    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const supportsUserInvalid = CSS.supports('selector(:user-invalid)');
    const flagged = new WeakSet();
    const dirtyState = new WeakMap();

    const syncAria = (el) => {
      if (!el.matches?.('input, select, textarea')) return;
      const invalid = supportsUserInvalid
        ? el.matches(':user-invalid')
        : el.classList.contains('user-invalid-fallback');

      if (invalid) {
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
      }
    };

    inquiryForm.querySelectorAll('input, select, textarea').forEach((el) => syncAria(el));

    if (!supportsUserInvalid) {
      const updateFallback = (input) => {
        const isValid = input.validity.valid;
        input.classList.toggle('user-invalid-fallback', !isValid);
        input.classList.toggle('user-valid-fallback', isValid);
        syncAria(input);
      };

      inquiryForm.addEventListener(
        'blur',
        (e) => {
          const el = e.target;
          if (!el.checkValidity) return;
          const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
          st.hasBlurred = true;
          dirtyState.set(el, st);
          if (st.hasInteracted) updateFallback(el);
        },
        true
      );
      inquiryForm.addEventListener('input', (e) => {
        const el = e.target;
        if (!el.checkValidity) return;
        const st = dirtyState.get(el) || { hasInteracted: false, hasBlurred: false };
        st.hasInteracted = true;
        dirtyState.set(el, st);
        if (st.hasBlurred) updateFallback(el);
      });
      inquiryForm.addEventListener(
        'change',
        (e) => {
          const el = e.target;
          if (!el.checkValidity) return;
          dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
          updateFallback(el);
        },
        true
      );
      inquiryForm.addEventListener(
        'invalid',
        (e) => {
          const el = e.target;
          dirtyState.set(el, { hasInteracted: true, hasBlurred: true });
          updateFallback(el);
        },
        true
      );
    } else {
      inquiryForm.addEventListener('blur', (e) => syncAria(e.target), true);
      inquiryForm.addEventListener('input', (e) => {
        if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
      });
      inquiryForm.addEventListener('change', (e) => syncAria(e.target), true);
      inquiryForm.addEventListener('invalid', (e) => syncAria(e.target), true);
    }

    inquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!inquiryForm.checkValidity()) {
        inquiryForm.querySelectorAll('input, select, textarea').forEach((el) => {
          if (!el.validity.valid) {
            el.classList.add('user-invalid-fallback');
            syncAria(el);
          }
        });
        const firstInvalid = inquiryForm.querySelector(':invalid');
        firstInvalid?.focus();
        return;
      }

      const data = new FormData(inquiryForm);
      const name = String(data.get('name') || '').trim();
      const contact = String(data.get('contact') || '').trim();
      const service = String(data.get('service') || '').trim();
      const message = String(data.get('message') || '').trim();

      const waLines = [
        `Hello Reen Business Centre!`,
        `Name: ${name}`,
        `Contact: ${contact}`,
        `Service Needed: ${service}`,
      ];
      if (message) waLines.push(`Details: ${message}`);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waLines.join('\n'))}`;

      // Open WhatsApp directly inside the synchronous submit gesture so popups aren't blocked
      const popup = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!popup) {
        window.location.href = waUrl;
      }

      if (formFeedback) {
        formFeedback.replaceChildren();

        const title = document.createElement('strong');
        title.textContent = `Opening WhatsApp for ${name}…`;

        const desc = document.createElement('span');
        desc.textContent = `Your ${service.toLowerCase()} inquiry is pre-filled and ready to send on WhatsApp (0977 794 427). If WhatsApp didn't open automatically, tap below:`;

        const actions = document.createElement('div');
        actions.className = 'form-status-actions';

        const waLink = document.createElement('a');
        waLink.className = 'btn btn-terracotta btn-sm';
        waLink.href = waUrl;
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        waLink.textContent = 'Open WhatsApp Chat';

        actions.append(waLink);
        formFeedback.append(title, desc, actions);
        formFeedback.hidden = false;
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      inquiryForm.reset();
      setTimeout(() => {
        inquiryForm.querySelectorAll('input, select, textarea').forEach((el) => {
          el.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          syncAria(el);
        });
      }, 0);
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Footer Year & Service Worker Registration (HTTP/HTTPS only)
  // ---------------------------------------------------------------------------
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
