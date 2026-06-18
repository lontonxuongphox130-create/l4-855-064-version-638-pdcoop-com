(() => {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    const activate = (next) => {
      slides[index]?.classList.remove('is-active');
      dots[index]?.classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index]?.classList.add('is-active');
      dots[index]?.classList.add('is-active');
    };
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => activate(dotIndex));
    });
    if (slides.length > 1) {
      window.setInterval(() => activate(index + 1), 5200);
    }
  }

  const panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach((panel) => {
    const grid = document.querySelector('[data-filterable-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    const keyword = panel.querySelector('[data-local-search]');
    const region = panel.querySelector('[data-local-region]');
    const year = panel.querySelector('[data-local-year]');
    const genre = panel.querySelector('[data-local-genre]');
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const queryInput = panel.querySelector('[data-query-input]');
    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }
    const filter = () => {
      const q = (keyword?.value || '').trim().toLowerCase();
      const r = region?.value || '';
      const y = year?.value || '';
      const g = genre?.value || '';
      let visible = 0;
      cards.forEach((card) => {
        const title = (card.dataset.title || '').toLowerCase();
        const dataRegion = card.dataset.region || '';
        const dataYear = card.dataset.year || '';
        const dataGenre = card.dataset.genre || '';
        const haystack = `${title} ${dataRegion} ${dataYear} ${dataGenre}`.toLowerCase();
        const ok = (!q || haystack.includes(q)) && (!r || dataRegion === r) && (!y || dataYear === y) && (!g || dataGenre.includes(g));
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    };
    [keyword, region, year, genre].forEach((control) => {
      if (control) control.addEventListener('input', filter);
      if (control) control.addEventListener('change', filter);
    });
    filter();
  });
})();
