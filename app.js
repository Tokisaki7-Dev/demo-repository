const exchangeRate = 5.05;
const state = {
  products: [],
  filtered: [],
  alerts: JSON.parse(localStorage.getItem('promoradar_alerts') || '[]'),
  watchlist: JSON.parse(localStorage.getItem('promoradar_watchlist') || '[]'),
  theme: localStorage.getItem('promoradar_theme') || 'dark',
  autoRefreshId: null,
};

const el = {
  queryInput: document.getElementById('queryInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  sourceFilter: document.getElementById('sourceFilter'),
  maxPriceInput: document.getElementById('maxPriceInput'),
  minDiscountInput: document.getElementById('minDiscountInput'),
  sortBy: document.getElementById('sortBy'),
  productsGrid: document.getElementById('productsGrid'),
  applyBtn: document.getElementById('applyBtn'),
  clearBtn: document.getElementById('clearBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  stats: document.getElementById('stats'),
  discountChart: document.getElementById('discountChart'),
  lastUpdated: document.getElementById('lastUpdated'),
  alertForm: document.getElementById('alertForm'),
  alertKeyword: document.getElementById('alertKeyword'),
  alertTargetPrice: document.getElementById('alertTargetPrice'),
  alertsList: document.getElementById('alertsList'),
  watchlist: document.getElementById('watchlist'),
  autoRefreshToggle: document.getElementById('autoRefreshToggle'),
  themeBtn: document.getElementById('themeBtn'),
  productCardTemplate: document.getElementById('productCardTemplate'),
};

const curatedCatalog = [
  {
    id: 'curated-1',
    title: 'Teclado Mecânico RGB TKL',
    priceBRL: 249.9,
    originalPriceBRL: 399.9,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    category: 'gaming',
    source: 'curated',
    rating: 4.8,
    buyLink: 'https://www.kabum.com.br/',
    description: 'Switch red silencioso, anti-ghosting e iluminação RGB por tecla.',
  },
  {
    id: 'curated-2',
    title: 'Mouse Gamer Wireless 26000 DPI',
    priceBRL: 189.9,
    originalPriceBRL: 319.9,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80',
    category: 'gaming',
    source: 'curated',
    rating: 4.6,
    buyLink: 'https://www.amazon.com.br/',
    description: 'Sensor óptico de alta precisão, bateria para 70 horas e cabo paracord.',
  },
  {
    id: 'curated-3',
    title: 'SSD NVMe 1TB PCIe 4.0',
    priceBRL: 379.9,
    originalPriceBRL: 569.9,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
    category: 'hardware',
    source: 'curated',
    rating: 4.9,
    buyLink: 'https://www.pichau.com.br/',
    description: 'Leitura de até 7.000MB/s com dissipador incluso.',
  },
];

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function toStars(rating) {
  const full = Math.round(rating);
  return `${'★'.repeat(full)}${'☆'.repeat(5 - full)} ${rating.toFixed(1)}`;
}

function calcDiscount(current, original) {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

function clipText(text, max = 135) {
  if (!text) return 'Sem descrição disponível.';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function updateTheme() {
  document.body.classList.toggle('light', state.theme === 'light');
  localStorage.setItem('promoradar_theme', state.theme);
}

async function fetchFakeStoreProducts() {
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) throw new Error('Falha ao carregar FakeStore');
  const data = await response.json();

  return data.map((item) => {
    const priceBRL = item.price * exchangeRate;
    const discount = 8 + Math.floor(Math.random() * 35);
    const originalPriceBRL = priceBRL / (1 - discount / 100);
    return {
      id: `fake-${item.id}`,
      title: item.title,
      priceBRL,
      originalPriceBRL,
      image: item.image,
      category: item.category,
      source: 'fakestore',
      rating: item.rating?.rate || 4,
      buyLink: `https://fakestoreapi.com/products/${item.id}`,
      description: item.description,
    };
  });
}

async function fetchDummyJsonProducts() {
  const response = await fetch('https://dummyjson.com/products?limit=60');
  if (!response.ok) throw new Error('Falha ao carregar DummyJSON');
  const data = await response.json();

  return (data.products || []).map((item) => {
    const priceBRL = item.price * exchangeRate;
    const originalPriceBRL = item.price / (1 - item.discountPercentage / 100) * exchangeRate;
    return {
      id: `dummy-${item.id}`,
      title: item.title,
      priceBRL,
      originalPriceBRL,
      image: item.thumbnail,
      category: item.category,
      source: 'dummyjson',
      rating: item.rating || 4,
      buyLink: `https://dummyjson.com/products/${item.id}`,
      description: item.description,
    };
  });
}

function uniqueCategories(list) {
  return [...new Set(list.map((item) => item.category).filter(Boolean))].sort();
}

function fillCategoryFilter() {
  const categories = uniqueCategories(state.products);
  el.categoryFilter.innerHTML = '<option value="">Todas</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    el.categoryFilter.appendChild(option);
  });
}

function renderProducts() {
  el.productsGrid.innerHTML = '';
  if (!state.filtered.length) {
    el.productsGrid.innerHTML = '<p class="muted">Nenhuma promoção encontrada para os filtros selecionados.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  state.filtered.forEach((product) => {
    const card = el.productCardTemplate.content.cloneNode(true);
    const discount = calcDiscount(product.priceBRL, product.originalPriceBRL);

    card.querySelector('.product-image').src = product.image;
    card.querySelector('.product-title').textContent = product.title;
    card.querySelector('.source-tag').textContent = product.source;
    card.querySelector('.product-category').textContent = `Categoria: ${product.category}`;
    card.querySelector('.product-description').textContent = clipText(product.description);
    card.querySelector('.old-price').textContent = `De ${brl.format(product.originalPriceBRL)}`;
    card.querySelector('.current-price').textContent = brl.format(product.priceBRL);
    card.querySelector('.discount').textContent = `-${discount}% OFF`;
    card.querySelector('.rating-row').textContent = toStars(product.rating);

    const buyLink = card.querySelector('.buy-link');
    buyLink.href = product.buyLink;

    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => toggleWatchlist(product.id));

    fragment.appendChild(card);
  });

  el.productsGrid.appendChild(fragment);
}

