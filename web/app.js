'use strict';

const DATA_URL = 'https://velvet0523.github.io/morning-brief/data/today.json';
const CHAT_REFRESH_URL = 'https://chatgpt.com/c/6a9c3a18-ce08-83ee-b207-0ab2e8886f30';
const app = document.getElementById('app');

const OFFICIAL_STOCK_ALIASES = new Set([
  '005930.KS', '삼성전자', 'MU', 'MICRON', '마이크론', 'NVDA', 'NVIDIA', '엔비디아',
  'GOOGL', 'GOOG', 'GOOGLE', '구글', 'ALPHABET', '알파벳',
  'MSFT', 'MICROSOFT', '마이크로소프트', '000660.KS', 'SK하이닉스',
]);
const storedStocks = JSON.parse(localStorage.getItem('morning-brief-stocks') || '[]');
const cleanedAddedStocks = storedStocks.filter(
  (stock) => !OFFICIAL_STOCK_ALIASES.has(String(stock.symbol || stock.name || '').trim().toUpperCase()),
);
localStorage.setItem('morning-brief-stocks', JSON.stringify(cleanedAddedStocks));

const state = {
  data: null,
  error: false,
  tab: 'NEWS',
  showSearch: false,
  expandedStocks: new Set(),
  addedStocks: cleanedAddedStocks,
  theme: localStorage.getItem('morning-brief-theme') === 'light' ? 'light' : 'dark',
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));

const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch { return '#'; }
};

const formatUpdatedAt = (value) => {
  if (!value) return '아직 갱신 기록 없음';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(value));
  } catch { return value; }
};

const calculateForwardPe = (valuation = {}) => {
  const price = Number(valuation.price);
  const forwardEps = Number(valuation.forwardEps);
  if (!Number.isFinite(price) || !Number.isFinite(forwardEps) || forwardEps <= 0) return '—';
  return `${(price / forwardEps).toFixed(2)}배`;
};

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#0b1220' : '#f3f6fa';
};

const storyCard = (story) => `
  <article class="card">
    <div class="card-top"><span class="tag">${escapeHtml(story.tag)}</span><span class="score">${escapeHtml(story.level)}${story.importanceScore ? ` · ${escapeHtml(story.importanceScore)}점` : ''}</span></div>
    <h3>${escapeHtml(story.title)}</h3>
    <p class="summary">${escapeHtml(story.summary)}</p>
    <p class="why">왜 중요한가 · ${escapeHtml(story.why)}</p>
    <a class="source" href="${safeUrl(story.source)}" target="_blank" rel="noopener noreferrer">원문 출처 열기&nbsp; ›</a>
  </article>`;

const renderNews = () => {
  const data = state.data;
  const stories = data?.stories || [];
  const macro = stories.filter((item) => item.category === 'MACRO');
  const industry = stories.filter((item) => item.category === 'INDUSTRY');
  const markets = data?.markets || [];
  return `
    <section class="hero">
      <div class="kicker">TODAY IN 3 LINES</div>
      <h2>${escapeHtml(data?.headline || '세계 경제와 주식시장의 핵심 흐름을 확인하세요.')}</h2>
      <p>AI가 중요도와 시장 영향을 분석한 브리핑입니다.</p>
    </section>
    <h2 class="section-title">핵심 뉴스 · 매크로</h2>
    ${macro.length ? macro.map(storyCard).join('') : '<div class="empty">선정 기준을 통과한 매크로 뉴스가 없습니다.</div>'}
    <h2 class="section-title">핵심 뉴스 · 산업</h2>
    ${industry.length ? industry.map(storyCard).join('') : '<div class="empty">선정 기준을 통과한 산업 뉴스가 없습니다.</div>'}
    <h2 class="section-title">시장 한눈에 보기</h2>
    <div class="metrics">${markets.map((item) => `<div class="metric"><div class="metric-label">${escapeHtml(item.label)}</div><div class="metric-value">${escapeHtml(item.value)}</div></div>`).join('')}</div>`;
};

