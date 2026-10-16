// Shared site behavior, loaded on every page (<script src="site.js" defer>).
// - Mobile navigation: adds a menu (hamburger) button to the header and
//   lets dropdowns open by tap / click / keyboard instead of hover only.
// - Small accessibility helpers for icon-only links and the pathway
//   page "click to expand" dropdowns.
(function () {
  const header = document.querySelector('header');
  const nav = header && header.querySelector('nav');
  if (!nav) return;

  const navList = nav.querySelector('ul');
  nav.id = nav.id || 'site-nav';

  /* ---------- Menu (hamburger) button ---------- */
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(toggle);

  // styles.css only switches to the mobile menu layout when this class is
  // present, so the regular nav still shows if this script fails to load.
  header.classList.add('has-mobile-nav');

  function setMenuOpen(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('nav-open'));
  });

  /* ---------- Social links inside the mobile menu ---------- */
  // On phones the header is too narrow for the social icons, so a copy is
  // placed at the bottom of the menu (hidden on desktop by styles.css).
  const socials = header.querySelector('.socials');
  if (socials && navList) {
    const li = document.createElement('li');
    li.className = 'nav-socials';
    li.appendChild(socials.cloneNode(true));
    navList.appendChild(li);
  }

  // Icon-only links need a text name for screen readers
  const iconNames = {
    'fa-facebook': 'Facebook',
    'fa-instagram': 'Instagram',
    'fa-times': 'X (formerly Twitter)',
    'fa-x-twitter': 'X (formerly Twitter)'
  };
  header.querySelectorAll('.socials a').forEach(link => {
    const icon = link.querySelector('i');
    if (!icon || link.hasAttribute('aria-label')) return;
    const match = Object.keys(iconNames).find(cls => icon.classList.contains(cls));
    if (match) link.setAttribute('aria-label', iconNames[match]);
    icon.setAttribute('aria-hidden', 'true');
  });

  /* ---------- Highlight the current page in the menu ---------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  nav.querySelectorAll('a[href]').forEach(link => {
    if ((link.getAttribute('href') || '').toLowerCase() === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Dropdown submenus ---------- */
  const submenuItems = [];
  if (navList) {
    Array.from(navList.children).forEach(li => {
      const link = li.querySelector(':scope > a');
      const submenu = li.querySelector(':scope > ul');
      if (!link || !submenu) return;
      submenuItems.push(li);
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', (e) => {
        e.preventDefault(); // these top-level links are href="#"
        const open = !li.classList.contains('open');
        closeSubmenus();
        setSubmenuOpen(li, open);
      });
    });
  }

  function setSubmenuOpen(li, open) {
    li.classList.toggle('open', open);
    li.querySelector(':scope > a').setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeSubmenus() {
    submenuItems.forEach(li => setSubmenuOpen(li, false));
  }

  // Close everything with Escape or by clicking outside the header
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSubmenus();
      if (header.classList.contains('nav-open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    }
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      closeSubmenus();
      setMenuOpen(false);
    }
  });

  // Reset the mobile menu when the window grows back to desktop size
  // (keep this number in sync with the header breakpoint in styles.css)
  const desktopQuery = window.matchMedia('(min-width: 1025px)');
  const onBreakpointChange = (e) => { if (e.matches) setMenuOpen(false); };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpointChange);
  else desktopQuery.addListener(onBreakpointChange);

  /* ---------- Pathway page "click to expand" dropdowns ---------- */
  // These use onclick on a <div>/<span>, which keyboards can't reach.
  // Make them focusable and operable with Enter / Space.
  document.querySelectorAll('.dropdown-header').forEach(headerEl => {
    const dropdown = headerEl.parentElement;
    headerEl.setAttribute('role', 'button');
    headerEl.setAttribute('tabindex', '0');
    headerEl.setAttribute('aria-expanded', dropdown.classList.contains('show') ? 'true' : 'false');
    headerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        headerEl.click();
      }
    });
    // Runs after the page's own onclick="toggleDropdown(this)"
    headerEl.addEventListener('click', () => {
      headerEl.setAttribute('aria-expanded', dropdown.classList.contains('show') ? 'true' : 'false');
    });
  });
})();