function sortProducts(list) {
  const mode = el.sortBy.value;
  if (mode === 'price-asc') return list.sort((a, b) => a.priceBRL - b.priceBRL);
  if (mode === 'price-desc') return list.sort((a, b) => b.priceBRL - a.priceBRL);
  if (mode === 'rating') return list.sort((a, b) => b.rating - a.rating);
  return list.sort((a, b) => calcDiscount(b.priceBRL, b.originalPriceBRL) - calcDiscount(a.priceBRL, a.originalPriceBRL));
}

function applyFilters() {
  const term = el.queryInput.value.toLowerCase().trim();
  const category = el.categoryFilter.value;
  const source = el.sourceFilter.value;
  const maxPrice = Number(el.maxPriceInput.value || Infinity);
  const minDiscount = Number(el.minDiscountInput.value || 0);

  const filtered = state.products.filter((product) => {
    const textMatch = product.title.toLowerCase().includes(term) || product.description.toLowerCase().includes(term);
    const categoryMatch = category ? product.category === category : true;
    const sourceMatch = source ? product.source === source : true;
    const priceMatch = product.priceBRL <= maxPrice;
    const discountMatch = calcDiscount(product.priceBRL, product.originalPriceBRL) >= minDiscount;
    return textMatch && categoryMatch && sourceMatch && priceMatch && discountMatch;
  });

  state.filtered = sortProducts(filtered);
  renderProducts();
  renderStats();
  renderChart();
  checkAlerts();
}

function renderStats() {
  const list = state.filtered;
  const avg = list.length ? list.reduce((sum, p) => sum + p.priceBRL, 0) / list.length : 0;
  const avgDiscount = list.length
    ? list.reduce((sum, p) => sum + calcDiscount(p.priceBRL, p.originalPriceBRL), 0) / list.length
    : 0;

  const best = list[0];
  el.stats.innerHTML = [
    { label: 'Ofertas', value: list.length },
    { label: 'Preço médio', value: brl.format(avg || 0) },
    { label: 'Desconto médio', value: `${avgDiscount.toFixed(1)}%` },
    { label: 'Melhor oferta', value: best ? `${calcDiscount(best.priceBRL, best.originalPriceBRL)}%` : '-' },
  ]
    .map(
      (item) =>
        `<div class="stat-card"><span class="muted">${item.label}</span><strong>${item.value}</strong></div>`,
    )
    .join('');
}

