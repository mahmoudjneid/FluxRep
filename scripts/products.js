(() => {
  const products = window.FLURENTZA_PRODUCTS || {};
  const productList = Object.values(products);
  const solutionData = {
    'electric-drive-systems': { title: 'Electric Drive Systems', image: 'assets/Section 02-Solutions/01_Electric Drive System.png', description: 'High-performance electric drive architectures engineered for efficiency, response and complete system integration.' },
    'energy-systems': { title: 'Energy Systems', image: 'assets/Section 02-Solutions/02_Energy Systems.png', description: 'Energy architectures engineered for high-density storage, efficient conversion and resilient system operation.' },
    'intelligent-control': { title: 'Intelligent Control & Energy Management', image: 'assets/Section 02-Solutions/03_Intelligent Control & Energy Management.png', description: 'Control and energy-management systems that coordinate complex power flows for predictable, optimized system performance.' },
    'advanced-materials': { title: 'Advanced Materials & Circularity', image: 'assets/Section 02-Solutions/04_Advanced Materials & Circularity.png', description: 'Advanced material strategies that improve performance, resource efficiency and the useful life of engineered systems.' },
    'multi-physics': { title: 'Multi-Physics & System Optimization', image: 'assets/Section 02-Solutions/05_Multi-Physics & System Optimization.png', description: 'Connected simulation and validation across the physical behaviors that determine system performance.' },
    'integrated-engineering': { title: 'Integrated Engineering Systems', image: 'assets/Section 02-Solutions/06_Multi-Physics & System Optimization.png', description: 'Integrated engineering from system architecture through validated prototypes, connecting technologies into complete working systems.' }
  };
  const currentSlug = new URLSearchParams(window.location.search).get('product');
  const detailRoot = document.querySelector('[data-product-detail]');
  const overviewRoot = document.querySelector('[data-products-overview]');
  const contextRoot = document.querySelector('[data-product-context]');

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const placeholder = (ariaLabel, visibleText = 'Engineering visual', note = 'Image to be supplied') => `<div class="product-image-slot" role="img" aria-label="${escapeHtml(ariaLabel)}"><span>${escapeHtml(visibleText)}</span><small>${escapeHtml(note)}</small></div>`;
  const imageSlot = (src, label, visibleText, note, eager = false) => src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(label)}"${eager ? ' decoding="async"' : ' loading="lazy" decoding="async"'}>` : placeholder(label, visibleText, note);
  const productUrl = (slug) => `product.html?product=${encodeURIComponent(slug)}`;
  const solutionUrl = (slug) => `solution.html?solution=${encodeURIComponent(slug)}`;

  const reveal = (root, selector = '.product-reveal:not(.is-visible)') => {
    const elements = [...root.querySelectorAll(selector)];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    // deferred to the next frame so observer setup never competes with the first scroll input
    window.requestAnimationFrame(() => {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      elements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 90, 450)}ms`;
        observer.observe(element);
      });
    });
  };

  const productCard = (product) => `<a class="product-card product-reveal" href="${productUrl(product.slug)}"><div class="product-card__visual">${imageSlot(product.mainImage, `${product.name} main product image`)}</div><div class="product-card__body"><p class="products-eyebrow">${escapeHtml(product.category)} <span>/</span> ${escapeHtml(product.status)}</p><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.shortDescription)}</p><span class="product-link">View platform <span aria-hidden="true">&rarr;</span></span></div></a>`;

  if (overviewRoot) {
    overviewRoot.innerHTML = productList.map(productCard).join('');
    reveal(overviewRoot);
  }

  if (!detailRoot) {
    return;
  }

  const product = products[currentSlug] || productList[0];
  if (!product) {
    detailRoot.innerHTML = '<p class="product-empty">No product record is available.</p>';
    return;
  }

  if (contextRoot) {
    contextRoot.innerHTML = `<a href="products.html">Products</a><span aria-hidden="true">/</span><strong aria-current="page">${escapeHtml(product.name)}</strong>`;
  }

  const architecture = product.characteristics.map((item) => `<div class="product-architecture__node"><span>${escapeHtml(item)}</span></div>`).join('');
  const outcomes = product.applications.map((item) => `<div class="product-outcome"><p>${escapeHtml(item)}</p></div>`).join('');
  const galleryCaptions = ['Platform integration view', 'System interface detail', 'Validation environment'];
  const gallery = (product.galleryImages.length ? product.galleryImages : [null, null, null]).map((image, index) => {
    const caption = image ? 'Supporting engineering view' : `${galleryCaptions[index] || 'Engineering visual'} — to be supplied`;
    return `<figure class="product-gallery__item">${imageSlot(image, `${product.name} — ${galleryCaptions[index] || 'supporting view'}`, galleryCaptions[index] || 'Engineering visual')}<figcaption>${caption}</figcaption></figure>`;
  }).join('');

  const relatedSolutions = product.relatedSolutions.map((slug) => {
    const item = solutionData[slug];
    if (!item) {
      return '';
    }
    return `<a class="product-related__link" href="${solutionUrl(slug)}"><span class="product-related__image"><img src="${item.image}" alt="${escapeHtml(item.title)} engineering perspective" loading="lazy" decoding="async"></span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><span class="product-related__cta">Explore solution <span aria-hidden="true">&rarr;</span></span></a>`;
  }).join('');

  const otherProducts = productList.filter((item) => item.slug !== product.slug);
  const relatedProductCard = (item) => `<a class="product-related__link" href="${productUrl(item.slug)}"><span class="product-related__image">${imageSlot(item.mainImage, `${item.name} main product image`)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.shortDescription)}</p><span class="product-related__cta">View platform <span aria-hidden="true">&rarr;</span></span></a>`;
  const relatedProductsMarkup = otherProducts.map(relatedProductCard).join('');

  detailRoot.innerHTML = `
  <section class="product-detail-hero">
    <div class="product-detail-hero__visual">${imageSlot(product.mainImage, `${product.name} main product image`, undefined, undefined, true)}</div>
    <div class="product-detail-hero__copy product-reveal is-visible">
      <p class="products-eyebrow">${escapeHtml(product.category)} <span>/</span> ${escapeHtml(product.status)}</p>
      <h1>${escapeHtml(product.name)}</h1>
      <p>${escapeHtml(product.shortDescription)}</p>
    </div>
  </section>
  <section class="product-detail-section product-reveal">
    <p class="product-detail-section__eyebrow">Product overview</p>
    <h2>Platforms for engineering work that moves toward validation.</h2>
    <div class="product-detail-overview"><p>${escapeHtml(product.fullDescription)}</p><p>Intended context: ${escapeHtml(product.applications.join(', '))}.</p></div>
  </section>
  <section class="product-detail-section product-detail-section--pale product-reveal">
    <div class="product-detail-section__inner">
      <p class="product-detail-section__eyebrow">Key characteristics</p>
      <h2>Engineering depth where it matters.</h2>
      <div class="product-architecture">${architecture}</div>
    </div>
  </section>
  <section class="product-detail-section product-reveal">
    <p class="product-detail-section__eyebrow">Product gallery</p>
    <h2>Supporting views of the engineering story.</h2>
    <div class="product-gallery">${gallery}</div>
  </section>
  <section class="product-detail-section product-detail-section--pale product-reveal">
    <div class="product-detail-section__inner">
      <p class="product-detail-section__eyebrow">Applications / use cases</p>
      <h2>Where the platform belongs.</h2>
      <div class="product-outcomes">${outcomes}</div>
    </div>
  </section>
  <section class="product-detail-section product-reveal">
    <p class="product-detail-section__eyebrow">Related solutions</p>
    <h2>Connect the platform to the engineering problem.</h2>
    <div class="product-related-grid">${relatedSolutions}</div>
  </section>
  <section class="product-detail-section product-detail-section--pale product-reveal">
    <div class="product-detail-section__inner product-related__header">
      <div><p class="product-detail-section__eyebrow">Related products</p><h2>Continue through the platform collection.</h2></div>
      <div class="product-carousel__controls"><button class="product-carousel__button" type="button" data-product-carousel-prev aria-label="Previous related products">&larr;</button><button class="product-carousel__button" type="button" data-product-carousel-next aria-label="Next related products">&rarr;</button></div>
    </div>
    <div class="product-detail-section__inner product-carousel"><div class="product-carousel__track" data-product-related-track>${relatedProductsMarkup}</div></div>
  </section>
  <section class="product-detail-cta product-reveal">
    <h2>Explore what we can engineer together.</h2>
    <a class="product-detail-cta__link" href="index.html#main-content">Contact FLURENTZA <span aria-hidden="true">&rarr;</span></a>
  </section>
  `;

  document.title = `${product.name} | FLURENTZA`;
  reveal(detailRoot);

  const relatedTrack = detailRoot.querySelector('[data-product-related-track]');
  const previousRelated = detailRoot.querySelector('[data-product-carousel-prev]');
  const nextRelated = detailRoot.querySelector('[data-product-carousel-next]');
  const relatedSourceMarkup = relatedTrack?.innerHTML || '';
  let relatedStep = 0;
  let relatedAnimating = false;
  let relatedDirection = 0;

  const measureRelatedStep = () => {
    if (!relatedTrack) {
      return;
    }

    const item = relatedTrack.querySelector('.product-related__link');
    const gap = Number.parseFloat(getComputedStyle(relatedTrack).gap) || 0;
    relatedStep = (item?.getBoundingClientRect().width || 0) + gap;
  };

  const buildRelatedCarousel = () => {
    if (!relatedTrack) {
      return;
    }

    relatedTrack.innerHTML = relatedSourceMarkup;
    relatedAnimating = false;
    relatedDirection = 0;
    relatedTrack.style.transition = 'none';
    measureRelatedStep();
    relatedTrack.style.transform = 'translateX(0)';
    relatedTrack.offsetWidth;
    relatedTrack.style.transition = '';
  };

  const moveRelatedCarousel = (direction) => {
    if (!relatedTrack || relatedAnimating || relatedTrack.childElementCount < 2) {
      return;
    }

    relatedAnimating = true;
    relatedDirection = direction;
    measureRelatedStep();

    if (direction > 0) {
      relatedTrack.style.transition = '';
      relatedTrack.style.transform = `translateX(-${relatedStep}px)`;
      return;
    }

    relatedTrack.style.transition = 'none';
    relatedTrack.prepend(relatedTrack.lastElementChild);
    measureRelatedStep();
    relatedTrack.style.transform = `translateX(-${relatedStep}px)`;
    relatedTrack.offsetWidth;
    relatedTrack.style.transition = '';
    relatedTrack.style.transform = 'translateX(0)';
  };

  previousRelated?.addEventListener('click', () => moveRelatedCarousel(-1));
  nextRelated?.addEventListener('click', () => moveRelatedCarousel(1));
  relatedTrack?.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') {
      return;
    }

    if (relatedDirection > 0) {
      relatedTrack.style.transition = 'none';
      relatedTrack.append(relatedTrack.firstElementChild);
      measureRelatedStep();
      relatedTrack.style.transform = 'translateX(0)';
      relatedTrack.offsetWidth;
      relatedTrack.style.transition = '';
    }

    relatedDirection = 0;
    relatedAnimating = false;
  });

  // deferred so the initial forced-reflow measurement doesn't compete with the first scroll input
  window.requestAnimationFrame(buildRelatedCarousel);
  window.addEventListener('resize', buildRelatedCarousel);
})();