const header = document.getElementById('siteHeader');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const searchToggle = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('.search-panel');
const searchClose = document.querySelector('.search-close');
const searchInput = document.getElementById('siteSearch');
const searchResults = document.querySelector('.search-results');
const backToTop = document.querySelector('.back-to-top');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const faqItems = [...document.querySelectorAll('.faq-item')];

document.getElementById('year').textContent = new Date().getFullYear();

const catalog = Array.isArray(window.productCatalog) ? window.productCatalog : [];
const productGrid = document.getElementById('productGrid');
const productCount = document.getElementById('productCount');
const loadMoreProducts = document.getElementById('loadMoreProducts');
const showAllProducts = document.getElementById('showAllProducts');
let visibleProductCount = Math.min(12, catalog.length);

const escapeHTML = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderProducts = () => {
  const visibleProducts = catalog.slice(0, visibleProductCount);
  const renderedProductCount = productGrid.children.length;
  if (renderedProductCount > visibleProducts.length) productGrid.innerHTML = '';
  const startIndex = productGrid.children.length;
  const newProducts = visibleProducts.slice(startIndex);
  productGrid.insertAdjacentHTML('beforeend', newProducts.map((product, offset) => {
    const index = startIndex + offset;
    const name = escapeHTML(product.name);
    const image = escapeHTML(product.image);
    const fallbackClass = product.image === 'img/logo.webp' ? ' class="catalog-fallback"' : '';
    return `
      <article class="product-card" data-product-id="${product.id}" style="animation-delay:${(index % 4) * 45}ms">
        <a class="product-image" href="#contact" aria-label="Request ${name}">
          <img src="${image}" alt="${name}" width="800" height="800" loading="lazy" decoding="async" fetchpriority="low"${fallbackClass}>
        </a>
        <h3>${name}</h3>
        <a class="round-link" href="#contact" aria-label="Request ${name}"><i class="ri-arrow-right-line" aria-hidden="true"></i></a>
      </article>`;
  }).join(''));

  productCount.textContent = `Showing ${visibleProducts.length} of ${catalog.length} products`;
  loadMoreProducts.hidden = visibleProducts.length >= catalog.length;
};

loadMoreProducts.addEventListener('click', () => {
  const firstNewProductIndex = visibleProductCount;
  visibleProductCount = Math.min(visibleProductCount + 12, catalog.length);
  renderProducts();
  if (window.matchMedia('(max-width: 540px)').matches) {
    requestAnimationFrame(() => {
      const firstNewProduct = productGrid.children[firstNewProductIndex];
      if (firstNewProduct) {
        productGrid.scrollTo({
          left: firstNewProduct.offsetLeft - productGrid.offsetLeft,
          behavior: 'smooth'
        });
      }
    });
  }
});

showAllProducts.addEventListener('click', () => {
  visibleProductCount = catalog.length;
  renderProducts();
  productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

renderProducts();

faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const setMenu = (open) => {
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
};

menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

const setSearch = (open) => {
  searchPanel.classList.toggle('open', open);
  searchPanel.setAttribute('aria-hidden', String(!open));
  searchToggle?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('search-open', open);
  if (open) setTimeout(() => searchInput.focus(), 250);
};

searchToggle?.addEventListener('click', () => setSearch(true));
searchClose.addEventListener('click', () => setSearch(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setSearch(false);
    setMenu(false);
  }
});

const products = catalog.map((product) => ({
  id: product.id,
  name: product.name,
  terms: product.name.toLowerCase()
}));

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    searchResults.textContent = 'Try "patchouli", "clove", or "citronella".';
    return;
  }
  const matches = products.filter((product) => product.terms.includes(query)).slice(0, 12);
  searchResults.innerHTML = matches.length
    ? matches.map((product) => `<a href="#products" data-search-result="${product.id}">${escapeHTML(product.name)} <i class="ri-arrow-right-line" aria-hidden="true"></i></a>`).join('')
    : `No oils found for "${escapeHTML(query)}". Contact us for a custom request.`;
  searchResults.querySelectorAll('[data-search-result]').forEach((link) => link.addEventListener('click', () => {
    const productId = Number(link.dataset.searchResult);
    visibleProductCount = Math.max(visibleProductCount, productId);
    renderProducts();
    setSearch(false);
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-product-id="${productId}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.classList.add('search-highlight');
      setTimeout(() => target?.classList.remove('search-highlight'), 1600);
    });
  }));
});

const handleScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-sticky', y > 72);
  backToTop.classList.toggle('visible', y > 650);

  let activeId = 'home';
  sections.forEach((section) => {
    if (y >= section.offsetTop - 160) activeId = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 5) * 55, 220)}ms`;
  observer.observe(element);
});

searchResults.textContent = 'Try "patchouli", "clove", or "citronella".';