const renderStock = () => {
  const fallback = [
    { symbol: '005930.KS', name: '삼성전자', change: '—', stance: '분석 예정', reason: '다음 종목 분석을 기다리고 있습니다.' },
    { symbol: 'MU', name: 'Micron', change: '—', stance: '분석 예정', reason: '다음 종목 분석을 기다리고 있습니다.' },
    { symbol: 'NVDA', name: 'NVIDIA', change: '—', stance: '분석 예정', reason: '다음 종목 분석을 기다리고 있습니다.' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', change: '—', stance: '분석 예정', reason: '다음 종목 분석을 기다리고 있습니다.' },
    { symbol: 'MSFT', name: 'Microsoft', change: '—', stance: '분석 예정', reason: '다음 종목 분석을 기다리고 있습니다.' },
  ];
  const officialStocks = state.data?.stocks || fallback;
  const officialSymbols = new Set(officialStocks.map((stock) => stock.symbol));
  const stocks = [...officialStocks, ...state.addedStocks.filter((stock) => !officialSymbols.has(stock.symbol))];
  return `
    ${state.showSearch ? '<form class="search-panel" id="stock-form"><input id="stock-input" aria-label="종목 티커" placeholder="티커 입력 (예: MU, 005930.KS)" autocomplete="off"><button type="submit">추가</button></form>' : ''}
    <section class="hero">
      <div class="kicker">TODAY'S STOCK IMPACT</div>
      <h2>오늘 뉴스가 관심 종목에 미친 영향을 확인하세요.</h2>
      <p>주가 변화의 원인을 호재·악재·수급성 움직임으로 구분합니다.</p>
    </section>
    <h2 class="section-title">관심 종목 분석</h2>
    ${stocks.map((stock) => `
      <article class="card stock-card">
        <button class="stock-toggle" type="button" data-stock-toggle="${escapeHtml(stock.symbol)}" aria-expanded="${state.expandedStocks.has(stock.symbol)}">
          <div class="stock-heading"><div class="stock-name">${escapeHtml(stock.name)}</div><div class="stock-change">${escapeHtml(stock.change)}</div></div>
          <div class="stock-meta"><span class="symbol">${escapeHtml(stock.symbol)} · ${escapeHtml(stock.stance)}</span><span class="stock-chevron">${state.expandedStocks.has(stock.symbol) ? '⌃' : '⌄'}</span></div>
          <div class="analysis-time">분석 기준 · ${escapeHtml(formatUpdatedAt(stock.analyzedAt || state.data?.updatedAt))}</div>
        </button>
        ${state.expandedStocks.has(stock.symbol) ? `<div class="valuation-panel">
          <div class="valuation-grid">
            <div class="valuation-item"><span>PER</span><strong>${escapeHtml(stock.valuation?.pe || '—')}</strong></div>
            <div class="valuation-item"><span>PBR</span><strong>${escapeHtml(stock.valuation?.pbr || '—')}</strong></div>
            <div class="valuation-item"><span>EPS</span><strong>${escapeHtml(stock.valuation?.eps || '—')}</strong></div>
            <div class="valuation-item"><span>12M Fwd PER</span><strong>${escapeHtml(calculateForwardPe(stock.valuation))}</strong></div>
          </div>
          <div class="valuation-basis">${escapeHtml(stock.valuation ? `${stock.valuation.basis} · ${stock.valuation.asOf}` : '다음 갱신에서 지표를 계산합니다.')}</div>
          <div class="valuation-basis">${calculateForwardPe(stock.valuation) !== '—' ? `12개월 선행 컨센서스 · 예상 EPS ${escapeHtml(stock.valuation.forwardEpsLabel)} · ${escapeHtml(stock.valuation.forwardAsOf)}` : '12개월 예상 EPS가 없어 선행 PER을 표시하지 않습니다.'}</div>
          ${stock.valuation?.forwardSource ? `<a class="valuation-source" href="${safeUrl(stock.valuation.forwardSource)}" target="_blank" rel="noopener noreferrer">Forward PER 출처 열기&nbsp; ›</a>` : ''}
        </div>` : ''}
        <p class="summary">${escapeHtml(stock.reason)}</p>
        <p class="why">관련 매크로·산업 뉴스, 기업 고유 이슈, 시장 수급을 구분해 판단합니다.</p>
      </article>`).join('')}`;
};

const renderFlow = () => {
  const flow = state.data?.flowAnalysis || { title: '핵심 뉴스의 연결고리를 분석 중입니다', overview: '다음 갱신부터 인과관계 분석이 표시됩니다.', links: [], watch: '확인된 사실과 추정 경로를 구분합니다.' };
  return `
    <section class="hero flow-hero">
      <div class="kicker">MARKET CAUSAL MAP</div>
      <h2>${escapeHtml(flow.title)}</h2>
      <p>${escapeHtml(flow.overview)}</p>
    </section>
    <h2 class="section-title">핵심 연결고리</h2>
    <section class="flow-card">
      ${(flow.links || []).slice(0, 3).map((link) => `<div class="flow-link"><div class="flow-path">${escapeHtml(link.cause)} &nbsp;→&nbsp; ${escapeHtml(link.effect)}</div><p class="flow-explanation">${escapeHtml(link.explanation)}</p></div>`).join('') || '<div class="empty">다음 뉴스 갱신부터 인과관계 분석이 표시됩니다.</div>'}
    </section>
    <section class="watch"><strong>앞으로 볼 변수</strong><p>${escapeHtml(flow.watch)}</p></section>
    <p class="caution">AI 해석이며, 확인된 사실과 추정 경로를 구분해 작성합니다.</p>
    <section class="theme-card">
      <div class="theme-title">화면 테마</div><div class="theme-hint">선택한 테마는 이 브라우저에 저장됩니다.</div>
      <div class="theme-toggle">
        <button class="theme-option ${state.theme === 'light' ? 'active' : ''}" data-theme-choice="light" type="button">☀ 일반</button>
        <button class="theme-option ${state.theme === 'dark' ? 'active' : ''}" data-theme-choice="dark" type="button">☾ 다크</button>
      </div>
    </section>`;
};

const render = () => {
  applyTheme();
  const title = { NEWS: '아침 브리핑', STOCK: '관심 종목', FLOW: '뉴스 흐름' }[state.tab];
  const updatedAt = state.tab === 'STOCK' ? state.data?.updatedAt : (state.data?.newsUpdatedAt || state.data?.updatedAt);
  document.querySelectorAll('.tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === state.tab));
  if (state.error && !state.data) {
    app.innerHTML = '<main class="shell"><div class="error">데이터를 불러오지 못했습니다.<br><button id="retry" type="button">다시 시도</button></div></main>';
    return;
  }
  app.innerHTML = `
    <main class="shell">
      <header>
        <div class="brand">MORNING BRIEF</div>
        <div class="title-row"><h1>${title}</h1>${state.tab === 'NEWS' ? '<button class="header-action" id="news-refresh" type="button">↻&nbsp; 뉴스 최신화</button>' : ''}${state.tab === 'STOCK' ? '<button class="header-action search-button" id="search-toggle" type="button" aria-label="종목 검색">⌕</button>' : ''}</div>
        <p class="date">${escapeHtml(state.data?.date || '오늘')} · 한국시간</p>
        <p class="updated">${state.tab === 'STOCK' ? '최근 데이터 반영' : '최근 AI 분석'} · ${escapeHtml(formatUpdatedAt(updatedAt))}</p>
      </header>
      ${state.tab === 'NEWS' ? renderNews() : state.tab === 'STOCK' ? renderStock() : renderFlow()}
      <p class="footer">데이터 기준 시각과 출처를 함께 표시합니다.</p>
    </main>`;
};

const loadData = async () => {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Data request failed');
    state.data = await response.json();
    state.error = false;
  } catch { state.error = true; }
  render();
};

document.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-tab]');
  if (tab) { state.tab = tab.dataset.tab; state.showSearch = false; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (event.target.closest('#news-refresh')) { window.open(CHAT_REFRESH_URL, '_blank', 'noopener,noreferrer'); return; }
  if (event.target.closest('#search-toggle')) { state.showSearch = !state.showSearch; render(); document.getElementById('stock-input')?.focus(); return; }
  const stockToggle = event.target.closest('[data-stock-toggle]');
  if (stockToggle) {
    const symbol = stockToggle.dataset.stockToggle;
    if (state.expandedStocks.has(symbol)) state.expandedStocks.delete(symbol);
    else state.expandedStocks.add(symbol);
    render();
    return;
  }
  if (event.target.closest('#retry')) { loadData(); return; }
  const theme = event.target.closest('[data-theme-choice]');
  if (theme) { state.theme = theme.dataset.themeChoice; localStorage.setItem('morning-brief-theme', state.theme); render(); }
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'stock-form') return;
  event.preventDefault();
  const input = document.getElementById('stock-input');
  const symbol = input.value.trim().toUpperCase();
  const existing = [...(state.data?.stocks || []), ...state.addedStocks].some((stock) => stock.symbol === symbol);
  if (!symbol || existing) return;
  state.addedStocks.push({ symbol, name: symbol, change: '—', stance: '분석 예정', reason: '추가한 관심 종목입니다. 다음 브리핑부터 관련 뉴스와 주가 영향을 분석합니다.' });
  localStorage.setItem('morning-brief-stocks', JSON.stringify(state.addedStocks));
  state.showSearch = false;
  render();
});

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') loadData(); });
applyTheme();
render();
loadData();