function renderChart() {
  const ctx = el.discountChart.getContext('2d');
  const w = el.discountChart.width;
  const h = el.discountChart.height;
  ctx.clearRect(0, 0, w, h);

  const data = state.filtered.slice(0, 18).map((product) => calcDiscount(product.priceBRL, product.originalPriceBRL));
  if (!data.length) return;

  const max = Math.max(...data, 10);
  const barWidth = w / data.length;

  data.forEach((value, index) => {
    const x = index * barWidth + 4;
    const barH = (value / max) * (h - 24);
    const y = h - barH - 6;

    ctx.fillStyle = '#2b7fff';
    ctx.fillRect(x, y, barWidth - 8, barH);

    ctx.fillStyle = '#93b7ff';
    ctx.font = '12px Inter';
    ctx.fillText(`${value}%`, x, y - 4);
  });
}

function renderAlerts() {
  el.alertsList.innerHTML = '';
  if (!state.alerts.length) {
    el.alertsList.innerHTML = '<li class="muted">Nenhum alerta configurado.</li>';
    return;
  }

  state.alerts.forEach((alert, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <span>${alert.keyword} até ${brl.format(alert.targetPrice)}</span>
      <button class="btn btn-secondary" type="button" data-remove-alert="${index}">Remover</button>
    `;
    el.alertsList.appendChild(li);
  });
}

function renderWatchlist() {
  el.watchlist.innerHTML = '';
  if (!state.watchlist.length) {
    el.watchlist.innerHTML = '<li class="muted">Adicione produtos para acompanhar quedas de preço.</li>';
    return;
  }

  state.watchlist.forEach((id) => {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;

    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <span>${product.title} • ${brl.format(product.priceBRL)}</span>
      <button class="btn btn-secondary" type="button" data-remove-watch="${id}">Remover</button>
    `;
    el.watchlist.appendChild(li);
  });
}

function persistState() {
  localStorage.setItem('promoradar_alerts', JSON.stringify(state.alerts));
  localStorage.setItem('promoradar_watchlist', JSON.stringify(state.watchlist));
}

function toggleWatchlist(productId) {
  const exists = state.watchlist.includes(productId);
  state.watchlist = exists ? state.watchlist.filter((id) => id !== productId) : [...state.watchlist, productId];
  persistState();
  renderWatchlist();
}

function checkAlerts() {
  if (!state.alerts.length || !('Notification' in window)) return;

  state.alerts.forEach((alert) => {
    const found = state.filtered.find(
      (product) => product.priceBRL <= alert.targetPrice && product.title.toLowerCase().includes(alert.keyword.toLowerCase()),
    );

    if (found && Notification.permission === 'granted') {
      new Notification('Promoção encontrada!', {
        body: `${found.title} por ${brl.format(found.priceBRL)} (${found.source})`,
      });
    }
  });
}

async function refreshData() {
  el.lastUpdated.textContent = 'Atualizando fontes...';

  const requests = [fetchFakeStoreProducts(), fetchDummyJsonProducts()];
  const results = await Promise.allSettled(requests);

  const merged = [...curatedCatalog];
  results.forEach((res) => {
    if (res.status === 'fulfilled') merged.push(...res.value);
  });

  state.products = merged;
  fillCategoryFilter();
  applyFilters();

  el.lastUpdated.textContent = `Atualizado em ${new Date().toLocaleString('pt-BR')} • ${state.products.length} produtos agregados`;
}

function setupEvents() {
  el.applyBtn.addEventListener('click', applyFilters);
  el.clearBtn.addEventListener('click', () => {
    el.queryInput.value = '';
    el.categoryFilter.value = '';
    el.sourceFilter.value = '';
    el.maxPriceInput.value = '';
    el.minDiscountInput.value = '10';
    el.sortBy.value = 'discount';
    applyFilters();
  });

  el.refreshBtn.addEventListener('click', refreshData);

  el.alertForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.alerts.push({
      keyword: el.alertKeyword.value.trim(),
      targetPrice: Number(el.alertTargetPrice.value),
    });
    persistState();
    renderAlerts();
    el.alertForm.reset();
  });

  el.alertsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-alert]');
    if (!button) return;
    const index = Number(button.dataset.removeAlert);
    state.alerts.splice(index, 1);
    persistState();
    renderAlerts();
  });

  el.watchlist.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-watch]');
    if (!button) return;
    state.watchlist = state.watchlist.filter((id) => id !== button.dataset.removeWatch);
    persistState();
    renderWatchlist();
  });

  el.autoRefreshToggle.addEventListener('change', (event) => {
    if (event.target.checked) {
      state.autoRefreshId = setInterval(refreshData, 300000);
      return;
    }

    clearInterval(state.autoRefreshId);
  });

  el.themeBtn.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    updateTheme();
  });
}

async function init() {
  updateTheme();
  setupEvents();
  renderAlerts();
  renderWatchlist();

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  await refreshData();
}

init();
