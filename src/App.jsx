import { useEffect, useState, useRef } from 'react';
import './index.css';

// Shared bookmark store — populated by useEffect after bookmarks load
const bmCollStore = { byCollection: {}, all: [] };

// ── Collections page data ──────────────────────────────────────────────────
const COLL_PAGE_DATA = [
  { name: 'Biology Notes',    icon: '/icons/bookmark-icons/Graduatecap2.png', modified: 'Jun 3, 2026',  count: 4 },
  { name: 'Recipes',          icon: '/icons/bookmark-icons/Popcorn.png',      modified: 'May 20, 2026', count: 2 },
  { name: 'Travel',           icon: '/icons/bookmark-icons/Airplane.png',     modified: 'May 22, 2026', count: 1 },
  { name: 'Writing Projects', icon: '/icons/bookmark-icons/Pencil2.png',      modified: 'Apr 15, 2026', count: 3 },
  { name: 'Entertainment',    icon: '/icons/bookmark-icons/Popsicle1.png',    modified: 'Mar 8, 2026',  count: 5 },
  { name: 'Design & UX',      icon: '/icons/bookmark-icons/ColorPalette.png', modified: 'Jul 4, 2026',  count: 4 },
  { name: 'AI Research',      icon: '/icons/bookmark-icons/Brain1.png',       modified: 'Jul 2, 2026',  count: 3 },
];

const COLL_BOOKMARKS = {
  'Biology Notes': [
    { title: 'Photosynthesis explained', preview: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose.', date: 'Jun 3, 2026' },
    { title: 'Cell division overview', preview: 'Mitosis and meiosis are the two types of cell division. Mitosis produces two identical daughter cells while meiosis produces four genetically diverse cells.', date: 'May 28, 2026' },
    { title: 'DNA replication process', preview: 'DNA replication is a biological process by which one double-stranded DNA molecule is copied to produce two identical replicas.', date: 'May 21, 2026' },
    { title: 'Protein synthesis steps', preview: 'The central dogma of molecular biology describes the flow of genetic information within a biological system — from DNA to RNA to protein.', date: 'Apr 10, 2026' },
  ],
  'Recipes': [
    { title: 'Pasta carbonara recipe', preview: 'Classic Roman pasta carbonara made with eggs, Pecorino Romano, guanciale, and black pepper. No cream needed — the egg emulsification does the work.', date: 'May 20, 2026' },
    { title: 'Sourdough bread tips', preview: 'Maintaining a healthy starter is the foundation of great sourdough. Feed it regularly, watch the hydration, and give it time to develop flavor.', date: 'May 5, 2026' },
  ],
  'Travel': [
    { title: 'Japan travel itinerary', preview: 'Tokyo to Kyoto in 10 days — the best temples, street food, and hidden neighborhoods. Includes day trips to Nara, Osaka, and Hakone.', date: 'May 22, 2026' },
  ],
  'Writing Projects': [
    { title: 'Opening paragraph techniques', preview: 'The best opening paragraphs create immediate tension, establish voice, and give readers a reason to stay. Study the first lines of your favorite books.', date: 'Apr 15, 2026' },
    { title: 'Character development notes', preview: 'Characters need wants, needs, and a wound that shapes how they see the world. The conflict between what they want and what they need drives the story.', date: 'Apr 8, 2026' },
    { title: 'Plot structure overview', preview: 'The three-act structure: setup, confrontation, resolution. Within each act, identify the turning points that shift the direction of the story.', date: 'Mar 30, 2026' },
  ],
  'Entertainment': [
    { title: 'Best shows of 2026', preview: 'A curated list of the most talked-about TV series this year — spanning drama, dark comedy, and documentary.', date: 'Mar 8, 2026' },
    { title: 'Film score recommendations', preview: 'These film scores work as standalone listening: Ennio Morricone, Hans Zimmer, Jonny Greenwood, and Mica Levi.', date: 'Feb 22, 2026' },
    { title: 'Podcast list', preview: 'Long-form interview podcasts for deep dives: Lex Fridman, 80,000 Hours, Huberman Lab, and Conan O\'Brien Needs a Friend.', date: 'Feb 10, 2026' },
    { title: 'Book recommendations', preview: 'Fiction and nonfiction picks for 2026 — from narrative nonfiction to literary fiction and speculative sci-fi.', date: 'Jan 28, 2026' },
    { title: 'Concert tickets to check', preview: 'Upcoming shows worth watching: Radiohead reunion tour dates, Beyoncé stadium run, and indie venue picks.', date: 'Jan 15, 2026' },
  ],
  'Design & UX': [
    { title: 'Typography principles', preview: 'Good typography is invisible — it guides the reader without calling attention to itself. Start with type scale, spacing, and hierarchy.', date: 'Jul 4, 2026' },
    { title: 'Color theory basics', preview: 'Understanding hue, saturation, and lightness is the foundation. Complementary, analogous, and triadic color schemes each create different moods.', date: 'Jun 18, 2026' },
    { title: 'Figma component best practices', preview: 'Build components with variables and auto-layout from the start. Avoid hardcoded values. Use naming conventions that match your dev team.', date: 'Jun 5, 2026' },
    { title: 'User research methods', preview: 'Moderated usability testing, contextual inquiry, diary studies, and card sorting — each method reveals a different layer of user behavior.', date: 'May 29, 2026' },
  ],
  'AI Research': [
    { title: 'Transformer architecture deep dive', preview: 'Attention is all you need — the 2017 paper that changed everything. Self-attention, multi-head attention, and positional encoding explained.', date: 'Jul 2, 2026' },
    { title: 'RLHF overview', preview: 'Reinforcement learning from human feedback aligns language models with human preferences by training a reward model on ranked outputs.', date: 'Jun 20, 2026' },
    { title: 'Prompt engineering patterns', preview: 'Chain-of-thought, few-shot, and role prompting are the three most reliable patterns. Combine them thoughtfully based on the task structure.', date: 'Jun 8, 2026' },
  ],
};

function CollectionDetailPage({ collection, bmsByCollection, onBack }) {
  const [search, setSearch] = useState('');
  const [hoveredBm, setHoveredBm] = useState(null);
  if (!collection) return null;

  const allBms = bmsByCollection[collection.name] || [];
  const bookmarks = allBms.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(d) {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function openBmMenu(e, bm) {
    e.stopPropagation();
    const menu = document.getElementById('bm-tt-menu');
    if (!menu) return;
    const rect = e.currentTarget.getBoundingClientRect();
    window.bmTtActiveBm = bm._bm || bm;
    document.getElementById('bm-tt-submenu')?.classList.remove('visible');
    window.bmTtSubmenuOpen = false;
    menu.style.right = 'auto';
    menu.style.left = Math.max(0, rect.right - 200) + 'px';
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.classList.add('visible');
    window.bmTtMenuOpen = true;
  }

  return (
    <main className="main coll-page">
      <div className="coll-page-inner">
        <div className="coll-page-header">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <button className="coll-back-btn" onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="#5d5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="coll-icon-wrap" style={{flexShrink:0}}>
              <img src={collection.icon} width="20" height="20" alt="" />
            </div>
            <h1 className="coll-page-title">{collection.name}</h1>
          </div>
          <div className="coll-page-header-right">
            <div className="coll-search-wrap">
              <svg className="coll-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M9.167 15a5.833 5.833 0 1 0 0-11.667A5.833 5.833 0 0 0 9.167 15Z" stroke="#8f8f8f" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M16.668 16.667 13.377 13.375" stroke="#8f8f8f" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input className="coll-search-input" placeholder="Search bookmarks" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="coll-bm-list">
          {bookmarks.length === 0 && (
            <div className="coll-bm-empty">
              {allBms.length === 0 ? 'No bookmarks in this collection yet.' : 'No bookmarks match your search.'}
            </div>
          )}
          {bookmarks.map((bm, i) => (
            <div
              key={bm.id || i}
              className={`coll-bm-item${hoveredBm === i ? ' hovered' : ''}`}
              onMouseEnter={() => setHoveredBm(i)}
              onMouseLeave={() => setHoveredBm(null)}
            >
              <div className="coll-bm-row">
                <div className="coll-bm-badge" style={{background: bm.color}}>
                  {bm.iconSrc && <img src={bm.iconSrc} width="13" height="13" alt="" style={{filter:'brightness(0) invert(1)'}} />}
                </div>
                <div className="coll-bm-content">
                  <div className="coll-bm-title">{bm.title}</div>
                  <div className="coll-bm-date">{formatDate(bm.createdAt)}</div>
                </div>
                <div className="coll-bm-actions">
                  {hoveredBm === i && (
                    <button className="coll-bm-dots" onClick={e => openBmMenu(e, bm)}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="4" cy="10" r="1.5" fill="#8f8f8f"/>
                        <circle cx="10" cy="10" r="1.5" fill="#8f8f8f"/>
                        <circle cx="16" cy="10" r="1.5" fill="#8f8f8f"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function CollectionsPage({ onBack, onOpenCollection }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = COLL_PAGE_DATA.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="main coll-page">
      <div className="coll-page-inner">
        {/* Header */}
        <div className="coll-page-header">
          <h1 className="coll-page-title">Collections</h1>
          <div className="coll-page-header-right">
            <div className="coll-search-wrap">
              <svg className="coll-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M9.167 15a5.833 5.833 0 1 0 0-11.667A5.833 5.833 0 0 0 9.167 15Z" stroke="#8f8f8f" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M16.668 16.667 13.377 13.375" stroke="#8f8f8f" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                className="coll-search-input"
                placeholder="Search collections"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="coll-new-btn">New</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="coll-tabs">
          {['all', 'created', 'shared'].map(t => (
            <button
              key={t}
              className={`coll-tab${filter === t ? ' active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? 'All' : t === 'created' ? 'Created by you' : 'Shared with you'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="coll-table">
          <div className="coll-table-header">
            <span>Name</span>
          </div>
          <div className="coll-table-body">
            {filtered.map((c, i) => (
              <div
                key={c.name}
                className={`coll-row${hoveredRow === i ? ' hovered' : ''}`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onOpenCollection && onOpenCollection(c)}
              >
                <div className="coll-col-name">
                  <div className="coll-icon-wrap">
                    <img src={c.icon} width="20" height="20" alt="" />
                  </div>
                  <span className="coll-row-name">{c.name}</span>
                  <span className="coll-row-count">{c.count}</span>
                </div>
                <span className="coll-col-modified">{c.modified}</span>
                <div className="coll-col-actions">
                  {hoveredRow === i && (
                    <button className="coll-row-dots">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="4" cy="10" r="1.5" fill="#8f8f8f"/>
                        <circle cx="10" cy="10" r="1.5" fill="#8f8f8f"/>
                        <circle cx="16" cy="10" r="1.5" fill="#8f8f8f"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(() =>
    window.location.hash === '#/collections' ? 'collections' : 'chat'
  );
  const [currentCollection, setCurrentCollection] = useState(null);
  const [bmsByCollection, setBmsByCollection] = useState({});
  const setBmsByCollRef = useRef(setBmsByCollection);

  function navTo(page, collection) {
    if (page === 'collections') {
      window.location.hash = '/collections';
    } else if (page === 'collection-detail' && collection) {
      window.location.hash = '/collections/' + encodeURIComponent(collection.name);
    } else {
      window.location.hash = '';
    }
    setCurrentPage(page);
    if (collection !== undefined) setCurrentCollection(collection);
    if (page === 'collections') {
      document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    }
  }

  useEffect(() => {
    // Sidebar collapse toggle
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const appSidebar  = document.getElementById('app-sidebar');
    if (collapseBtn && appSidebar) {
      collapseBtn.addEventListener('click', () => {
        appSidebar.classList.toggle('collapsed');
      });
    }

    // Keep bookmark modal at a constant visual size regardless of browser zoom
    const NATIVE_DPR = Math.round(window.devicePixelRatio) || 1;
    function applyModalCounterZoom() {
      const modal = document.getElementById('bookmark-modal');
      if (!modal) return;
      const zoomFactor = window.devicePixelRatio / NATIVE_DPR;
      modal.style.zoom = zoomFactor !== 1 ? String(1 / zoomFactor) : '';
    }
    function watchDPR() {
      const mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      const handler = () => { mq.removeEventListener('change', handler); applyModalCounterZoom(); watchDPR(); };
      mq.addEventListener('change', handler);
    }
    applyModalCounterZoom();
    watchDPR();

    const landing = document.getElementById('landing');
    const chatView = document.getElementById('chat-view');
    const messagesEl = document.getElementById('messages');
    const messagesInner = document.getElementById('messages-inner');
    const landingTextarea = document.getElementById('landing-textarea');
    const chatTextarea = document.getElementById('chat-textarea');
    const landingSendBtn = document.getElementById('landing-send-btn');
    const chatSendBtn = document.getElementById('chat-send-btn');

    const announcementBanner = document.getElementById('announcement-banner');
    document.getElementById('banner-got-it').addEventListener('click', dismissBanner);
    document.getElementById('banner-close').addEventListener('click', dismissBanner);
    function dismissBanner() {
      announcementBanner.classList.remove('visible');
      announcementBanner.addEventListener('transitionend', () => announcementBanner.classList.remove('show'), { once: true });
    }

    let inChat = false;
    let isTyping = false;
    let bannerShown = false;

    function escHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function scrollBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addUserBubble(text) {
      const wrap = document.createElement('div');
      wrap.className = 'user-bubble-wrap';
      const bubble = document.createElement('div');
      bubble.className = 'user-bubble';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      messagesInner.appendChild(wrap);
      scrollBottom();
    }

    const ICON_COPY = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.668 10.667C12.668 9.957 12.668 9.463 12.637 9.079C12.626 8.87 12.588 8.663 12.524 8.464L12.469 8.334C12.315 8.033 12.081 7.78 11.793 7.603L11.666 7.531C11.508 7.451 11.296 7.394 10.921 7.363C10.537 7.332 10.044 7.332 9.333 7.332H6.5C5.789 7.332 5.296 7.332 4.912 7.363C4.703 7.374 4.496 7.412 4.297 7.476L4.167 7.531C3.866 7.685 3.613 7.919 3.436 8.207L3.366 8.334C3.285 8.492 3.228 8.704 3.197 9.079C3.166 9.463 3.165 9.956 3.165 10.667V13.5C3.165 14.211 3.165 14.704 3.197 15.088C3.228 15.464 3.285 15.675 3.365 15.833L3.435 15.959C3.612 16.247 3.865 16.481 4.167 16.635L4.297 16.691C4.441 16.743 4.63 16.78 4.912 16.803C5.296 16.834 5.789 16.835 6.5 16.835H9.333C10.043 16.835 10.537 16.835 10.921 16.803C11.297 16.772 11.508 16.715 11.666 16.635L11.793 16.565C12.08 16.388 12.315 16.135 12.469 15.833L12.524 15.703C12.576 15.559 12.614 15.37 12.637 15.088C12.668 14.704 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.453 12.663 14.801 12.66 15.088 12.637C15.464 12.606 15.675 12.549 15.833 12.469L15.959 12.398C16.247 12.221 16.481 11.968 16.635 11.666L16.691 11.536C16.755 11.337 16.793 11.13 16.803 10.921C16.834 10.537 16.835 10.044 16.835 9.333V6.5C16.835 5.789 16.835 5.296 16.803 4.912C16.793 4.703 16.755 4.496 16.691 4.297L16.635 4.167C16.481 3.866 16.247 3.613 15.959 3.436L15.833 3.366C15.675 3.285 15.463 3.228 15.088 3.197C14.704 3.166 14.211 3.165 13.5 3.165H10.667C9.957 3.165 9.463 3.166 9.079 3.197C8.797 3.22 8.608 3.257 8.464 3.309L8.334 3.365C8.033 3.519 7.78 3.753 7.603 4.041L7.531 4.167C7.451 4.325 7.394 4.537 7.363 4.912C7.34 5.199 7.336 5.547 7.334 6.002H9.333C10.022 6.002 10.579 6.002 11.029 6.038C11.487 6.076 11.894 6.155 12.271 6.347L12.488 6.469C12.984 6.773 13.388 7.209 13.653 7.729L13.72 7.872C13.864 8.209 13.93 8.57 13.962 8.971C13.999 9.421 13.998 9.978 13.998 10.667V12.665ZM18.165 9.333C18.165 10.022 18.165 10.579 18.129 11.029C18.096 11.43 18.031 11.791 17.887 12.128L17.82 12.271C17.555 12.791 17.15 13.227 16.655 13.531L16.436 13.653C16.06 13.845 15.654 13.924 15.196 13.962C14.859 13.989 14.462 13.993 13.996 13.995C13.993 14.462 13.989 14.859 13.962 15.196C13.929 15.597 13.864 15.958 13.72 16.294L13.653 16.436C13.388 16.958 12.984 17.394 12.488 17.698L12.271 17.82C11.894 18.012 11.487 18.091 11.029 18.129C10.579 18.166 10.022 18.165 9.333 18.165H6.5C5.81 18.165 5.254 18.165 4.804 18.129C4.404 18.096 4.042 18.031 3.706 17.887L3.563 17.82C3.043 17.555 2.607 17.152 2.302 16.655L2.18 16.436C1.988 16.06 1.909 15.654 1.871 15.196C1.834 14.746 1.835 14.189 1.835 13.5V10.667C1.835 9.978 1.835 9.421 1.871 8.971C1.909 8.513 1.988 8.106 2.18 7.729L2.302 7.512C2.606 7.016 3.042 6.612 3.563 6.347L3.706 6.28C4.042 6.136 4.403 6.07 4.804 6.038C5.141 6.011 5.537 6.006 6.004 6.004C6.006 5.537 6.011 5.141 6.038 4.804C6.075 4.346 6.155 3.94 6.347 3.564L6.469 3.344C6.773 2.849 7.209 2.445 7.729 2.18L7.872 2.113C8.209 1.969 8.57 1.903 8.971 1.871C9.421 1.834 9.978 1.835 10.667 1.835H13.5C14.19 1.835 14.746 1.835 15.196 1.871C15.654 1.909 16.06 1.988 16.436 2.18L16.656 2.302C17.151 2.606 17.555 3.042 17.82 3.563L17.887 3.706C18.031 4.042 18.097 4.403 18.129 4.804C18.166 5.254 18.165 5.811 18.165 6.5V9.333Z" fill="#5D5D5D"/></svg>`;

    const ICON_THUMBSUP = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10.915 1.84L11.295 1.888L11.475 1.915C11.899 1.993 12.303 2.157 12.661 2.397C13.02 2.637 13.325 2.947 13.559 3.309C13.793 3.671 13.951 4.078 14.022 4.503C14.094 4.928 14.078 5.363 13.975 5.782L13.926 5.959L13.399 7.672C13.771 7.676 14.096 7.684 14.379 7.706C14.874 7.745 15.311 7.828 15.701 8.033L15.853 8.118C16.222 8.339 16.542 8.634 16.794 8.983C17.046 9.332 17.224 9.728 17.317 10.148L17.347 10.31C17.403 10.69 17.365 11.083 17.283 11.51C17.236 11.751 17.174 12.022 17.096 12.323L16.826 13.333L16.446 14.728C16.208 15.6 16.044 16.236 15.736 16.73L15.595 16.935C15.299 17.317 14.92 17.627 14.487 17.841L14.298 17.926C13.688 18.177 12.978 18.166 11.945 18.166H7.333C6.644 18.166 6.087 18.166 5.637 18.129C5.237 18.096 4.876 18.031 4.539 17.887L4.397 17.82C3.877 17.555 3.44 17.152 3.135 16.655L3.013 16.437C2.821 16.06 2.742 15.654 2.704 15.197C2.668 14.747 2.668 14.189 2.668 13.5V11.667C2.668 10.935 2.662 10.437 2.776 10.014L2.837 9.813C3.005 9.321 3.291 8.878 3.671 8.523C4.051 8.167 4.512 7.911 5.014 7.776L5.177 7.739C5.566 7.664 6.026 7.668 6.667 7.668C6.803 7.668 6.937 7.633 7.054 7.564C7.172 7.496 7.27 7.398 7.337 7.28L10.257 2.17L10.312 2.088C10.383 1.999 10.476 1.929 10.581 1.886C10.687 1.842 10.802 1.827 10.915 1.84ZM7.331 14.167C7.331 14.984 7.337 15.263 7.394 15.475L7.43 15.592C7.528 15.877 7.694 16.134 7.914 16.339C8.134 16.545 8.401 16.694 8.692 16.772L8.87 16.807C9.077 16.832 9.387 16.835 10 16.835H11.945C13.099 16.835 13.484 16.823 13.79 16.696L13.9 16.646C14.15 16.523 14.372 16.344 14.543 16.122L14.616 16.017C14.776 15.755 14.896 15.352 15.162 14.378L15.543 12.982L15.808 11.992C15.88 11.71 15.937 11.472 15.977 11.261C16.037 10.948 16.052 10.738 16.039 10.579L16.018 10.436C15.916 9.978 15.643 9.576 15.254 9.313L15.081 9.21C14.925 9.128 14.698 9.065 14.275 9.032C13.848 8.999 13.292 8.998 12.5 8.998C12.396 8.998 12.294 8.974 12.201 8.927C12.108 8.88 12.028 8.812 11.966 8.728C11.904 8.644 11.863 8.548 11.845 8.445C11.828 8.343 11.835 8.237 11.865 8.138L12.655 5.568L12.705 5.363C12.75 5.122 12.746 4.875 12.693 4.636C12.641 4.397 12.541 4.17 12.399 3.97C12.258 3.77 12.078 3.601 11.87 3.472C11.662 3.342 11.43 3.256 11.188 3.218L8.49 7.939C8.233 8.388 7.82 8.726 7.33 8.889L7.331 14.167ZM3.998 13.5C3.998 14.211 3.999 14.704 4.031 15.088C4.061 15.464 4.118 15.675 4.199 15.833L4.269 15.959C4.445 16.247 4.699 16.481 5 16.635L5.13 16.69C5.274 16.742 5.463 16.78 5.745 16.803C5.978 16.822 6.25 16.828 6.587 16.831C6.41 16.582 6.27 16.31 6.171 16.021L6.11 15.819C5.996 15.396 6 14.9 6 14.167V9.003C5.793 9.007 5.65 9.013 5.536 9.027L5.358 9.061C5.067 9.139 4.8 9.288 4.579 9.494C4.359 9.699 4.193 9.956 4.095 10.241L4.06 10.358C4.003 10.57 3.997 10.849 3.997 11.667L3.998 13.5Z" fill="#5D5D5D"/></svg>`;

    const ICON_THUMBSDOWN = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.669 5.833C12.669 5.22 12.665 4.91 12.639 4.704L12.606 4.525C12.528 4.234 12.379 3.967 12.173 3.747C11.968 3.527 11.711 3.361 11.426 3.263L11.308 3.228C11.096 3.171 10.818 3.165 10 3.165H8.055C7.045 3.165 6.625 3.175 6.33 3.262L6.21 3.304C5.95 3.411 5.72 3.576 5.534 3.786L5.457 3.878C5.305 4.075 5.203 4.331 5.034 4.917L4.838 5.622L4.457 7.018C4.248 7.782 4.103 8.318 4.023 8.739C3.943 9.157 3.943 9.392 3.981 9.564L4.036 9.758C4.186 10.2 4.5 10.57 4.918 10.79L5.051 10.848C5.201 10.901 5.408 10.943 5.725 10.968C6.152 11.001 6.708 11.002 7.5 11.002C7.597 11.002 7.693 11.024 7.782 11.065C7.87 11.106 7.948 11.166 8.01 11.241C8.073 11.316 8.118 11.403 8.143 11.498C8.167 11.592 8.171 11.69 8.154 11.786L8.135 11.862L7.345 14.432C7.268 14.683 7.245 14.948 7.279 15.208C7.313 15.469 7.403 15.719 7.542 15.942C7.681 16.165 7.866 16.355 8.085 16.5C8.304 16.645 8.551 16.741 8.811 16.782L11.509 12.061L11.583 11.941C11.842 11.55 12.224 11.257 12.669 11.109V5.833ZM17.332 8.333C17.332 8.973 17.336 9.434 17.262 9.823L17.223 9.985C17.088 10.487 16.832 10.948 16.477 11.328C16.122 11.707 15.679 11.994 15.187 12.162L14.987 12.224C14.562 12.337 14.066 12.332 13.334 12.332C13.215 12.332 13.098 12.359 12.991 12.412C12.885 12.464 12.792 12.541 12.72 12.635L12.664 12.72L9.744 17.83C9.678 17.944 9.581 18.035 9.463 18.094C9.346 18.153 9.214 18.176 9.084 18.16L8.706 18.112C8.248 18.055 7.807 17.898 7.416 17.652C7.025 17.406 6.692 17.078 6.441 16.69C6.19 16.302 6.027 15.864 5.964 15.406C5.901 14.949 5.938 14.483 6.074 14.041L6.6 12.327C6.273 12.327 5.946 12.316 5.62 12.294C5.188 12.26 4.8 12.194 4.447 12.039L4.299 11.967C3.918 11.767 3.582 11.491 3.311 11.156C3.04 10.821 2.841 10.435 2.725 10.02L2.683 9.853C2.588 9.422 2.623 8.978 2.717 8.49C2.809 8.006 2.971 7.411 3.174 6.668L3.554 5.272L3.746 4.58C3.929 3.942 4.102 3.457 4.404 3.065L4.537 2.905C4.857 2.544 5.254 2.259 5.702 2.075L5.936 1.992C6.495 1.826 7.151 1.835 8.056 1.835H12.666C13.356 1.835 13.913 1.835 14.363 1.871C14.821 1.909 15.227 1.988 15.603 2.18L15.821 2.302C16.317 2.606 16.721 3.042 16.987 3.564L17.054 3.706C17.198 4.042 17.263 4.403 17.296 4.804C17.332 5.254 17.332 5.811 17.332 6.5V8.333ZM13.998 10.996C14.332 10.99 14.501 10.977 14.641 10.94L14.758 10.903C15.043 10.806 15.3 10.64 15.506 10.42C15.712 10.2 15.86 9.933 15.939 9.642L15.972 9.462C15.998 9.257 16.002 8.947 16.002 8.333V6.5C16.002 5.789 16.001 5.296 15.97 4.912C15.959 4.703 15.921 4.496 15.857 4.297L15.802 4.167C15.648 3.866 15.414 3.613 15.126 3.436L15 3.366C14.842 3.285 14.63 3.228 14.255 3.197C13.974 3.178 13.693 3.168 13.412 3.168C13.627 3.47 13.792 3.811 13.89 4.181L13.927 4.344C13.981 4.622 13.995 4.936 13.997 5.326L13.998 10.996Z" fill="#5D5D5D"/></svg>`;

    const ICON_SHARE = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.668 12.666V12.5C2.668 12.324 2.738 12.155 2.863 12.03C2.987 11.905 3.157 11.835 3.333 11.835C3.509 11.835 3.678 11.905 3.803 12.03C3.928 12.155 3.998 12.324 3.998 12.5V12.666C3.998 13.377 3.999 13.871 4.031 14.254C4.061 14.63 4.118 14.841 4.198 14.999L4.268 15.126C4.445 15.414 4.698 15.648 5 15.802L5.13 15.858C5.274 15.909 5.463 15.947 5.745 15.97C6.129 16.001 6.622 16.001 7.333 16.001H12.666C13.377 16.001 13.871 16.001 14.254 15.97C14.63 15.94 14.841 15.882 14.999 15.802L15.126 15.731C15.414 15.555 15.648 15.301 15.802 14.999L15.858 14.869C15.909 14.726 15.947 14.536 15.97 14.254C16.001 13.871 16.001 13.377 16.001 12.666V12.5C16.001 12.324 16.071 12.155 16.196 12.03C16.321 11.905 16.49 11.835 16.666 11.835C16.842 11.835 17.012 11.905 17.136 12.03C17.261 12.155 17.331 12.324 17.331 12.5V12.666C17.331 13.356 17.331 13.912 17.295 14.363C17.262 14.763 17.197 15.125 17.053 15.461L16.987 15.604C16.721 16.124 16.317 16.561 15.822 16.864L15.604 16.987C15.227 17.179 14.821 17.257 14.363 17.295C13.913 17.332 13.355 17.331 12.666 17.331H7.333C6.644 17.331 6.087 17.332 5.637 17.295C5.237 17.262 4.876 17.198 4.539 17.054L4.397 16.987C3.877 16.722 3.44 16.319 3.135 15.822L3.013 15.604C2.821 15.227 2.742 14.821 2.704 14.363C2.668 13.913 2.668 13.355 2.668 12.666ZM9.335 12.5V4.94L7.137 7.137C7.011 7.255 6.844 7.32 6.671 7.317C6.498 7.315 6.334 7.245 6.211 7.123C6.089 7.001 6.019 6.836 6.017 6.663C6.014 6.49 6.079 6.323 6.197 6.197L9.53 2.863L9.631 2.78C9.759 2.695 9.912 2.657 10.065 2.672C10.218 2.687 10.361 2.755 10.47 2.863L13.804 6.197C13.918 6.324 13.979 6.49 13.974 6.66C13.969 6.83 13.899 6.992 13.779 7.113C13.658 7.233 13.496 7.303 13.326 7.308C13.155 7.312 12.99 7.251 12.863 7.137L10.665 4.94V12.5C10.656 12.67 10.582 12.83 10.458 12.947C10.334 13.064 10.17 13.13 10 13.13C9.83 13.13 9.666 13.064 9.542 12.947C9.418 12.83 9.344 12.67 9.335 12.5Z" fill="#5D5D5D"/></svg>`;

    const ICON_REFRESH = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.502 16.666V13.333C3.502 12.966 3.8 12.668 4.167 12.668H7.5L7.634 12.682C7.784 12.713 7.919 12.794 8.016 12.913C8.113 13.032 8.166 13.18 8.166 13.334C8.166 13.487 8.113 13.635 8.016 13.754C7.919 13.873 7.784 13.954 7.634 13.985L7.5 13.998H5.475C6.048 14.629 6.747 15.132 7.526 15.477C8.305 15.822 9.148 16.001 10 16.001C13.06 16.001 15.586 13.711 15.955 10.751L15.985 10.62C16.038 10.464 16.147 10.333 16.29 10.252C16.434 10.172 16.603 10.147 16.764 10.184C16.924 10.221 17.066 10.316 17.16 10.451C17.255 10.586 17.296 10.751 17.275 10.915L17.225 11.252C16.931 12.954 16.044 14.498 14.722 15.61C13.4 16.723 11.728 17.333 10 17.332C8.073 17.331 6.221 16.584 4.832 15.247V16.667C4.832 16.843 4.762 17.013 4.637 17.137C4.513 17.262 4.343 17.332 4.167 17.332C3.991 17.332 3.822 17.262 3.697 17.137C3.572 17.013 3.502 16.842 3.502 16.666ZM10 2.67C11.994 2.67 13.837 3.467 15.178 4.763V3.333C15.178 3.157 15.248 2.987 15.373 2.863C15.498 2.738 15.667 2.668 15.843 2.668C16.02 2.668 16.189 2.738 16.313 2.863C16.438 2.987 16.508 3.157 16.508 3.333V6.666C16.508 6.842 16.438 7.011 16.313 7.136C16.189 7.261 16.02 7.331 15.843 7.331H12.51C12.334 7.331 12.165 7.261 12.04 7.136C11.915 7.011 11.845 6.842 11.845 6.666C11.845 6.49 11.915 6.32 12.04 6.196C12.165 6.071 12.334 6.001 12.51 6.001H14.525C13.952 5.37 13.253 4.867 12.474 4.522C11.695 4.177 10.852 3.998 10 3.998C8.538 3.998 7.127 4.532 6.03 5.499C4.934 6.466 4.228 7.8 4.045 9.25L3.385 9.167L2.725 9.085C2.948 7.313 3.81 5.683 5.15 4.502C6.489 3.32 8.214 2.668 10 2.668" fill="#5D5D5D"/></svg>`;

    const ICON_MORE = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.498 8.502C15.895 8.502 16.276 8.66 16.557 8.941C16.838 9.222 16.996 9.603 16.996 10C16.996 10.397 16.838 10.778 16.557 11.059C16.276 11.34 15.895 11.498 15.498 11.498C15.101 11.498 14.72 11.34 14.439 11.059C14.158 10.778 14 10.397 14 10C14 9.603 14.158 9.222 14.439 8.941C14.72 8.66 15.101 8.502 15.498 8.502ZM4.498 8.502C4.695 8.502 4.89 8.541 5.072 8.616C5.254 8.691 5.419 8.802 5.558 8.941C5.697 9.08 5.808 9.245 5.883 9.427C5.958 9.609 5.997 9.804 5.997 10.001C5.997 10.198 5.958 10.393 5.883 10.575C5.808 10.757 5.697 10.922 5.558 11.061C5.419 11.2 5.254 11.311 5.072 11.386C4.89 11.461 4.695 11.5 4.498 11.5C4.1 11.5 3.719 11.342 3.438 11.061C3.157 10.78 2.999 10.399 2.999 10.001C2.999 9.603 3.157 9.222 3.438 8.941C3.719 8.66 4.1 8.502 4.498 8.502ZM10 8.502C10.397 8.502 10.778 8.66 11.059 8.941C11.34 9.222 11.498 9.603 11.498 10C11.498 10.397 11.34 10.778 11.059 11.059C10.778 11.34 10.397 11.498 10 11.498C9.603 11.498 9.222 11.34 8.941 11.059C8.66 10.778 8.502 10.397 8.502 10C8.502 9.603 8.66 9.222 8.941 8.941C9.222 8.66 9.603 8.502 10 8.502Z" fill="#5D5D5D"/></svg>`;

    const ICON_BOOKMARK = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.833 17.5L10 13.333L4.167 17.5V4.167C4.167 3.725 4.342 3.301 4.655 2.988C4.967 2.676 5.391 2.5 5.833 2.5H14.167C14.609 2.5 15.033 2.676 15.345 2.988C15.658 3.301 15.833 3.725 15.833 4.167V17.5Z" stroke="#5D5D5D" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    // Each block: { type: 'p'|'h2'|'h3'|'lead'|'ul'|'equation', text?, items? }
    const AI_BLOCKS = [
      { type: 'p', text: 'Current fare searches show Turkish at about **$703** for **Nov. 26–Dec. 10**, while AirHint is showing **$650** Air Europa for **Nov. 25–Dec. 7** and **$684** Norse for **Nov. 25–Dec. 4**.' },
      { type: 'p', text: 'Google Flights is also currently showing **$304 one-way on Nov. 26**, which confirms that Thanksgiving itself isn\'t necessarily insanely expensive.' },
      { type: 'h2', text: 'What I\'d actually book' },
      { type: 'lead', text: 'My first choice would be the Turkish Airlines ~$703 itinerary, Nov. 26 → Dec. 10.' },
      { type: 'p', text: 'That\'s because it\'s a reasonable price *and* Turkish is a much better candidate for finding a genuinely refundable fare than something like Norse\'s cheapest ticket. Turkish currently publishes the Nov. 26–Dec. 10 JFK–MXP itinerary at **$703 round trip**.' },
      { type: 'p', text: 'Another option worth checking is **Air France/KLM**. Air France currently has JFK → Milan fares around **$686–$637** in November, although the displayed lowest fares aren\'t necessarily refundable.' },
      { type: 'h2', text: 'One important question' },
      { type: 'p', text: 'If you tell me **your preferred return date** (e.g. **Nov 29, Dec 1, Dec 5, Dec 7, etc.**) and whether you mean:' },
      { type: 'ul', items: [
        '**Fully refundable to your original payment method**, or',
        '**Free cancellation for airline credit**'
      ]},
      { type: 'p', text: 'I can narrow this down to the **cheapest 5 actual options**, including **flight times, nonstop vs. connection, baggage, and exactly what refundable fare you\'d need to select**.' }
    ];

    // Parse inline **bold** and *italic* markdown into HTML
    function inlineMd(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g,   '<em>$1</em>');
    }

    function createResponseActions() {
      const el = document.createElement('div');
      el.className = 'response-actions';
      el.innerHTML = `
        <button class="action-btn" title="Copy">${ICON_COPY}</button>
        <button class="action-btn" title="Good response">${ICON_THUMBSUP}</button>
        <button class="action-btn" title="Bad response">${ICON_THUMBSDOWN}</button>
        <button class="action-btn" title="Share">${ICON_SHARE}</button>
        <button class="action-btn" title="Regenerate" style="padding:5px 6px;width:auto;">${ICON_REFRESH}</button>
        <button class="action-btn" title="More">${ICON_MORE}</button>
        <button class="action-btn action-btn-bookmark" title="Bookmark"><span class="bm-ab-label">Bookmarks</span></button>
      `;
      return el;
    }

    function streamBlocks(container, blocks, onDone) {
      let bIdx = 0;

      function renderNext() {
        if (bIdx >= blocks.length) { if (onDone) onDone(); return; }
        const block = blocks[bIdx++];
        let el;

        if (block.type === 'h2') {
          el = document.createElement('p');
          el.className = 'ai-para ai-heading-2';
          el.innerHTML = inlineMd(block.text);
        } else if (block.type === 'lead') {
          el = document.createElement('p');
          el.className = 'ai-para ai-lead';
          el.innerHTML = inlineMd(block.text);
        } else if (block.type === 'h3') {
          el = document.createElement('p');
          el.className = 'ai-para ai-heading';
          el.innerHTML = inlineMd(block.text);
        } else if (block.type === 'ul') {
          el = document.createElement('ul');
          el.className = 'ai-para ai-list';
          block.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = inlineMd(item);
            el.appendChild(li);
          });
        } else if (block.type === 'equation') {
          el = document.createElement('p');
          el.className = 'ai-para ai-equation';
          el.innerHTML = inlineMd(block.text);
        } else {
          el = document.createElement('p');
          el.className = 'ai-para';
          el.innerHTML = inlineMd(block.text);
        }

        container.appendChild(el);
        scrollBottom();
        // Stagger between blocks to simulate streaming
        const delay = block.type === 'ul' ? block.items.join('').length * 12
                    : (block.text || '').length * 12;
        setTimeout(renderNext, Math.min(Math.max(delay, 120), 600));
      }

      renderNext();
    }

    function startAIResponse() {
      // Update the recents title to reflect the conversation topic
      const recentActive = document.querySelector('.history-item.active');
      if (recentActive) recentActive.textContent = 'Photosynthesis overview';

      const aiMsg = document.createElement('div');
      aiMsg.className = 'ai-message';
      const textEl = document.createElement('div');
      textEl.className = 'ai-text';
      const actionsEl = createResponseActions();
      aiMsg.appendChild(textEl);
      aiMsg.appendChild(actionsEl);
      messagesInner.appendChild(aiMsg);
      scrollBottom();

      streamBlocks(textEl, AI_BLOCKS, () => {
        isTyping = false;
        setTimeout(() => actionsEl.classList.add('visible'), 1500);
        setTimeout(() => {
          if (!bannerShown) {
            bannerShown = true;
            announcementBanner.classList.add('show');
            requestAnimationFrame(() => requestAnimationFrame(() => announcementBanner.classList.add('visible')));
          }
        }, 2200);
      });
    }

    const landingTopbarActions = document.getElementById('landing-topbar-actions');
    const chatTopbarActions = document.getElementById('chat-topbar-actions');

    function sendMessage(text) {
      if (!text.trim()) return;
      if (!inChat) {
        landing.style.display = 'none';
        chatView.classList.add('active');
        landingTopbarActions.style.display = 'none';
        chatTopbarActions.classList.add('active');
        inChat = true;
        chatTextarea.focus();

        // Deselect all nav-rows and history-items
        document.querySelectorAll('.nav-row, .history-item').forEach(el => el.classList.remove('active'));

        // Add new conversation entry at top of recents
        const recentsScroll = document.querySelector('.recents-scroll');
        const newItem = document.createElement('div');
        newItem.className = 'history-item active';
        const label = text.trim().length > 28 ? text.trim().slice(0, 28) + '…' : text.trim();
        newItem.textContent = label;
        recentsScroll.insertBefore(newItem, recentsScroll.firstChild);
      }
      addUserBubble(text.trim());
      isTyping = true;
      setTimeout(startAIResponse, 380);
    }

    // Send button active/inactive state
    const landingSendBtn2 = document.getElementById('landing-send-btn');
    const chatSendBtn2 = document.getElementById('chat-send-btn');

    function updateSendBtn(textarea, btn) {
      if (textarea.value.trim().length > 0) {
        btn.classList.remove('inactive');
      } else {
        btn.classList.add('inactive');
      }
    }

    // Initialize both as inactive
    landingSendBtn2.classList.add('inactive');
    chatSendBtn2.classList.add('inactive');

    landingTextarea.addEventListener('input', () => updateSendBtn(landingTextarea, landingSendBtn2));
    chatTextarea.addEventListener('input', () => updateSendBtn(chatTextarea, chatSendBtn2));

    // Landing listeners
    landingTextarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const t = landingTextarea.value;
        landingTextarea.value = '';
        landingTextarea.style.height = '24px';
        sendMessage(t);
      }
    });
    landingSendBtn.addEventListener('click', () => {
      const t = landingTextarea.value;
      landingTextarea.value = '';
      landingTextarea.style.height = '24px';
      sendMessage(t);
    });

    // Chat listeners
    chatTextarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const t = chatTextarea.value;
        chatTextarea.value = '';
        chatTextarea.style.height = '24px';
        sendMessage(t);
      }
    });
    chatSendBtn.addEventListener('click', () => {
      const t = chatTextarea.value;
      chatTextarea.value = '';
      chatTextarea.style.height = '24px';
      sendMessage(t);
    });

    // ── Selection popup ────────────────────────────────────────────────────────
    const popup = document.getElementById('text-hover-popup');
    const popupBookmarkBtn = popup.querySelector('.popup-cap-right');
    let isEditMode = false;
    let nextBmId = 0;
    let currentEditBmId = null;
    let forceFullBookmark = false;
    let lastSelectedText = '';
    let lastSelectedHtml = '';
    let lastBookmarkedMsg = null;
    let bookmarkFirstPara = null;
    let bookmarkLastPara  = null;
    let bookmarkRange     = null;
    let bmIsCode = false;
    let bmCodeHtml = '';
    let pendingBmIconSrc = null;
    let pendingBmIconPath = null;
    let pendingSelSpan = null;

    function tryShowSelectionPopup() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      try {
        const range = sel.getRangeAt(0);
        const node  = range.commonAncestorContainer;
        const el    = node.nodeType === 3 ? node.parentElement : node;
        if (!el.closest('.ai-text')) return;
        const rect = range.getBoundingClientRect();
        if (!rect.width && !rect.height) return;
        lastSelectedText  = sel.toString().trim();
        isEditMode = false;
        currentEditBmId = null;
        popupBookmarkBtn.textContent = 'Bookmark';

        // Detect if selection is within a code block body
        const codeBody = el.closest('.code-block-body');
        if (codeBody) {
          bmIsCode = true;
          // Capture highlighted HTML from the selection
          const frag = range.cloneContents();
          const tmp = document.createElement('div');
          tmp.appendChild(frag);
          bmCodeHtml = tmp.innerHTML;
          lastSelectedHtml = '';
          lastBookmarkedMsg = null;
          bookmarkRange     = null;
          bookmarkFirstPara = null;
          bookmarkLastPara  = null;
        } else {
          bmIsCode = false;
          bmCodeHtml = '';
          // Capture formatted HTML from selection
          const frag = range.cloneContents();
          const tmp = document.createElement('div');
          tmp.appendChild(frag);
          lastSelectedHtml = tmp.innerHTML;
          lastBookmarkedMsg = el.closest('.ai-message');
          bookmarkRange     = range.cloneRange();
          bookmarkFirstPara = null;
          bookmarkLastPara  = null;
          if (lastBookmarkedMsg) {
            lastBookmarkedMsg.querySelectorAll('.ai-para').forEach(p => {
              if (range.intersectsNode(p)) {
                if (!bookmarkFirstPara) bookmarkFirstPara = p;
                bookmarkLastPara = p;
              }
            });
          }
        }

        const pw = popup.offsetWidth || 262;
        const ph = popup.offsetHeight || 44;
        const x  = Math.max(8, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 8));
        const y  = Math.max(60, rect.top - ph - 10);
        popup.style.left = x + 'px';
        popup.style.top  = y + 'px';
        popup.classList.add('visible');
      } catch (_) {}
    }

    document.addEventListener('mouseup', (e) => {
      if (popup.contains(e.target)) return;
      setTimeout(tryShowSelectionPopup, 30);
    });

    document.addEventListener('mousedown', (e) => {
      if (popup.contains(e.target)) return;
      popup.classList.remove('visible');
    });

    // Click on an existing bookmark (line or highlight) → show edit popup
    messagesInner.addEventListener('click', (e) => {
      const target = e.target.closest('.bm-highlight, .bm-line');
      if (!target) return;
      e.stopPropagation();
      isEditMode = true;
      currentEditBmId = target.dataset.bmId != null ? parseInt(target.dataset.bmId) : null;
      popupBookmarkBtn.textContent = 'Edit Bookmark';
      const rect = target.getBoundingClientRect();
      const pw = popup.offsetWidth || 220;
      const ph = popup.offsetHeight || 44;
      const x = Math.max(8, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 8));
      const y = Math.max(60, rect.top - ph - 10);
      popup.style.left = x + 'px';
      popup.style.top  = y + 'px';
      popup.classList.add('visible');
    });

    messagesInner.addEventListener('click', (e) => {
      const btn = e.target.closest('.action-btn[title="Bookmark"]');
      if (!btn) return;
      e.stopPropagation();
      const aiMsg = btn.closest('.ai-message');
      if (!aiMsg) return;
      const bmRpPanel = document.getElementById('bm-right-panel');
      if (bmRpPanel) {
        if (bmRpPanel.classList.contains('open') && bmRpSourceMsg === aiMsg) {
          bmRpClose();
        } else {
          bmRpOpen(aiMsg);
        }
      }
    });

    // ── Response more-menu popup ───────────────────────────────────────────────
    const responseMorePopup = document.getElementById('response-more-popup');
    const rmpTimestamp      = document.getElementById('response-more-timestamp');
    let   rmpAnchorMsg      = null;

    function closeResponseMorePopup() {
      responseMorePopup.classList.remove('open');
      rmpAnchorMsg = null;
    }

    messagesInner.addEventListener('click', (e) => {
      const btn = e.target.closest('.action-btn[title="More"]');
      if (!btn) return;
      e.stopPropagation();

      const aiMsg = btn.closest('.ai-message');
      const isAlreadyOpen = responseMorePopup.classList.contains('open') && rmpAnchorMsg === aiMsg;
      closeResponseMorePopup();
      if (isAlreadyOpen) return;

      rmpAnchorMsg = aiMsg;

      // Timestamp from the message's date element, or fallback
      const dateEl = aiMsg.querySelector('.msg-date, .ai-date, time');
      rmpTimestamp.textContent = dateEl ? dateEl.textContent : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Position above the button
      responseMorePopup.classList.add('open');
      const rect = btn.getBoundingClientRect();
      const pw   = responseMorePopup.offsetWidth  || 210;
      const ph   = responseMorePopup.offsetHeight || 180;
      const x    = Math.max(8, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 8));
      const y    = Math.max(8, rect.top - ph - 8);
      responseMorePopup.style.left = x + 'px';
      responseMorePopup.style.top  = y + 'px';
    });

    document.getElementById('rmp-add-bookmark').addEventListener('click', () => {
      const aiMsg = rmpAnchorMsg;
      closeResponseMorePopup();
      if (!aiMsg) return;
      const paras = aiMsg.querySelectorAll('.ai-para');
      if (!paras.length) return;
      lastBookmarkedMsg = aiMsg;
      bookmarkFirstPara = paras[0];
      bookmarkLastPara  = paras[paras.length - 1];
      bookmarkRange     = null;
      forceFullBookmark = true;
      lastSelectedText  = Array.from(paras).map(p => p.textContent).join(' ');
      lastSelectedHtml  = Array.from(paras).map(p => p.outerHTML).join('');
      isEditMode = false;
      currentEditBmId = null;
      bmIsCode = false;
      bmCodeHtml = '';
      openBookmarkModal(lastSelectedText);
    });

    document.addEventListener('click', (e) => {
      if (!responseMorePopup.classList.contains('open')) return;
      if (!responseMorePopup.contains(e.target)) closeResponseMorePopup();
    });

    // ── Bookmark modal ─────────────────────────────────────────────────────────
    const bookmarkOverlay    = document.getElementById('bookmark-overlay');
    const bookmarkModal      = document.getElementById('bookmark-modal');
    const bmPreviewText      = document.getElementById('bm-preview-text');
    const bmNameInput        = document.getElementById('bm-name-input');
    const bmCreateBtn        = document.getElementById('bm-create-btn');
    const bmCreateView       = document.getElementById('bm-create-view');
    const bmPreviewView      = document.getElementById('bm-preview-view');
    const bmFullContent      = document.getElementById('bm-full-content');
    const bmPvTitle          = document.getElementById('bm-pv-title');
    const bmPvCollection     = document.getElementById('bm-pv-collection');
    const bmPreviewBtn       = document.getElementById('bm-preview-btn');

    let savedBookmarkText = '';
    let savedBookmarkHtml = '';
    let bmIsAnimating = false;

    function _populatePreviewContent() {
      if (bmIsCode && bmCodeHtml) {
        bmFullContent.innerHTML = bmCodeHtml;
        bmFullContent.style.fontFamily = "'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace";
        bmFullContent.style.fontSize = '12px';
        bmFullContent.style.lineHeight = '1.65';
      } else {
        if (savedBookmarkHtml) {
          bmFullContent.innerHTML = savedBookmarkHtml;
        } else {
          bmFullContent.textContent = savedBookmarkText;
        }
        bmFullContent.style.fontFamily = '';
        bmFullContent.style.fontSize = '';
        bmFullContent.style.lineHeight = '';
      }
      bmPvTitle.textContent = bmNameInput.value.trim() || 'Untitled Bookmark';
      const hasCollection = bmCollectionText.classList.contains('selected');
      const collText = hasCollection ? bmCollectionText.textContent.trim() : '';
      bmPvCollection.textContent = collText;
      document.getElementById('bm-pv-collection-icon').innerHTML = hasCollection ? selectedCollectionIcon.replace(/<img /g, '<img width="16" height="16" ') : '';
      document.getElementById('bm-pv-collection-wrap').style.display = hasCollection ? 'flex' : 'none';
      // Date: always today
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      document.getElementById('bm-pv-date').textContent = dateStr + ' ·';
      // Conversation title: current active conversation
      const convTitle = convData[activeConvId]?.name || '';
      document.getElementById('bm-pv-conv-title').textContent = convTitle;
    }

    // Instant reset — used when modal opens or after it closes (no animation needed)
    function _resetToCreateView() {
      bmCreateView.style.cssText = '';
      // Only hide display; preserve flex-direction/gap so layout is correct when shown
      bmPreviewView.style.display = 'none';
      bmPreviewView.style.opacity = '';
      bmPreviewView.style.transform = '';
      bmPreviewView.style.transition = '';
      bmPreviewBtn.style.cssText = '';
      bmCreateBtn.style.cssText = '';
      bookmarkModal.style.cssText = '';
      bookmarkModal.scrollTop = 0;
      document.getElementById('bm-color-popup').classList.remove('open');
      document.getElementById('bm-writing-icon-btn').classList.remove('active');
    }

    function animateToPreview() {
      if (bmIsAnimating) return;
      bmIsAnimating = true;

      _populatePreviewContent();

      // Step 1: fade out create view (130ms)
      bmCreateView.style.transition = 'opacity 0.13s ease';
      bmPreviewBtn.style.transition = 'opacity 0.13s ease';
      bmCreateView.style.opacity = '0';
      bmPreviewBtn.style.opacity = '0';
      bmPreviewBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        // Step 2: swap views — modal snaps to preview height while content is invisible
        bmCreateView.style.display = 'none';
        bmCreateView.style.opacity = '';
        bmCreateView.style.transition = '';
        bmPreviewBtn.style.display = 'none';
        bmPreviewBtn.style.opacity = '';
        bmPreviewBtn.style.transition = '';
        bmPreviewBtn.style.pointerEvents = '';

        bmPreviewView.style.display = 'flex';
        bmPreviewView.style.flexDirection = 'column';
        bmPreviewView.style.gap = '20px';
        bmPreviewView.style.opacity = '0';
        bmPreviewView.style.transform = 'translateY(6px)';
        bmCreateBtn.classList.add('active');

        // Step 3: fade in preview content
        requestAnimationFrame(() => {
          bmPreviewView.style.transition = 'opacity 0.25s ease, transform 0.28s ease';
          bmPreviewView.style.opacity = '1';
          bmPreviewView.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
          bmPreviewView.style.transition = '';
          bmPreviewView.style.transform = '';
          bmIsAnimating = false;
        }, 320);
      }, 140);
    }

    function animateToCreate() {
      if (bmIsAnimating) return;
      bmIsAnimating = true;

      // Step 1: fade out preview view (130ms)
      bmPreviewView.style.transition = 'opacity 0.13s ease';
      bmPreviewView.style.opacity = '0';

      setTimeout(() => {
        // Step 2: swap views — modal snaps back to create height while invisible
        bmPreviewView.style.display = 'none';
        bmPreviewView.style.opacity = '';
        bmPreviewView.style.transition = '';

        bmCreateView.style.display = '';
        bmCreateView.style.opacity = '0';
        bmPreviewBtn.style.display = '';
        bmPreviewBtn.style.opacity = '0';
        bmCreateBtn.classList.toggle('active', bmNameInput.value.trim().length > 0);
        bookmarkModal.scrollTop = 0;

        // Step 3: fade in create content
        requestAnimationFrame(() => {
          bmCreateView.style.transition = 'opacity 0.22s ease';
          bmCreateView.style.opacity = '1';
          bmPreviewBtn.style.transition = 'opacity 0.22s ease';
          bmPreviewBtn.style.opacity = '1';
        });

        setTimeout(() => {
          bmCreateView.style.transition = '';
          bmCreateView.style.opacity = '';
          bmPreviewBtn.style.transition = '';
          bmPreviewBtn.style.opacity = '';
          bmIsAnimating = false;
        }, 270);
      }, 140);
    }

    function openBookmarkModal(selectedText, prefill) {
      savedBookmarkText = selectedText || '';
      savedBookmarkHtml = lastSelectedHtml || '';
      const isCode = bmIsCode || (prefill && prefill.type === 'code');
      if (isCode && bmCodeHtml) {
        bmPreviewText.innerHTML = bmCodeHtml;
        bmPreviewText.classList.add('is-code');
      } else {
        if (savedBookmarkHtml) {
          bmPreviewText.innerHTML = savedBookmarkHtml;
        } else {
          bmPreviewText.textContent = savedBookmarkText;
        }
        bmPreviewText.classList.remove('is-code');
      }
      bmNameInput.value = prefill ? prefill.title : '';
      bmCreateBtn.classList.toggle('active', !!(prefill && prefill.title));
      // Reset collection for new bookmarks (not editing)
      if (!prefill) {
        bmCollectionText.textContent = 'Select a collection';
        bmCollectionText.classList.remove('selected');
        selectedCollectionIcon = '';
        bmCollectionDropdown.querySelectorAll('.bm-collection-option').forEach(o => o.classList.remove('active'));
      }
      // Set color — prefill color if editing, otherwise black
      const color = (prefill && prefill.color) || '#181818';
      bmSelectedColor = color;
      const dots = bmColorPopup.querySelectorAll('.bm-cs-dot');
      dots.forEach(d => d.classList.remove('selected'));
      const activeDot = bmColorPopup.querySelector(`.bm-cs-dot[data-color="${color}"]`);
      if (activeDot) activeDot.classList.add('selected');
      // setBmModalIconMode must run first (it shows/hides SVGs), then we override with custom icon
      setBmModalIconMode(isCode, color);
      // Restore or randomize icon
      const allIconBtns = Array.from(bmColorPopup.querySelectorAll('.bm-cs-icon-btn'));
      allIconBtns.forEach(b => b.classList.remove('selected'));
      if (!isCode) {
        if (prefill && prefill.iconSrc) {
          // Find the matching icon button by src filename
          const srcName = prefill.iconSrc.split('/').pop();
          const matchBtn = allIconBtns.find(b => b.dataset.icon && b.dataset.icon.split('/').pop() === srcName);
          if (matchBtn) { matchBtn.classList.add('selected'); applyCustomIcon(matchBtn.dataset.icon); }
          else { applyCustomIcon(prefill.iconSrc); }
          applyIconColorFilter(color);
        } else if (allIconBtns.length) {
          const randomBtn = allIconBtns[Math.floor(Math.random() * allIconBtns.length)];
          randomBtn.classList.add('selected');
          applyCustomIcon(randomBtn.dataset.icon);
          applyIconColorFilter(color);
        }
      } else {
        clearCustomIcon();
      }
      // Restore collection if editing
      if (prefill && prefill.collection) {
        const collOpt = bmCollectionDropdown.querySelector(`.bm-collection-option[data-val="${prefill.collection}"]`);
        if (collOpt) collOpt.click();
      }
      applyTextPreviewBg(color);
      bmCsPvSyncTitle();
      bmCsPvSyncColl();
      _resetToCreateView();
      bookmarkOverlay.classList.add('visible');
      setTimeout(() => bmNameInput.focus(), 250);
    }

    function closeBookmarkModal() {
      bookmarkModal.classList.add('closing');
      forceFullBookmark = false;
      bmPreviewText.classList.remove('is-code');
      clearCustomIcon();
      setBmModalIconMode(false, '#181818');
      pendingCodeBmBtn = null;
      // Start fading the overlay backdrop slightly after the modal starts its drop
      setTimeout(() => bookmarkOverlay.classList.remove('visible'), 60);
      // Reset state after animation fully completes
      setTimeout(() => {
        bookmarkModal.classList.remove('closing');
        _resetToCreateView();
      }, 680);
    }

    document.getElementById('bm-close-btn').addEventListener('click', closeBookmarkModal);
    document.getElementById('bm-preview-close-btn').addEventListener('click', closeBookmarkModal);
    document.getElementById('bm-back-btn').addEventListener('click', animateToCreate);
    document.getElementById('bm-preview-box').addEventListener('click', animateToPreview);
    bmPreviewBtn.addEventListener('click', animateToPreview);
    function hexToRgba(hex, alpha) {
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    bmCreateBtn.addEventListener('click', () => {
      const color = bmWritingIconPath.getAttribute('stroke') || '#181818';

      // Detect partial vs full-paragraph selection
      const coveredParas = [];
      if (!forceFullBookmark && lastBookmarkedMsg && bookmarkRange) {
        lastBookmarkedMsg.querySelectorAll('.ai-para').forEach(p => {
          if (bookmarkRange.intersectsNode(p)) coveredParas.push(p);
        });
      }
      const totalLen = coveredParas.reduce((s, p) => s + p.textContent.length, 0);
      const isFullParagraph = forceFullBookmark || (totalLen > 0 && lastSelectedText.length >= totalLen * 0.85);

      // In edit mode, skip DOM manipulation — just updating metadata via the second listener
      if (currentEditBmId != null) { closeBookmarkModal(); return; }

      const thisBmId = nextBmId++;

      if (isFullParagraph && lastBookmarkedMsg && bookmarkFirstPara && bookmarkLastPara) {
        // Re-query paras at creation time so full-response bookmarks capture all paragraphs
        if (forceFullBookmark) {
          const allParas = lastBookmarkedMsg.querySelectorAll('.ai-para');
          if (allParas.length) {
            bookmarkFirstPara = allParas[0];
            bookmarkLastPara  = allParas[allParas.length - 1];
          }
        }
      }

      if (pendingCodeBmBtn) {
        pendingCodeBmBtn.innerHTML = SVG_CODE_BM_BTN_FILLED;
        pendingCodeBmBtn = null;
      }

      // Add overlapping badge circle at end of last bookmarked paragraph
      // Skip badge for full-response bookmarks (added via the "..." menu) — they show only in the count
      const badgePara = bookmarkLastPara;
      if (badgePara && !bmIsCode && !forceFullBookmark) {
        let group = badgePara.querySelector(':scope > .bm-badge-group');
        if (!group) {
          group = document.createElement('span');
          group.className = 'bm-badge-group';
          badgePara.appendChild(group);
        }
        const badge = document.createElement('span');
        badge.className = 'bm-badge';
        badge.dataset.bmId = thisBmId;
        badge.style.background = '#fff';
        if (bmSelectedIconSrc) {
          const img = document.createElement('img');
          img.src = bmSelectedIconSrc;
          // Permanent color filter for this badge at the selected color
          const filterId = `bm-badge-filter-${thisBmId}`;
          const fr = parseInt(color.slice(1, 3), 16) / 255;
          const fg = parseInt(color.slice(3, 5), 16) / 255;
          const fb = parseInt(color.slice(5, 7), 16) / 255;
          const fSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          fSvg.setAttribute('style', 'display:none;position:absolute;width:0;height:0');
          fSvg.innerHTML = `<defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr}  0 0 0 0 ${fg}  0 0 0 0 ${fb}  0 0 0 1 0"/></filter></defs>`;
          badge.appendChild(fSvg);
          img.style.filter = `url(#${filterId})`;
          badge.appendChild(img);
        } else {
          const iconPath = bmWritingIconPath.getAttribute('d');
          badge.innerHTML = iconPath
            ? `<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="${iconPath}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.497V3.125C11.876 2.435 11.317 1.875 10.626 1.875H4.376C3.686 1.875 3.126 2.435 3.126 3.125V12.497C3.126 13.003 3.696 13.299 4.11 13.008L6.782 11.13C7.213 10.827 7.788 10.827 8.22 11.13L10.892 13.008C11.306 13.299 11.876 13.003 11.876 12.497Z" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
        group.appendChild(badge);
        attachHighlightTooltip(badge);
      }

      // Capture icon data before closeBookmarkModal() nulls bmSelectedIconSrc
      pendingBmIconSrc = bmSelectedIconSrc;
      pendingBmIconPath = bmWritingIconPath.getAttribute('d');

      // Wrap the selected text range in a span for precise underline targeting
      pendingSelSpan = null;
      if (!isFullParagraph && bookmarkRange) {
        try {
          const span = document.createElement('span');
          span.dataset.bmSelId = thisBmId;
          bookmarkRange.surroundContents(span);
          pendingSelSpan = span;
        } catch (e) { pendingSelSpan = null; }
      }

      closeBookmarkModal();
    });

    bookmarkOverlay.addEventListener('mousedown', (e) => {
      if (!bookmarkModal.contains(e.target)) closeBookmarkModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookmarkOverlay.classList.contains('visible')) closeBookmarkModal();
    });

    bmNameInput.addEventListener('input', () => {
      bmCreateBtn.classList.toggle('active', bmNameInput.value.trim().length > 0);
      bmCsPvSyncTitle();
    });

    // Collection dropdown
    const bmCollectionSelect   = document.getElementById('bm-collection-select');
    const bmCollectionDropdown = document.getElementById('bm-collection-dropdown');
    const bmCollectionText     = document.getElementById('bm-collection-text');
    let selectedCollectionIcon = '';

    bmCollectionSelect.addEventListener('click', () => {
      bmCollectionDropdown.classList.toggle('open');
      bmCollectionSelect.classList.toggle('open', bmCollectionDropdown.classList.contains('open'));
    });

    bmCollectionDropdown.querySelectorAll('.bm-collection-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        bmCollectionText.textContent = val;
        bmCollectionText.classList.add('selected');
        selectedCollectionIcon = opt.querySelector('.bm-coll-icon')?.innerHTML || '';
        bmCollectionDropdown.querySelectorAll('.bm-collection-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        bmCollectionDropdown.classList.remove('open');
        bmCollectionSelect.classList.remove('open');
        bmCsPvSyncColl();
      });
    });

    // ── Color picker ─────────────────────────────────────────────────
    let bmSelectedColor = '#181818';
    const bmWritingIconBtn      = document.getElementById('bm-writing-icon-btn');
    const bmWritingCodeSvg      = document.getElementById('bm-writing-code-svg');
    const bmWritingCodePath     = document.getElementById('bm-writing-code-path');
    const bmCsPreviewCodeSvg    = document.getElementById('bm-cs-preview-code-svg');
    const bmCsPreviewCodePath   = document.getElementById('bm-cs-preview-code-path');
    const bmColorPopup      = document.getElementById('bm-color-popup');
    const bmWritingIconPath = document.getElementById('bm-writing-icon-path');
    const bmCsPreviewPath   = document.getElementById('bm-cs-preview-path');

    // Preview card helpers
    (function() {
      const d = new Date();
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const el = document.getElementById('bm-cs-pv-date');
      if (el) el.textContent = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    })();

    function bmCsPvSyncTitle() {
      const el = document.getElementById('bm-cs-pv-title');
      if (el) el.textContent = bmNameInput.value.trim() || 'Untitled Bookmark';
    }

    function bmCsPvSyncColl() {
      const hasCollection = bmCollectionText.classList.contains('selected');
      const collName = hasCollection ? bmCollectionText.textContent.trim() : '';
      const pvCollName = document.getElementById('bm-cs-pv-coll-name');
      const pvCollIcon = document.getElementById('bm-cs-pv-coll-icon');
      const pvSep = document.getElementById('bm-cs-pv-sep');
      if (collName) {
        pvCollName.textContent = collName;
        pvCollName.style.display = '';
        pvSep.style.display = '';
        if (selectedCollectionIcon) {
          pvCollIcon.innerHTML = selectedCollectionIcon.replace(/<img /g, '<img width="13" height="13" ').replace(/width="16" height="16"/g, 'width="13" height="13"');
          pvCollIcon.style.display = 'inline-flex';
        } else {
          pvCollIcon.innerHTML = '';
          pvCollIcon.style.display = 'none';
        }
      } else {
        pvCollName.style.display = 'none';
        pvCollIcon.innerHTML = '';
        pvCollIcon.style.display = 'none';
        pvSep.style.display = 'none';
      }
    }

    function setBmModalIconMode(isCode, color) {
      const c = color || '#181818';
      if (isCode) {
        document.getElementById('bm-writing-icon-svg').style.display = 'none';
        bmWritingCodeSvg.style.display = '';
        bmWritingCodePath.setAttribute('fill', c);
        document.getElementById('bm-cs-preview-svg').style.display = 'none';
        bmCsPreviewCodeSvg.style.display = '';
        bmCsPreviewCodePath.setAttribute('fill', c);
      } else {
        document.getElementById('bm-writing-icon-svg').style.display = '';
        bmWritingCodeSvg.style.display = 'none';
        bmWritingIconPath.setAttribute('stroke', c);
        document.getElementById('bm-cs-preview-svg').style.display = '';
        bmCsPreviewCodeSvg.style.display = 'none';
        bmCsPreviewPath.setAttribute('stroke', c);
      }
    }

    // Close dropdown when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (!bmCollectionSelect.contains(e.target) && !bmCollectionDropdown.contains(e.target)) {
        bmCollectionDropdown.classList.remove('open');
        bmCollectionSelect.classList.remove('open');
      }
      if (!bmWritingIconBtn.contains(e.target) && !bmColorPopup.contains(e.target)) {
        bmColorPopup.classList.remove('open');
        bmWritingIconBtn.classList.remove('active');
      }
    });

    bmWritingIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = bmColorPopup.classList.contains('open');
      if (isOpen) {
        bmColorPopup.classList.remove('open');
        bmWritingIconBtn.classList.remove('active');
        return;
      }
      bmColorPopup.classList.add('open');
      bmWritingIconBtn.classList.add('active');
      const rect = bmWritingIconBtn.getBoundingClientRect();
      const pw = bmColorPopup.offsetWidth || 260;
      const ph = bmColorPopup.offsetHeight || 400;
      // Position to the right of the button
      let x = rect.right + 8;
      let y = rect.top;
      // If overflows right edge, flip to left of button
      if (x + pw > window.innerWidth - 8) x = rect.left - pw - 8;
      // If overflows bottom, clamp up
      if (y + ph > window.innerHeight - 8) y = window.innerHeight - ph - 8;
      if (y < 8) y = 8;
      bmColorPopup.style.left = x + 'px';
      bmColorPopup.style.top  = y + 'px';
    });

    let bmSelectedIconSrc = null;
    const bmWritingIconImg   = document.getElementById('bm-writing-icon-img');
    const bmCsPvCustomIcon   = document.getElementById('bm-cs-pv-custom-icon');

    function applyCustomIcon(src) {
      bmSelectedIconSrc = src;
      // Writing icon button
      bmWritingIconImg.src = src;
      bmWritingIconImg.style.display = '';
      document.getElementById('bm-writing-icon-svg').style.display = 'none';
      document.getElementById('bm-writing-code-svg').style.display = 'none';
      // Preview card icon
      bmCsPvCustomIcon.src = src;
      bmCsPvCustomIcon.style.display = '';
      document.getElementById('bm-cs-preview-svg').style.display = 'none';
      document.getElementById('bm-cs-preview-code-svg').style.display = 'none';
    }

    function clearCustomIcon() {
      bmSelectedIconSrc = null;
      bmWritingIconImg.style.display = 'none';
      bmCsPvCustomIcon.style.display = 'none';
    }

    // SVG filter for icon colorization — repaints black PNG icons to the selected color
    const iconFilterSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconFilterSvg.setAttribute('style', 'display:none;position:absolute');
    iconFilterSvg.innerHTML = `<defs><filter id="bm-icon-color-filter" color-interpolation-filters="sRGB"><feColorMatrix id="bm-icon-color-matrix" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter></defs>`;
    document.body.appendChild(iconFilterSvg);

    function applyIconColorFilter(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      document.getElementById('bm-icon-color-matrix')?.setAttribute(
        'values', `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1 0`
      );
      bmColorPopup.querySelectorAll('.bm-cs-icon-btn img').forEach(img => {
        img.style.filter = 'url(#bm-icon-color-filter)';
      });
      if (bmCsPvCustomIcon) bmCsPvCustomIcon.style.filter = 'url(#bm-icon-color-filter)';
      if (bmWritingIconImg) bmWritingIconImg.style.filter = 'url(#bm-icon-color-filter)';
    }

    function applyTextPreviewBg(hex) {
      const previewBox = document.getElementById('bm-preview-box');
      if (!previewBox) return;
      const isBlack = hex.toLowerCase() === '#181818';
      if (isBlack) {
        previewBox.style.background = '';
      } else {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const lr = Math.round(255 - (255 - r) * 0.08);
        const lg = Math.round(255 - (255 - g) * 0.08);
        const lb = Math.round(255 - (255 - b) * 0.08);
        previewBox.style.background = `rgb(${lr}, ${lg}, ${lb})`;
      }
    }

    bmColorPopup.querySelectorAll('.bm-cs-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = dot.dataset.color;
        bmColorPopup.querySelectorAll('.bm-cs-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        bmSelectedColor = color;
        bmWritingIconPath.setAttribute('stroke', color);
        bmCsPreviewPath.setAttribute('stroke', color);
        bmWritingCodePath.setAttribute('fill', color);
        bmCsPreviewCodePath.setAttribute('fill', color);
        applyIconColorFilter(color);
        applyTextPreviewBg(color);
      });
    });

    bmColorPopup.querySelectorAll('.bm-cs-icon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        bmColorPopup.querySelectorAll('.bm-cs-icon-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        applyCustomIcon(btn.dataset.icon);
      });
    });

    // Wire "Bookmark" cap to open the modal with saved selection
    document.querySelector('.popup-cap-right').addEventListener('click', () => {
      popup.classList.remove('visible');
      let prefill = null;
      if (isEditMode && currentEditBmId != null) {
        const bm = fnBookmarks.find(b => b.id === currentEditBmId);
        if (bm) prefill = { title: bm.title, color: bm.color, iconPath: bm.iconPath };
      }
      openBookmarkModal(lastSelectedText, prefill);
      if (isEditMode) isEditMode = false;
    });

    // ── Pre-filled conversation ────────────────────────────────────────────────
    const PREFILLED_PROMPTS = [
      "I'm taking about a design challenge",
      "I like conversation health, is this something worth exploring as a feature?",
      "think of other tools that have solutions for this kind of problem",
      "Overview",
      "what is an adjacent project that I could look at for reference or inspiration?",
      "Nah i like the conversation health thing",
      "can you write a fibonacci sequence in python",
      "when does that side navigation with the conversation history get useful?",
      "would it make sense to add a toggle there for bookmarks vs chats?",
      "im thinking that the current thing that the right panel shows is the list of prompts in the conversation",
      "wait so in the default view when that line shows up on the right, what does it show?"
    ];

    const PREFILLED_RESPONSES = [
      // 0
      "That sounds interesting! Design challenges are a great way to push creative thinking and surface real constraints.\n\nWhat's the core problem you're working through — is it a UX problem, a visual design challenge, or something more systemic in how a product works? Also curious whether this is for an existing product or a greenfield concept.",
      // 1
      "Conversation health is actually a really compelling design space. It refers to how well a conversation serves its participants over time — whether it stays focused, productive, and meaningful rather than fragile, overwhelming, or lost in noise.\n\nFor a product like ChatGPT, it could mean:\n\n**Depth tracking** — understanding when a conversation is going somewhere versus spinning in circles.\n\n**Insight surfacing** — automatically identifying the most valuable responses in a long thread so they don't get buried.\n\n**Navigation affordances** — giving users lightweight tools to jump around, bookmark, and annotate without breaking the flow of the conversation.\n\n**Agency over retention** — letting users decide what to keep, what to discard, and what to revisit later.\n\nIt's absolutely worth exploring — especially as AI conversations grow longer and more complex. The problem compounds fast: a chat that spans 40 exchanges becomes nearly unusable without some structure.",
      // 2
      "Great instinct to look at analogues. A few tools that tackle similar problems:\n\n**Notion** — treats notes as a structured, revisitable knowledge base rather than a linear thread. The key insight is that information should be addressable, not just scrollable.\n\n**Readwise** — resurfaces highlights from books and articles on a scheduled cadence so insights actually stick over time. The resurfacing mechanic is underexplored in chat.\n\n**Roam Research** — bidirectional linking lets you connect related ideas across time and context, so the graph of what you've learned becomes queryable.\n\n**Linear** — gives structure to open-ended async conversation in the form of issues, priorities, and statuses. It transforms a shapeless discussion into something actionable.\n\n**Slack Bookmarks** — lightweight pinning inside a channel to surface key messages without leaving the conversation context.\n\nThe common thread: they all fight against information entropy in long-running conversations. None of them fully solve it for AI chat, which is the gap you're designing into.",
      // 3
      "Here's an overview of the conversation health design space:\n\n**Problem:** As AI conversations grow longer, valuable responses get buried under layers of back-and-forth. There's no native way to navigate, reference, or reuse content from earlier in a chat without scrolling manually.\n\n**Opportunity:** Build lightweight tools into the conversation UI itself — not in a separate notes app — that let users bookmark, annotate, and navigate their conversation like a living document.\n\n**Core features to consider:**\n\n**Response bookmarking** — save specific AI outputs with a single click, accessible from a persistent panel.\n\n**Conversation table of contents** — a dynamic list of all user prompts that acts as chapter headings, letting you jump anywhere instantly.\n\n**Inline highlights** — select any passage of an AI response and save just that fragment, with context preserved.\n\n**Persistent side panel** — a right-side drawer that surfaces both the ToC and saved bookmarks, togglable without leaving the conversation.",
      // 4
      "A few adjacent projects worth studying:\n\n**Felt** — collaborative map-making with a strong information hierarchy model. What's interesting is how they layer context on top of a primary artifact without cluttering it.\n\n**Artifact (by Yahoo News)** — treats articles as objects to collect and annotate. The core mechanic is that content becomes a persistent object in your library, not a page you visited and forgot.\n\n**Mem.ai** — AI-powered notes that surface relevant past context automatically. It tries to reduce the tax of organizing by making retrieval ambient.\n\n**Rewind** — passive capture of everything you've seen on screen, queryable later. Bold bet on the idea that capture should be automatic, not deliberate.\n\nThe most relevant pattern here is **Artifact + Readwise**: both assume that the value of content compounds over time, and both build retrieval and highlighting into the core reading experience rather than leaving it to the user to copy-paste into another tool. That's the design posture you want for conversation health.",
      // 5
      "Sticking with conversation health is the right call. It's differentiated, it's directly tied to ChatGPT's core use case, and it solves a real pain point that grows more acute the longer someone uses the product.\n\nThe adjacent tools are useful for pattern inspiration, but the specific problem of navigating and retaining value from AI chat conversations is relatively unexplored territory — most tools treat chat as ephemeral, not as a knowledge asset. That's the opening.\n\nThe other reason it's worth pursuing: it has a clear success metric. Right now, if someone asks \"where did ChatGPT explain X to me last week?\" the answer is essentially \"good luck scrolling.\" A healthy conversation UI should make that retrieval instant and obvious.",
      // 6 — Fibonacci (code block)
      "Sure! Here's a clean iterative implementation:\n\n```python\ndef fibonacci(n):\n    \"\"\"Return the first n numbers in the Fibonacci sequence.\"\"\"\n    a, b = 0, 1\n    sequence = []\n    for _ in range(n):\n        sequence.append(a)\n        a, b = b, a + b\n    return sequence\n\n# Generate the first 10 Fibonacci numbers\nresult = fibonacci(10)\nprint(result)\n```\n\n**Output:**\n\n```\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n```\n\nThis uses an iterative approach — O(n) time, O(n) space. It's the most readable version. If you need a recursive version, a generator, or a memoized approach, let me know and I can show those too.",
      // 7
      "The side navigation becomes most useful once a conversation has enough content that scrolling becomes friction — typically around 5–8 exchanges in. At that point there are two distinct use cases:\n\n**Jump back** — the user remembers a specific response from earlier (a definition, a code snippet, a recommendation) but can't locate it without scrolling through everything above.\n\n**Pick up a thread** — the conversation covered multiple topics, and the user wants to return to one of them without losing their place in the current one.\n\nThe conversation history in the left sidebar helps you find the right *chat*, but once you're inside a long chat, you need a secondary navigation layer for moving *within* it. That's the gap the side nav fills — it's essentially a table of contents that builds itself as you talk.",
      // 8
      "Yes, a toggle between bookmarks and prompts inside the side panel makes a lot of sense. Here's the reasoning:\n\n**Prompts view** — shows all the user's messages as a table of contents, letting you jump to any point in the conversation. This is always populated and immediately useful from the very first exchange.\n\n**Bookmarks view** — shows only the responses the user has explicitly saved. This is more curated and personally meaningful — it's the \"highlights reel\" of the conversation.\n\nThe toggle lets the panel serve two distinct navigation modes without needing two separate surfaces. The prompts view is the sensible default because it's always available; bookmarks is opt-in and grows in value the more the user engages with the product.\n\nDesign-wise, you'd want the toggle to be fixed at the top of the panel so it's always reachable regardless of how far down the list has scrolled.",
      // 9
      "Exactly — showing the list of user prompts is the cleanest default for the panel. Each prompt acts as a chapter heading for the conversation, giving you an at-a-glance overview of everything you've discussed.\n\nIt's like a table of contents where you wrote all the chapter names yourself. The structure emerges naturally from the conversation without any extra work from the user.\n\nClicking any entry should smooth-scroll to that point in the conversation — similar to how an anchor link works on a long webpage. The panel stays visible while you read, so you can jump again without re-opening anything.",
      // 10
      "In the default collapsed state, the panel shows just a few thin horizontal lines — a minimal visual hint that navigation is available without interrupting the reading experience. It's intentionally understated at rest.\n\nOn hover, it expands to reveal the full prompt list. This two-state design keeps the UI clean for users who don't need navigation while making the feature immediately discoverable for those who do — no settings, no onboarding required.\n\nThe lines themselves are a deliberate choice: they echo the idea of a document outline or a text stacking effect, hinting at the structured list underneath without spelling it out explicitly."
    ];

    const PHOTO_PROMPTS = [
      "can you give me an overview of photosynthesis",
      "where does this process take place in the plant?",
      "what are the two main stages?",
      "can you give me the overall equation?",
      "why is this so important to life on earth?"
    ];

    const PHOTO_RESPONSES = [
      "Photosynthesis is the biological process by which plants, algae, and certain bacteria convert light energy — primarily from the sun — into chemical energy stored as glucose.\n\nIt's the foundational energy-conversion process for most of life on Earth, sitting at the base of virtually every food chain.",
      "The process takes place in the **chloroplasts** — specialized organelles found in plant cells. Inside each chloroplast is a green pigment called **chlorophyll**, which is responsible for capturing light energy.\n\nChlorophyll absorbs red and blue wavelengths of light most efficiently, which is why plants appear green to us — the green light is reflected rather than absorbed.",
      "Photosynthesis unfolds in two interconnected stages:\n\n**Light-dependent reactions** — These occur in the thylakoid membranes inside the chloroplast. Sunlight drives the splitting of water molecules (H₂O), releasing oxygen (O₂) as a byproduct. This stage generates ATP and NADPH, the energy carriers passed to the next stage.\n\n**The Calvin Cycle** (light-independent reactions) — This takes place in the stroma. It uses the ATP and NADPH from stage one to fix carbon dioxide (CO₂) from the atmosphere and convert it into glucose (C₆H₁₂O₆).",
      "The overall chemical equation is:\n\n**6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂**\n\nIn plain terms: six molecules of carbon dioxide and six molecules of water, powered by light, are converted into one molecule of glucose and six molecules of oxygen gas.",
      "Photosynthesis is essential to life on Earth for two reasons:\n\n**Oxygen production** — The oxygen in our atmosphere is almost entirely a byproduct of photosynthetic organisms. Every breath we take depends on it.\n\n**Energy base of food chains** — By converting solar energy into chemical energy (glucose), photosynthetic organisms create the primary energy source that flows through every ecosystem."
    ];

    function escHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    function renderMdInline(text) {
      return escHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    const SVG_CODE_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="#0D0D0D"/></svg>`;

    const SVG_COPY_ICON = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.668 10.667C12.668 9.95696 12.668 9.46296 12.637 9.07896C12.6263 8.86991 12.5883 8.66316 12.524 8.46396L12.469 8.33396C12.3151 8.0328 12.0812 7.77988 11.793 7.60296L11.666 7.53096C11.508 7.45096 11.296 7.39396 10.921 7.36296C10.537 7.33196 10.044 7.33196 9.33296 7.33196H6.49996C5.78896 7.33196 5.29596 7.33196 4.91196 7.36296C4.70291 7.37365 4.49616 7.41164 4.29696 7.47596L4.16696 7.53096C3.8658 7.68484 3.61288 7.91873 3.43596 8.20696L3.36596 8.33396C3.28496 8.49196 3.22796 8.70396 3.19696 9.07896C3.16596 9.46296 3.16496 9.95596 3.16496 10.667V13.5C3.16496 14.211 3.16496 14.704 3.19696 15.088C3.22796 15.464 3.28496 15.675 3.36496 15.833L3.43496 15.959C3.61196 16.247 3.86496 16.481 4.16696 16.635L4.29696 16.691C4.44096 16.743 4.62996 16.78 4.91196 16.803C5.29596 16.834 5.78896 16.835 6.49996 16.835H9.33296C10.043 16.835 10.537 16.835 10.921 16.803C11.297 16.772 11.508 16.715 11.666 16.635L11.793 16.565C12.08 16.388 12.315 16.135 12.469 15.833L12.524 15.703C12.576 15.559 12.614 15.37 12.637 15.088C12.668 14.704 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.453 12.663 14.801 12.66 15.088 12.637C15.464 12.606 15.675 12.549 15.833 12.469L15.959 12.398C16.247 12.221 16.481 11.968 16.635 11.666L16.691 11.536C16.7549 11.3367 16.7926 11.13 16.803 10.921C16.834 10.537 16.835 10.044 16.835 9.33296V6.49996C16.835 5.78896 16.835 5.29596 16.803 4.91196C16.7926 4.70296 16.7549 4.4962 16.691 4.29696L16.635 4.16696C16.4811 3.8658 16.2472 3.61288 15.959 3.43596L15.833 3.36596C15.675 3.28496 15.463 3.22796 15.088 3.19696C14.704 3.16596 14.211 3.16496 13.5 3.16496H10.667C9.95696 3.16496 9.46296 3.16596 9.07896 3.19696C8.79696 3.21996 8.60796 3.25696 8.46396 3.30896L8.33396 3.36496C8.0328 3.51884 7.77988 3.75273 7.60296 4.04096L7.53096 4.16696C7.45096 4.32496 7.39396 4.53696 7.36296 4.91196C7.33996 5.19896 7.33596 5.54696 7.33396 6.00196H9.33296C10.022 6.00196 10.579 6.00196 11.029 6.03796C11.487 6.07596 11.894 6.15496 12.271 6.34696L12.488 6.46896C12.984 6.77296 13.388 7.20896 13.653 7.72896L13.72 7.87196C13.864 8.20896 13.93 8.56996 13.962 8.97096C13.999 9.42096 13.998 9.97796 13.998 10.667V12.665ZM18.165 9.33296C18.165 10.022 18.165 10.579 18.129 11.029C18.096 11.43 18.031 11.791 17.887 12.128L17.82 12.271C17.555 12.791 17.15 13.227 16.655 13.531L16.436 13.653C16.06 13.845 15.654 13.924 15.196 13.962C14.859 13.989 14.462 13.993 13.996 13.995C13.993 14.462 13.989 14.859 13.962 15.196C13.929 15.597 13.864 15.958 13.72 16.294L13.653 16.436C13.388 16.958 12.984 17.394 12.488 17.698L12.271 17.82C11.894 18.012 11.487 18.091 11.029 18.129C10.579 18.166 10.022 18.165 9.33296 18.165H6.49996C5.80996 18.165 5.25396 18.165 4.80396 18.129C4.40396 18.096 4.04196 18.031 3.70596 17.887L3.56296 17.82C3.04347 17.555 2.60714 17.1519 2.30196 16.655L2.17996 16.436C1.98796 16.06 1.90896 15.654 1.87096 15.196C1.83396 14.746 1.83496 14.189 1.83496 13.5V10.667C1.83496 9.97796 1.83496 9.42096 1.87096 8.97096C1.90896 8.51296 1.98796 8.10596 2.17996 7.72896L2.30196 7.51196C2.60596 7.01596 3.04196 6.61196 3.56296 6.34696L3.70596 6.27996C4.04196 6.13596 4.40296 6.06996 4.80396 6.03796C5.14096 6.01096 5.53696 6.00596 6.00396 6.00396C6.00596 5.53696 6.01096 5.14096 6.03796 4.80396C6.07496 4.34596 6.15496 3.93996 6.34696 3.56396L6.46896 3.34396C6.77296 2.84896 7.20896 2.44496 7.72896 2.17996L7.87196 2.11296C8.20896 1.96896 8.56996 1.90296 8.97096 1.87096C9.42096 1.83396 9.97796 1.83496 10.667 1.83496H13.5C14.19 1.83496 14.746 1.83496 15.196 1.87096C15.654 1.90896 16.06 1.98796 16.436 2.17996L16.656 2.30196C17.151 2.60596 17.555 3.04196 17.82 3.56296L17.887 3.70596C18.031 4.04196 18.097 4.40296 18.129 4.80396C18.166 5.25396 18.165 5.81096 18.165 6.49996V9.33296Z" fill="#0D0D0D"/></svg>`;

    const SVG_RUN_ICON = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.95996 5.22608C4.95996 3.70508 6.64996 2.79108 7.92296 3.62408L15.222 8.39608C15.4883 8.57017 15.7071 8.8079 15.8586 9.08778C16.01 9.36766 16.0893 9.68086 16.0893 9.99908C16.0893 10.3173 16.01 10.6305 15.8586 10.9104C15.7071 11.1903 15.4883 11.428 15.222 11.6021L7.92196 16.3751C6.64896 17.2071 4.95996 16.2931 4.95996 14.7711V5.22608ZM6.28996 14.7711C6.28996 15.2361 6.80596 15.5161 7.19496 15.2611L14.495 10.4891C14.5765 10.4359 14.6434 10.3633 14.6898 10.2777C14.7361 10.1922 14.7604 10.0964 14.7604 9.99908C14.7604 9.90177 14.7361 9.806 14.6898 9.72044C14.6434 9.63488 14.5765 9.56224 14.495 9.50908L7.19496 4.73708C7.10669 4.6794 7.00446 4.64665 6.8991 4.6423C6.79374 4.63795 6.68916 4.66216 6.59643 4.71236C6.5037 4.76257 6.42626 4.83691 6.37231 4.92752C6.31836 5.01812 6.28991 5.12163 6.28996 5.22708V14.7711Z" fill="#0D0D0D"/></svg>`;

    function highlightPython(code) {
      const KW = new Set(['def','for','in','return','if','else','elif','while','import','from','class','try','except','finally','with','as','pass','break','continue','not','and','or','is','lambda','yield','True','False','None','del','raise','global','nonlocal','assert','print']);
      let out = '';
      let i = 0;
      while (i < code.length) {
        // Triple-quoted string
        if ((code[i] === '"' || code[i] === "'") && code.startsWith(code[i].repeat(3), i)) {
          const q = code[i].repeat(3);
          let j = i + 3;
          while (j < code.length && !code.startsWith(q, j)) j++;
          j += 3;
          out += `<span style="color:#B9480D">${escHtml(code.slice(i, j))}</span>`;
          i = j; continue;
        }
        // Single/double quoted string
        if (code[i] === '"' || code[i] === "'") {
          const q = code[i];
          let j = i + 1;
          while (j < code.length && code[j] !== q && code[j] !== '\n') {
            if (code[j] === '\\') j++;
            j++;
          }
          j++;
          out += `<span style="color:#B9480D">${escHtml(code.slice(i, j))}</span>`;
          i = j; continue;
        }
        // Comment
        if (code[i] === '#') {
          let j = i;
          while (j < code.length && code[j] !== '\n') j++;
          out += `<span style="color:#888;font-style:italic">${escHtml(code.slice(i, j))}</span>`;
          i = j; continue;
        }
        // Number
        if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i+1]||''))) {
          let j = i;
          while (j < code.length && /[0-9._eExXbBoOjJ]/.test(code[j])) j++;
          out += `<span style="color:#B9480D">${escHtml(code.slice(i, j))}</span>`;
          i = j; continue;
        }
        // Identifier / keyword
        if (/[a-zA-Z_]/.test(code[i])) {
          let j = i;
          while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
          const word = code.slice(i, j);
          const color = KW.has(word) ? '#BA437A' : '#6B3AB4';
          out += `<span style="color:${color}">${escHtml(word)}</span>`;
          i = j; continue;
        }
        out += escHtml(code[i]);
        i++;
      }
      return out;
    }

    function buildCodeBlock(lang, code) {
      const wrap = document.createElement('div');
      wrap.className = 'code-block';
      const cleanCode = code.replace(/^\n/, '').replace(/\n$/, '');
      const langLabel = lang.trim() || 'code';
      wrap.innerHTML = `
        <div class="code-block-header">
          <span class="code-block-lang">${SVG_CODE_ICON}${escHtml(langLabel)}</span>
          <div class="code-block-actions">
            <button class="code-icon-btn code-copy-btn" title="Copy code">${SVG_COPY_ICON}</button>
            <button class="code-icon-btn code-bm-btn" title="Bookmark code">${SVG_CODE_BM_BTN}</button>
            <button class="code-run-btn" title="Run code">${SVG_RUN_ICON}Run</button>
          </div>
        </div>
        <div class="code-block-body"><code>${lang === 'python' ? highlightPython(cleanCode) : escHtml(cleanCode)}</code></div>`;
      wrap.querySelector('.code-copy-btn').addEventListener('click', function() {
        navigator.clipboard.writeText(cleanCode).catch(() => {});
        this.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#0D0D0D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        setTimeout(() => { this.innerHTML = SVG_COPY_ICON; }, 2000);
      });
      wrap.querySelector('.code-bm-btn').addEventListener('click', function() {
        pendingCodeBmBtn = this;
        // Check if user has text selected within this code block
        const sel = window.getSelection();
        const codeEl = wrap.querySelector('code');
        let usedSelection = false;
        if (sel && !sel.isCollapsed && sel.toString().trim()) {
          try {
            const range = sel.getRangeAt(0);
            const node = range.commonAncestorContainer;
            const el = node.nodeType === 3 ? node.parentElement : node;
            if (el.closest('.code-block-body') === wrap.querySelector('.code-block-body')) {
              const frag = range.cloneContents();
              const tmp = document.createElement('div');
              tmp.appendChild(frag);
              bmCodeHtml = tmp.innerHTML;
              lastSelectedText = sel.toString().trim();
              usedSelection = true;
            }
          } catch (_) {}
        }
        if (!usedSelection) {
          // Bookmark entire code block
          bmCodeHtml = codeEl ? codeEl.innerHTML : escHtml(cleanCode);
          lastSelectedText = cleanCode;
        }
        bmIsCode = true;
        lastBookmarkedMsg = null;
        bookmarkRange = null;
        bookmarkFirstPara = null;
        bookmarkLastPara = null;
        forceFullBookmark = false;
        isEditMode = false;
        currentEditBmId = null;
        openBookmarkModal(lastSelectedText);
      });
      return wrap;
    }
    function renderResponse(responseStr, container) {
      // Split on fenced code blocks: ```lang\n...\n```
      const parts = responseStr.split(/(```[^\n]*\n[\s\S]*?```)/g);
      parts.forEach(part => {
        const codeMatch = part.match(/^```([^\n]*)\n([\s\S]*?)```$/);
        if (codeMatch) {
          container.appendChild(buildCodeBlock(codeMatch[1].trim(), codeMatch[2]));
        } else {
          part.split(/\n\n+/).forEach(para => {
            if (!para.trim()) return;
            const trimmed = para.trim();
            let el;
            if (trimmed === '---') {
              el = document.createElement('hr');
              el.className = 'ai-hr';
            } else if (trimmed.startsWith('# ')) {
              el = document.createElement('p');
              el.className = 'ai-para ai-heading-1';
              el.innerHTML = renderMdInline(trimmed.slice(2));
            } else if (trimmed.startsWith('## ')) {
              el = document.createElement('p');
              el.className = 'ai-para ai-heading-2';
              el.innerHTML = renderMdInline(trimmed.slice(3));
            } else if (trimmed.startsWith('### ')) {
              el = document.createElement('p');
              el.className = 'ai-para ai-heading';
              el.innerHTML = renderMdInline(trimmed.slice(4));
            } else if (/^[*\-] /.test(trimmed)) {
              el = document.createElement('ul');
              el.className = 'ai-para ai-list';
              trimmed.split('\n').forEach(line => {
                const text = line.trim().replace(/^[*\-] /, '');
                if (!text) return;
                const li = document.createElement('li');
                li.innerHTML = renderMdInline(text);
                el.appendChild(li);
              });
            } else {
              el = document.createElement('p');
              el.className = 'ai-para';
              el.innerHTML = renderMdInline(trimmed);
            }
            container.appendChild(el);
          });
        }
      });
    }

    function loadConversation(convId) {
      // Save current conversation's bookmarks
      if (activeConvId) {
        convData[activeConvId].bookmarks = fnBookmarks.slice();
      }

      // Switch active conversation
      activeConvId = convId;
      const conv = convData[convId];
      activeConvPrompts = conv.prompts;

      // Swap fnBookmarks contents without breaking existing references
      fnBookmarks.length = 0;
      conv.bookmarks.forEach(b => fnBookmarks.push(b));

      // Update sidebar active state
      document.querySelectorAll('.nav-row, .history-item').forEach(el => el.classList.remove('active'));
      const sidebarEl = document.querySelector(`.history-item[data-prefilled="${convId}"]`);
      if (sidebarEl) sidebarEl.classList.add('active');

      // Clear existing badge groups from old conversation
      document.querySelectorAll('.bm-badge-group').forEach(el => el.remove());

      // Rebuild conversation messages
      messagesInner.innerHTML = '';
      conv.prompts.forEach((prompt, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'user-bubble-wrap';
        wrap.id = `msg-${i}`;
        const bubble = document.createElement('div');
        bubble.className = 'user-bubble';
        bubble.textContent = prompt;
        wrap.appendChild(bubble);
        messagesInner.appendChild(wrap);

        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        const textEl = document.createElement('div');
        textEl.className = 'ai-text';
        renderResponse(conv.responses[i], textEl);
        aiMsg.appendChild(textEl);

        const actionsEl = createResponseActions();
        actionsEl.classList.add('visible');
        aiMsg.appendChild(actionsEl);
        messagesInner.appendChild(aiMsg);
      });

      // Switch to chat view
      landing.style.display = 'none';
      chatView.classList.add('active');
      landingTopbarActions.style.display = 'none';
      chatTopbarActions.classList.add('active');
      inChat = true;

      // Show floating nav (hidden for Daily Briefing conversation)
      if (activeConvId !== 3) {
        fnLines.classList.add('active');
        fnCard.classList.add('active');
      } else {
        fnLines.classList.remove('active');
        fnCard.classList.remove('active');
      }
      bmTtHideAll();

      // Inject prefilled bookmarks for Daily Briefing (conv 3)
      if (convId === 3 && fnBookmarks.length === 0) {
        // Helper: create one prefilled bookmark
        function addPrefilled(para, quoteStart, quoteEnd, title, color, iconSrc, date) {
          if (!para) return;
          let selSpan = null;
          const w = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = w.nextNode())) {
            const idx = n.textContent.indexOf(quoteStart);
            if (idx !== -1) {
              const endTxt = quoteEnd || quoteStart;
              const endIdx = n.textContent.indexOf(endTxt, idx);
              const end = endIdx !== -1 ? endIdx + endTxt.length : Math.min(idx + quoteStart.length, n.textContent.length);
              try {
                const r = document.createRange();
                r.setStart(n, idx);
                r.setEnd(n, end);
                selSpan = document.createElement('span');
                r.surroundContents(selSpan);
              } catch(e) { selSpan = null; }
              break;
            }
          }
          let grp = para.querySelector(':scope > .bm-badge-group');
          if (!grp) { grp = document.createElement('span'); grp.className = 'bm-badge-group'; para.appendChild(grp); }
          const bid = nextBmId++;
          const badge = document.createElement('span');
          badge.className = 'bm-badge'; badge.dataset.bmId = bid; badge.style.background = '#fff';
          const fid = `bm-badge-filter-${bid}`;
          const fr = parseInt(color.slice(1,3),16)/255;
          const fg = parseInt(color.slice(3,5),16)/255;
          const fb = parseInt(color.slice(5,7),16)/255;
          const fsvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fsvg.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fsvg.innerHTML = `<defs><filter id="${fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr} 0 0 0 0 ${fg} 0 0 0 0 ${fb} 0 0 0 1 0"/></filter></defs>`;
          badge.appendChild(fsvg);
          const img = document.createElement('img');
          img.src = iconSrc; img.style.filter = `url(#${fid})`; img.width = 15; img.height = 15;
          badge.appendChild(img);
          grp.appendChild(badge);
          attachHighlightTooltip(badge);
          fnBookmarks.push({ id: bid, title, color, iconPath: null, iconSrc, type: 'text', collection: null, createdAt: date, lastPara: para, selectionSpan: selSpan });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        const SONOS_QUOTE = 'Sonos is treating the home audio system as one continuous interface rather than a set of separate devices';
        const PINK = '#F06292';
        const AUDIO_SRC = '/icons/bookmark-icons/Audio.png';
        // Find the paragraph containing the Sonos quote
        const paras = [...messagesInner.querySelectorAll('.ai-para')];
        const sonosPara = paras.find(p => p.textContent.includes('Sonos is treating'));
        if (sonosPara) {
          // Wrap just the quote text in a selection span
          let selSpan = null;
          const walker = document.createTreeWalker(sonosPara, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const idx = node.textContent.indexOf('Sonos is treating');
            if (idx !== -1) {
              const endIdx = node.textContent.indexOf('devices', idx) + 'devices'.length;
              if (endIdx > idx) {
                const range = document.createRange();
                range.setStart(node, idx);
                range.setEnd(node, Math.min(endIdx, node.textContent.length));
                try {
                  selSpan = document.createElement('span');
                  range.surroundContents(selSpan);
                } catch(e) { selSpan = null; }
              }
              break;
            }
          }
          // Create badge group + badge
          let group = sonosPara.querySelector(':scope > .bm-badge-group');
          if (!group) {
            group = document.createElement('span');
            group.className = 'bm-badge-group';
            sonosPara.appendChild(group);
          }
          const bmId = nextBmId++;
          const badge = document.createElement('span');
          badge.className = 'bm-badge';
          badge.dataset.bmId = bmId;
          badge.style.background = '#fff';
          // Custom image icon with color filter
          const filterId = `bm-badge-filter-${bmId}`;
          const fr = parseInt(PINK.slice(1,3),16)/255;
          const fg = parseInt(PINK.slice(3,5),16)/255;
          const fb = parseInt(PINK.slice(5,7),16)/255;
          const fSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvg.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvg.innerHTML = `<defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr}  0 0 0 0 ${fg}  0 0 0 0 ${fb}  0 0 0 1 0"/></filter></defs>`;
          badge.appendChild(fSvg);
          const img = document.createElement('img');
          img.src = AUDIO_SRC;
          img.style.filter = `url(#${filterId})`;
          img.width = 15; img.height = 15;
          badge.appendChild(img);
          group.appendChild(badge);
          attachHighlightTooltip(badge);
          // Push bookmark data
          fnBookmarks.push({
            id: bmId,
            title: 'Designing across ecosystems',
            color: PINK,
            iconPath: null,
            iconSrc: AUDIO_SRC,
            type: 'text',
            collection: 'Design & UX',
            createdAt: new Date('2026-06-03T10:00:00'),
            lastPara: sonosPara,
            selectionSpan: selSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Gesture-Based Control (same sonosPara)
        if (sonosPara) {
          const HAND_RED = '#E53935';
          const HAND_SRC = '/icons/bookmark-icons/HandBell.png';
          let gestureSelSpan = null;
          const gestureWalker = document.createTreeWalker(sonosPara, NodeFilter.SHOW_TEXT);
          let gn;
          while ((gn = gestureWalker.nextNode())) {
            const idx = gn.textContent.indexOf('a virtual two-finger volume control');
            if (idx !== -1) {
              try {
                const r = document.createRange();
                r.setStart(gn, idx);
                r.setEnd(gn, idx + 'a virtual two-finger volume control'.length);
                gestureSelSpan = document.createElement('span');
                r.surroundContents(gestureSelSpan);
              } catch(e) { gestureSelSpan = null; }
              break;
            }
          }
          const gestureGroup = sonosPara.querySelector(':scope > .bm-badge-group');
          const bmIdG = nextBmId++;
          const badgeG = document.createElement('span');
          badgeG.className = 'bm-badge';
          badgeG.dataset.bmId = bmIdG;
          badgeG.style.background = '#fff';
          const filterIdG = `bm-badge-filter-${bmIdG}`;
          const frG = parseInt(HAND_RED.slice(1,3),16)/255;
          const fgG = parseInt(HAND_RED.slice(3,5),16)/255;
          const fbG = parseInt(HAND_RED.slice(5,7),16)/255;
          const fSvgG = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvgG.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvgG.innerHTML = `<defs><filter id="${filterIdG}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${frG}  0 0 0 0 ${fgG}  0 0 0 0 ${fbG}  0 0 0 1 0"/></filter></defs>`;
          badgeG.appendChild(fSvgG);
          const imgG = document.createElement('img');
          imgG.src = HAND_SRC;
          imgG.style.filter = `url(#${filterIdG})`;
          imgG.width = 15; imgG.height = 15;
          badgeG.appendChild(imgG);
          if (gestureGroup) gestureGroup.appendChild(badgeG);
          attachHighlightTooltip(badgeG);
          fnBookmarks.push({
            id: bmIdG, title: 'Gesture-Based Control', color: HAND_RED, iconPath: null, iconSrc: HAND_SRC,
            type: 'text', collection: 'Design & UX', createdAt: new Date('2026-05-20T10:00:00'),
            lastPara: sonosPara, selectionSpan: gestureSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Model-agnostic AI (same sonosPara)
        if (sonosPara) {
          const QAI_SRC = '/icons/bookmark-icons/Quickai.png';
          const MODEL_GREEN = '#43A047';
          let modelSelSpan = null;
          const modelWalker = document.createTreeWalker(sonosPara, NodeFilter.SHOW_TEXT);
          let mn;
          while ((mn = modelWalker.nextNode())) {
            const idx = mn.textContent.indexOf('support for third-party models');
            if (idx !== -1) {
              const endText = 'Gemini';
              const endIdx = mn.textContent.indexOf(endText, idx);
              const end = endIdx !== -1 ? endIdx + endText.length : idx + 60;
              try {
                const r = document.createRange();
                r.setStart(mn, idx);
                r.setEnd(mn, Math.min(end, mn.textContent.length));
                modelSelSpan = document.createElement('span');
                r.surroundContents(modelSelSpan);
              } catch(e) { modelSelSpan = null; }
              break;
            }
          }
          const modelGroup = sonosPara.querySelector(':scope > .bm-badge-group');
          const bmIdM = nextBmId++;
          const badgeM = document.createElement('span');
          badgeM.className = 'bm-badge';
          badgeM.dataset.bmId = bmIdM;
          badgeM.style.background = '#fff';
          const filterIdM = `bm-badge-filter-${bmIdM}`;
          const frM = parseInt(MODEL_GREEN.slice(1,3),16)/255;
          const fgM = parseInt(MODEL_GREEN.slice(3,5),16)/255;
          const fbM = parseInt(MODEL_GREEN.slice(5,7),16)/255;
          const fSvgM = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvgM.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvgM.innerHTML = `<defs><filter id="${filterIdM}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${frM}  0 0 0 0 ${fgM}  0 0 0 0 ${fbM}  0 0 0 1 0"/></filter></defs>`;
          badgeM.appendChild(fSvgM);
          const imgM = document.createElement('img');
          imgM.src = QAI_SRC;
          imgM.style.filter = `url(#${filterIdM})`;
          imgM.width = 15; imgM.height = 15;
          badgeM.appendChild(imgM);
          if (modelGroup) modelGroup.appendChild(badgeM);
          attachHighlightTooltip(badgeM);
          fnBookmarks.push({
            id: bmIdM, title: 'Model-agnostic AI', color: MODEL_GREEN, iconPath: null, iconSrc: QAI_SRC,
            type: 'text', collection: 'AI Research', createdAt: new Date('2026-05-22T10:00:00'),
            lastPara: sonosPara, selectionSpan: modelSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Second prefilled bookmark: UX beyond the screen
        const UX_QUOTE = 'better user experiences increasingly depend on invisible hardware decisions';
        const GREEN = '#4CAF50';
        const BRAIN_SRC = '/icons/bookmark-icons/Brain1.png';
        const uxPara = paras.find(p => p.textContent.includes(UX_QUOTE));
        if (uxPara) {
          let uxSelSpan = null;
          const walker2 = document.createTreeWalker(uxPara, NodeFilter.SHOW_TEXT);
          let node2;
          while ((node2 = walker2.nextNode())) {
            const idx = node2.textContent.indexOf('better user experiences');
            if (idx !== -1) {
              const endText = 'local computation.';
              const endIdx = node2.textContent.indexOf(endText, idx);
              const end = endIdx !== -1 ? endIdx + endText.length : Math.min(idx + 120, node2.textContent.length);
              try {
                const range2 = document.createRange();
                range2.setStart(node2, idx);
                range2.setEnd(node2, end);
                uxSelSpan = document.createElement('span');
                range2.surroundContents(uxSelSpan);
              } catch(e) { uxSelSpan = null; }
              break;
            }
          }
          let group2 = uxPara.querySelector(':scope > .bm-badge-group');
          if (!group2) {
            group2 = document.createElement('span');
            group2.className = 'bm-badge-group';
            uxPara.appendChild(group2);
          }
          const bmId2 = nextBmId++;
          const badge2 = document.createElement('span');
          badge2.className = 'bm-badge';
          badge2.dataset.bmId = bmId2;
          badge2.style.background = '#fff';
          const filterId2 = `bm-badge-filter-${bmId2}`;
          const fr2 = parseInt(GREEN.slice(1,3),16)/255;
          const fg2 = parseInt(GREEN.slice(3,5),16)/255;
          const fb2 = parseInt(GREEN.slice(5,7),16)/255;
          const fSvg2 = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvg2.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvg2.innerHTML = `<defs><filter id="${filterId2}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr2}  0 0 0 0 ${fg2}  0 0 0 0 ${fb2}  0 0 0 1 0"/></filter></defs>`;
          badge2.appendChild(fSvg2);
          const img2 = document.createElement('img');
          img2.src = BRAIN_SRC;
          img2.style.filter = `url(#${filterId2})`;
          img2.width = 15; img2.height = 15;
          badge2.appendChild(img2);
          group2.appendChild(badge2);
          attachHighlightTooltip(badge2);
          fnBookmarks.push({
            id: bmId2,
            title: 'UX beyond the screen',
            color: GREEN,
            iconPath: null,
            iconSrc: BRAIN_SRC,
            type: 'text',
            collection: 'Design & UX',
            createdAt: new Date('2026-07-04T10:00:00'),
            lastPara: uxPara,
            selectionSpan: uxSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Third prefilled bookmark: Sustainability as systems design
        const SUSTAIN_QUOTE = 'This reframes sustainable design from a materials question into a systems question';
        const ORANGE = '#FF8C42';
        const GROWTH_SRC = '/icons/bookmark-icons/Growth.png';
        const sustainPara = paras.find(p => p.textContent.includes(SUSTAIN_QUOTE));
        if (sustainPara) {
          let sustainSelSpan = null;
          const walker3 = document.createTreeWalker(sustainPara, NodeFilter.SHOW_TEXT);
          let node3;
          while ((node3 = walker3.nextNode())) {
            const idx = node3.textContent.indexOf('This reframes');
            if (idx !== -1) {
              const endText = 'comes apart.';
              const endIdx = node3.textContent.indexOf(endText, idx);
              const end = endIdx !== -1 ? endIdx + endText.length : Math.min(idx + 150, node3.textContent.length);
              try {
                const range3 = document.createRange();
                range3.setStart(node3, idx);
                range3.setEnd(node3, end);
                sustainSelSpan = document.createElement('span');
                range3.surroundContents(sustainSelSpan);
              } catch(e) { sustainSelSpan = null; }
              break;
            }
          }
          let group3 = sustainPara.querySelector(':scope > .bm-badge-group');
          if (!group3) {
            group3 = document.createElement('span');
            group3.className = 'bm-badge-group';
            sustainPara.appendChild(group3);
          }
          const bmId3 = nextBmId++;
          const badge3 = document.createElement('span');
          badge3.className = 'bm-badge';
          badge3.dataset.bmId = bmId3;
          badge3.style.background = '#fff';
          const filterId3 = `bm-badge-filter-${bmId3}`;
          const fr3 = parseInt(ORANGE.slice(1,3),16)/255;
          const fg3 = parseInt(ORANGE.slice(3,5),16)/255;
          const fb3 = parseInt(ORANGE.slice(5,7),16)/255;
          const fSvg3 = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvg3.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvg3.innerHTML = `<defs><filter id="${filterId3}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr3}  0 0 0 0 ${fg3}  0 0 0 0 ${fb3}  0 0 0 1 0"/></filter></defs>`;
          badge3.appendChild(fSvg3);
          const img3 = document.createElement('img');
          img3.src = GROWTH_SRC;
          img3.style.filter = `url(#${filterId3})`;
          img3.width = 15; img3.height = 15;
          badge3.appendChild(img3);
          group3.appendChild(badge3);
          attachHighlightTooltip(badge3);
          fnBookmarks.push({
            id: bmId3,
            title: 'Sustainability as systems design',
            color: ORANGE,
            iconPath: null,
            iconSrc: GROWTH_SRC,
            type: 'text',
            collection: 'AI Research',
            createdAt: new Date('2026-07-02T10:00:00'),
            lastPara: sustainPara,
            selectionSpan: sustainSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Fourth prefilled bookmark: UX for autonomous agents
        const AGENT_QUOTE = 'once an AI can actually click, type, navigate websites, fill forms, and take actions';
        const BLUE = '#1E88E5';
        const POPCORN_SRC = '/icons/bookmark-icons/Popcorn.png';
        const agentPara = paras.find(p => p.textContent.includes(AGENT_QUOTE));
        if (agentPara) {
          let agentSelSpan = null;
          const walker4 = document.createTreeWalker(agentPara, NodeFilter.SHOW_TEXT);
          let node4;
          while ((node4 = walker4.nextNode())) {
            const idx = node4.textContent.indexOf('once an AI can');
            if (idx !== -1) {
              const endText = 'ways to intervene.';
              const endIdx = node4.textContent.indexOf(endText, idx);
              const end = endIdx !== -1 ? endIdx + endText.length : Math.min(idx + 200, node4.textContent.length);
              try {
                const range4 = document.createRange();
                range4.setStart(node4, idx);
                range4.setEnd(node4, end);
                agentSelSpan = document.createElement('span');
                range4.surroundContents(agentSelSpan);
              } catch(e) { agentSelSpan = null; }
              break;
            }
          }
          let group4 = agentPara.querySelector(':scope > .bm-badge-group');
          if (!group4) {
            group4 = document.createElement('span');
            group4.className = 'bm-badge-group';
            agentPara.appendChild(group4);
          }
          const bmId4 = nextBmId++;
          const badge4 = document.createElement('span');
          badge4.className = 'bm-badge';
          badge4.dataset.bmId = bmId4;
          badge4.style.background = '#fff';
          const filterId4 = `bm-badge-filter-${bmId4}`;
          const fr4 = parseInt(BLUE.slice(1,3),16)/255;
          const fg4 = parseInt(BLUE.slice(3,5),16)/255;
          const fb4 = parseInt(BLUE.slice(5,7),16)/255;
          const fSvg4 = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvg4.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvg4.innerHTML = `<defs><filter id="${filterId4}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr4}  0 0 0 0 ${fg4}  0 0 0 0 ${fb4}  0 0 0 1 0"/></filter></defs>`;
          badge4.appendChild(fSvg4);
          const img4 = document.createElement('img');
          img4.src = POPCORN_SRC;
          img4.style.filter = `url(#${filterId4})`;
          img4.width = 15; img4.height = 15;
          badge4.appendChild(img4);
          group4.appendChild(badge4);
          attachHighlightTooltip(badge4);
          fnBookmarks.push({
            id: bmId4,
            title: 'UX for autonomous agents',
            color: BLUE,
            iconPath: null,
            iconSrc: POPCORN_SRC,
            type: 'text',
            collection: 'Design & UX',
            createdAt: new Date('2026-08-15T10:00:00'),
            lastPara: agentPara,
            selectionSpan: agentSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // Fifth prefilled bookmark: AI shouldn't replace qualitative judgment
        const AI_QUOTE = 'AI-assisted analysis can make messy human feedback too clean';
        const YELLOW = '#F5A623';
        const NOTEBOOK_SRC = '/icons/bookmark-icons/Notebook.png';
        const aiPara = paras.find(p => p.textContent.includes(AI_QUOTE));
        if (aiPara) {
          let aiSelSpan = null;
          const walker5 = document.createTreeWalker(aiPara, NodeFilter.SHOW_TEXT);
          let node5;
          while ((node5 = walker5.nextNode())) {
            const idx = node5.textContent.indexOf('AI-assisted analysis');
            if (idx !== -1) {
              const endText = 'rigid categories';
              const endIdx = node5.textContent.indexOf(endText, idx);
              const end = endIdx !== -1 ? endIdx + endText.length : Math.min(idx + 120, node5.textContent.length);
              try {
                const range5 = document.createRange();
                range5.setStart(node5, idx);
                range5.setEnd(node5, end);
                aiSelSpan = document.createElement('span');
                range5.surroundContents(aiSelSpan);
              } catch(e) { aiSelSpan = null; }
              break;
            }
          }
          let group5 = aiPara.querySelector(':scope > .bm-badge-group');
          if (!group5) {
            group5 = document.createElement('span');
            group5.className = 'bm-badge-group';
            aiPara.appendChild(group5);
          }
          const bmId5 = nextBmId++;
          const badge5 = document.createElement('span');
          badge5.className = 'bm-badge';
          badge5.dataset.bmId = bmId5;
          badge5.style.background = '#fff';
          const filterId5 = `bm-badge-filter-${bmId5}`;
          const fr5 = parseInt(YELLOW.slice(1,3),16)/255;
          const fg5 = parseInt(YELLOW.slice(3,5),16)/255;
          const fb5 = parseInt(YELLOW.slice(5,7),16)/255;
          const fSvg5 = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fSvg5.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fSvg5.innerHTML = `<defs><filter id="${filterId5}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${fr5}  0 0 0 0 ${fg5}  0 0 0 0 ${fb5}  0 0 0 1 0"/></filter></defs>`;
          badge5.appendChild(fSvg5);
          const img5 = document.createElement('img');
          img5.src = NOTEBOOK_SRC;
          img5.style.filter = `url(#${filterId5})`;
          img5.width = 15; img5.height = 15;
          badge5.appendChild(img5);
          group5.appendChild(badge5);
          attachHighlightTooltip(badge5);
          fnBookmarks.push({
            id: bmId5,
            title: "AI shouldn't replace qualitative judgment",
            color: YELLOW,
            iconPath: null,
            iconSrc: NOTEBOOK_SRC,
            type: 'text',
            collection: 'AI Research',
            createdAt: new Date(Date.now() - 3 * 60 * 1000),
            lastPara: aiPara,
            selectionSpan: aiSelSpan,
          });
          convData[3].bookmarks = fnBookmarks.slice();
        }

        // ── 14 new prefilled bookmarks ──────────────────────────────────────────
        const IC = (n) => `/icons/bookmark-icons/${n}.png`;
        const TEAL = '#00ACC1', PURPLE = '#9C27B0', RED2 = '#E53935';
        const newParas = [...messagesInner.querySelectorAll('.ai-para')];

        // Cornell / nanoscale paragraph (contains both quotes 1 & 2)
        const cornellPara = newParas.find(p => p.textContent.includes('manipulating light at the nanoscale'));
        addPrefilled(cornellPara, 'manipulating light at the nanoscale', 'information-processing systems', 'Light as a Computing Medium', PINK, IC('TestTube'), new Date('2026-09-04T09:00:00'));
        addPrefilled(cornellPara, 'strong static magnetic fields without external magnets or magnetic materials', 'magnetic materials', 'Magnetism Without Magnets', RED2, IC('Brackets2'), new Date('2026-08-28T09:00:00'));

        // Einhorn Center paragraph
        const einhornPara = newParas.find(p => p.textContent.includes('connect academic work with public problems'));
        addPrefilled(einhornPara, 'connect academic work with public problems', 'public problems', 'Academia Meets Public Problems', '#FF8C42', IC('Graduatecap2'), new Date('2026-08-25T09:00:00'));
        addPrefilled(einhornPara, 'community partnerships as part of how knowledge is produced', 'extracurricular add-on', 'Learning Through Community', YELLOW, IC('Peace'), new Date('2026-09-02T09:00:00'));

        // Product design theme paragraph
        const designPara = newParas.find(p => p.textContent.includes('The strongest product-design theme is the interface disappearing'));
        addPrefilled(designPara, 'the interface disappearing into the system', 'into the system', 'When the Interface Disappears', '#4CAF50', IC('Code'), new Date('2026-09-04T10:00:00'));
        addPrefilled(designPara, 'Voice assistants, edge sensing, connected hardware', 'pixels on a screen', 'Designing Beyond the Screen', TEAL, IC('ColorPalette'), new Date('2026-08-31T09:00:00'));

        // NVIDIA paragraph
        const nvidiaPara = newParas.find(p => p.textContent.includes('NVIDIA plans to acquire Hugging Face'));
        addPrefilled(nvidiaPara, 'NVIDIA plans to acquire Hugging Face', 'Hugging Face', 'AI Infrastructure Meets Open Models', '#1E88E5', IC('Globe3'), new Date('2026-09-03T09:00:00'));
        addPrefilled(nvidiaPara, 'brings NVIDIA closer to the software and developer layer of AI', 'infrastructure layer', 'AI Is Moving Up the Stack', PURPLE, IC('Chart6'), new Date('2026-09-03T10:00:00'));
        addPrefilled(nvidiaPara, 'if open models continue becoming cheaper and more capable', 'more capable', 'The Open-Model Advantage', PINK, IC('Dollar'), new Date('2026-08-29T09:00:00'));

        // Astra paragraph
        const astraPara = newParas.find(p => p.textContent.includes('improved ability to use computers and browsers autonomously'));
        addPrefilled(astraPara, 'improved ability to use computers and browsers autonomously', 'autonomously', 'AI That Can Use Computers', RED2, IC('SuitcaseWork'), new Date('2026-09-03T11:00:00'));
        addPrefilled(astraPara, 'performing tasks rather than simply answering questions', 'answering questions', 'From Answers to Actions', '#FF8C42', IC('Airplane'), new Date('2026-09-01T09:00:00'));

        // UX implication paragraph (same as agentPara but different quotes)
        const uxImplPara = newParas.find(p => p.textContent.includes("What should I let AI do"));
        addPrefilled(uxImplPara, 'products need much better permission systems, previews, undo mechanisms', 'ways to intervene', 'UX for Autonomous Agents', YELLOW, IC('Hammer2'), new Date('2026-09-04T11:00:00'));
        addPrefilled(uxImplPara, "We're moving from", "What should I let AI do", 'From Asking AI to Delegating', '#4CAF50', IC('Pencil'), new Date('2026-09-03T12:00:00'));

        // Figma paragraph
        const figmaPara = newParas.find(p => p.textContent.includes('lets designers create and manipulate work within Figma'));
        addPrefilled(figmaPara, 'lets designers create and manipulate work within Figma', 'into the tool afterward', 'AI-Native Design Tools', TEAL, IC('PaintBucket'), new Date('2026-08-30T09:00:00'));
      }

      fnRender();
    }

    function buildPrefilledConversation() {
      loadConversation(3);
    }

    // ── Floating Nav ─────────────────────────────────────────────────────────────
    const fnLines        = document.getElementById('fn-lines');
    const fnCard         = document.getElementById('fn-card');
    const fnList         = document.getElementById('fn-list');
    const fnMode = 'prompts';
    const fnBookmarks = [];
    let fnHoverTimer = null;
    let fnNavScrollSaved = null;
    let fnNavActiveBmId = null;

    // Per-conversation state
    const BRIEFING_PROMPTS = ["What's the design & UX news today?"];
    const BRIEFING_RESPONSES = [
`# Daily Briefing — Thursday, September 3, 2026

## Product design & UX

### 1. Sonos is rebuilding its ecosystem around voice, AI, and cross-device control

Sonos announced its biggest product update in years, including new Ace Ultra headphones, a Beam Ultra soundbar, and the Sonos 27 software platform. The UX story is the deeper integration: a new voice assistant, support for third-party models such as **ChatGPT** and **Gemini**, a virtual two-finger volume control, and easier linking across speakers and headphones. This matters because Sonos is treating the home audio system as one continuous interface rather than a set of separate devices—and trying to rebuild trust through a more coherent experience.

### 2. GlobalFoundries is making "UX" a hardware platform for intelligent edge devices

GlobalFoundries announced customer availability for its new **UX platform family**, built for low-power microcontrollers, wireless connectivity, sensing, imaging, and edge-AI applications. The design implication is easy to miss: better user experiences increasingly depend on invisible hardware decisions—power efficiency, sensing, latency, and local computation. As more products become context-aware, product designers will need to think beyond screens and into the physical capabilities that make an interaction feel instant and intelligent.

### 3. Circular product design is becoming a lifecycle system, not a materials choice

Arc'teryx introduced **System 0**, a framework for designing products around durability, repairability, disassembly, and end-of-life regeneration. Its first product, the Sperro SV jacket, is designed to separate into recyclable material streams at end of life. This reframes sustainable design from a materials question into a systems question—asking not just what something is made of, but how it comes apart.

## Cornell & college news

### 4. Cornell researchers demonstrate a new way to generate nanoscale magnetization with light

Cornell researchers say they have used an engineered metasurface to create strong static magnetic fields without external magnets or magnetic materials. The work could have implications for spintronics, quantum and photonic computing, and data storage. The broader significance is that manipulating light at the nanoscale may open new ways to control information-processing systems that are currently constrained by conventional magnetic materials.

### 5. Cornell's largest-ever engaged fellowship cohort expands community-based learning

The Einhorn Center named 42 faculty and staff from 19 Cornell units as Engaged Fellows for 2026–27, the largest cohort since the program began in 2013. Fellows will develop community-engaged courses, projects, and scholarship through a shared yearlong program. This matters for college students because it reflects a broader push to connect academic work with public problems—and to treat community partnerships as part of how knowledge is produced, not just as an extracurricular add-on.

**Quick Cornell note**

Cornell Career Fair Days begin with preparation events next week, including an international-student session on September 8, an employer panel on September 9, and a preview event on September 14. The main fair runs September 15–17, with dedicated tracks for human capital and STEAM-related roles.

## What to watch

The strongest product-design theme is the interface disappearing into the system. Voice assistants, edge sensing, connected hardware, and lifecycle-aware products all push designers to think about behavior across devices, environments, and time—not just the pixels on a screen.

---

## Extra news for today — September 3

### AI & tech

**NVIDIA is buying Hugging Face for $12.93B**

This is probably the biggest tech story today. NVIDIA plans to acquire Hugging Face, the platform used by millions of developers to find and run open-source AI models. The strategic move brings NVIDIA closer to the software and developer layer of AI, rather than keeping it primarily at the chip/infrastructure layer. It could become especially important if open models continue becoming cheaper and more capable.

**OpenAI launches GPT-6 Astra**

OpenAI released Astra today and is positioning it as a major step toward AGI. One of the most interesting changes is its improved ability to use computers and browsers autonomously—performing tasks rather than simply answering questions. It's initially available through OpenAI's Daybreak cybersecurity program before expanding to paid customers and the API.

**The agent UX problem is getting real**

The important implication of Astra and other new agents isn't just model intelligence. It's UX: once an AI can actually click, type, navigate websites, fill forms, and take actions, products need much better permission systems, previews, undo mechanisms, progress indicators, and ways to intervene. We're moving from "What should I ask AI?" toward "What should I let AI do?"

### Product design & UX

**Figma is leaning harder into AI + design systems**

Figma's latest updates include more control over generative plugins and shaders, while its AI direction increasingly lets designers create and manipulate work within Figma rather than exporting AI-generated assets into the tool afterward.

**New research: AI can dynamically change a webpage's layout**

Researchers published a system using contextual bandits to dynamically select page layouts based on user and item context. In online experiments on a major retail platform, the approach outperformed a strong heuristic baseline. This is a fascinating direction because it suggests a future where the interface itself is continuously optimized, rather than designers choosing one static layout for everyone.

**UX researchers are questioning whether AI is flattening qualitative research**

A recent UX research paper argues that AI-assisted analysis can make messy human feedback too clean—turning nuanced responses into rigid categories and potentially removing the researcher's ability to notice contradictions or unexpected needs. The proposed approach is to use AI to amplify human interpretation rather than automate it away. That's particularly relevant if you're interested in AI + product research.

### Cornell

**Cornell's government researchers released a major 2026 election forecast**

Professor Peter Enns and graduate students released a midterm forecast giving Democrats an 8-in-10 chance of winning a House majority. Cornell says the model has correctly predicted the winner of the previous 14 congressional elections.

**Cornell's largest Engaged Fellows cohort launches**

The Einhorn Center named 42 faculty and staff from 19 Cornell units as its 2026–27 Engaged Fellows—the largest cohort since the program began in 2013. The program focuses on connecting academic work with community problems.

**A Cornell professor died in a plane crash near Ithaca**

David Kornreich, a Cornell physics and astronomy educator and Ph.D. '01, died August 30 at age 52 in a plane crash near Ithaca. Cornell's Chronicle reported the news September 2.

### One thing I'd add to your daily briefings

Given your interests, I'd make the regular briefing roughly:

* 2–3 Product Design / UX stories
* 1 AI / technology story
* 1 Cornell story
* 1 broader college / higher-ed story
* 1 interesting research or emerging product
* A short "Why this matters for designers" section

That would give you more useful signal without turning it into a giant news dump.`
    ];

    const convData = {
      1: { name: 'Conversation Health Design', prompts: PREFILLED_PROMPTS,  responses: PREFILLED_RESPONSES,  bookmarks: [] },
      2: { name: 'Photosynthesis Overview',    prompts: PHOTO_PROMPTS,      responses: PHOTO_RESPONSES,      bookmarks: [] },
      3: { name: 'Daily Briefing — Sep 3',     prompts: BRIEFING_PROMPTS,   responses: BRIEFING_RESPONSES,   bookmarks: [] },
    };
    let activeConvId  = 1;
    let activeConvPrompts = PREFILLED_PROMPTS;

    function fnExpand() {
      clearTimeout(fnHoverTimer);
      fnLines.classList.add('expanded');
      fnCard.classList.add('expanded');
    }
    function fnCollapse() {
      fnHoverTimer = setTimeout(() => {
        fnLines.classList.remove('expanded');
        fnCard.classList.remove('expanded');
      }, 80);
    }

    fnLines.addEventListener('mouseenter', fnExpand);
    fnLines.addEventListener('mouseleave', fnCollapse);
    fnCard.addEventListener('mouseenter', fnExpand);
    fnCard.addEventListener('mouseleave', fnCollapse);

    // Bookmark icon for code block header (20×20)
    const SVG_CODE_BM_BTN = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.833 17.5L10 13.333L4.167 17.5V4.167C4.167 3.725 4.342 3.301 4.655 2.988C4.967 2.676 5.391 2.5 5.833 2.5H14.167C14.609 2.5 15.033 2.676 15.345 2.988C15.658 3.301 15.833 3.725 15.833 4.167V17.5Z" stroke="#5D5D5D" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_CODE_BM_BTN_FILLED = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.833 17.5L10 13.333L4.167 17.5V4.167C4.167 3.725 4.342 3.301 4.655 2.988C4.967 2.676 5.391 2.5 5.833 2.5H14.167C14.609 2.5 15.033 2.676 15.345 2.988C15.658 3.301 15.833 3.725 15.833 4.167V17.5Z" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    let pendingCodeBmBtn = null;
    // The </>  code icon reused for nav items (18×18 render, 16×16 viewBox from e45ab3.svg)
    const SVG_NAV_CODE_ICON = `<svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="#0D0D0D"/></svg>`;

    const SVG_CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M16.835 9.99995C16.835 6.48995 13.811 3.58195 9.99996 3.58195C6.18896 3.58195 3.16496 6.48995 3.16496 9.99995C3.16496 11.454 3.67896 12.797 4.55296 13.877C4.67496 14.028 4.72496 14.227 4.68896 14.417C4.59396 14.925 4.45896 15.42 4.30496 15.904C4.92083 15.8223 5.53006 15.6967 6.12796 15.528L6.25396 15.505C6.38213 15.4946 6.51057 15.5213 6.62396 15.582C7.66309 16.135 8.82284 16.4225 9.99996 16.419C13.811 16.419 16.835 13.509 16.835 9.99895M18.165 9.99895C18.165 14.313 14.473 17.748 9.99996 17.748C8.69424 17.7501 7.40558 17.4513 6.23396 16.875C5.31396 17.117 4.36896 17.268 3.37396 17.33C3.26277 17.3367 3.15165 17.3155 3.05081 17.2681C2.94997 17.2208 2.86264 17.1489 2.79684 17.059C2.73104 16.9691 2.68887 16.8641 2.67422 16.7537C2.65956 16.6432 2.67288 16.5309 2.71296 16.427L2.91996 15.862C3.08196 15.394 3.21996 14.929 3.32196 14.46C2.35791 13.1727 1.83626 11.6081 1.83496 9.99995C1.83496 5.68495 5.52696 2.25195 9.99996 2.25195C14.473 2.25195 18.165 5.68495 18.165 9.99995" fill="#0D0D0D"/></svg>`;
    const SVG_BOOKMARK_ICON = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

    const fnModeIconEl = document.getElementById('fn-mode-icon');

    // ═══════════════ BOOKMARK TOOLTIP SYSTEM ═══════════════

    // SVG icon constants for tooltip/menu/submenu
    const SVG_TT_DOTS = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9.75C9.41422 9.75 9.75 9.41422 9.75 9C9.75 8.58578 9.41422 8.25 9 8.25C8.58578 8.25 8.25 8.58578 8.25 9C8.25 9.41422 8.58578 9.75 9 9.75Z" stroke="#5D5D5D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 9.75C15.4142 9.75 15.75 9.41422 15.75 9C15.75 8.58578 15.4142 8.25 15 8.25C14.5858 8.25 14.25 8.58578 14.25 9C14.25 9.41422 14.5858 9.75 15 9.75Z" stroke="#5D5D5D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 9.75C3.41421 9.75 3.75 9.41422 3.75 9C3.75 8.58578 3.41421 8.25 3 8.25C2.58579 8.25 2.25 8.58578 2.25 9C2.25 9.41422 2.58579 9.75 3 9.75Z" stroke="#5D5D5D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_TT_SHARE = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.66797 5.00033L10.0013 1.66699L13.3346 5.00033" stroke="#0d0d0d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.0015 2.5V10.8333" stroke="#0d0d0d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.168 8.33301C15.0885 8.33301 15.8346 9.07917 15.8346 9.99967V14.9997C15.8346 15.9202 15.0885 16.6663 14.168 16.6663H5.83464C4.91416 16.6663 4.16797 15.9202 4.16797 14.9997V9.99967C4.16797 9.07917 4.91416 8.33301 5.83464 8.33301" stroke="#0d0d0d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_TT_EDIT = `<svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5108 2.44619L12.5556 3.49093C13.0437 3.97908 13.0437 4.77054 12.5556 5.2587L11.252 6.56228L4.87251 12.9418C4.7553 13.059 4.59633 13.1248 4.43057 13.1248H1.87695V10.5712C1.87695 10.4054 1.9428 10.2465 2.06001 10.1293L8.43945 3.74981L9.74308 2.4462C10.2312 1.95804 11.0227 1.95804 11.5108 2.44619Z" stroke="#0d0d0d" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.43945 3.75L11.252 6.5625" stroke="#0d0d0d" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_TT_TAG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.16943 2.41699H9.31201C9.71436 2.41699 10.102 2.55551 10.4116 2.80566L10.562 2.94141L17.0083 9.3877C17.6486 10.0283 17.6887 11.0422 17.1284 11.7295L17.0083 11.8623L11.8647 17.0059C11.2241 17.6462 10.2102 17.6863 9.52295 17.126L9.39014 17.0059L2.93115 10.5469C2.60346 10.219 2.41943 9.77388 2.41943 9.30957V4.16699C2.41943 3.20049 3.20293 2.41699 4.16943 2.41699ZM4.16943 2.58301C3.29498 2.58301 2.58545 3.29254 2.58545 4.16699V9.30957C2.58545 9.728 2.75115 10.1305 3.04736 10.4277L3.04834 10.4287L9.5083 16.8877C10.088 17.4668 11.0048 17.5031 11.6265 16.9961L11.7466 16.8877L16.8901 11.7441C17.4693 11.1645 17.5055 10.2476 16.9985 9.62598L16.8901 9.50586L10.4312 3.04688C10.135 2.7511 9.73256 2.58301 9.31201 2.58301H4.16943ZM6.31006 5.75293C6.55793 5.78112 6.75226 5.99328 6.75244 6.25L6.74268 6.35059C6.69599 6.57836 6.4939 6.74985 6.25244 6.75L6.15771 6.74121C5.94505 6.70026 5.78002 6.52431 5.75537 6.30762L5.75244 6.25L5.75537 6.19141C5.78367 5.94558 5.99305 5.75259 6.24756 5.75L6.31006 5.75293Z" fill="#181818" fill-opacity="0.88" stroke="#0d0d0d" stroke-width="1.5"/></svg>`;
    const SVG_TT_CHEVRON_R = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.9165 15.001L12.9165 10.001L7.9165 5.00098" stroke="#0d0d0d" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_TT_ASKGPT = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.9159 9.99967C17.9159 5.83301 14.8372 3.33301 9.99919 3.33301C5.16122 3.33301 2.08252 5.83301 2.08252 9.99967C2.08252 11.0783 2.8277 12.9077 2.94632 13.1921C2.95716 13.218 2.9679 13.2418 2.97759 13.2682C3.05882 13.4897 3.38512 14.6515 2.08252 16.3696C3.84178 17.2029 5.7101 15.833 5.7101 15.833C7.00273 16.5125 8.54077 16.6663 9.99919 16.6663C14.8372 16.6663 17.9159 14.1663 17.9159 9.99967Z" stroke="#0d0d0d" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/></svg>`;
    const SVG_TT_TRASH = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.1665 5.41699L4.8928 15.9483C4.95307 16.8222 5.67955 17.5003 6.55552 17.5003H13.4442C14.3201 17.5003 15.0466 16.8222 15.1068 15.9483L15.8332 5.41699" stroke="#FA423E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.3335 9.16699V13.3337" stroke="#FA423E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6665 9.16699V13.3337" stroke="#FA423E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.9165 5H17.0832" stroke="#FA423E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.72559 4.78818C7.01939 3.24755 8.37357 2.08301 9.99982 2.08301C11.6261 2.08301 12.9802 3.24755 13.2741 4.78818" stroke="#FA423E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const SVG_TT_BOOK = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0015 14.8545C14.7404 14.9469 14.4602 15 14.1675 15H5.83447C5.37424 15 5.00146 15.3737 5.00146 15.834C5.00163 16.2654 5.32927 16.6206 5.74951 16.6631L5.83447 16.667H14.1675C14.6276 16.667 15.0013 16.2941 15.0015 15.834V14.8545ZM10.0015 8.33398C10.4616 8.33416 10.8345 8.70685 10.8345 9.16699C10.8345 9.62713 10.4616 9.99982 10.0015 10H7.50146C7.04123 10 6.66748 9.62724 6.66748 9.16699C6.66748 8.70674 7.04123 8.33398 7.50146 8.33398H10.0015ZM12.5015 5C12.9616 5.00018 13.3345 5.37386 13.3345 5.83398C13.3343 6.29396 12.9615 6.66682 12.5015 6.66699H7.50146C7.04134 6.66699 6.66766 6.29407 6.66748 5.83398C6.66748 5.37375 7.04123 5 7.50146 5H12.5015ZM15.0015 4.16699C15.0015 3.70676 14.6277 3.33398 14.1675 3.33398H5.83447C5.37424 3.33398 5.00146 3.70676 5.00146 4.16699V13.4785C5.26226 13.3863 5.54208 13.334 5.83447 13.334H14.1675C14.5988 13.334 14.9537 13.006 14.9966 12.5859L15.0015 12.5V4.16699ZM16.6675 15.834C16.6673 17.2146 15.5481 18.334 14.1675 18.334H5.83447C4.53991 18.334 3.475 17.3497 3.34717 16.0889L3.33447 15.834V4.16699C3.33447 2.78628 4.45376 1.66699 5.83447 1.66699H14.1675C15.5482 1.66699 16.6675 2.78628 16.6675 4.16699V15.834Z" fill="#0285FF"/></svg>`;
    const SVG_TT_SEARCH = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.16781 14.9997C12.3895 14.9997 15.0011 12.388 15.0011 9.16634C15.0011 5.94468 12.3895 3.33301 9.16781 3.33301C5.94615 3.33301 3.33447 5.94468 3.33447 9.16634C3.33447 12.388 5.94615 14.9997 9.16781 14.9997Z" stroke="#9A9A9A" stroke-width="1.1" stroke-linecap="round"/><path d="M16.6686 16.6667L13.377 13.375" stroke="#9A9A9A" stroke-width="1.1" stroke-linecap="round"/></svg>`;
    const SVG_TT_PLUS = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.0002 3.33301V9.99967M10.0002 9.99967V16.6663M10.0002 9.99967H3.3335M10.0002 9.99967H16.6668" stroke="black" stroke-width="1.4" stroke-linecap="round"/></svg>`;
    const SVG_TT_CHECK = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.2108 5.27915C15.5169 4.93559 16.0439 4.90487 16.3876 5.21079C16.7311 5.51687 16.7618 6.0439 16.4559 6.38755L8.28861 15.5542C8.13693 15.7244 7.92238 15.8249 7.69453 15.8325C7.46664 15.8401 7.24524 15.7547 7.08255 15.5949L3.58239 12.1574C3.25405 11.8349 3.24932 11.3066 3.57181 10.9782C3.8943 10.6499 4.42266 10.6451 4.75101 10.9676L7.62617 13.7915L15.2108 5.27915Z" fill="#181818" fill-opacity="0.88"/></svg>`;

    // Collections data (uses SVGs inline from the existing dropdown)
    // Inject shared filter defs for collection icons (matches bm-coll-filter-* in the modal dropdown)
    (() => {
      if (document.getElementById('bm-coll-filters-global')) return;
      const s = document.createElementNS('http://www.w3.org/2000/svg','svg');
      s.id = 'bm-coll-filters-global';
      s.setAttribute('style','display:none;position:absolute;width:0;height:0');
      s.innerHTML = `<defs>
        <filter id="bm-coll-filter-0" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.01 0 0 0 0 0.53 0 0 0 0 0.29 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.57 0 0 0 0 0.07 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-2" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.52 0 0 0 0 0.9 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-3" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.58 0 0 0 0 0.18 0 0 0 0 0.85 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-4" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.92 0 0 0 0 0.16 0 0 0 0 0.33 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-5" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.95 0 0 0 0 0.38 0 0 0 0 0.12 0 0 0 1 0"/></filter>
        <filter id="bm-coll-filter-6" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.04 0 0 0 0 0.44 0 0 0 0 0.78 0 0 0 1 0"/></filter>
      </defs>`;
      document.body.appendChild(s);
    })();
    const COLLECTIONS = [
      { name: 'Biology Notes',    icon: `<img src="/icons/bookmark-icons/Graduatecap2.png" width="16" height="16" style="display:block;filter:url(#bm-coll-filter-0)"/>` },
      { name: 'Recipes',          icon: `<img src="/icons/bookmark-icons/Popcorn.png"      width="16" height="16" style="display:block;filter:url(#bm-coll-filter-1)"/>` },
      { name: 'Travel',           icon: `<img src="/icons/bookmark-icons/Airplane.png"     width="16" height="16" style="display:block;filter:url(#bm-coll-filter-2)"/>` },
      { name: 'Writing Projects', icon: `<img src="/icons/bookmark-icons/Pencil2.png"      width="16" height="16" style="display:block;filter:url(#bm-coll-filter-3)"/>` },
      { name: 'Entertainment',    icon: `<img src="/icons/bookmark-icons/Popsicle1.png"    width="16" height="16" style="display:block;filter:url(#bm-coll-filter-4)"/>` },
      { name: 'Design & UX',      icon: `<img src="/icons/bookmark-icons/ColorPalette.png" width="16" height="16" style="display:block;filter:url(#bm-coll-filter-5)"/>` },
      { name: 'AI Research',      icon: `<img src="/icons/bookmark-icons/Brain1.png"       width="16" height="16" style="display:block;filter:url(#bm-coll-filter-6)"/>` },
    ];

    // Global tooltip state
    let bmTtHideTimer = null;
    let bmTtActiveBm = null;
    let bmTtMenuOpen = false;
    let bmTtSubmenuOpen = false;
    let bmTtGroupBms = [];
    let bmTtGroupIdx = 0;
    let bmTtUnderlinedParas = [];

    // Time-ago helper
    function bmTimeAgo(date) {
      if (!date) return '';
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Initialise static icon slots and populate collection list (runs once)
    (function bmTtInit() {
      document.getElementById('bm-tt-dots').innerHTML = SVG_TT_DOTS;
      document.getElementById('bm-tt-sub-search-icon').innerHTML = SVG_TT_SEARCH;
      document.getElementById('bm-tt-sub-plus-icon').innerHTML = SVG_TT_PLUS;

      // Build collection rows
      const list = document.getElementById('bm-tt-sub-list');
      COLLECTIONS.forEach(c => {
        const row = document.createElement('div');
        row.className = 'bm-tt-sub-coll';
        row.innerHTML = `<span>${c.icon}</span><span>${c.name}</span>`;
        row.addEventListener('click', () => {
          if (bmTtActiveBm) { bmTtActiveBm.collection = c.name; fnRender(); }
          bmTtHideAll();
        });
        list.appendChild(row);
      });

      // Search filter
      document.getElementById('bm-tt-sub-search-input').addEventListener('input', function() {
        const q = this.value.toLowerCase();
        list.querySelectorAll('.bm-tt-sub-coll').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    })();

    function bmTtClearUnderlines() {
      bmTtUnderlinedParas.forEach(p => p.classList.remove('bm-para-underline'));
      bmTtUnderlinedParas = [];
    }

    function bmTtApplyUnderline(bm) {
      bmTtClearUnderlines();
      const target = bm.selectionSpan || bm.lastPara;
      if (!target) return;
      const color = bm.color || '#181818';
      target.style.setProperty('--bm-underline-color', color);
      target.classList.add('bm-para-underline');
      bmTtUnderlinedParas.push(target);
    }

    function bmTtHideAll() {
      clearTimeout(bmTtHideTimer);
      document.getElementById('bm-tt').classList.remove('visible');
      document.getElementById('bm-tt-menu').classList.remove('visible');
      document.getElementById('bm-tt-submenu').classList.remove('visible');
      bmTtActiveBm = null;
      bmTtMenuOpen = false;
      bmTtSubmenuOpen = false;
      bmTtClearUnderlines();
    }

    function bmTtScheduleHide() {
      bmTtHideTimer = setTimeout(bmTtHideAll, 400);
    }

    function bmTtBadgeIcon(bm) {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%';
      if (bm.iconSrc) {
        const img = document.createElement('img');
        img.src = bm.iconSrc; img.width = 15; img.height = 15;
        const fId = `bm-tt-mini-filter-${bm.id}`;
        if (!document.getElementById(fId)) {
          const r = parseInt(bm.color.slice(1,3),16)/255;
          const g = parseInt(bm.color.slice(3,5),16)/255;
          const b = parseInt(bm.color.slice(5,7),16)/255;
          const fsvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fsvg.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fsvg.innerHTML = `<defs><filter id="${fId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0"/></filter></defs>`;
          document.body.appendChild(fsvg);
        }
        img.style.filter = `url(#${fId})`;
        div.appendChild(img);
      } else {
        const color = bm.color || '#181818';
        div.innerHTML = bm.iconPath
          ? `<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="${bm.iconPath}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.497V3.125C11.876 2.435 11.317 1.875 10.626 1.875H4.376C3.686 1.875 3.126 2.435 3.126 3.125V12.497C3.126 13.003 3.696 13.299 4.11 13.008L6.782 11.13C7.213 10.827 7.788 10.827 8.22 11.13L10.892 13.008C11.306 13.299 11.876 13.003 11.876 12.497Z" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      }
      return div;
    }

    // Visual order: active badge is always rightmost; others are left of it
    function bmTtRenderBadgeStack(bms, activeIdx, animate) {
      activeIdx = (activeIdx === undefined) ? bmTtGroupIdx : activeIdx;
      const stack = document.getElementById('bm-tt-badge-stack');
      // Build display order: non-active first (in order), active last (rightmost)
      const others = bms.filter((_, i) => i !== activeIdx).slice(0, 2);
      const activeBm = bms[activeIdx];
      const displayOrder = [...others, activeBm]; // rightmost = active

      stack.innerHTML = '';
      stack.style.position = 'relative';
      stack.style.display = 'flex';
      stack.style.alignItems = 'center';

      displayOrder.forEach((bm, vi) => {
        const isActive = bm === activeBm;
        const circle = document.createElement('div');
        circle.className = 'bm-tt-mini-badge';
        circle.dataset.bmId = bm.id;
        circle.style.transition = animate ? 'border-color 0.2s ease, transform 0.22s ease' : '';
        if (vi > 0) circle.style.marginLeft = '-6px';
        // z-index: active on top
        circle.style.zIndex = isActive ? '3' : String(vi + 1);
        circle.style.borderColor = isActive ? '' : '#EFEFEF';
        // Dim only the icon content, not the badge background
        const iconWrap = circle.querySelector('div');
        if (iconWrap) iconWrap.style.opacity = isActive ? '1' : '0.2';
        circle.appendChild(bmTtBadgeIcon(bm));

        // Hover: highlight this badge, dim others
        circle.addEventListener('mouseenter', () => {
          stack.querySelectorAll('.bm-tt-mini-badge').forEach(c => {
            const hovered = c === circle;
            c.style.borderColor = hovered ? '' : '#EFEFEF';
            const iw = c.querySelector('div'); if (iw) iw.style.opacity = hovered ? '1' : '0.2';
          });
        });
        circle.addEventListener('mouseleave', () => {
          // Restore: active is the rightmost (last child)
          const all = [...stack.querySelectorAll('.bm-tt-mini-badge')];
          all.forEach((c, ci) => {
            const isLast = ci === all.length - 1;
            c.style.borderColor = isLast ? '' : '#EFEFEF';
            const iw = c.querySelector('div'); if (iw) iw.style.opacity = isLast ? '1' : '0.2';
          });
        });

        stack.appendChild(circle);
      });
    }

    function bmTtRenderContent(bm, groupBms, idx, animate) {
      bmTtActiveBm = bm;
      document.getElementById('bm-tt-title').textContent = bm.title;
      const hasColl = !!(bm.collection);
      const bookIconEl = document.getElementById('bm-tt-book-icon');
      if (hasColl) {
        const collDef = COLLECTIONS.find(c => c.name === bm.collection);
        bookIconEl.innerHTML = collDef ? collDef.icon : SVG_TT_BOOK;
        bookIconEl.style.display = '';
      } else {
        bookIconEl.innerHTML = '';
        bookIconEl.style.display = 'none';
      }
      document.getElementById('bm-tt-coll').textContent = hasColl ? bm.collection : '';
      document.getElementById('bm-tt-coll').style.display = hasColl ? '' : 'none';
      document.getElementById('bm-tt-bullet').style.display = hasColl ? '' : 'none';
      document.getElementById('bm-tt-time').textContent = bmTimeAgo(bm.createdAt);
      // Counter
      document.getElementById('bm-tt-counter').textContent = groupBms.length > 1 ? `${idx + 1}/${groupBms.length}` : '';
      // Prev/next visibility
      document.getElementById('bm-tt-prev').style.opacity = idx > 0 ? '1' : '0.3';
      document.getElementById('bm-tt-next').style.opacity = idx < groupBms.length - 1 ? '1' : '0.3';
      bmTtRenderBadgeStack(groupBms, idx, !!animate);
      bmTtApplyUnderline(bm);
    }

    function bmTtShow(groupEl) {
      clearTimeout(bmTtHideTimer);
      // Collect all bm IDs from badges in this group
      const badges = [...groupEl.querySelectorAll('.bm-badge[data-bm-id]')];
      const bms = badges.map(b => fnBookmarks.find(bm => bm.id === parseInt(b.dataset.bmId))).filter(Boolean);
      if (!bms.length) return;
      bmTtGroupBms = bms;
      bmTtGroupIdx = 0;
      document.getElementById('bm-tt-menu').classList.remove('visible');
      document.getElementById('bm-tt-submenu').classList.remove('visible');
      bmTtMenuOpen = false;
      bmTtSubmenuOpen = false;

      const tt = document.getElementById('bm-tt');
      tt.classList.add('visible');
      bmTtRenderContent(bms[0], bms, 0);

      // Position above the group
      const rect = groupEl.getBoundingClientRect();
      const ttW = 250;
      tt.style.width = ttW + 'px';
      tt.style.left = '';
      tt.style.top = '';
      const ttH = tt.offsetHeight || 80;
      let left = rect.left + rect.width / 2 - ttW / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - ttW - 8));
      let top = rect.top - ttH - 8;
      if (top < 8) top = rect.bottom; // flush — no gap to cross when below
      tt.style.left = left + 'px';
      tt.style.top  = top  + 'px';
    }

    // Wire prev/next buttons
    document.getElementById('bm-tt-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      if (bmTtGroupIdx > 0) {
        bmTtGroupIdx--;
        bmTtRenderContent(bmTtGroupBms[bmTtGroupIdx], bmTtGroupBms, bmTtGroupIdx, true);
      }
    });
    document.getElementById('bm-tt-next').addEventListener('click', (e) => {
      e.stopPropagation();
      if (bmTtGroupIdx < bmTtGroupBms.length - 1) {
        bmTtGroupIdx++;
        bmTtRenderContent(bmTtGroupBms[bmTtGroupIdx], bmTtGroupBms, bmTtGroupIdx, true);
      }
    });

    function syncGroupOverflow(groupEl) {
      if (!groupEl) return;
      const badges = groupEl.querySelectorAll(':scope > .bm-badge');
      const count = badges.length;
      let overflow = groupEl.querySelector('.bm-badge-overflow');
      if (count > 3) {
        if (!overflow) {
          overflow = document.createElement('span');
          overflow.className = 'bm-badge-overflow';
          groupEl.appendChild(overflow);
        }
        overflow.textContent = `+${count - 3}`;
        // Hide badges beyond the first 3
        badges.forEach((b, i) => { b.style.display = i < 3 ? '' : 'none'; });
      } else {
        if (overflow) overflow.remove();
        badges.forEach(b => { b.style.display = ''; });
      }
    }

    // Attach tooltip hover to a badge group
    function attachHighlightTooltip(badge) {
      // Wire to the containing badge group (created or found in badge creation)
      const groupEl = badge.parentElement; // .bm-badge-group
      syncGroupOverflow(groupEl);
      if (!groupEl || groupEl._bmTtWired) return;
      groupEl._bmTtWired = true;
      let showTimer = null;
      groupEl.addEventListener('mouseenter', () => {
        clearTimeout(bmTtHideTimer);
        showTimer = setTimeout(() => bmTtShow(groupEl), 180);
      });
      groupEl.addEventListener('mouseleave', () => {
        clearTimeout(showTimer);
        bmTtScheduleHide();
      });
    }

    // Keep tooltip alive when the mouse moves onto it
    document.getElementById('bm-tt').addEventListener('mouseenter', () => clearTimeout(bmTtHideTimer));
    document.getElementById('bm-tt').addEventListener('mouseleave', bmTtScheduleHide);

    // Three-dots button: toggle dropdown
    document.getElementById('bm-tt-dots').addEventListener('click', (e) => {
      e.stopPropagation();
      const tt   = document.getElementById('bm-tt');
      const menu = document.getElementById('bm-tt-menu');
      const sub  = document.getElementById('bm-tt-submenu');
      sub.classList.remove('visible');
      bmTtSubmenuOpen = false;
      if (bmTtMenuOpen) {
        menu.classList.remove('visible');
        bmTtMenuOpen = false;
        return;
      }
      // Align menu below tooltip, left-aligned with it
      const ttRect = tt.getBoundingClientRect();
      menu.style.left = ttRect.left + 'px';
      menu.style.right = '';
      menu.style.top  = (ttRect.bottom + 6) + 'px';
      menu.classList.add('visible');
      bmTtMenuOpen = true;
    });

    let bmTtSubHideTimer;

    // Keep submenu alive when mouse is on it
    document.getElementById('bm-tt-submenu').addEventListener('mouseenter', () => {
      clearTimeout(bmTtHideTimer);
      clearTimeout(bmTtSubHideTimer);
    });
    document.getElementById('bm-tt-submenu').addEventListener('mouseleave', () => {
      document.getElementById('bm-tt-submenu').classList.remove('visible');
      bmTtSubmenuOpen = false;
    });
    // Keep menu alive when mouse is on it (but not on addcoll row — submenu handles that)
    document.getElementById('bm-tt-menu').addEventListener('mouseenter', () => clearTimeout(bmTtHideTimer));
    document.getElementById('bm-tt-menu').addEventListener('mouseleave', bmTtScheduleHide);

    // Menu item: Share
    document.getElementById('bm-ttm-share').addEventListener('click', () => {
      bmTtHideAll();
      const toast = document.createElement('div');
      toast.textContent = 'Link copied';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0d0d0d;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;z-index:99999;pointer-events:none;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });

    // Menu item: Edit
    document.getElementById('bm-ttm-edit').addEventListener('click', () => {
      if (!bmTtActiveBm) return;
      const bm = bmTtActiveBm;
      bmTtHideAll();
      currentEditBmId = bm.id;
      bmIsCode = bm.type === 'code';
      const editText = bm.selectionSpan?.textContent || bm.lastPara?.textContent || bm.title;
      openBookmarkModal(editText, { title: bm.title, color: bm.color, iconPath: bm.iconPath, iconSrc: bm.iconSrc, type: bm.type, collection: bm.collection });
    });

    // ─── Attached bookmarks state & rendering ───
    const attachedBookmarks = [];
    const chatBmMultiPopup  = document.getElementById('chat-bm-multi-popup');
    const chatBmInline      = document.getElementById('chat-bm-inline');
    const chatInputBox      = document.getElementById('chat-input-box');
    const chatInputRow      = document.getElementById('chat-input-row');

    const SVG_BM_CHIP_ICON = (bm, size) => {
      const s = size || 15;
      if (bm.type === 'code') {
        return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none"><path d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="${bm.color || '#0D0D0D'}"/></svg>`;
      }
      if (bm.iconSrc) {
        const color = bm.color || '#181818';
        const r = parseInt(color.slice(1,3),16)/255, g = parseInt(color.slice(3,5),16)/255, b_ = parseInt(color.slice(5,7),16)/255;
        const fid = `bm-chip-icon-filter-${bm.id}`;
        return `<span style="display:inline-flex;align-items:center;width:${s}px;height:${s}px;flex-shrink:0"><svg style="display:none;position:absolute;width:0;height:0"><defs><filter id="${fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b_} 0 0 0 1 0"/></filter></defs></svg><img src="${bm.iconSrc}" width="${s}" height="${s}" style="filter:url(#${fid})"/></span>`;
      }
      if (bm.iconPath) {
        return `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none"><path d="${bm.iconPath}" stroke="${bm.color || '#161616'}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      }
      return `<svg width="${s}" height="${s}" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.4968V3.125C11.876 2.43464 11.3164 1.875 10.626 1.875H4.37598C3.68562 1.875 3.12598 2.43464 3.12598 3.125V12.4968C3.12598 13.0029 3.69625 13.2992 4.11037 13.0081L6.78216 11.1302C7.21348 10.8271 7.78848 10.8271 8.21979 11.1302L10.8916 13.0081C11.3057 13.2992 11.876 13.0029 11.876 12.4968Z" stroke="${bm.color || '#161616'}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };

    const SVG_CHEVRON_DOWN_SMALL = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M10.8332 4.875L7.26586 8.44231C6.84282 8.86535 6.15691 8.86535 5.73381 8.44231L2.1665 4.875" stroke="#535353" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    function renderBmMultiPopup() {
      chatBmMultiPopup.innerHTML = '';
      attachedBookmarks.forEach(bm => {
        const item = document.createElement('div');
        item.className = 'chat-bm-popup-item';
        item.innerHTML = `
          <button class="chat-bm-popup-x" title="Remove">×</button>
          <span class="chat-bm-popup-icon">${SVG_BM_CHIP_ICON(bm, 18)}</span>
          <span class="chat-bm-popup-title">${escHtml(bm.title)}</span>
        `;
        item.querySelector('.chat-bm-popup-x').addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = attachedBookmarks.findIndex(b => b.id === bm.id);
          if (idx !== -1) attachedBookmarks.splice(idx, 1);
          if (attachedBookmarks.length <= 1) chatBmMultiPopup.classList.remove('visible');
          renderAttachedBookmarks();
          if (attachedBookmarks.length > 1) renderBmMultiPopup();
        });
        chatBmMultiPopup.appendChild(item);
      });
    }

    function renderAttachedBookmarks() {
      chatBmInline.innerHTML = '';

      if (attachedBookmarks.length === 0) {
        // Collapse: move textarea back into the row
        chatInputBox.classList.remove('bm-expanded');
        if (chatTextarea.parentElement === chatInputBox) {
          chatInputRow.insertBefore(chatTextarea, chatInputRow.querySelector('.input-right'));
        }
        return;
      }

      // Expand: move textarea above the row
      chatInputBox.classList.add('bm-expanded');
      if (chatTextarea.parentElement !== chatInputBox) {
        chatInputBox.insertBefore(chatTextarea, chatInputRow);
      }

      if (attachedBookmarks.length === 1) {
        const bm = attachedBookmarks[0];
        const chip = document.createElement('div');
        chip.className = 'chat-bm-inline-chip';
        chip.innerHTML = `
          <span class="ibm-icon-wrap">
            <span class="ibm-icon">${SVG_BM_CHIP_ICON(bm, 18)}</span>
            <button class="ibm-x" title="Remove">×</button>
          </span>
          <span class="ibm-title">${escHtml(bm.title)}</span>
        `;
        chip.querySelector('.ibm-x').addEventListener('click', (e) => {
          e.stopPropagation();
          attachedBookmarks.splice(0, 1);
          renderAttachedBookmarks();
        });
        chatBmInline.appendChild(chip);
      } else {
        // Multi-pill: bookmark icon + "N Bookmarks" + chevron; hover shows × to bulk-remove
        const pill = document.createElement('div');
        pill.className = 'chat-bm-multi-pill';
        const genericBmSvg = `<svg width="18" height="18" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.4968V3.125C11.876 2.43464 11.3164 1.875 10.626 1.875H4.37598C3.68562 1.875 3.12598 2.43464 3.12598 3.125V12.4968C3.12598 13.0029 3.69625 13.2992 4.11037 13.0081L6.78216 11.1302C7.21348 10.8271 7.78848 10.8271 8.21979 11.1302L10.8916 13.0081C11.3057 13.2992 11.876 13.0029 11.876 12.4968Z" stroke="#0d0d0d" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        pill.innerHTML = `
          <span class="mbm-icon-wrap">
            <span class="mbm-icon">${genericBmSvg}</span>
            <button class="mbm-x" title="Remove all">×</button>
          </span>
          <span class="mbm-count">${attachedBookmarks.length} Bookmarks</span>
          <span class="mbm-chevron">${SVG_CHEVRON_DOWN_SMALL}</span>
        `;
        pill.querySelector('.mbm-x').addEventListener('click', (e) => {
          e.stopPropagation();
          attachedBookmarks.splice(0);
          chatBmMultiPopup.classList.remove('visible');
          renderAttachedBookmarks();
        });
        pill.addEventListener('click', (e) => {
          if (e.target.closest('.mbm-x')) return;
          e.stopPropagation();
          if (chatBmMultiPopup.classList.contains('visible')) {
            chatBmMultiPopup.classList.remove('visible');
            return;
          }
          renderBmMultiPopup();
          const pr = pill.getBoundingClientRect();
          chatBmMultiPopup.style.bottom = (window.innerHeight - pr.top + 8) + 'px';
          chatBmMultiPopup.style.left   = pr.left + 'px';
          chatBmMultiPopup.style.top    = 'auto';
          chatBmMultiPopup.classList.add('visible');
        });
        chatBmInline.appendChild(pill);
      }
    }

    document.addEventListener('click', () => chatBmMultiPopup.classList.remove('visible'));
    chatBmMultiPopup.addEventListener('click', e => e.stopPropagation());

    // Menu item: Ask ChatGPT — attach bookmark to input
    document.getElementById('bm-ttm-ask').addEventListener('click', () => {
      if (!bmTtActiveBm) { bmTtHideAll(); return; }
      const bm = bmTtActiveBm;
      if (!attachedBookmarks.find(b => b.id === bm.id)) {
        attachedBookmarks.push(bm);
        renderAttachedBookmarks();
      }
      bmTtHideAll();
      chatTextarea.focus();
    });

    // Menu item: Delete
    document.getElementById('bm-ttm-delete').addEventListener('click', () => {
      if (!bmTtActiveBm) return;
      const id = bmTtActiveBm.id;
      const idx = fnBookmarks.findIndex(b => b.id === id);
      if (idx !== -1) fnBookmarks.splice(idx, 1);
      document.querySelectorAll(`[data-bm-id="${id}"]`).forEach(el => {
        if (el.classList.contains('bm-highlight')) {
          // unwrap: keep the text, remove only the highlight span
          const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        } else {
          el.remove();
        }
      });
      bmTtHideAll();
      fnRender();
    });

    // New collection inline input
    document.getElementById('bm-tt-sub-new').addEventListener('click', () => {
      const row = document.getElementById('bm-tt-sub-new');
      if (row.querySelector('input')) return;
      row.innerHTML = '';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Collection name...';
      input.style.cssText = 'border:none;outline:none;font-size:13px;flex:1;background:transparent;min-width:0;';
      const check = document.createElement('button');
      check.innerHTML = SVG_TT_CHECK;
      check.style.cssText = 'border:none;background:none;cursor:pointer;padding:2px;display:flex;align-items:center;flex-shrink:0;';
      row.appendChild(input);
      row.appendChild(check);
      input.focus();

      function bmResetNewRow() {
        row.innerHTML = '';
        const ps = document.createElement('span');
        ps.id = 'bm-tt-sub-plus-icon';
        ps.innerHTML = SVG_TT_PLUS;
        const lbl = document.createElement('span');
        lbl.id = 'bm-tt-sub-new-label';
        lbl.textContent = 'New collection';
        row.appendChild(ps);
        row.appendChild(lbl);
      }

      function bmConfirmNewCollection() {
        const name = input.value.trim();
        if (!name) { bmResetNewRow(); return; }
        const icon = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3.33 15H11.67M3.33 11.67H16.67M3.33 8.33H11.67M3.33 5H16.67" stroke="#888" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        COLLECTIONS.push({ name, icon });
        if (bmTtActiveBm) bmTtActiveBm.collection = name;
        // Add row to DOM list
        const list = document.getElementById('bm-tt-sub-list');
        const collRow = document.createElement('div');
        collRow.className = 'bm-tt-sub-coll';
        collRow.innerHTML = icon + `<span>${name}</span>`;
        collRow.addEventListener('click', () => {
          if (bmTtActiveBm) { bmTtActiveBm.collection = name; fnRender(); }
          bmTtHideAll();
        });
        list.appendChild(collRow);
        bmResetNewRow();
        bmTtHideAll();
        fnRender();
      }

      check.addEventListener('click', bmConfirmNewCollection);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') bmConfirmNewCollection();
        if (e.key === 'Escape') bmResetNewRow();
      });
    });

    // Close all tooltip UI on outside click
    document.addEventListener('mousedown', (e) => {
      const tt   = document.getElementById('bm-tt');
      const menu = document.getElementById('bm-tt-menu');
      const sub  = document.getElementById('bm-tt-submenu');
      if (!tt.contains(e.target) && !menu.contains(e.target) && !sub.contains(e.target) && !e.target.closest('.fn-item')) {
        bmTtHideAll();
      }
    }, true);

    function fnUpdateModeIcon() {
      fnModeIconEl.innerHTML = fnMode === 'prompts' ? SVG_CHAT_ICON : SVG_BOOKMARK_ICON;
    }

    function fnRebuildLines(count) {
      // Remove old lines, keep the mode icon
      fnLines.querySelectorAll('.fn-line').forEach(el => el.remove());
      for (let i = 0; i < count; i++) {
        const line = document.createElement('div');
        line.className = 'fn-line';
        line.style.width = '28px';
        fnLines.appendChild(line);
      }
    }

    function updateActionBarBadges() {
      document.querySelectorAll('.ai-message').forEach(msg => {
        const btn = msg.querySelector('.action-btn-bookmark');
        if (!btn) return;
        const bms = fnBookmarks.filter(bm => bm.lastPara && msg.contains(bm.lastPara));
        // Update label
        let label = btn.querySelector('.bm-ab-label');
        if (!label) {
          label = document.createElement('span');
          label.className = 'bm-ab-label';
          btn.appendChild(label);
        }
        label.textContent = bms.length > 0 ? `Bookmarks (${bms.length})` : 'Bookmarks';
        let stack = btn.querySelector('.bm-action-stack');
        if (!stack) {
          stack = document.createElement('span');
          stack.className = 'bm-action-stack';
          btn.insertBefore(stack, btn.firstChild);
        }
        stack.innerHTML = '';
        const shown = bms.slice(0, 3);
        shown.forEach((bm, i) => {
          const circle = document.createElement('span');
          circle.className = 'bm-tt-mini-badge';
          if (i > 0) circle.style.marginLeft = '-4px';
          const color = bm.color || '#181818';
          if (bm.iconSrc) {
            const img = document.createElement('img');
            img.src = bm.iconSrc;
            img.width = 15; img.height = 15;
            const fId = `bm-ab-filter-${bm.id}`;
            if (!document.getElementById(fId)) {
              const r = parseInt(bm.color.slice(1,3),16)/255;
              const g = parseInt(bm.color.slice(3,5),16)/255;
              const b = parseInt(bm.color.slice(5,7),16)/255;
              const fsvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
              fsvg.setAttribute('style','display:none;position:absolute;width:0;height:0');
              fsvg.innerHTML = `<defs><filter id="${fId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0"/></filter></defs>`;
              document.body.appendChild(fsvg);
            }
            img.style.filter = `url(#${fId})`;
            circle.appendChild(img);
          } else {
            circle.innerHTML = bm.iconPath
              ? `<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="${bm.iconPath}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              : `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.497V3.125C11.876 2.435 11.317 1.875 10.626 1.875H4.376C3.686 1.875 3.126 2.435 3.126 3.125V12.497C3.126 13.003 3.696 13.299 4.11 13.008L6.782 11.13C7.213 10.827 7.788 10.827 8.22 11.13L10.892 13.008C11.306 13.299 11.876 13.003 11.876 12.497Z" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          }
          stack.appendChild(circle);
        });
      });
    }

    // ── Right bookmarks panel ─────────────────────────────────────────────────
    const bmRpPanel  = document.getElementById('bm-right-panel');
    const bmRpList   = document.getElementById('bm-rp-list');
    const bmRpCount  = document.getElementById('bm-rp-count');
    let bmRpSourceMsg = null;

    function bmRpFormat(bm) {
      const date = bm.createdAt ? bmTimeAgo(bm.createdAt) : '';
      const color = bm.color || '#181818';
      // Badge
      const badge = document.createElement('span');
      badge.className = 'bm-tt-mini-badge';
      if (bm.iconSrc) {
        const fid = `bm-rp-filter-${bm.id}`;
        if (!document.getElementById(fid)) {
          const r = parseInt(color.slice(1,3),16)/255;
          const g = parseInt(color.slice(3,5),16)/255;
          const b = parseInt(color.slice(5,7),16)/255;
          const fsvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
          fsvg.setAttribute('style','display:none;position:absolute;width:0;height:0');
          fsvg.innerHTML = `<defs><filter id="${fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0"/></filter></defs>`;
          document.body.appendChild(fsvg);
        }
        const img = document.createElement('img'); img.src = bm.iconSrc;
        img.width = 15; img.height = 15; img.style.filter = `url(#${fid})`;
        badge.appendChild(img);
      } else {
        badge.innerHTML = bm.iconPath
          ? `<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="${bm.iconPath}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11.876 12.497V3.125C11.876 2.435 11.317 1.875 10.626 1.875H4.376C3.686 1.875 3.126 2.435 3.126 3.125V12.497C3.126 13.003 3.696 13.299 4.11 13.008L6.782 11.13C7.213 10.827 7.788 10.827 8.22 11.13L10.892 13.008C11.306 13.299 11.876 13.003 11.876 12.497Z" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      }
      // Row
      const row = document.createElement('div');
      row.className = 'bm-rp-item';
      const badgeWrap = document.createElement('div'); badgeWrap.className = 'bm-rp-badge-wrap';
      badgeWrap.appendChild(badge);
      const content = document.createElement('div'); content.className = 'bm-rp-content';
      const meta = document.createElement('div'); meta.className = 'bm-rp-meta';
      const titleEl = document.createElement('div'); titleEl.className = 'bm-rp-title'; titleEl.textContent = bm.title;
      const metaRow = document.createElement('div'); metaRow.className = 'bm-rp-meta-row';
      metaRow.innerHTML = `<span>${date}</span>`;
      if (bm.collection) {
        const collDef2 = COLLECTIONS.find(c => c.name === bm.collection);
        const collIconHtml = collDef2 ? `<span style="display:inline-flex;align-items:center;width:13px;height:13px;flex-shrink:0;margin-right:3px">${collDef2.icon.replace(/width="16" height="16"/g,'width="13" height="13"')}</span>` : '';
        metaRow.innerHTML += `<span class="bm-rp-dot">·</span><span class="bm-rp-coll" style="display:inline-flex;align-items:center;gap:0">${collIconHtml}${bm.collection}</span>`;
      }
      meta.appendChild(titleEl); meta.appendChild(metaRow);
      const preview = document.createElement('div'); preview.className = 'bm-rp-preview';
      preview.textContent = bm.selectionSpan?.textContent || bm.lastPara?.textContent?.slice(0, 200) || '';
      content.appendChild(meta); content.appendChild(preview);
      row.appendChild(badgeWrap); row.appendChild(content);
      row.addEventListener('mouseenter', () => {
        const floatBtn = document.getElementById('bm-rp-dots-float');
        if (!floatBtn) return;
        const rowRect = row.getBoundingClientRect();
        floatBtn.style.top = (rowRect.top + rowRect.height / 2 - 14) + 'px';
        floatBtn.style.left = (rowRect.right - 36) + 'px';
        floatBtn.style.right = 'auto';
        floatBtn.style.display = 'flex';
        floatBtn._currentBm = bm;
        floatBtn._currentRow = row;
        row.classList.add('bm-rp-item-active');
      });
      row.addEventListener('mouseleave', (e) => {
        const floatBtn = document.getElementById('bm-rp-dots-float');
        if (floatBtn && !floatBtn.matches(':hover')) {
          floatBtn.style.display = 'none';
          row.classList.remove('bm-rp-item-active');
        }
      });
      row.addEventListener('click', () => bmRpAnchor(bm));
      // Drag to chat
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', bm.selectionSpan?.textContent || bm.title);
        e.dataTransfer.setData('application/bm-id', String(bm.id));
        row.classList.add('bm-rp-dragging');
        document.getElementById('chat-input-box')?.classList.add('bm-drag-target');
        // Custom drag ghost — looks like the inline chip
        const ghost = document.createElement('span');
        ghost.className = 'bm-inline-chip bm-drag-ghost';
        ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;pointer-events:none;';
        const color = bm.color || '#181818';
        const fid = `bm-chip-filter-${bm.id}`;
        if (bm.iconSrc) {
          if (!document.getElementById(fid)) {
            const r=parseInt(color.slice(1,3),16)/255, g=parseInt(color.slice(3,5),16)/255, b_=parseInt(color.slice(5,7),16)/255;
            const fs = document.createElementNS('http://www.w3.org/2000/svg','svg');
            fs.setAttribute('style','display:none;position:absolute;width:0;height:0');
            fs.innerHTML=`<defs><filter id="${fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b_} 0 0 0 1 0"/></filter></defs>`;
            document.body.appendChild(fs);
          }
          const img = document.createElement('img');
          img.src = bm.iconSrc; img.width = 13; img.height = 13;
          img.style.filter = `url(#${fid})`;
          ghost.appendChild(img);
        }
        const lbl = document.createElement('span'); lbl.textContent = bm.title; ghost.appendChild(lbl);
        const x = document.createElement('span'); x.textContent = '×'; x.style.cssText = 'color:#aaa;font-size:15px;margin-left:2px;'; ghost.appendChild(x);
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
        setTimeout(() => ghost.remove(), 0);
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('bm-rp-dragging');
        document.getElementById('chat-input-box')?.classList.remove('bm-drag-target', 'bm-drag-hover');
      });
      return row;
    }

    let bmRpActiveAnchor = null;
    let bmRpDimmedBadges = [];
    function bmRpClearAnchor() {
      if (bmRpActiveAnchor) {
        const { para, span } = bmRpActiveAnchor;
        if (span) span.classList.remove('bm-para-underline');
        else if (para) para.classList.remove('bm-para-underline');
        bmRpActiveAnchor = null;
      }
      bmRpDimmedBadges.forEach(b => b.classList.remove('bm-badge-dimmed'));
      bmRpDimmedBadges = [];
    }
    function bmRpAnchor(bm) {
      bmRpClearAnchor();
      const target = bm.selectionSpan || bm.lastPara;
      if (!target) return;
      const color = bm.color || '#181818';
      target.style.setProperty('--bm-underline-color', color);
      target.classList.add('bm-para-underline');
      bmRpActiveAnchor = { para: bm.lastPara, span: bm.selectionSpan };
      // Dim sibling badges on the same paragraph
      if (bm.lastPara) {
        const group = bm.lastPara.querySelector(':scope > .bm-badge-group');
        if (group) {
          group.querySelectorAll('.bm-badge').forEach(badge => {
            if (parseInt(badge.dataset.bmId) !== bm.id) {
              badge.classList.add('bm-badge-dimmed');
              bmRpDimmedBadges.push(badge);
            }
          });
        }
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function bmRpOpen(msgEl) {
      bmRpSourceMsg = msgEl;
      const bms = fnBookmarks.filter(bm => bm.lastPara && msgEl.contains(bm.lastPara));
      bmRpCount.textContent = `· ${bms.length}`;
      bmRpList.innerHTML = '';
      bms.forEach(bm => bmRpList.appendChild(bmRpFormat(bm)));
      bmRpPanel.classList.add('open');
    }

    function bmRpClose() {
      bmRpPanel.classList.remove('open');
      bmRpSourceMsg = null;
      bmRpClearAnchor();
    }

    document.getElementById('bm-rp-close').addEventListener('click', bmRpClose);

    // Floating dots button for right panel rows
    const rpDotsFloat = document.getElementById('bm-rp-dots-float');
    if (rpDotsFloat) {
      let rpFloatCachedRect = null;
      rpDotsFloat.addEventListener('mouseenter', () => {
        rpFloatCachedRect = rpDotsFloat.getBoundingClientRect();
      });
      rpDotsFloat.addEventListener('click', (e) => {
        e.stopPropagation();
        const bm = rpDotsFloat._currentBm;
        if (!bm) return;
        bmTtActiveBm = bm;
        const menu = document.getElementById('bm-tt-menu');
        document.getElementById('bm-tt-submenu').classList.remove('visible');
        bmTtSubmenuOpen = false;
        const btnRect = rpFloatCachedRect || rpDotsFloat.getBoundingClientRect();
        menu.style.right = 'auto';
        menu.style.left = Math.max(0, btnRect.right - 200) + 'px';
        menu.style.top = (btnRect.bottom + 6) + 'px';
        menu.classList.add('visible');
        bmTtMenuOpen = true;
        rpDotsFloat.style.display = 'none';
      });
      rpDotsFloat.addEventListener('mouseleave', () => {
        rpDotsFloat.style.display = 'none';
        if (rpDotsFloat._currentRow) {
          rpDotsFloat._currentRow.classList.remove('bm-rp-item-active');
          rpDotsFloat._currentRow = null;
        }
      });
    }

    // ── Drag bookmark to chat ─────────────────────────────────────────────────
    const bmDropZone = document.getElementById('bm-drop-zone');
    const bmDropShell = document.getElementById('bm-drop-shell');
    const bmChatInlineEl = document.getElementById('chat-bm-inline');

    bmDropShell.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; chatInputBox?.classList.add('bm-drag-hover'); });
    bmDropShell.addEventListener('dragleave', (e) => { if (!bmDropShell.contains(e.relatedTarget)) chatInputBox?.classList.remove('bm-drag-hover'); });
    bmDropShell.addEventListener('drop', (e) => {
      e.preventDefault();
      chatInputBox?.classList.remove('bm-drag-target', 'bm-drag-hover');
      const bmId = parseInt(e.dataTransfer.getData('application/bm-id'));
      const bm = fnBookmarks.find(b => b.id === bmId);
      if (!bm) return;
      if (!attachedBookmarks.find(b => b.id === bm.id)) {
        attachedBookmarks.push(bm);
      }
      renderAttachedBookmarks();
    });

    function fnRender() {
      fnList.innerHTML = '';
      fnUpdateModeIcon();
      updateActionBarBadges();
      if (fnMode === 'prompts') {
        const promptItems = [];
        activeConvPrompts.forEach((prompt, i) => {
          const item = document.createElement('div');
          item.className = 'fn-item';
          const text = document.createElement('span');
          text.className = 'fn-item-text';
          text.textContent = prompt;
          item.appendChild(text);
          item.addEventListener('click', () => {
            const target = document.getElementById(`msg-${i}`);
            const scroller = document.getElementById('messages');
            if (target && scroller) {
              const targetRect = target.getBoundingClientRect();
              const scrollerRect = scroller.getBoundingClientRect();
              scroller.scrollTo({ top: scroller.scrollTop + (targetRect.top - scrollerRect.top) - 16, behavior: 'smooth' });
              promptItems.forEach(el => el.classList.remove('fn-item-active'));
              item.classList.add('fn-item-active');
            }
          });
          fnList.appendChild(item);
          promptItems.push(item);
        });

        // Auto-highlight the prompt closest to the top of the viewport on scroll
        const scroller = document.getElementById('messages');
        function updateActivePrompt() {
          if (!scroller) return;
          const scrollerRect = scroller.getBoundingClientRect();
          let bestIdx = 0;
          let bestDist = Infinity;
          activeConvPrompts.forEach((_, i) => {
            const el = document.getElementById(`msg-${i}`);
            if (!el) return;
            const dist = Math.abs(el.getBoundingClientRect().top - scrollerRect.top - 16);
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
          });
          promptItems.forEach((el, i) => el.classList.toggle('fn-item-active', i === bestIdx));
        }
        updateActivePrompt();
        if (scroller) {
          scroller._fnScrollHandler && scroller.removeEventListener('scroll', scroller._fnScrollHandler);
          scroller._fnScrollHandler = updateActivePrompt;
          scroller.addEventListener('scroll', updateActivePrompt, { passive: true });
        }
      } else {
        if (fnBookmarks.length === 0) {
          fnList.innerHTML = `<div style="padding:24px 12px;text-align:center;color:#b0b0b0;font-size:13px;line-height:18px;">No bookmarks yet.<br>Highlight text to save one.</div>`;
          fnRebuildLines(1);
          return;
        }
        fnBookmarks.forEach(bm => {
          const item = document.createElement('div');
          item.className = 'fn-item';
          let iconSvg;
          if (bm.type === 'code') {
            // Use the </> code icon, colored with the bookmark's color
            iconSvg = `<svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="${bm.color || '#0D0D0D'}"/></svg>`;
          } else if (bm.iconPath) {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${bm.iconPath}" stroke="${bm.color || '#181818'}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          } else {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3.33337 15H11.6667M3.33337 11.6667H16.6667M3.33337 8.33333H11.6667M3.33337 5H16.6667" stroke="${bm.color || '#181818'}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          }
          item.innerHTML = `
            <span class="fn-item-bm" style="flex-shrink:0;display:flex;align-items:center;">${iconSvg}</span>
            <span class="fn-item-text">${bm.title}</span>
            <button class="fn-item-dots" title="More options">${SVG_TT_DOTS}</button>`;
          item.querySelector('.fn-item-dots').addEventListener('click', (e) => {
            e.stopPropagation();
            bmTtShow(bm, e.currentTarget);
          });
          if (fnNavActiveBmId === bm.id) item.classList.add('fn-item-active');
          item.addEventListener('click', (e) => {
            if (e.target.closest('.fn-item-dots')) return;
            const scroller = document.getElementById('messages');
            const target = document.querySelector(`[data-bm-id="${bm.id}"]`);
            if (!scroller) return;
            if (fnNavActiveBmId === bm.id) {
              // Same bookmark — go back to saved position
              scroller.scrollTo({ top: fnNavScrollSaved, behavior: 'smooth' });
              fnNavActiveBmId = null;
              fnNavScrollSaved = null;
              document.getElementById('fn-back-row').style.display = 'none';
              document.querySelectorAll('.fn-item').forEach(i => i.classList.remove('fn-item-active'));
            } else {
              if (!target) return;
              fnNavScrollSaved = scroller.scrollTop;
              fnNavActiveBmId = bm.id;
              const targetRect = target.getBoundingClientRect();
              const scrollerRect = scroller.getBoundingClientRect();
              scroller.scrollTo({ top: scroller.scrollTop + (targetRect.top - scrollerRect.top) - 80, behavior: 'smooth' });
              document.getElementById('fn-back-row').style.display = 'flex';
              document.querySelectorAll('.fn-item').forEach(i => i.classList.remove('fn-item-active'));
              item.classList.add('fn-item-active');
              setTimeout(() => {
                target.classList.remove('bm-jump');
                void target.offsetWidth;
                target.classList.add('bm-jump');
                setTimeout(() => target.classList.remove('bm-jump'), 1100);
              }, 350);
            }
          });
          fnList.appendChild(item);
        });
      }
      // Sync collapsed lines to item count
      const count = fnMode === 'prompts' ? activeConvPrompts.length : fnBookmarks.length;
      fnRebuildLines(Math.max(count, 1));
    }

    document.getElementById('fn-back-btn').addEventListener('click', () => {
      const scroller = document.getElementById('messages');
      if (scroller && fnNavScrollSaved !== null) {
        scroller.scrollTo({ top: fnNavScrollSaved, behavior: 'smooth' });
      }
      fnNavActiveBmId = null;
      fnNavScrollSaved = null;
      document.getElementById('fn-back-row').style.display = 'none';
      document.querySelectorAll('.fn-item').forEach(i => i.classList.remove('fn-item-active'));
    });

    bmCreateBtn.addEventListener('click', () => {
      const title = bmNameInput.value.trim() || 'Untitled Bookmark';
      const color = bmSelectedColor;
      // Use pending values captured before closeBookmarkModal() ran in listener 1
      const iconPath = pendingBmIconPath;
      const iconSrc = pendingBmIconSrc;
      const selSpan = pendingSelSpan;
      const collText = bmCollectionText.textContent;
      const collectionVal = collText !== 'Select a collection' ? collText : null;
      if (currentEditBmId != null) {
        const bm = fnBookmarks.find(b => b.id === currentEditBmId);
        if (bm) {
          bm.title = title;
          bm.color = color;
          bm.iconPath = iconPath;
          bm.collection = collectionVal !== null ? collectionVal : (bm.collection || null);
          // createdAt preserved — do not overwrite
        }
        // Update badge color if present
        const badge = document.querySelector(`.bm-badge[data-bm-id="${currentEditBmId}"]`);
        if (badge) badge.style.background = '#fff';
        currentEditBmId = null;
        bmIsCode = false;
        bmCodeHtml = '';
      } else {
        const id = nextBmId - 1;
        const type = bmIsCode ? 'code' : 'text';
        fnBookmarks.unshift({ id, title, color, iconPath, iconSrc, type, collection: collectionVal, createdAt: new Date(), lastPara: bookmarkLastPara, selectionSpan: selSpan });
        bmIsCode = false;
        bmCodeHtml = '';
      }
      fnRender();
    });

    function updateFloatingNav() {
      if (inChat && activeConvId !== 3) { fnLines.classList.add('active'); fnCard.classList.add('active'); }
      else { fnLines.classList.remove('active'); fnCard.classList.remove('active'); }
    }

    // Sidebar: click handlers for prefilled conversations
    document.querySelectorAll('.history-item[data-prefilled]').forEach(el => {
      el.addEventListener('click', () => loadConversation(parseInt(el.dataset.prefilled)));
    });

    // Boot: load prefilled conversation on page load
    buildPrefilledConversation();

    // Expose bookmarks to React after they're loaded
    setTimeout(() => {
      const byCollection = {};
      fnBookmarks.forEach(bm => {
        if (!bm.collection) return;
        if (!byCollection[bm.collection]) byCollection[bm.collection] = [];
        byCollection[bm.collection].push({
          id: bm.id,
          title: bm.title,
          color: bm.color,
          iconSrc: bm.iconSrc,
          collection: bm.collection,
          createdAt: bm.createdAt,
          _bm: bm,
        });
      });
      bmCollStore.byCollection = byCollection;
      setBmsByCollRef.current(byCollection);
    }, 300);

  }, []);

  return (
    <>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="sidebar" id="app-sidebar">

        <div className="sidebar-top">
          {/* ChatGPT logo – 55180d.svg */}
          <button className="icon-sq" title="Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4919 21.8909C12.8321 21.8909 12.2052 21.7654 11.6111 21.5143C11.0229 21.2658 10.4861 20.9104 10.0277 20.4659C9.52417 20.6376 8.99558 20.7244 8.46357 20.7226C7.60175 20.7295 6.754 20.5041 6.00939 20.0701C5.26213 19.6391 4.63581 19.0264 4.18855 18.2888C3.73752 17.529 3.50507 16.6594 3.51683 15.7759C3.51683 15.392 3.56921 14.9762 3.67397 14.5284C3.15734 14.0549 2.7402 13.4832 2.44688 12.8467C2.15604 12.2056 2.00728 11.5093 2.0108 10.8053C2.01432 10.1014 2.17004 9.40652 2.46727 8.7684C2.76402 8.11799 3.19581 7.53818 3.73394 7.06751C4.2831 6.58135 4.94147 6.23488 5.65314 6.05753C5.79102 5.32134 6.10366 4.62901 6.56476 4.03877C7.03896 3.43183 7.61912 2.95682 8.30523 2.61377C8.98702 2.27168 9.73993 2.09537 10.5027 2.09918C11.1624 2.09918 11.789 2.22433 12.3823 2.47463C12.9757 2.72572 13.5035 3.07557 13.9657 3.52419C14.4692 3.35209 14.9977 3.26494 15.5298 3.2663C16.4143 3.2663 17.2323 3.4842 17.984 3.92002C18.728 4.34818 19.3483 4.96189 19.7845 5.70128C20.2467 6.45377 20.4778 7.29142 20.4778 8.21423C20.4778 8.59807 20.425 9.0139 20.3194 9.46171C20.8472 9.94951 21.2562 10.5169 21.5465 11.1638C21.8368 11.7971 21.9819 12.4633 21.9819 13.1622C21.9819 13.8755 21.83 14.562 21.5261 15.2217C21.2231 15.8794 20.785 16.4659 20.2403 16.943C19.6945 17.4191 19.0432 17.7583 18.3403 17.9326C18.2017 18.6719 17.8823 19.3654 17.4106 19.9513C16.9547 20.5535 16.3651 21.0413 15.6882 21.3763C15.0064 21.7184 14.2535 21.8947 13.4907 21.8909M8.60151 19.4176C9.26124 19.4176 9.835 19.2788 10.3228 19.0013L14.0448 16.8638C14.1071 16.8234 14.158 16.7677 14.1924 16.7019C14.2269 16.6361 14.2438 16.5626 14.2416 16.4884V14.7851L9.45316 17.5367C9.32335 17.6204 9.17218 17.6649 9.01774 17.6649C8.8633 17.6649 8.71213 17.6204 8.58232 17.5367L4.84228 15.38C4.84087 15.4267 4.83402 15.473 4.82189 15.518V15.7555C4.82189 16.428 4.98022 17.0482 5.29689 17.6159C5.62715 18.1701 6.08256 18.6055 6.66312 18.9222C7.25457 19.2555 7.92385 19.4261 8.60271 19.4164M8.80063 16.1897C8.86721 16.2266 8.94163 16.2472 9.01774 16.2497C9.08411 16.2497 9.15008 16.2297 9.21566 16.1897L10.7006 15.3381L5.93022 12.5672C5.79298 12.492 5.67949 12.3799 5.60255 12.2437C5.52561 12.1074 5.48829 11.9523 5.49481 11.7959V7.50173C4.83508 7.79121 4.3073 8.23982 3.91147 8.84757C3.51765 9.43193 3.3106 10.1221 3.31771 10.8267C3.31771 11.4737 3.48285 12.0934 3.81311 12.686C4.14257 13.2801 4.57119 13.7291 5.09897 14.033L8.80063 16.1897ZM13.4907 20.5835C14.1904 20.5835 14.8241 20.4251 15.3919 20.1085C15.9574 19.7977 16.4275 19.3386 16.7517 18.7807C17.0759 18.2228 17.2419 17.587 17.2319 16.9418V12.6668C17.2357 12.5948 17.2191 12.5232 17.1841 12.4602C17.1491 12.3972 17.0971 12.3453 17.034 12.3105L15.5298 11.4397V16.9622C15.5363 17.1186 15.499 17.2736 15.4221 17.4099C15.3451 17.5462 15.2316 17.6583 15.0944 17.7335L11.3532 19.8914C11.9739 20.3445 12.7234 20.5871 13.4919 20.5835M14.244 13.3397V10.6492L12.0069 9.38255L9.75063 10.6492V13.3409L12.0069 14.6076L14.244 13.3397ZM8.46477 7.02793C8.45803 6.87136 8.49524 6.71604 8.57219 6.57952C8.64914 6.44301 8.76275 6.33075 8.90019 6.25545L12.6414 4.09875C12.0212 3.6454 11.2722 3.40245 10.5039 3.40544C9.80501 3.40544 9.17167 3.56377 8.60391 3.88044C8.04588 4.18719 7.58062 4.63836 7.25687 5.18669C6.9368 5.75392 6.7729 6.39588 6.78187 7.04712V11.3017C6.78187 11.4609 6.84784 11.5864 6.97979 11.6784L8.46357 12.5492L8.46477 7.02793ZM18.5202 16.4884C19.1799 16.1973 19.7009 15.7483 20.0831 15.1413C20.479 14.5352 20.6769 13.8755 20.6769 13.1622C20.6753 12.5102 20.5051 11.8697 20.1827 11.3029C19.8524 10.7088 19.4234 10.2598 18.8956 9.95591L15.194 7.8184C15.1148 7.76642 15.0424 7.74683 14.9769 7.75962C14.9064 7.75982 14.8376 7.78067 14.7789 7.8196L13.294 8.64965L18.0836 11.4409C18.2201 11.5101 18.331 11.621 18.4002 11.7576C18.483 11.8874 18.5248 12.0391 18.5202 12.193V16.4884ZM14.5414 6.43418C14.6689 6.34434 14.8209 6.29612 14.9769 6.29612C15.1328 6.29612 15.2848 6.34434 15.4123 6.43418L19.1727 8.63046V8.27421C19.1727 7.64087 19.0144 7.04072 18.6977 6.47376C18.3965 5.89536 17.9368 5.41478 17.3723 5.08834C16.8045 4.74448 16.1448 4.57255 15.3931 4.57255C14.7334 4.57255 14.1592 4.71129 13.6706 4.98878L9.94855 7.12629C9.88585 7.16664 9.83467 7.22254 9.79998 7.28854C9.7653 7.35454 9.7483 7.4284 9.75063 7.50293V9.20382L14.5414 6.43418Z" fill="#0D0D0D"/>
            </svg>
          </button>
          {/* sidebar toggle – 836f7a.svg */}
          <button className="icon-sq" id="sidebar-collapse-btn" title="Collapse sidebar" style={{color: "#8f8f8f"}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.83496 4.00004C6.38396 4.00404 6.01496 4.01204 5.69796 4.03804C5.31196 4.07004 5.03896 4.12304 4.82196 4.20004L4.62196 4.28604C4.18196 4.51004 3.81496 4.85004 3.55896 5.26804L3.45596 5.45204C3.32996 5.69904 3.24996 6.01404 3.20796 6.52804C3.16496 7.05104 3.16496 7.71804 3.16496 8.66304V11.327C3.16496 12.271 3.16496 12.939 3.20796 13.462C3.24996 13.977 3.32996 14.291 3.45596 14.538L3.55896 14.722C3.81496 15.14 4.18296 15.48 4.62196 15.704L4.82196 15.79C5.03896 15.867 5.31196 15.92 5.69796 15.952C6.01396 15.978 6.38296 15.986 6.83396 15.99L6.83496 4.00004ZM18.165 11.327C18.165 12.249 18.165 12.981 18.117 13.57C18.074 14.092 17.992 14.547 17.812 14.965L17.73 15.142C17.3951 15.7986 16.8853 16.3499 16.257 16.735L15.981 16.89C15.516 17.127 15.007 17.228 14.411 17.277C13.821 17.325 13.089 17.325 12.167 17.325H7.83296C6.91096 17.325 6.17896 17.325 5.58996 17.277C5.06796 17.235 4.61296 17.151 4.19496 16.972L4.01896 16.89C3.36203 16.5553 2.81039 16.0456 2.42496 15.417L2.27096 15.142C2.03296 14.676 1.93096 14.167 1.88296 13.57C1.83496 12.981 1.83496 12.25 1.83496 11.327V8.66304C1.83496 7.74104 1.83496 7.00904 1.88296 6.42004C1.93196 5.82304 2.03296 5.31404 2.27096 4.84904L2.42496 4.57304C2.81053 3.94489 3.36216 3.43548 4.01896 3.10104L4.19496 3.01804C4.61296 2.83804 5.06796 2.75504 5.58996 2.71304C6.17896 2.66504 6.90996 2.66504 7.83296 2.66504H12.167C13.089 2.66504 13.821 2.66504 14.41 2.71304C15.007 2.76204 15.516 2.86304 15.981 3.10104L16.257 3.25504C16.8855 3.64047 17.3952 4.19211 17.73 4.84904L17.812 5.02504C17.992 5.44304 18.074 5.89804 18.117 6.42004C18.165 7.00904 18.165 7.74004 18.165 8.66304V11.327ZM8.16496 15.995H12.167C13.111 15.995 13.779 15.995 14.302 15.952C14.816 15.91 15.131 15.83 15.378 15.704L15.562 15.601C15.98 15.345 16.32 14.977 16.544 14.538L16.63 14.338C16.707 14.121 16.76 13.848 16.792 13.462C16.835 12.939 16.835 12.272 16.835 11.327V8.66304C16.835 7.71904 16.835 7.05104 16.792 6.52804C16.76 6.14204 16.707 5.86904 16.63 5.65204L16.544 5.45204C16.3207 5.01406 15.9809 4.64622 15.562 4.38904L15.378 4.28604C15.131 4.16004 14.816 4.08004 14.302 4.03804C13.779 3.99504 13.112 3.99504 12.167 3.99504H8.16396L8.16496 4.00004V15.995Z" fill="#8F8F8F"/>
            </svg>
          </button>
        </div>

        {/* Collapsed icon rail — only visible when sidebar.collapsed */}
        <div className="sidebar-collapsed-icons">
          {/* New chat */}
          <button className="icon-sq" title="New chat">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.66895 11.333V8.66697C2.66895 7.74497 2.66895 7.01197 2.71695 6.42297C2.76495 5.82597 2.86695 5.31697 3.10395 4.85197L3.25895 4.57597C3.64424 3.94796 4.19551 3.43856 4.85195 3.10397L5.02895 3.02097C5.44695 2.84197 5.90095 2.75797 6.42395 2.71597C7.01295 2.66797 7.74395 2.66797 8.66695 2.66797H9.16695C9.34332 2.66797 9.51246 2.73804 9.63717 2.86275C9.76188 2.98746 9.83195 3.15661 9.83195 3.33297C9.83195 3.50934 9.76188 3.67849 9.63717 3.8032C9.51246 3.92791 9.34332 3.99797 9.16695 3.99797H8.66695C7.72295 3.99797 7.05395 3.99797 6.53195 4.04097C6.14595 4.07297 5.87195 4.12597 5.65595 4.20297L5.45595 4.28897C5.0176 4.51206 4.6494 4.85189 4.39195 5.27097L4.28995 5.45497C4.16395 5.70197 4.08395 6.01697 4.04195 6.53097C3.99895 7.05398 3.99895 7.72297 3.99895 8.66697V11.333C3.99895 12.277 3.99895 12.946 4.04195 13.469C4.08395 13.983 4.16395 14.298 4.28995 14.545L4.39195 14.729C4.64895 15.147 5.01595 15.487 5.45595 15.711L5.65595 15.797C5.87295 15.874 6.14595 15.927 6.53195 15.958C7.05395 16.001 7.72195 16.002 8.66695 16.002H11.3339C12.2779 16.002 12.9459 16.001 13.4689 15.958C13.9829 15.916 14.2979 15.837 14.5449 15.711L14.7289 15.607C15.1469 15.351 15.4879 14.984 15.7119 14.545L15.7979 14.345C15.8749 14.128 15.9279 13.855 15.9579 13.469C16.0009 12.946 16.0019 12.277 16.0019 11.333V10.833C16.0019 10.6566 16.072 10.4875 16.1967 10.3627C16.3214 10.238 16.4906 10.168 16.6669 10.168C16.8433 10.168 17.0125 10.238 17.1372 10.3627C17.2619 10.4875 17.3319 10.6566 17.3319 10.833V11.333C17.3319 12.255 17.3329 12.988 17.2849 13.577C17.2419 14.099 17.1579 14.554 16.9789 14.972L16.8959 15.148C16.5616 15.8043 16.0526 16.3555 15.4249 16.741L15.1489 16.895C14.6829 17.133 14.1739 17.235 13.5769 17.285C12.9869 17.332 12.2559 17.332 11.3339 17.332H8.66695C7.74395 17.332 7.01295 17.332 6.42395 17.284C5.90095 17.241 5.44695 17.158 5.02895 16.979L4.85195 16.895C4.19564 16.5607 3.64439 16.0516 3.25895 15.424L3.10395 15.148C2.86695 14.683 2.76495 14.174 2.71695 13.578C2.66795 12.988 2.66895 12.256 2.66895 11.333ZM13.4649 3.11297C13.9318 2.73254 14.5232 2.53899 15.1246 2.56984C15.726 2.6007 16.2945 2.85376 16.7199 3.27997L16.8869 3.46497C17.6139 4.35697 17.6139 5.64497 16.8869 6.53597L16.7189 6.72097L11.6729 11.769C11.1388 12.3027 10.4645 12.6744 9.72795 12.841L9.41095 12.899L7.59395 13.159C7.49171 13.1735 7.38749 13.1641 7.28954 13.1314C7.1916 13.0987 7.10261 13.0436 7.02964 12.9705C6.95667 12.8975 6.90172 12.8084 6.86914 12.7104C6.83656 12.6124 6.82725 12.5082 6.84195 12.406L7.10195 10.59L7.15995 10.271C7.3267 9.53481 7.69835 8.86085 8.23195 8.32697L13.2799 3.27997L13.4649 3.11297ZM15.7789 4.22097C15.5859 4.02789 15.3282 3.91324 15.0556 3.8992C14.7829 3.88517 14.5148 3.97274 14.3029 4.14497L14.2189 4.22097L9.17295 9.26897C8.81688 9.62484 8.56866 10.0741 8.45695 10.565L8.41695 10.777L8.28295 11.716L9.22295 11.582L9.43395 11.543C9.92552 11.4316 10.3755 11.1834 10.7319 10.827L15.7799 5.77997L15.8559 5.69597C16.1859 5.29197 16.1859 4.70797 15.8559 4.30397L15.7789 4.22097Z" fill="#0D0D0D"/></svg>
          </button>
          {/* Search */}
          <button className="icon-sq" title="Search chats">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14.086 8.75002C14.086 7.33509 13.5239 5.97812 12.5234 4.97761C11.5229 3.9771 10.1659 3.41502 8.75097 3.41502C7.33604 3.41502 5.97906 3.9771 4.97855 4.97761C3.97805 5.97812 3.41597 7.33509 3.41597 8.75002C3.41597 10.165 3.97805 11.5219 4.97855 12.5224C5.97906 13.5229 7.33604 14.085 8.75097 14.085C10.1659 14.085 11.5229 13.5229 12.5234 12.5224C13.5239 11.5219 14.086 10.165 14.086 8.75002ZM15.416 8.75002C15.4175 10.2911 14.883 11.7848 13.904 12.975L13.97 13.03L16.97 16.03L17.056 16.134C17.1398 16.262 17.1769 16.415 17.1612 16.5672C17.1455 16.7194 17.0779 16.8616 16.9697 16.9697C16.8615 17.0779 16.7193 17.1456 16.5671 17.1613C16.4149 17.177 16.262 17.1398 16.134 17.056L16.03 16.971L13.03 13.971L12.975 13.903C11.8042 14.8626 10.3416 15.3951 8.82788 15.4128C7.31417 15.4305 5.83954 14.9324 4.64663 14.0004C3.45372 13.0684 2.61362 11.7581 2.26457 10.2851C1.91551 8.81206 2.0783 7.2641 2.72615 5.89592C3.374 4.52774 4.4683 3.42086 5.82899 2.75742C7.18968 2.09399 8.73568 1.91352 10.2126 2.24572C11.6895 2.57793 13.0093 3.403 13.9549 4.58518C14.9004 5.76736 15.4154 7.23621 15.415 8.75002" fill="#0D0D0D"/></svg>
          </button>
          {/* Collections */}
          <button className="icon-sq" title="Collections">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 6C2 4.89543 2.89543 4 4 4H10C11.1046 4 12 4.89543 12 6V19C12 19 10.5 18 9 18H4C2.89543 18 2 17.1046 2 16V6Z" stroke="#0D0D0D" strokeWidth="1.4" strokeLinejoin="round"/><path d="M22 6C22 4.89543 21.1046 4 20 4H14C12.8954 4 12 4.89543 12 6V19C12 19 13.5 18 15 18H20C21.1046 18 22 17.1046 22 16V6Z" stroke="#0D0D0D" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </button>
          {/* Library */}
          <button className="icon-sq" title="Library">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M14.6421 2.45399C14.9435 2.40074 15.2524 2.4074 15.5513 2.47357C15.8501 2.53974 16.1329 2.66413 16.3837 2.83965C16.6344 3.01516 16.8481 3.23835 17.0125 3.49647C17.177 3.75459 17.289 4.04258 17.3421 4.34399L19.1481 14.579C19.2015 14.8806 19.1949 15.1898 19.1286 15.4888C19.0624 15.7879 18.9379 16.0709 18.7621 16.3218C18.5864 16.5726 18.3629 16.7864 18.1045 16.9508C17.8461 17.1152 17.5578 17.2271 17.2561 17.28L16.0321 17.496C15.7307 17.5492 15.4217 17.5425 15.1228 17.4763C14.8239 17.4101 14.541 17.2856 14.2903 17.11C14.0395 16.9344 13.8258 16.7111 13.6614 16.4528C13.497 16.1946 13.3851 15.9065 13.3321 15.605L12.3131 9.82799V14.92C12.3132 15.2262 12.253 15.5295 12.1359 15.8124C12.0187 16.0953 11.8469 16.3524 11.6303 16.5689C11.4137 16.7854 11.1566 16.9571 10.8736 17.0741C10.5906 17.1911 10.2873 17.2513 9.98112 17.251H8.31512C7.66512 17.251 7.07712 16.983 6.65512 16.554C6.23112 16.984 5.64412 17.251 4.99312 17.251H3.32712C3.02097 17.2513 2.71777 17.1912 2.43485 17.0742C2.15193 16.9572 1.89484 16.7856 1.67827 16.5693C1.46169 16.3529 1.28989 16.0959 1.17267 15.8131C1.05545 15.5303 0.995117 15.2271 0.995117 14.921V4.92099C0.995117 4.30241 1.24078 3.70916 1.67808 3.27167C2.11539 2.83417 2.70854 2.58826 3.32712 2.58799H4.99312C5.64312 2.58799 6.23112 2.85399 6.65412 3.28299C6.87103 3.06276 7.12961 2.88788 7.41477 2.76856C7.69994 2.64924 8.00599 2.58786 8.31512 2.58799H9.98112C10.7881 2.58799 11.4991 2.99799 11.9181 3.61999C12.2601 3.13499 12.7881 2.77999 13.4181 2.66999L14.6421 2.45399ZM16.0321 4.57599C16.0094 4.44644 15.9614 4.32263 15.8908 4.21166C15.8202 4.1007 15.7283 4.00476 15.6206 3.92933C15.5128 3.8539 15.3913 3.80047 15.2628 3.7721C15.1344 3.74373 15.0016 3.74097 14.8721 3.76399L13.6491 3.97999C13.5196 4.00269 13.3958 4.05072 13.2848 4.12134C13.1738 4.19196 13.0779 4.28377 13.0025 4.39153C12.927 4.49928 12.8736 4.62086 12.8452 4.74929C12.8169 4.87772 12.8141 5.01049 12.8371 5.13999L14.6421 15.374C14.7381 15.919 15.2571 16.283 15.8021 16.187L17.0241 15.971C17.5691 15.875 17.9331 15.355 17.8371 14.811L16.0321 4.57599ZM3.32712 3.91799C2.77412 3.91799 2.32512 4.36699 2.32512 4.91999V14.92C2.32512 15.473 2.77512 15.92 3.32712 15.921H4.99312C5.50912 15.921 5.93312 15.531 5.98812 15.031C5.98612 14.9937 5.98445 14.957 5.98312 14.921V4.92099C5.98445 4.88299 5.98612 4.84532 5.98812 4.80799C5.93312 4.30799 5.50812 3.91799 4.99312 3.91799H3.32712ZM8.31512 3.91799C7.80012 3.91799 7.37512 4.30799 7.31912 4.80799C7.32245 4.84532 7.32445 4.88266 7.32512 4.91999V14.92C7.32445 14.9573 7.32245 14.994 7.31912 15.03C7.37512 15.531 7.79912 15.921 8.31512 15.921H9.98112C10.5341 15.921 10.9831 15.473 10.9831 14.921V4.92099C10.9831 4.36699 10.5341 3.91799 9.98112 3.91799H8.31512Z" fill="#0D0D0D"/></svg>
          </button>
          {/* Apps */}
          <button className="icon-sq" title="Apps">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.94597 14.028C7.94597 13.5044 7.73799 13.0023 7.3678 12.6321C6.9976 12.2619 6.49551 12.054 5.97197 12.054C5.44843 12.054 4.94634 12.2619 4.57614 12.6321C4.20594 13.0023 3.99797 13.5044 3.99797 14.028C3.99797 14.5515 4.20594 15.0536 4.57614 15.4238C4.94634 15.794 5.44843 16.002 5.97197 16.002C6.49551 16.002 6.9976 15.794 7.3678 15.4238C7.73799 15.0536 7.94597 14.5515 7.94597 14.028ZM16.001 14.028C16.0069 13.7651 15.9602 13.5036 15.8637 13.259C15.7672 13.0144 15.6228 12.7915 15.4389 12.6035C15.2551 12.4155 15.0355 12.2661 14.7931 12.1641C14.5508 12.0621 14.2904 12.0095 14.0275 12.0095C13.7645 12.0095 13.5042 12.0621 13.2618 12.1641C13.0194 12.2661 12.7999 12.4155 12.616 12.6035C12.4322 12.7915 12.2878 13.0144 12.1912 13.259C12.0947 13.5036 12.048 13.7651 12.054 14.028C12.0656 14.5437 12.2786 15.0344 12.6474 15.395C13.0163 15.7556 13.5116 15.9575 14.0275 15.9575C14.5433 15.9575 15.0387 15.7556 15.4075 15.395C15.7763 15.0344 15.9894 14.5437 16.001 14.028ZM7.94597 5.97197C7.94597 5.44843 7.73799 4.94634 7.3678 4.57614C6.9976 4.20594 6.49551 3.99797 5.97197 3.99797C5.44843 3.99797 4.94634 4.20594 4.57614 4.57614C4.20594 4.94634 3.99797 5.44843 3.99797 5.97197C3.99797 6.49551 4.20594 6.9976 4.57614 7.3678C4.94634 7.73799 5.44843 7.94597 5.97197 7.94597C6.49551 7.94597 6.9976 7.73799 7.3678 7.3678C7.73799 6.9976 7.94597 6.49551 7.94597 5.97197ZM16.001 5.97197C16.0069 5.70907 15.9602 5.44763 15.8637 5.20302C15.7672 4.9584 15.6228 4.73554 15.4389 4.54751C15.2551 4.35948 15.0355 4.21008 14.7931 4.10808C14.5508 4.00608 14.2904 3.95354 14.0275 3.95354C13.7645 3.95354 13.5042 4.00608 13.2618 4.10808C13.0194 4.21008 12.7999 4.35948 12.616 4.54751C12.4322 4.73554 12.2878 4.9584 12.1912 5.20302C12.0947 5.44763 12.048 5.70907 12.054 5.97197C12.0656 6.48768 12.2786 6.97836 12.6474 7.33899C13.0163 7.69962 13.5116 7.90154 14.0275 7.90154C14.5433 7.90154 15.0387 7.69962 15.4075 7.33899C15.7763 6.97836 15.9894 6.48768 16.001 5.97197ZM9.27597 14.028C9.27597 14.9042 8.92787 15.7446 8.30825 16.3642C7.68863 16.9839 6.84824 17.332 5.97197 17.332C5.09569 17.332 4.25531 16.9839 3.63569 16.3642C3.01607 15.7446 2.66797 14.9042 2.66797 14.028C2.66797 13.1517 3.01607 12.3113 3.63569 11.6917C4.25531 11.0721 5.09569 10.724 5.97197 10.724C6.84824 10.724 7.68863 11.0721 8.30825 11.6917C8.92787 12.3113 9.27597 13.1517 9.27597 14.028ZM17.331 14.028C17.3386 14.4666 17.2588 14.9024 17.0962 15.3099C16.9336 15.7174 16.6915 16.0884 16.384 16.4013C16.0765 16.7142 15.7097 16.9628 15.3051 17.1324C14.9005 17.3021 14.4662 17.3894 14.0275 17.3894C13.5887 17.3894 13.1544 17.3021 12.7498 17.1324C12.3452 16.9628 11.9785 16.7142 11.671 16.4013C11.3634 16.0884 11.1213 15.7174 10.9587 15.3099C10.7961 14.9024 10.7163 14.4666 10.724 14.028C10.739 13.1618 11.0937 12.3362 11.7116 11.7289C12.3295 11.1217 13.1611 10.7814 14.0275 10.7814C14.8938 10.7814 15.7255 11.1217 16.3433 11.7289C16.9612 12.3362 17.3159 13.1618 17.331 14.028ZM9.27597 5.97197C9.27597 6.84824 8.92787 7.68863 8.30825 8.30825C7.68863 8.92787 6.84824 9.27597 5.97197 9.27597C5.09569 9.27597 4.25531 8.92787 3.63569 8.30825C3.01607 7.68863 2.66797 6.84824 2.66797 5.97197C2.66797 5.09569 3.01607 4.25531 3.63569 3.63569C4.25531 3.01607 5.09569 2.66797 5.97197 2.66797C6.84824 2.66797 7.68863 3.01607 8.30825 3.63569C8.92787 4.25531 9.27597 5.09569 9.27597 5.97197ZM17.331 5.97197C17.3386 6.41063 17.2588 6.84641 17.0962 7.2539C16.9336 7.66138 16.6915 8.0324 16.384 8.34532C16.0765 8.65823 15.7097 8.90676 15.3051 9.07642C14.9005 9.24607 14.4662 9.33345 14.0275 9.33345C13.5887 9.33345 13.1544 9.24607 12.7498 9.07642C12.3452 8.90676 11.9785 8.65823 11.671 8.34532C11.3634 8.0324 11.1213 7.66138 10.9587 7.2539C10.7961 6.84641 10.7163 6.41063 10.724 5.97197C10.739 5.10578 11.0937 4.28016 11.7116 3.67293C12.3295 3.0657 13.1611 2.72545 14.0275 2.72545C14.8938 2.72545 15.7255 3.0657 16.3433 3.67293C16.9612 4.28016 17.3159 5.10578 17.331 5.97197Z" fill="#0D0D0D"/></svg>
          </button>
        </div>

        <div className="sidebar-scroll">
        {/* new chat + search */}
        <div className="nav-group" style={{marginTop: "4px"}}>
          {/* New chat – 3a5c87.svg (compose/edit) */}
          <button className="nav-row active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.66895 11.333V8.66697C2.66895 7.74497 2.66895 7.01197 2.71695 6.42297C2.76495 5.82597 2.86695 5.31697 3.10395 4.85197L3.25895 4.57597C3.64424 3.94796 4.19551 3.43856 4.85195 3.10397L5.02895 3.02097C5.44695 2.84197 5.90095 2.75797 6.42395 2.71597C7.01295 2.66797 7.74395 2.66797 8.66695 2.66797H9.16695C9.34332 2.66797 9.51246 2.73804 9.63717 2.86275C9.76188 2.98746 9.83195 3.15661 9.83195 3.33297C9.83195 3.50934 9.76188 3.67849 9.63717 3.8032C9.51246 3.92791 9.34332 3.99797 9.16695 3.99797H8.66695C7.72295 3.99797 7.05395 3.99797 6.53195 4.04097C6.14595 4.07297 5.87195 4.12597 5.65595 4.20297L5.45595 4.28897C5.0176 4.51206 4.6494 4.85189 4.39195 5.27097L4.28995 5.45497C4.16395 5.70197 4.08395 6.01697 4.04195 6.53097C3.99895 7.05398 3.99895 7.72297 3.99895 8.66697V11.333C3.99895 12.277 3.99895 12.946 4.04195 13.469C4.08395 13.983 4.16395 14.298 4.28995 14.545L4.39195 14.729C4.64895 15.147 5.01595 15.487 5.45595 15.711L5.65595 15.797C5.87295 15.874 6.14595 15.927 6.53195 15.958C7.05395 16.001 7.72195 16.002 8.66695 16.002H11.3339C12.2779 16.002 12.9459 16.001 13.4689 15.958C13.9829 15.916 14.2979 15.837 14.5449 15.711L14.7289 15.607C15.1469 15.351 15.4879 14.984 15.7119 14.545L15.7979 14.345C15.8749 14.128 15.9279 13.855 15.9579 13.469C16.0009 12.946 16.0019 12.277 16.0019 11.333V10.833C16.0019 10.6566 16.072 10.4875 16.1967 10.3627C16.3214 10.238 16.4906 10.168 16.6669 10.168C16.8433 10.168 17.0125 10.238 17.1372 10.3627C17.2619 10.4875 17.3319 10.6566 17.3319 10.833V11.333C17.3319 12.255 17.3329 12.988 17.2849 13.577C17.2419 14.099 17.1579 14.554 16.9789 14.972L16.8959 15.148C16.5616 15.8043 16.0526 16.3555 15.4249 16.741L15.1489 16.895C14.6829 17.133 14.1739 17.235 13.5769 17.285C12.9869 17.332 12.2559 17.332 11.3339 17.332H8.66695C7.74395 17.332 7.01295 17.332 6.42395 17.284C5.90095 17.241 5.44695 17.158 5.02895 16.979L4.85195 16.895C4.19564 16.5607 3.64439 16.0516 3.25895 15.424L3.10395 15.148C2.86695 14.683 2.76495 14.174 2.71695 13.578C2.66795 12.988 2.66895 12.256 2.66895 11.333ZM13.4649 3.11297C13.9318 2.73254 14.5232 2.53899 15.1246 2.56984C15.726 2.6007 16.2945 2.85376 16.7199 3.27997L16.8869 3.46497C17.6139 4.35697 17.6139 5.64497 16.8869 6.53597L16.7189 6.72097L11.6729 11.769C11.1388 12.3027 10.4645 12.6744 9.72795 12.841L9.41095 12.899L7.59395 13.159C7.49171 13.1735 7.38749 13.1641 7.28954 13.1314C7.1916 13.0987 7.10261 13.0436 7.02964 12.9705C6.95667 12.8975 6.90172 12.8084 6.86914 12.7104C6.83656 12.6124 6.82725 12.5082 6.84195 12.406L7.10195 10.59L7.15995 10.271C7.3267 9.53481 7.69835 8.86085 8.23195 8.32697L13.2799 3.27997L13.4649 3.11297ZM15.7789 4.22097C15.5859 4.02789 15.3282 3.91324 15.0556 3.8992C14.7829 3.88517 14.5148 3.97274 14.3029 4.14497L14.2189 4.22097L9.17295 9.26897C8.81688 9.62484 8.56866 10.0741 8.45695 10.565L8.41695 10.777L8.28295 11.716L9.22295 11.582L9.43395 11.543C9.92552 11.4316 10.3755 11.1834 10.7319 10.827L15.7799 5.77997L15.8559 5.69597C16.1859 5.29197 16.1859 4.70797 15.8559 4.30397L15.7789 4.22097Z" fill="#0D0D0D"/>
            </svg>
            New chat
          </button>
          {/* Search – ac6d36.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.086 8.75002C14.086 7.33509 13.5239 5.97812 12.5234 4.97761C11.5229 3.9771 10.1659 3.41502 8.75097 3.41502C7.33604 3.41502 5.97906 3.9771 4.97855 4.97761C3.97805 5.97812 3.41597 7.33509 3.41597 8.75002C3.41597 10.165 3.97805 11.5219 4.97855 12.5224C5.97906 13.5229 7.33604 14.085 8.75097 14.085C10.1659 14.085 11.5229 13.5229 12.5234 12.5224C13.5239 11.5219 14.086 10.165 14.086 8.75002ZM15.416 8.75002C15.4175 10.2911 14.883 11.7848 13.904 12.975L13.97 13.03L16.97 16.03L17.056 16.134C17.1398 16.262 17.1769 16.415 17.1612 16.5672C17.1455 16.7194 17.0779 16.8616 16.9697 16.9697C16.8615 17.0779 16.7193 17.1456 16.5671 17.1613C16.4149 17.177 16.262 17.1398 16.134 17.056L16.03 16.971L13.03 13.971L12.975 13.903C11.8042 14.8626 10.3416 15.3951 8.82788 15.4128C7.31417 15.4305 5.83954 14.9324 4.64663 14.0004C3.45372 13.0684 2.61362 11.7581 2.26457 10.2851C1.91551 8.81206 2.0783 7.2641 2.72615 5.89592C3.374 4.52774 4.4683 3.42086 5.82899 2.75742C7.18968 2.09399 8.73568 1.91352 10.2126 2.24572C11.6895 2.57793 13.0093 3.403 13.9549 4.58518C14.9004 5.76736 15.4154 7.23621 15.415 8.75002" fill="#0D0D0D"/>
            </svg>
            Search chats
          </button>
          {/* Projects – 61ee0c.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6182 9.33192H3.38217V12.6999C3.38217 13.3749 3.38217 13.8439 3.41217 14.2079C3.44217 14.5649 3.49517 14.7659 3.57217 14.9159L3.63917 15.0359C3.80617 15.3089 4.04717 15.5319 4.33417 15.6789L4.45717 15.7309C4.59417 15.7809 4.77417 15.8159 5.04217 15.8379C5.40617 15.8679 5.87517 15.8679 6.55017 15.8679H13.4502C14.1252 15.8679 14.5942 15.8679 14.9582 15.8379C15.3152 15.8079 15.5162 15.7549 15.6662 15.6779L15.7862 15.6109C16.0592 15.4439 16.2822 15.2029 16.4292 14.9159L16.4812 14.7929C16.5312 14.6559 16.5662 14.4759 16.5882 14.2079C16.6182 13.8439 16.6182 13.3749 16.6182 12.6999V9.33192ZM17.8822 12.6999C17.8822 13.3549 17.8822 13.8839 17.8482 14.3119C17.8172 14.6919 17.7542 15.0349 17.6182 15.3549L17.5542 15.4899C17.3022 15.9849 16.9182 16.3999 16.4472 16.6889L16.2402 16.8039C15.8822 16.9859 15.4972 17.0619 15.0622 17.0979C14.6342 17.1329 14.1052 17.1319 13.4502 17.1319H6.55017C5.89517 17.1319 5.36617 17.1319 4.93817 17.0979C4.55817 17.0669 4.21517 17.0039 3.89617 16.8679L3.76017 16.8039C3.26626 16.5527 2.85159 16.1695 2.56217 15.6969L2.44617 15.4899C2.26417 15.1319 2.18817 14.7469 2.15217 14.3119C2.11717 13.8839 2.11817 13.3549 2.11817 12.6999V7.29992C2.11817 6.64492 2.11817 6.11592 2.15217 5.68792C2.18817 5.25292 2.26417 4.86792 2.44617 4.50992L2.56217 4.30292C2.85159 3.83036 3.26626 3.44719 3.76017 3.19592L3.89617 3.13292C4.21617 2.99592 4.55817 2.93292 4.93817 2.90292C5.36617 2.86692 5.89517 2.86792 6.55017 2.86792H7.24517C7.38917 2.86792 7.48717 2.86792 7.58417 2.87392L7.83517 2.89992C8.41517 2.98492 8.96017 3.23792 9.40017 3.62992L9.64417 3.86792C9.75517 3.98092 9.79417 4.01792 9.83017 4.05092L9.94217 4.14392C10.2142 4.34792 10.5422 4.46892 10.8822 4.48992L11.1452 4.49292H13.4502C14.1052 4.49292 14.6342 4.49292 15.0622 4.52692C15.4972 4.56292 15.8822 4.63892 16.2402 4.82092L16.4472 4.93692C16.9182 5.22492 17.3022 5.63992 17.5542 6.13492L17.6172 6.27092C17.7542 6.59092 17.8172 6.93292 17.8472 7.31292C17.8832 7.74092 17.8822 8.26992 17.8822 8.92492V12.6999ZM3.38217 8.06792H16.6142C16.6126 7.8507 16.6039 7.63358 16.5882 7.41692C16.578 7.21811 16.542 7.02147 16.4812 6.83192L16.4292 6.70892C16.2828 6.42257 16.0603 6.18211 15.7862 6.01392L15.6662 5.94592C15.5162 5.86992 15.3152 5.81592 14.9582 5.78692C14.5942 5.75692 14.1252 5.75692 13.4502 5.75692H11.1452L10.8052 5.75092C10.218 5.71516 9.65428 5.50755 9.18417 5.15392L8.98917 4.99392C8.91717 4.92892 8.84717 4.85892 8.74617 4.75692L8.56017 4.57392C8.30503 4.34692 7.98905 4.19954 7.65117 4.14992L7.50717 4.13492C7.45717 4.13192 7.40417 4.13192 7.24517 4.13192H6.55017C5.87517 4.13192 5.40617 4.13192 5.04217 4.16192C4.84336 4.17212 4.64671 4.20809 4.45717 4.26892L4.33417 4.32092C4.04717 4.46792 3.80617 4.69092 3.63917 4.96392L3.57117 5.08392C3.49517 5.23392 3.44117 5.43492 3.41217 5.79192C3.38217 6.15592 3.38217 6.62492 3.38217 7.29992V8.06792Z" fill="#0D0D0D"/>
            </svg>
            Projects
          </button>
          {/* Bookmarks – Bookmark.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H10C11.1046 4 12 4.89543 12 6V19C12 19 10.5 18 9 18H4C2.89543 18 2 17.1046 2 16V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M22 6C22 4.89543 21.1046 4 20 4H14C12.8954 4 12 4.89543 12 6V19C12 19 13.5 18 15 18H20C21.1046 18 22 17.1046 22 16V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Collections
          </button>
          {/* Library – 4a730f.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.6421 2.45399C14.9435 2.40074 15.2524 2.4074 15.5513 2.47357C15.8501 2.53974 16.1329 2.66413 16.3837 2.83965C16.6344 3.01516 16.8481 3.23835 17.0125 3.49647C17.177 3.75459 17.289 4.04258 17.3421 4.34399L19.1481 14.579C19.2015 14.8806 19.1949 15.1898 19.1286 15.4888C19.0624 15.7879 18.9379 16.0709 18.7621 16.3218C18.5864 16.5726 18.3629 16.7864 18.1045 16.9508C17.8461 17.1152 17.5578 17.2271 17.2561 17.28L16.0321 17.496C15.7307 17.5492 15.4217 17.5425 15.1228 17.4763C14.8239 17.4101 14.541 17.2856 14.2903 17.11C14.0395 16.9344 13.8258 16.7111 13.6614 16.4528C13.497 16.1946 13.3851 15.9065 13.3321 15.605L12.3131 9.82799V14.92C12.3132 15.2262 12.253 15.5295 12.1359 15.8124C12.0187 16.0953 11.8469 16.3524 11.6303 16.5689C11.4137 16.7854 11.1566 16.9571 10.8736 17.0741C10.5906 17.1911 10.2873 17.2513 9.98112 17.251H8.31512C7.66512 17.251 7.07712 16.983 6.65512 16.554C6.23112 16.984 5.64412 17.251 4.99312 17.251H3.32712C3.02097 17.2513 2.71777 17.1912 2.43485 17.0742C2.15193 16.9572 1.89484 16.7856 1.67827 16.5693C1.46169 16.3529 1.28989 16.0959 1.17267 15.8131C1.05545 15.5303 0.995117 15.2271 0.995117 14.921V4.92099C0.995117 4.30241 1.24078 3.70916 1.67808 3.27167C2.11539 2.83417 2.70854 2.58826 3.32712 2.58799H4.99312C5.64312 2.58799 6.23112 2.85399 6.65412 3.28299C6.87103 3.06276 7.12961 2.88788 7.41477 2.76856C7.69994 2.64924 8.00599 2.58786 8.31512 2.58799H9.98112C10.7881 2.58799 11.4991 2.99799 11.9181 3.61999C12.2601 3.13499 12.7881 2.77999 13.4181 2.66999L14.6421 2.45399ZM16.0321 4.57599C16.0094 4.44644 15.9614 4.32263 15.8908 4.21166C15.8202 4.1007 15.7283 4.00476 15.6206 3.92933C15.5128 3.8539 15.3913 3.80047 15.2628 3.7721C15.1344 3.74373 15.0016 3.74097 14.8721 3.76399L13.6491 3.97999C13.5196 4.00269 13.3958 4.05072 13.2848 4.12134C13.1738 4.19196 13.0779 4.28377 13.0025 4.39153C12.927 4.49928 12.8736 4.62086 12.8452 4.74929C12.8169 4.87772 12.8141 5.01049 12.8371 5.13999L14.6421 15.374C14.7381 15.919 15.2571 16.283 15.8021 16.187L17.0241 15.971C17.5691 15.875 17.9331 15.355 17.8371 14.811L16.0321 4.57599ZM3.32712 3.91799C2.77412 3.91799 2.32512 4.36699 2.32512 4.91999V14.92C2.32512 15.473 2.77512 15.92 3.32712 15.921H4.99312C5.50912 15.921 5.93312 15.531 5.98812 15.031C5.98612 14.9937 5.98445 14.957 5.98312 14.921V4.92099C5.98445 4.88299 5.98612 4.84532 5.98812 4.80799C5.93312 4.30799 5.50812 3.91799 4.99312 3.91799H3.32712ZM8.31512 3.91799C7.80012 3.91799 7.37512 4.30799 7.31912 4.80799C7.32245 4.84532 7.32445 4.88266 7.32512 4.91999V14.92C7.32445 14.9573 7.32245 14.994 7.31912 15.03C7.37512 15.531 7.79912 15.921 8.31512 15.921H9.98112C10.5341 15.921 10.9831 15.473 10.9831 14.921V4.92099C10.9831 4.36699 10.5341 3.91799 9.98112 3.91799H8.31512Z" fill="#0D0D0D"/>
            </svg>
            Library
          </button>
          {/* Apps – c8839f.svg (2×2 circles grid) */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.94597 14.028C7.94597 13.5044 7.73799 13.0023 7.3678 12.6321C6.9976 12.2619 6.49551 12.054 5.97197 12.054C5.44843 12.054 4.94634 12.2619 4.57614 12.6321C4.20594 13.0023 3.99797 13.5044 3.99797 14.028C3.99797 14.5515 4.20594 15.0536 4.57614 15.4238C4.94634 15.794 5.44843 16.002 5.97197 16.002C6.49551 16.002 6.9976 15.794 7.3678 15.4238C7.73799 15.0536 7.94597 14.5515 7.94597 14.028ZM16.001 14.028C16.0069 13.7651 15.9602 13.5036 15.8637 13.259C15.7672 13.0144 15.6228 12.7915 15.4389 12.6035C15.2551 12.4155 15.0355 12.2661 14.7931 12.1641C14.5508 12.0621 14.2904 12.0095 14.0275 12.0095C13.7645 12.0095 13.5042 12.0621 13.2618 12.1641C13.0194 12.2661 12.7999 12.4155 12.616 12.6035C12.4322 12.7915 12.2878 13.0144 12.1912 13.259C12.0947 13.5036 12.048 13.7651 12.054 14.028C12.0656 14.5437 12.2786 15.0344 12.6474 15.395C13.0163 15.7556 13.5116 15.9575 14.0275 15.9575C14.5433 15.9575 15.0387 15.7556 15.4075 15.395C15.7763 15.0344 15.9894 14.5437 16.001 14.028ZM7.94597 5.97197C7.94597 5.44843 7.73799 4.94634 7.3678 4.57614C6.9976 4.20594 6.49551 3.99797 5.97197 3.99797C5.44843 3.99797 4.94634 4.20594 4.57614 4.57614C4.20594 4.94634 3.99797 5.44843 3.99797 5.97197C3.99797 6.49551 4.20594 6.9976 4.57614 7.3678C4.94634 7.73799 5.44843 7.94597 5.97197 7.94597C6.49551 7.94597 6.9976 7.73799 7.3678 7.3678C7.73799 6.9976 7.94597 6.49551 7.94597 5.97197ZM16.001 5.97197C16.0069 5.70907 15.9602 5.44763 15.8637 5.20302C15.7672 4.9584 15.6228 4.73554 15.4389 4.54751C15.2551 4.35948 15.0355 4.21008 14.7931 4.10808C14.5508 4.00608 14.2904 3.95354 14.0275 3.95354C13.7645 3.95354 13.5042 4.00608 13.2618 4.10808C13.0194 4.21008 12.7999 4.35948 12.616 4.54751C12.4322 4.73554 12.2878 4.9584 12.1912 5.20302C12.0947 5.44763 12.048 5.70907 12.054 5.97197C12.0656 6.48768 12.2786 6.97836 12.6474 7.33899C13.0163 7.69962 13.5116 7.90154 14.0275 7.90154C14.5433 7.90154 15.0387 7.69962 15.4075 7.33899C15.7763 6.97836 15.9894 6.48768 16.001 5.97197ZM9.27597 14.028C9.27597 14.9042 8.92787 15.7446 8.30825 16.3642C7.68863 16.9839 6.84824 17.332 5.97197 17.332C5.09569 17.332 4.25531 16.9839 3.63569 16.3642C3.01607 15.7446 2.66797 14.9042 2.66797 14.028C2.66797 13.1517 3.01607 12.3113 3.63569 11.6917C4.25531 11.0721 5.09569 10.724 5.97197 10.724C6.84824 10.724 7.68863 11.0721 8.30825 11.6917C8.92787 12.3113 9.27597 13.1517 9.27597 14.028ZM17.331 14.028C17.3386 14.4666 17.2588 14.9024 17.0962 15.3099C16.9336 15.7174 16.6915 16.0884 16.384 16.4013C16.0765 16.7142 15.7097 16.9628 15.3051 17.1324C14.9005 17.3021 14.4662 17.3894 14.0275 17.3894C13.5887 17.3894 13.1544 17.3021 12.7498 17.1324C12.3452 16.9628 11.9785 16.7142 11.671 16.4013C11.3634 16.0884 11.1213 15.7174 10.9587 15.3099C10.7961 14.9024 10.7163 14.4666 10.724 14.028C10.739 13.1618 11.0937 12.3362 11.7116 11.7289C12.3295 11.1217 13.1611 10.7814 14.0275 10.7814C14.8938 10.7814 15.7255 11.1217 16.3433 11.7289C16.9612 12.3362 17.3159 13.1618 17.331 14.028ZM9.27597 5.97197C9.27597 6.84824 8.92787 7.68863 8.30825 8.30825C7.68863 8.92787 6.84824 9.27597 5.97197 9.27597C5.09569 9.27597 4.25531 8.92787 3.63569 8.30825C3.01607 7.68863 2.66797 6.84824 2.66797 5.97197C2.66797 5.09569 3.01607 4.25531 3.63569 3.63569C4.25531 3.01607 5.09569 2.66797 5.97197 2.66797C6.84824 2.66797 7.68863 3.01607 8.30825 3.63569C8.92787 4.25531 9.27597 5.09569 9.27597 5.97197ZM17.331 5.97197C17.3386 6.41063 17.2588 6.84641 17.0962 7.2539C16.9336 7.66138 16.6915 8.0324 16.384 8.34532C16.0765 8.65823 15.7097 8.90676 15.3051 9.07642C14.9005 9.24607 14.4662 9.33345 14.0275 9.33345C13.5887 9.33345 13.1544 9.24607 12.7498 9.07642C12.3452 8.90676 11.9785 8.65823 11.671 8.34532C11.3634 8.0324 11.1213 7.66138 10.9587 7.2539C10.7961 6.84641 10.7163 6.41063 10.724 5.97197C10.739 5.10578 11.0937 4.28016 11.7116 3.67293C12.3295 3.0657 13.1611 2.72545 14.0275 2.72545C14.8938 2.72545 15.7255 3.0657 16.3433 3.67293C16.9612 4.28016 17.3159 5.10578 17.331 5.97197Z" fill="#0D0D0D"/>
            </svg>
            Apps
          </button>
          {/* Codex – b995b8.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3331 11.4181C13.5095 11.4181 13.6786 11.4881 13.8033 11.6128C13.928 11.7376 13.9981 11.9067 13.9981 12.0831C13.9981 12.2594 13.928 12.4286 13.8033 12.5533C13.6786 12.678 13.5095 12.7481 13.3331 12.7481H10.8331C10.6567 12.7481 10.4876 12.678 10.3629 12.5533C10.2381 12.4286 10.1681 12.2594 10.1681 12.0831C10.1681 11.9067 10.2381 11.7376 10.3629 11.6128C10.4876 11.4881 10.6567 11.4181 10.8331 11.4181H13.3331ZM6.74109 7.34707C6.89228 7.25644 7.07327 7.22955 7.24428 7.2723C7.41529 7.31505 7.56233 7.42395 7.65309 7.57507L8.90309 9.65807C8.96472 9.76169 8.99724 9.88001 8.99724 10.0006C8.99724 10.1211 8.96472 10.2395 8.90309 10.3431L7.65309 12.4261C7.55747 12.567 7.41152 12.6659 7.24523 12.7025C7.07894 12.7391 6.90494 12.7106 6.75899 12.6229C6.61303 12.5352 6.50622 12.395 6.46048 12.231C6.41475 12.0669 6.43357 11.8916 6.51309 11.7411L7.55709 10.0001L6.51309 8.25907C6.42246 8.10788 6.39556 7.92689 6.43831 7.75588C6.48107 7.58487 6.58997 7.43783 6.74109 7.34707Z" fill="#0D0D0D"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M9.002 1.75C10.116 1.75 11.136 2.155 11.924 2.822C12.1853 2.774 12.454 2.74967 12.73 2.749C13.3916 2.74961 14.0451 2.89536 14.6442 3.17598C15.2434 3.45659 15.7737 3.86525 16.1977 4.37311C16.6218 4.88098 16.9292 5.47569 17.0984 6.11531C17.2676 6.75493 17.2945 7.42389 17.177 8.075C17.6489 8.63249 17.9788 9.29594 18.1385 10.0087C18.2983 10.7214 18.283 11.4622 18.0942 12.1678C17.9053 12.8733 17.5484 13.5227 17.054 14.0603C16.5595 14.5979 15.9423 15.0078 15.255 15.255C14.9407 16.1319 14.3631 16.8904 13.6013 17.4265C12.8394 17.9626 11.9306 18.2502 10.999 18.25C9.92803 18.2516 8.89161 17.8711 8.076 17.177C7.81533 17.225 7.547 17.2497 7.271 17.251C6.60919 17.2506 5.95554 17.1049 5.35617 16.8243C4.7568 16.5437 4.22631 16.135 3.80214 15.627C3.37796 15.119 3.07043 14.5241 2.90125 13.8842C2.73207 13.2444 2.70536 12.5753 2.823 11.924C2.18121 11.1691 1.8065 10.2236 1.757 9.234L1.75 9.001C1.75075 8.06955 2.03861 7.16098 2.57436 6.39904C3.11012 5.6371 3.86773 5.05883 4.744 4.743C5.05937 3.86651 5.63755 3.10871 6.39962 2.57305C7.16169 2.03738 8.0705 1.74995 9.002 1.75ZM9.002 3.078C8.29888 3.07859 7.61552 3.31074 7.05754 3.73858C6.49956 4.16641 6.09803 4.76612 5.915 5.445C5.88431 5.55746 5.82482 5.65997 5.74239 5.74239C5.65997 5.82482 5.55746 5.88431 5.445 5.915C4.90371 6.06091 4.4103 6.34659 4.01427 6.74338C3.61824 7.14017 3.33351 7.63413 3.18864 8.1757C3.04378 8.71728 3.04387 9.28742 3.18891 9.82894C3.33395 10.3705 3.61884 10.8643 4.015 11.261C4.09635 11.3438 4.15479 11.4463 4.18459 11.5585C4.21439 11.6707 4.21453 11.7887 4.185 11.901C4.11433 12.1663 4.07833 12.4423 4.077 12.729C4.07698 13.2192 4.18974 13.7028 4.40656 14.1424C4.62339 14.582 4.93846 14.9659 5.32739 15.2642C5.71632 15.5626 6.16868 15.7674 6.64947 15.8629C7.13025 15.9584 7.62657 15.942 8.1 15.815L8.187 15.798C8.28726 15.785 8.38918 15.7951 8.48489 15.8277C8.5806 15.8603 8.66754 15.9145 8.739 15.986C9.1358 16.3821 9.62981 16.667 10.1715 16.8119C10.7131 16.9568 11.2833 16.9567 11.825 16.8116C12.3666 16.6666 12.8605 16.3816 13.2572 15.9853C13.6539 15.5891 13.9393 15.0955 14.085 14.554L14.113 14.471C14.1519 14.3769 14.2121 14.2931 14.2887 14.2262C14.3654 14.1592 14.4565 14.1109 14.555 14.085C15.2339 13.9022 15.8337 13.5009 16.2617 12.9431C16.6897 12.3853 16.9221 11.7021 16.923 10.999C16.923 10.117 16.565 9.318 15.986 8.739C15.9038 8.65675 15.8448 8.55425 15.8149 8.44186C15.7851 8.32948 15.7854 8.2112 15.816 8.099C15.8873 7.83433 15.9233 7.55833 15.924 7.271C15.9239 6.78078 15.811 6.29715 15.594 5.85754C15.3771 5.41794 15.0619 5.03412 14.6729 4.7358C14.2839 4.43747 13.8315 4.23263 13.3507 4.13712C12.8698 4.04162 12.3735 4.058 11.9 4.185C11.7877 4.21543 11.6694 4.21564 11.557 4.18561C11.4446 4.15558 11.3421 4.09638 11.26 4.014C10.702 3.4545 9.95614 3.12203 9.167 3.081L9.002 3.078Z" fill="#0D0D0D"/>
            </svg>
            Codex
          </button>
          {/* More – f6d0e2.svg */}
          <button className="nav-row">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.498 8.50195C15.8953 8.50195 16.2763 8.65978 16.5573 8.94071C16.8382 9.22164 16.996 9.60266 16.996 9.99995C16.996 10.3972 16.8382 10.7783 16.5573 11.0592C16.2763 11.3401 15.8953 11.498 15.498 11.498C15.1007 11.498 14.7197 11.3401 14.4388 11.0592C14.1578 10.7783 14 10.3972 14 9.99995C14 9.60266 14.1578 9.22164 14.4388 8.94071C14.7197 8.65978 15.1007 8.50195 15.498 8.50195ZM4.49802 8.50195C4.69488 8.50195 4.8898 8.54073 5.07167 8.61606C5.25353 8.69139 5.41878 8.8018 5.55798 8.941C5.69717 9.0802 5.80759 9.24544 5.88292 9.42731C5.95825 9.60918 5.99702 9.8041 5.99702 10.001C5.99702 10.1978 5.95825 10.3927 5.88292 10.5746C5.80759 10.7565 5.69717 10.9217 5.55798 11.0609C5.41878 11.2001 5.25353 11.3105 5.07167 11.3858C4.8898 11.4612 4.69488 11.5 4.49802 11.5C4.10046 11.5 3.71919 11.342 3.43807 11.0609C3.15695 10.7798 2.99902 10.3985 2.99902 10.001C2.99902 9.60339 3.15695 9.22212 3.43807 8.941C3.71919 8.65988 4.10046 8.50195 4.49802 8.50195ZM10 8.50195C10.3973 8.50195 10.7783 8.65978 11.0593 8.94071C11.3402 9.22164 11.498 9.60266 11.498 9.99995C11.498 10.3972 11.3402 10.7783 11.0593 11.0592C10.7783 11.3401 10.3973 11.498 10 11.498C9.60273 11.498 9.22171 11.3401 8.94078 11.0592C8.65985 10.7783 8.50202 10.3972 8.50202 9.99995C8.50202 9.60266 8.65985 9.22164 8.94078 8.94071C9.22171 8.65978 9.60273 8.50195 10 8.50195Z" fill="#0D0D0D"/>
            </svg>
            More
          </button>
        </div>

        {/* Recents */}
        <div className="group-label" style={{marginTop: "8px", fontWeight: "600"}}>Recents</div>
        <div className="recents-scroll">
          <div className="history-item" data-prefilled="3" onClick={() => currentPage === 'collections' && navTo('chat')}>Daily Briefing — Sep 3</div>
          <div className="history-item" data-prefilled="1" onClick={() => currentPage === 'collections' && navTo('chat')}>Conversation Health Design</div>
          <div className="history-item history-item-disabled" data-prefilled="2">Photosynthesis Overview</div>
          <div className="history-item history-item-disabled">Rejection and Rediscovery</div>
          <div className="history-item history-item-disabled">Pogo Funding Rounds</div>
          <div className="history-item history-item-disabled">ChatGPT Bookmarks Feature</div>
          <div className="history-item history-item-disabled">Notion MCP Integration</div>
          <div className="history-item history-item-disabled">Portfolio Header Suggestions</div>
          <div className="history-item history-item-disabled">Critical value for β</div>
          <div className="history-item history-item-disabled">Government Denial Orders Clarifi…</div>
          <div className="history-item history-item-disabled">Best subset selection</div>
          <div className="history-item history-item-disabled">Regression Model Parameters</div>
          <div className="history-item history-item-disabled">Changing Opinions</div>
          <div className="history-item history-item-disabled">AOV vs LM</div>
          <div className="history-item history-item-disabled">Randomized Complete Block Des…</div>
          <div className="history-item">Invoice as Employment Proof</div>
          <div className="history-item history-item-disabled">Participation Points Status</div>
          <div className="history-item">Co-design Painpoints and Featur…</div>
          <div className="history-item history-item-disabled">Internship Description Summary</div>
          <div className="history-item">Bookmark Button Placement</div>
        </div>
        </div>{/* end sidebar-scroll */}

        <div className="sidebar-footer">
          <div className="user-row">
            <div className="avatar">NG</div>
            <div className="user-meta">
              <div className="user-name">Nitish Gannu</div>
              <div className="user-plan">Free</div>
            </div>
            <button className="upgrade-pill">Upgrade</button>
          </div>
        </div>

      </aside>

      {/* ══════════ COLLECTIONS PAGE ══════════ */}
      {currentPage === 'collections' && <CollectionsPage onBack={() => navTo('chat')} onOpenCollection={c => navTo('collection-detail', c)} />}
      {currentPage === 'collection-detail' && <CollectionDetailPage collection={currentCollection} bmsByCollection={bmsByCollection} onBack={() => navTo('collections')} />}

      {/* ══════════ MAIN ══════════ */}
      <main className="main" style={(currentPage === 'collections' || currentPage === 'collection-detail') ? {display:'none'} : {}}>
      <div className="main-chat" id="main-chat">
        <div className="topbar">
          <button className="model-btn">
            ChatGPT
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8e8ea0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div className="topbar-right">
            {/* landing state actions */}
            <div id="landing-topbar-actions" style={{display: "flex", alignItems: "center", gap: "4px"}}>
              <button className="upgrade-top">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.665 9.99996C17.6631 10.3242 17.552 10.6383 17.3494 10.8914C17.1469 11.1446 16.8649 11.322 16.549 11.395L16.422 11.419C14.71 11.666 13.612 12.13 12.877 12.862C12.141 13.594 11.674 14.684 11.424 16.389C11.3741 16.7414 11.1992 17.0641 10.9312 17.2984C10.6632 17.5326 10.3199 17.6627 9.96396 17.665C9.63181 17.6638 9.30985 17.5502 9.05054 17.3426C8.79122 17.1351 8.60985 16.8458 8.53596 16.522C8.12396 14.746 7.66196 13.619 6.95696 12.865C6.31296 12.177 5.39396 11.727 3.88696 11.469L3.57696 11.419C3.23424 11.3706 2.92031 11.2006 2.69234 10.9402C2.46438 10.6797 2.33755 10.3461 2.33496 9.99996C2.33496 9.26596 2.88896 8.68096 3.57696 8.57996L3.88696 8.53096C5.39396 8.27296 6.31296 7.82296 6.95696 7.13496C7.66196 6.38096 8.12396 5.25496 8.53696 3.47896L8.56896 3.35696C8.6637 3.06089 8.84986 2.80247 9.10069 2.61884C9.35151 2.43521 9.6541 2.33582 9.96496 2.33496C10.718 2.33496 11.32 2.90296 11.424 3.61096L11.528 4.22296C11.795 5.58296 12.233 6.49796 12.877 7.13796C13.613 7.86996 14.71 8.33396 16.422 8.58096C17.112 8.68096 17.665 9.26696 17.665 9.99996Z" fill="#5856D6"/>
                </svg>
                Upgrade
              </button>
              <button className="icon-round" title="Temporary chat">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.52096 15.1659C4.56094 15.0069 4.54078 14.8387 4.46436 14.6937C4.38793 14.5487 4.26063 14.437 4.10689 14.3801C3.95314 14.3232 3.7838 14.3251 3.63136 14.3854C3.47892 14.4457 3.35414 14.5602 3.28096 14.7069L3.23296 14.8329C3.12686 15.2369 3.00274 15.636 2.86096 16.0289L2.71296 16.4289C2.67338 16.5328 2.66043 16.6449 2.67531 16.7551C2.69018 16.8653 2.7324 16.97 2.79812 17.0597C2.86384 17.1494 2.95096 17.2212 3.05154 17.2685C3.15213 17.3159 3.26297 17.3373 3.37396 17.3309L3.77896 17.3009C4.60797 17.2299 5.42934 17.0877 6.23396 16.8759C6.84696 17.1789 7.50396 17.4099 8.19396 17.5579C8.2802 17.5786 8.36972 17.5819 8.45724 17.5675C8.54477 17.5531 8.62853 17.5214 8.7036 17.4741C8.77866 17.4269 8.84352 17.3651 8.89435 17.2924C8.94518 17.2197 8.98095 17.1376 8.99956 17.0508C9.01818 16.9641 9.01925 16.8745 9.00272 16.7874C8.9862 16.7003 8.95241 16.6173 8.90334 16.5434C8.85427 16.4695 8.79091 16.4062 8.717 16.3572C8.64309 16.3081 8.56011 16.2744 8.47296 16.2579C7.82751 16.1209 7.20468 15.8933 6.62296 15.5819C6.50957 15.5212 6.38113 15.4945 6.25296 15.5049L6.12796 15.5279C5.53929 15.6946 4.93196 15.8196 4.30596 15.9029C4.33729 15.8049 4.36796 15.7072 4.39796 15.6099L4.52096 15.1659ZM15.8 14.5369C15.6946 14.426 15.5542 14.3547 15.4025 14.3353C15.2507 14.3158 15.0969 14.3492 14.967 14.4299L14.86 14.5129C13.9304 15.3896 12.7772 15.993 11.527 16.2569C11.3544 16.2939 11.2037 16.3979 11.1078 16.5461C11.012 16.6942 10.979 16.8744 11.016 17.0469C11.053 17.2194 11.157 17.3702 11.3051 17.466C11.4533 17.5618 11.6334 17.5949 11.806 17.5579C13.2029 17.2613 14.4997 16.6093 15.571 15.6649L15.775 15.4769C15.9029 15.3555 15.9774 15.1883 15.9821 15.0121C15.9868 14.8358 15.9213 14.6649 15.8 14.5369ZM2.23796 7.58989C1.73376 9.05404 1.70158 10.6395 2.14596 12.1229L2.23796 12.4109C2.29181 12.5663 2.40137 12.6963 2.54546 12.7757C2.68956 12.8551 2.85797 12.8782 3.01814 12.8407C3.17831 12.8031 3.31887 12.7075 3.41267 12.5724C3.50646 12.4372 3.54682 12.2721 3.52596 12.1089L3.49596 11.9769C3.27521 11.3412 3.16297 10.6728 3.16396 9.99989C3.16396 9.30989 3.27996 8.64489 3.49396 8.02289C3.54812 7.85707 3.53496 7.6766 3.45732 7.5204C3.37967 7.36419 3.24375 7.24475 3.07886 7.18782C2.91397 7.13088 2.73331 7.14102 2.57583 7.21605C2.41834 7.29107 2.29664 7.42497 2.23696 7.58889M16.917 12.8229C17.0837 12.8802 17.2663 12.8691 17.4247 12.7918C17.5832 12.7145 17.7045 12.5775 17.762 12.4109C18.301 10.8491 18.301 9.15168 17.762 7.58989C17.7354 7.50508 17.692 7.42647 17.6345 7.3587C17.577 7.29092 17.5065 7.23537 17.4272 7.19531C17.3478 7.15525 17.2612 7.1315 17.1726 7.12547C17.0839 7.11944 16.9949 7.13125 16.9109 7.1602C16.8268 7.18915 16.7495 7.23465 16.6833 7.29401C16.6171 7.35338 16.5636 7.4254 16.5257 7.50582C16.4879 7.58625 16.4666 7.67344 16.463 7.76225C16.4594 7.85106 16.4737 7.93969 16.505 8.02289C16.719 8.64489 16.835 9.30989 16.835 9.99989C16.835 10.6899 16.719 11.3549 16.505 11.9769C16.4764 12.0595 16.4644 12.1469 16.4697 12.2341C16.4749 12.3214 16.4973 12.4067 16.5356 12.4853C16.5739 12.5639 16.6272 12.6341 16.6927 12.692C16.7581 12.75 16.8343 12.7944 16.917 12.8229ZM8.98296 2.95289C8.94602 2.78054 8.84217 2.6299 8.69422 2.53409C8.54628 2.43827 8.36634 2.40511 8.19396 2.44189C6.79736 2.73864 5.50092 3.39065 4.42996 4.33489L4.22596 4.52289C4.10733 4.63639 4.03489 4.78976 4.02257 4.95348C4.01025 5.1172 4.05893 5.27968 4.15924 5.40966C4.25954 5.53963 4.40438 5.62791 4.56588 5.65749C4.72737 5.68707 4.8941 5.65587 5.03396 5.56989L5.14096 5.48789C6.0704 4.61086 7.22366 4.00707 8.47396 3.74289C8.64634 3.70574 8.7969 3.60164 8.89254 3.45349C8.98818 3.30534 9.02106 3.12528 8.98396 2.95289M15.571 4.33489C14.4997 3.39049 13.2029 2.73848 11.806 2.44189C11.6354 2.40963 11.4591 2.44532 11.3145 2.54133C11.1699 2.63735 11.0686 2.78607 11.0322 2.95576C10.9958 3.12545 11.0271 3.30265 11.1196 3.44953C11.212 3.59641 11.3582 3.70133 11.527 3.74189C12.7004 3.99026 13.7898 4.53723 14.69 5.32989L14.86 5.48789L14.967 5.56989C15.097 5.65035 15.2508 5.68354 15.4024 5.66388C15.554 5.64422 15.6943 5.57291 15.7995 5.46195C15.9047 5.35099 15.9684 5.20717 15.98 5.05471C15.9915 4.90224 15.9502 4.75045 15.863 4.62489L15.775 4.52289L15.571 4.33489Z" fill="#0D0D0D"/>
                </svg>
              </button>
            </div>
            {/* chat state actions */}
            <div id="chat-topbar-actions" className="chat-topbar-actions">
              <button className="upgrade-top">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.665 9.99996C17.6631 10.3242 17.552 10.6383 17.3494 10.8914C17.1469 11.1446 16.8649 11.322 16.549 11.395L16.422 11.419C14.71 11.666 13.612 12.13 12.877 12.862C12.141 13.594 11.674 14.684 11.424 16.389C11.3741 16.7414 11.1992 17.0641 10.9312 17.2984C10.6632 17.5326 10.3199 17.6627 9.96396 17.665C9.63181 17.6638 9.30985 17.5502 9.05054 17.3426C8.79122 17.1351 8.60985 16.8458 8.53596 16.522C8.12396 14.746 7.66196 13.619 6.95696 12.865C6.31296 12.177 5.39396 11.727 3.88696 11.469L3.57696 11.419C3.23424 11.3706 2.92031 11.2006 2.69234 10.9402C2.46438 10.6797 2.33755 10.3461 2.33496 9.99996C2.33496 9.26596 2.88896 8.68096 3.57696 8.57996L3.88696 8.53096C5.39396 8.27296 6.31296 7.82296 6.95696 7.13496C7.66196 6.38096 8.12396 5.25496 8.53696 3.47896L8.56896 3.35696C8.6637 3.06089 8.84986 2.80247 9.10069 2.61884C9.35151 2.43521 9.6541 2.33582 9.96496 2.33496C10.718 2.33496 11.32 2.90296 11.424 3.61096L11.528 4.22296C11.795 5.58296 12.233 6.49796 12.877 7.13796C13.613 7.86996 14.71 8.33396 16.422 8.58096C17.112 8.68096 17.665 9.26696 17.665 9.99996Z" fill="#5856D6"/>
                </svg>
                Upgrade
              </button>
              <button className="share-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.668 12.6663V12.5003C2.668 12.324 2.73806 12.1548 2.86277 12.0301C2.98748 11.9054 3.15663 11.8353 3.333 11.8353C3.50937 11.8353 3.67851 11.9054 3.80323 12.0301C3.92794 12.1548 3.998 12.324 3.998 12.5003V12.6663C3.998 13.3773 3.999 13.8713 4.031 14.2543C4.061 14.6303 4.118 14.8413 4.198 14.9993L4.268 15.1263C4.445 15.4143 4.698 15.6483 5 15.8023L5.13 15.8583C5.274 15.9093 5.463 15.9473 5.745 15.9703C6.129 16.0013 6.622 16.0013 7.333 16.0013H12.666C13.377 16.0013 13.871 16.0013 14.254 15.9703C14.63 15.9403 14.841 15.8823 14.999 15.8023L15.126 15.7313C15.414 15.5553 15.648 15.3013 15.802 14.9993L15.858 14.8693C15.909 14.7263 15.947 14.5363 15.97 14.2543C16.001 13.8713 16.001 13.3773 16.001 12.6663V12.5003C16.001 12.324 16.0711 12.1548 16.1958 12.0301C16.3205 11.9054 16.4896 11.8353 16.666 11.8353C16.8424 11.8353 17.0115 11.9054 17.1362 12.0301C17.2609 12.1548 17.331 12.324 17.331 12.5003V12.6663C17.331 13.3563 17.331 13.9123 17.295 14.3633C17.262 14.7633 17.197 15.1253 17.053 15.4613L16.987 15.6043C16.721 16.1243 16.317 16.5613 15.822 16.8643L15.604 16.9873C15.227 17.1793 14.821 17.2573 14.363 17.2953C13.913 17.3323 13.355 17.3313 12.666 17.3313H7.333C6.644 17.3313 6.087 17.3323 5.637 17.2953C5.237 17.2623 4.876 17.1983 4.539 17.0543L4.397 16.9873C3.87714 16.7225 3.44045 16.3194 3.135 15.8223L3.013 15.6043C2.821 15.2273 2.742 14.8213 2.704 14.3633C2.668 13.9133 2.668 13.3553 2.668 12.6663ZM9.335 12.5003V4.94034L7.137 7.13734C7.01108 7.25568 6.84405 7.32036 6.67127 7.31768C6.49849 7.315 6.33354 7.24518 6.21135 7.12299C6.08916 7.0008 6.01934 6.83585 6.01666 6.66307C6.01398 6.49029 6.07866 6.32326 6.197 6.19734L9.53 2.86334L9.631 2.78034C9.75896 2.69527 9.91239 2.65705 10.0653 2.67218C10.2182 2.68731 10.3612 2.75484 10.47 2.86334L13.804 6.19734C13.9178 6.32422 13.9786 6.4899 13.9739 6.66026C13.9692 6.83062 13.8994 6.99271 13.7788 7.11316C13.6583 7.2336 13.4961 7.30324 13.3257 7.30774C13.1554 7.31224 12.9898 7.25126 12.863 7.13734L10.665 4.94034V12.5003C10.6557 12.6704 10.5815 12.8304 10.4579 12.9475C10.3342 13.0646 10.1703 13.1299 10 13.1299C9.82968 13.1299 9.66583 13.0646 9.54215 12.9475C9.41846 12.8304 9.34433 12.6704 9.335 12.5003Z" fill="#0D0D0D"/>
                </svg>
                Share
              </button>
              <button className="three-dot-btn" title="More options">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.498 8.50195C15.8953 8.50195 16.2763 8.65978 16.5573 8.94071C16.8382 9.22164 16.996 9.60266 16.996 9.99995C16.996 10.3972 16.8382 10.7783 16.5573 11.0592C16.2763 11.3401 15.8953 11.498 15.498 11.498C15.1007 11.498 14.7197 11.3401 14.4388 11.0592C14.1578 10.7783 14 10.3972 14 9.99995C14 9.60266 14.1578 9.22164 14.4388 8.94071C14.7197 8.65978 15.1007 8.50195 15.498 8.50195ZM4.49802 8.50195C4.69488 8.50195 4.8898 8.54073 5.07167 8.61606C5.25353 8.69139 5.41878 8.8018 5.55798 8.941C5.69717 9.0802 5.80759 9.24544 5.88292 9.42731C5.95825 9.60918 5.99702 9.8041 5.99702 10.001C5.99702 10.1978 5.95825 10.3927 5.88292 10.5746C5.80759 10.7565 5.69717 10.9217 5.55798 11.0609C5.41878 11.2001 5.25353 11.3105 5.07167 11.3858C4.8898 11.4612 4.69488 11.5 4.49802 11.5C4.10046 11.5 3.71919 11.342 3.43807 11.0609C3.15695 10.7798 2.99902 10.3985 2.99902 10.001C2.99902 9.60339 3.15695 9.22212 3.43807 8.941C3.71919 8.65988 4.10046 8.50195 4.49802 8.50195ZM10 8.50195C10.3973 8.50195 10.7783 8.65978 11.0593 8.94071C11.3402 9.22164 11.498 9.60266 11.498 9.99995C11.498 10.3972 11.3402 10.7783 11.0593 11.0592C10.7783 11.3401 10.3973 11.498 10 11.498C9.60273 11.498 9.22171 11.3401 8.94078 11.0592C8.65985 10.7783 8.50202 10.3972 8.50202 9.99995C8.50202 9.60266 8.65985 9.22164 8.94078 8.94071C9.22171 8.65978 9.60273 8.50195 10 8.50195Z" fill="#0D0D0D"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="center" id="landing">
          <h1 className="greeting">What are you working on?</h1>
          <div className="input-shell">
            <div className="input-box">
              {/* plus/attach – 6be74c.svg */}
              <button className="attach-btn" title="Attach">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.33496 16.5V10.665H3.49996C3.41263 10.665 3.32616 10.6478 3.24548 10.6143C3.16479 10.5809 3.09149 10.5319 3.02973 10.4702C2.96798 10.4084 2.919 10.3351 2.88558 10.2544C2.85216 10.1738 2.83496 10.0873 2.83496 9.99996C2.83496 9.91263 2.85216 9.82616 2.88558 9.74548C2.919 9.6648 2.96798 9.59149 3.02973 9.52973C3.09149 9.46798 3.16479 9.419 3.24548 9.38558C3.32616 9.35216 3.41263 9.33496 3.49996 9.33496H9.33496V3.49996C9.33496 3.32359 9.40502 3.15445 9.52973 3.02973C9.65445 2.90502 9.82359 2.83496 9.99996 2.83496C10.1763 2.83496 10.3455 2.90502 10.4702 3.02973C10.5949 3.15445 10.665 3.32359 10.665 3.49996V9.33496H16.5L16.634 9.34896C16.7835 9.38015 16.9178 9.4619 17.0142 9.58046C17.1106 9.69902 17.1632 9.84716 17.1632 9.99996C17.1632 10.1528 17.1106 10.3009 17.0142 10.4195C16.9178 10.538 16.7835 10.6198 16.634 10.651L16.5 10.665H10.665V16.5C10.665 16.5873 10.6478 16.6738 10.6143 16.7544C10.5809 16.8351 10.5319 16.9084 10.4702 16.9702C10.4084 17.0319 10.3351 17.0809 10.2544 17.1143C10.1738 17.1478 10.0873 17.165 9.99996 17.165C9.91263 17.165 9.82616 17.1478 9.74548 17.1143C9.6648 17.0809 9.59149 17.0319 9.52973 16.9702C9.46798 16.9084 9.419 16.8351 9.38558 16.7544C9.35216 16.6738 9.33496 16.5873 9.33496 16.5Z" fill="#0D0D0D"/>
                </svg>
              </button>
              <textarea className="text-input" id="landing-textarea" rows="1" placeholder="Ask anything"
                onInput={e => { e.target.style.height='24px'; e.target.style.height=Math.min(e.target.scrollHeight,200)+'px'; }}></textarea>
              <div className="input-right">
                {/* mic – 29f921.svg */}
                <button className="mic-btn" title="Voice">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.7799 10.1959C15.8637 10.2207 15.9418 10.2618 16.0098 10.3167C16.0777 10.3717 16.1341 10.4395 16.1758 10.5164C16.2175 10.5932 16.2437 10.6774 16.2528 10.7644C16.2619 10.8513 16.2538 10.9391 16.2289 11.0229L16.1489 11.2729C15.7461 12.4471 15.0155 13.4814 14.0435 14.2535C13.0715 15.0256 11.8988 15.5032 10.6639 15.6299L10.6649 16.8349H12.0829L12.2169 16.8489C12.3665 16.8801 12.5008 16.9619 12.5972 17.0804C12.6936 17.199 12.7462 17.3471 12.7462 17.4999C12.7462 17.6527 12.6936 17.8009 12.5972 17.9194C12.5008 18.038 12.3665 18.1197 12.2169 18.1509L12.0829 18.1649H7.91591C7.73954 18.1649 7.57039 18.0949 7.44568 17.9702C7.32097 17.8454 7.25091 17.6763 7.25091 17.4999C7.25091 17.3236 7.32097 17.1544 7.44568 17.0297C7.57039 16.905 7.73954 16.8349 7.91591 16.8349H9.33591L9.33391 15.6299C8.09922 15.5031 6.92667 15.0254 5.95486 14.2533C4.98305 13.4812 4.25262 12.447 3.84991 11.2729L3.76991 11.0229L3.74391 10.8909C3.73009 10.7379 3.76967 10.5849 3.85591 10.4578C3.94215 10.3307 4.06974 10.2373 4.217 10.1936C4.36426 10.1499 4.52211 10.1585 4.66374 10.218C4.80536 10.2775 4.92202 10.3842 4.99391 10.5199L5.04491 10.6439L5.10891 10.8419C5.46427 11.8778 6.13941 12.7741 7.03698 13.4016C7.93455 14.0291 9.00819 14.3553 10.1031 14.3333C11.1981 14.3112 12.2577 13.9421 13.1293 13.279C14.0009 12.616 14.6395 11.6933 14.9529 10.6439L15.0049 10.5199C15.077 10.3847 15.1936 10.2785 15.3351 10.2194C15.4765 10.1604 15.634 10.1521 15.7809 10.1959M12.2519 5.41693C12.2582 5.11726 12.2047 4.81935 12.0943 4.54066C11.984 4.26197 11.8192 4.0081 11.6095 3.79394C11.3998 3.57977 11.1495 3.40963 10.8732 3.29347C10.5969 3.17731 10.3001 3.11747 10.0004 3.11747C9.70068 3.11747 9.40396 3.17731 9.12765 3.29347C8.85135 3.40963 8.60101 3.57977 8.39131 3.79394C8.18162 4.0081 8.01678 4.26197 7.90647 4.54066C7.79616 4.81935 7.74259 5.11726 7.74891 5.41693V9.16693C7.76132 9.75585 8.00398 10.3165 8.42487 10.7286C8.84576 11.1407 9.41136 11.3715 10.0004 11.3715C10.5895 11.3715 11.1551 11.1407 11.5759 10.7286C11.9968 10.3165 12.2395 9.75585 12.2519 9.16693V5.41693ZM13.5819 9.16693C13.5819 10.1168 13.2046 11.0278 12.5329 11.6994C11.8612 12.3711 10.9503 12.7484 10.0004 12.7484C9.05053 12.7484 8.13957 12.3711 7.4679 11.6994C6.79624 11.0278 6.41891 10.1168 6.41891 9.16693V5.41693C6.43461 4.47742 6.81885 3.5817 7.4888 2.92285C8.15875 2.264 9.06077 1.89478 10.0004 1.89478C10.94 1.89478 11.8421 2.264 12.512 2.92285C13.182 3.5817 13.5662 4.47742 13.5819 5.41693V9.16693Z" fill="#0D0D0D"/>
                  </svg>
                </button>
                {/* send – 01bab7.svg (white arrow inside dark circle) */}
                <button className="send-btn" id="landing-send-btn" title="Send">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.00008 16V6.41396L5.70708 9.70696C5.61483 9.80247 5.50449 9.87865 5.38249 9.93106C5.26048 9.98347 5.12926 10.0111 4.99648 10.0122C4.8637 10.0134 4.73202 9.98806 4.60913 9.93778C4.48623 9.8875 4.37458 9.81325 4.28069 9.71936C4.18679 9.62546 4.11254 9.51381 4.06226 9.39092C4.01198 9.26802 3.98668 9.13634 3.98783 9.00356C3.98898 8.87078 4.01657 8.73956 4.06898 8.61756C4.12139 8.49555 4.19757 8.38521 4.29308 8.29296L9.29308 3.29296L9.36908 3.22496C9.56099 3.06874 9.80401 2.98922 10.0512 3.00178C10.2983 3.01434 10.532 3.11809 10.7071 3.29296L15.7071 8.29296L15.7751 8.36896C15.9297 8.56107 16.0078 8.80353 15.9945 9.04975C15.9812 9.29598 15.8774 9.52861 15.7031 9.70297C15.5287 9.87733 15.2961 9.98112 15.0499 9.99441C14.8036 10.0077 14.5612 9.92954 14.3691 9.77496L14.2931 9.70696L11.0001 6.41396V16C11.0001 16.2652 10.8947 16.5195 10.7072 16.7071C10.5197 16.8946 10.2653 17 10.0001 17C9.73486 17 9.48051 16.8946 9.29297 16.7071C9.10544 16.5195 9.00008 16.2652 9.00008 16Z" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="chips">
              {/* Create an image – d7281f.svg */}
              <button className="chip">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.001 7.33297C16.001 6.62297 16.001 6.12897 15.97 5.74497C15.9596 5.53596 15.922 5.32921 15.858 5.12997L15.802 4.99997C15.6481 4.69881 15.4142 4.44588 15.126 4.26897L15 4.19897C14.842 4.11897 14.63 4.06097 14.255 4.03097C13.872 3.99897 13.378 3.99797 12.667 3.99797H7.33297C6.62297 3.99797 6.12897 3.99897 5.74497 4.03097C5.46397 4.05397 5.27397 4.09097 5.12997 4.14097L4.99997 4.19997C4.69894 4.35357 4.44602 4.58711 4.26897 4.87497L4.19897 4.99997C4.11797 5.15797 4.06097 5.36997 4.03097 5.74497C3.99897 6.12897 3.99797 6.62197 3.99797 7.33297V11.727L5.01797 10.708L5.19497 10.548C5.64275 10.1841 6.20948 9.99909 6.7857 10.0286C7.36192 10.0582 7.90675 10.3002 8.31497 10.708L13.604 15.996C13.854 15.992 14.068 15.986 14.254 15.97C14.63 15.94 14.841 15.882 14.999 15.802L15.126 15.731C15.414 15.555 15.648 15.301 15.802 14.999L15.858 14.869C15.909 14.726 15.947 14.536 15.97 14.254C16.001 13.871 16.001 13.377 16.001 12.666V7.33297ZM7.37497 11.65C7.19991 11.4744 6.96587 11.3701 6.71826 11.3574C6.47065 11.3446 6.22714 11.4243 6.03497 11.581L5.95797 11.65L4.00197 13.606C4.00597 13.856 4.01497 14.069 4.03097 14.256C4.06097 14.631 4.11797 14.842 4.19797 15L4.26797 15.127C4.44497 15.415 4.69797 15.649 4.99997 15.803L5.12997 15.859C5.27397 15.91 5.46297 15.948 5.74497 15.971C6.12897 16.002 6.62197 16.002 7.33297 16.002H11.727L7.37497 11.65ZM13.085 7.91697C13.0891 7.78278 13.0662 7.64914 13.0176 7.52398C12.9691 7.39882 12.8959 7.28469 12.8024 7.18837C12.7088 7.09205 12.5969 7.0155 12.4733 6.96327C12.3496 6.91104 12.2167 6.8842 12.0824 6.88433C11.9482 6.88447 11.8153 6.91158 11.6918 6.96405C11.5682 7.01653 11.4564 7.0933 11.3631 7.18981C11.2698 7.28631 11.1968 7.40059 11.1485 7.52585C11.1002 7.65111 11.0776 7.78479 11.082 7.91897C11.0904 8.1791 11.1998 8.42573 11.3869 8.60665C11.574 8.78757 11.8242 8.88859 12.0844 8.88833C12.3447 8.88807 12.5947 8.78655 12.7814 8.60526C12.9681 8.42396 13.077 8.17712 13.085 7.91697ZM14.415 7.91697C14.415 8.53545 14.1693 9.12861 13.7319 9.56594C13.2946 10.0033 12.7015 10.249 12.083 10.249C11.4645 10.249 10.8713 10.0033 10.434 9.56594C9.99666 9.12861 9.75097 8.53545 9.75097 7.91697C9.75097 7.29848 9.99666 6.70533 10.434 6.268C10.8713 5.83066 11.4645 5.58497 12.083 5.58497C12.7015 5.58497 13.2946 5.83066 13.7319 6.268C14.1693 6.70533 14.415 7.29848 14.415 7.91697ZM17.331 12.667C17.331 13.357 17.331 13.913 17.295 14.364C17.262 14.764 17.197 15.126 17.053 15.462L16.987 15.605C16.721 16.125 16.317 16.562 15.822 16.865L15.604 16.988C15.227 17.18 14.821 17.258 14.363 17.296C13.913 17.333 13.355 17.332 12.666 17.332H7.33297C6.64397 17.332 6.08697 17.333 5.63697 17.296C5.23697 17.263 4.87597 17.198 4.53897 17.054L4.39697 16.988C3.87711 16.7232 3.44042 16.32 3.13497 15.823L3.01297 15.605C2.82097 15.228 2.74197 14.822 2.70397 14.364C2.66797 13.914 2.66797 13.356 2.66797 12.667V7.33297C2.66797 6.64397 2.66797 6.08697 2.70397 5.63697C2.74197 5.17897 2.82097 4.77297 3.01297 4.39697L3.13497 4.17797C3.43897 3.68197 3.87497 3.27797 4.39697 3.01297L4.53897 2.94697C4.87597 2.80197 5.23597 2.73697 5.63697 2.70397C6.08697 2.66797 6.64397 2.66797 7.33297 2.66797H12.666C13.356 2.66797 13.912 2.66797 14.363 2.70397C14.821 2.74197 15.227 2.82097 15.603 3.01297L15.822 3.13497C16.317 3.43897 16.722 3.87497 16.987 4.39697L17.053 4.53897C17.197 4.87597 17.263 5.23597 17.295 5.63697C17.332 6.08697 17.331 6.64397 17.331 7.33297V12.667Z" fill="#5D5D5D"/>
                </svg>
                Create an image
              </button>
              {/* Write or edit – 6d87e1.svg */}
              <button className="chip">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3311 3.56796C12.0183 2.94752 12.9176 2.61483 13.8431 2.63865C14.7687 2.66247 15.6497 3.04099 16.3041 3.69596L16.4321 3.83096C17.0309 4.49434 17.3624 5.35627 17.3624 6.24996C17.3624 7.14366 17.0309 8.00558 16.4321 8.66896L16.3041 8.80396L10.0121 15.094C9.68807 15.418 9.45407 15.655 9.22207 15.846L8.98707 16.023C8.78107 16.163 8.5644 16.283 8.33707 16.383L8.10707 16.476C7.92607 16.542 7.73807 16.59 7.52207 16.635L6.75707 16.77L4.36307 17.169C4.22107 17.193 4.06907 17.219 3.94107 17.229C3.84107 17.236 3.70807 17.239 3.56307 17.203L3.41407 17.154C3.19277 17.0575 3.00934 16.891 2.89207 16.68L2.84607 16.586C2.7788 16.4193 2.75339 16.2387 2.77207 16.06C2.78207 15.931 2.80707 15.78 2.83207 15.637L3.23007 13.243L3.36407 12.479C3.40247 12.2799 3.45596 12.084 3.52407 11.893L3.61707 11.663C3.71707 11.435 3.83707 11.2183 3.97707 11.013L4.15307 10.778C4.34307 10.546 4.58207 10.312 4.90507 9.98796L11.1961 3.69596L11.3311 3.56796ZM5.84607 10.928C5.49607 11.278 5.31307 11.463 5.18607 11.616L5.07607 11.763C4.98298 11.8996 4.90264 12.0446 4.83607 12.196L4.77407 12.351C4.73407 12.461 4.70207 12.576 4.66807 12.745L4.54107 13.462L4.14307 15.855L4.14207 15.857H4.14507L6.53807 15.458L7.25507 15.332C7.42407 15.298 7.53907 15.267 7.65007 15.227L7.80307 15.165C7.95507 15.0983 8.0994 15.018 8.23607 14.924L8.38407 14.814C8.53707 14.688 8.72207 14.504 9.07107 14.154L14.0591 9.16596L10.8331 5.93996L5.84607 10.928ZM15.3631 4.63696C14.964 4.23731 14.4308 4 13.8668 3.97099C13.3027 3.94199 12.748 4.12336 12.3101 4.47996L12.1371 4.63696L11.7731 4.99996L15.0001 8.22596L15.3631 7.86296L15.5201 7.68896C15.8509 7.28236 16.0315 6.77416 16.0315 6.24996C16.0315 5.72576 15.8509 5.21757 15.5201 4.81096L15.3631 4.63696Z" fill="#5D5D5D"/>
                </svg>
                Write or edit
              </button>
              {/* Look something up – 6b0d8c.svg */}
              <button className="chip">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2.125C12.0886 2.125 14.0916 2.95469 15.5685 4.43153C17.0453 5.90838 17.875 7.91142 17.875 10C17.875 12.0886 17.0453 14.0916 15.5685 15.5685C14.0916 17.0453 12.0886 17.875 10 17.875C7.91142 17.875 5.90838 17.0453 4.43153 15.5685C2.95469 14.0916 2.125 12.0886 2.125 10C2.125 7.91142 2.95469 5.90838 4.43153 4.43153C5.90838 2.95469 7.91142 2.125 10 2.125ZM7.887 10.625C7.943 12.316 8.225 13.813 8.64 14.905C8.873 15.519 9.135 15.973 9.395 16.263C9.655 16.553 9.86 16.625 10 16.625C10.14 16.625 10.346 16.552 10.605 16.263C10.865 15.973 11.127 15.519 11.36 14.905C11.775 13.813 12.057 12.316 12.113 10.625H7.887ZM3.405 10.625C3.5267 11.9014 4.0159 13.1151 4.81335 14.1192C5.6108 15.1232 6.68228 15.8745 7.898 16.282C7.73303 15.9819 7.59032 15.67 7.471 15.349C6.994 14.092 6.694 12.439 6.637 10.625H3.405ZM13.363 10.625C13.306 12.439 13.006 14.092 12.529 15.349C12.4094 15.6701 12.2663 15.9819 12.101 16.282C13.3169 15.8747 14.3886 15.1235 15.1862 14.1194C15.9839 13.1154 16.4732 11.9015 16.595 10.625H13.363ZM12.101 3.717C12.258 4.002 12.402 4.317 12.529 4.651C13.006 5.908 13.306 7.561 13.363 9.375H16.595C16.4733 8.09817 15.9839 6.88405 15.1861 5.87979C14.3882 4.87553 13.3172 4.12424 12.101 3.717ZM10 3.375C9.86 3.375 9.654 3.448 9.395 3.737C9.135 4.027 8.873 4.481 8.64 5.095C8.225 6.187 7.943 7.684 7.887 9.375H12.113C12.057 7.684 11.775 6.187 11.36 5.095C11.127 4.481 10.865 4.027 10.605 3.737C10.345 3.447 10.14 3.375 10 3.375ZM7.898 3.717C6.68213 4.12456 5.61055 4.87598 4.81309 5.88022C4.01563 6.88446 3.52651 8.09841 3.405 9.375H6.637C6.694 7.561 6.994 5.908 7.471 4.651C7.59833 4.315 7.74067 4.00367 7.898 3.717Z" fill="#5D5D5D"/>
                </svg>
                Look something up
              </button>
            </div>
          </div>
        </div>
        {/* ══════════ CHAT VIEW ══════════ */}
        <div className="chat-view" id="chat-view">
          <div className="messages" id="messages">
            <div className="messages-inner" id="messages-inner"></div>
          </div>
          <div className="chat-bottom">
            <div className="announcement-banner" id="announcement-banner">
              <div className="banner-row">
                <div className="banner-text">
                  <div className="banner-title">Never lose a good response again</div>
                  <div className="banner-body">You've probably had a great ChatGPT response disappear into a long thread never to be found again. Bookmarks let you pin any message so you can find it exactly when you need it.</div>
                </div>
                <div className="banner-actions">
                  <button className="banner-got-it" id="banner-got-it">Got it</button>
                  <button className="banner-close" id="banner-close"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.7085 2.7085L10.2918 10.2918M10.2918 2.7085L2.7085 10.2918" stroke="black" strokeWidth="1.66667" strokeLinecap="round"/></svg></button>
                </div>
              </div>
            </div>
            <div className="input-shell" id="bm-drop-shell">
              <div id="bm-drop-zone">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span>Drop bookmark to attach</span>
              </div>
              <div className="input-box" id="chat-input-box">
                <div className="input-box-row" id="chat-input-row">
                  <button className="attach-btn" title="Attach">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.33496 16.5V10.665H3.49996C3.41263 10.665 3.32616 10.6478 3.24548 10.6143C3.16479 10.5809 3.09149 10.5319 3.02973 10.4702C2.96798 10.4084 2.919 10.3351 2.88558 10.2544C2.85216 10.1738 2.83496 10.0873 2.83496 9.99996C2.83496 9.91263 2.85216 9.82616 2.88558 9.74548C2.919 9.6648 2.96798 9.59149 3.02973 9.52973C3.09149 9.46798 3.16479 9.419 3.24548 9.38558C3.32616 9.35216 3.41263 9.33496 3.49996 9.33496H9.33496V3.49996C9.33496 3.32359 9.40502 3.15445 9.52973 3.02973C9.65445 2.90502 9.82359 2.83496 9.99996 2.83496C10.1763 2.83496 10.3455 2.90502 10.4702 3.02973C10.5949 3.15445 10.665 3.32359 10.665 3.49996V9.33496H16.5L16.634 9.34896C16.7835 9.38015 16.9178 9.4619 17.0142 9.58046C17.1106 9.69902 17.1632 9.84716 17.1632 9.99996C17.1632 10.1528 17.1106 10.3009 17.0142 10.4195C16.9178 10.538 16.7835 10.6198 16.634 10.651L16.5 10.665H10.665V16.5C10.665 16.5873 10.6478 16.6738 10.6143 16.7544C10.5809 16.8351 10.5319 16.9084 10.4702 16.9702C10.4084 17.0319 10.3351 17.0809 10.2544 17.1143C10.1738 17.1478 10.0873 17.165 9.99996 17.165C9.91263 17.165 9.82616 17.1478 9.74548 17.1143C9.6648 17.0809 9.59149 17.0319 9.52973 16.9702C9.46798 16.9084 9.419 16.8351 9.38558 16.7544C9.35216 16.6738 9.33496 16.5873 9.33496 16.5Z" fill="#0D0D0D"/>
                    </svg>
                  </button>
                  <div id="chat-bm-inline"></div>
                  <textarea className="text-input" id="chat-textarea" rows="1" placeholder="Ask anything"
                    onInput={e => { e.target.style.height='24px'; e.target.style.height=Math.min(e.target.scrollHeight,200)+'px'; }}></textarea>
                  <div className="input-right">
                    <button className="mic-btn" title="Voice">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.7799 10.1959C15.8637 10.2207 15.9418 10.2618 16.0098 10.3167C16.0777 10.3717 16.1341 10.4395 16.1758 10.5164C16.2175 10.5932 16.2437 10.6774 16.2528 10.7644C16.2619 10.8513 16.2538 10.9391 16.2289 11.0229L16.1489 11.2729C15.7461 12.4471 15.0155 13.4814 14.0435 14.2535C13.0715 15.0256 11.8988 15.5032 10.6639 15.6299L10.6649 16.8349H12.0829L12.2169 16.8489C12.3665 16.8801 12.5008 16.9619 12.5972 17.0804C12.6936 17.199 12.7462 17.3471 12.7462 17.4999C12.7462 17.6527 12.6936 17.8009 12.5972 17.9194C12.5008 18.038 12.3665 18.1197 12.2169 18.1509L12.0829 18.1649H7.91591C7.73954 18.1649 7.57039 18.0949 7.44568 17.9702C7.32097 17.8454 7.25091 17.6763 7.25091 17.4999C7.25091 17.3236 7.32097 17.1544 7.44568 17.0297C7.57039 16.905 7.73954 16.8349 7.91591 16.8349H9.33591L9.33391 15.6299C8.09922 15.5031 6.92667 15.0254 5.95486 14.2533C4.98305 13.4812 4.25262 12.447 3.84991 11.2729L3.76991 11.0229L3.74391 10.8909C3.73009 10.7379 3.76967 10.5849 3.85591 10.4578C3.94215 10.3307 4.06974 10.2373 4.217 10.1936C4.36426 10.1499 4.52211 10.1585 4.66374 10.218C4.80536 10.2775 4.92202 10.3842 4.99391 10.5199L5.04491 10.6439L5.10891 10.8419C5.46427 11.8778 6.13941 12.7741 7.03698 13.4016C7.93455 14.0291 9.00819 14.3553 10.1031 14.3333C11.1981 14.3112 12.2577 13.9421 13.1293 13.279C14.0009 12.616 14.6395 11.6933 14.9529 10.6439L15.0049 10.5199C15.077 10.3847 15.1936 10.2785 15.3351 10.2194C15.4765 10.1604 15.634 10.1521 15.7809 10.1959M12.2519 5.41693C12.2582 5.11726 12.2047 4.81935 12.0943 4.54066C11.984 4.26197 11.8192 4.0081 11.6095 3.79394C11.3998 3.57977 11.1495 3.40963 10.8732 3.29347C10.5969 3.17731 10.3001 3.11747 10.0004 3.11747C9.70068 3.11747 9.40396 3.17731 9.12765 3.29347C8.85135 3.40963 8.60101 3.57977 8.39131 3.79394C8.18162 4.0081 8.01678 4.26197 7.90647 4.54066C7.79616 4.81935 7.74259 5.11726 7.74891 5.41693V9.16693C7.76132 9.75585 8.00398 10.3165 8.42487 10.7286C8.84576 11.1407 9.41136 11.3715 10.0004 11.3715C10.5895 11.3715 11.1551 11.1407 11.5759 10.7286C11.9968 10.3165 12.2395 9.75585 12.2519 9.16693V5.41693ZM13.5819 9.16693C13.5819 10.1168 13.2046 11.0278 12.5329 11.6994C11.8612 12.3711 10.9503 12.7484 10.0004 12.7484C9.05053 12.7484 8.13957 12.3711 7.4679 11.6994C6.79624 11.0278 6.41891 10.1168 6.41891 9.16693V5.41693C6.43461 4.47742 6.81885 3.5817 7.4888 2.92285C8.15875 2.264 9.06077 1.89478 10.0004 1.89478C10.94 1.89478 11.8421 2.264 12.512 2.92285C13.182 3.5817 13.5662 4.47742 13.5819 5.41693V9.16693Z" fill="#0D0D0D"/>
                      </svg>
                    </button>
                    <button className="send-btn" id="chat-send-btn" title="Send">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.00008 16V6.41396L5.70708 9.70696C5.61483 9.80247 5.50449 9.87865 5.38249 9.93106C5.26048 9.98347 5.12926 10.0111 4.99648 10.0122C4.8637 10.0134 4.73202 9.98806 4.60913 9.93778C4.48623 9.8875 4.37458 9.81325 4.28069 9.71936C4.18679 9.62546 4.11254 9.51381 4.06226 9.39092C4.01198 9.26802 3.98668 9.13634 3.98783 9.00356C3.98898 8.87078 4.01657 8.73956 4.06898 8.61756C4.12139 8.49555 4.19757 8.38521 4.29308 8.29296L9.29308 3.29296L9.36908 3.22496C9.56099 3.06874 9.80401 2.98922 10.0512 3.00178C10.2983 3.01434 10.532 3.11809 10.7071 3.29296L15.7071 8.29296L15.7751 8.36896C15.9297 8.56107 16.0078 8.80353 15.9945 9.04975C15.9812 9.29598 15.8774 9.52861 15.7031 9.70297C15.5287 9.87733 15.2961 9.98112 15.0499 9.99441C14.8036 10.0077 14.5612 9.92954 14.3691 9.77496L14.2931 9.70696L11.0001 6.41396V16C11.0001 16.2652 10.8947 16.5195 10.7072 16.7071C10.5197 16.8946 10.2653 17 10.0001 17C9.73486 17 9.48051 16.8946 9.29297 16.7071C9.10544 16.5195 9.00008 16.2652 9.00008 16Z" fill="white"/>
                      </svg>
                    </button>
                  </div>
                </div>{/* end #chat-input-row */}
              </div>
            </div>
            <div className="chat-disclaimer">ChatGPT can make mistakes. Check important info.</div>
          </div>
        </div>
      </div>{/* end .main-chat */}

      {/* ══════════ RIGHT BOOKMARKS PANEL ══════════ */}
      <div id="bm-right-panel">
        <div id="bm-rp-inner">
          <div id="bm-rp-header">
            <div id="bm-rp-header-left">
              <span id="bm-rp-title">Conversation Bookmarks</span>
            </div>
            <button id="bm-rp-close" title="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div id="bm-rp-body">
            <div id="bm-rp-section-label">
              <span className="rp-label-name">Bookmarks</span>
              <span className="rp-label-count" id="bm-rp-count">· 0</span>
            </div>
            <div id="bm-rp-list"></div>
          </div>
        </div>
      </div>

      </main>

      {/* ══════════ FLOATING NAV ══════════ */}
      {/* Lines handle (collapsed state) */}
      <div className="fn-lines" id="fn-lines">
        <div className="fn-mode-icon" id="fn-mode-icon"></div>
      </div>

      {/* Expanded card */}
      <div className="fn-card" id="fn-card">
        <div id="fn-back-row">
          <button id="fn-back-btn">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        </div>
        <div className="fn-list" id="fn-list"></div>
      </div>

      {/* bookmark creation modal */}
      <div id="bookmark-overlay">
        <div id="bookmark-modal">

          {/* ── CREATE VIEW ────────────────────────────────────────────────── */}
          <div id="bm-create-view">
            {/* header */}
            <div className="bm-header">
              <div className="bm-title">Create Bookmark</div>
              <div className="bm-header-icons">
                <button className="bm-icon-btn" id="bm-settings-btn" title="Settings">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.65516 4.49796L6.08494 4.36637C5.60275 4.2551 5.09724 4.40007 4.74731 4.75C4.39739 5.09992 4.25241 5.60542 4.36369 6.08762L4.49527 6.65783C4.64695 7.31508 4.37593 7.99759 3.8147 8.37175L3.12136 8.834C2.73149 9.09392 2.49731 9.53142 2.49731 10C2.49731 10.4686 2.73149 10.9061 3.12136 11.166L3.8147 11.6283C4.37593 12.0024 4.64695 12.6849 4.49528 13.3422L4.36369 13.9124C4.25241 14.3946 4.39739 14.9001 4.74731 15.25C5.09724 15.5999 5.60274 15.7449 6.08494 15.6337L6.65515 15.502C7.3124 15.3503 7.99491 15.6214 8.36906 16.1826L8.83131 16.876C9.09123 17.2658 9.52873 17.5 9.99731 17.5C10.4659 17.5 10.9034 17.2658 11.1633 16.876L11.6256 16.1826C11.9997 15.6214 12.6822 15.3503 13.3395 15.502L13.9097 15.6337C14.3919 15.7449 14.8974 15.5999 15.2473 15.25C15.5972 14.9001 15.7422 14.3946 15.631 13.9124L15.4993 13.3422C15.3476 12.6849 15.6187 12.0024 16.1799 11.6283L16.8733 11.166C17.2631 10.9061 17.4973 10.4686 17.4973 10C17.4973 9.53142 17.2631 9.09392 16.8733 8.834L16.1799 8.37175C15.6187 7.99759 15.3476 7.31508 15.4993 6.65784L15.631 6.08762C15.7422 5.60543 15.5972 5.09992 15.2473 4.75C14.8974 4.40007 14.3919 4.2551 13.9097 4.36637L13.3395 4.49796C12.6822 4.64963 11.9997 4.37862 11.6256 3.81738L11.1633 3.12403C10.9034 2.73418 10.4659 2.5 9.99731 2.5C9.52873 2.5 9.09123 2.73418 8.83131 3.12404L8.36906 3.81738C7.99491 4.37862 7.3124 4.64963 6.65516 4.49796Z" stroke="#181818" strokeWidth="1.66667" strokeLinejoin="round"/>
                    <path d="M12.4973 10C12.4973 11.3807 11.3781 12.5 9.99731 12.5C8.61656 12.5 7.49731 11.3807 7.49731 10C7.49731 8.61925 8.61656 7.5 9.99731 7.5C11.3781 7.5 12.4973 8.61925 12.4973 10Z" stroke="#181818" strokeWidth="1.66667" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="bm-icon-btn" id="bm-close-btn" title="Close">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.16675 4.16699L15.8334 15.8337M15.8334 4.16699L4.16675 15.8337" stroke="#181818" strokeWidth="1.66667" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="bm-fields">
              {/* preview box — clickable to enter preview view */}
              <div className="bm-preview" id="bm-preview-box" style={{cursor: "pointer"}}>
                <div className="bm-preview-blur">
                  <div className="bm-preview-text" id="bm-preview-text"></div>
                </div>
              </div>

              {/* bookmark name */}
              <div className="bm-field">
                <div className="bm-label">Bookmark name</div>
                <div className="bm-name-input-wrap">
                  {/* Writing icon — click to open color picker */}
                  <div className="bm-name-icon-cell" id="bm-writing-icon-btn">
                    <svg id="bm-writing-icon-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path id="bm-writing-icon-path" d="M3.33337 15H11.6667M3.33337 11.6667H16.6667M3.33337 8.33333H11.6667M3.33337 5H16.6667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <svg id="bm-writing-code-svg" width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: "none"}}>
                      <path id="bm-writing-code-path" d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="#181818"/>
                    </svg>
                    <img id="bm-writing-icon-img" width="20" height="20" style={{display: "none"}} alt="" />
                  </div>

                  {/* Color picker popup */}
                  <input className="bm-name-input" id="bm-name-input" type="text" placeholder="Revised essay, Pasta recipe, e.g" />
                </div>
              </div>

              {/* add to collection */}
              <div className="bm-field">
                <div className="bm-label">Add to collection</div>
                <div className="bm-collection-wrap">
                  <div className="bm-collection-select" id="bm-collection-select">
                    <span className="bm-collection-text" id="bm-collection-text">Select a collection</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.499 5.625L8.3829 9.74113C7.89477 10.2293 7.10334 10.2293 6.61515 9.74113L2.49902 5.625" stroke="#5D5D5D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="bm-collection-dropdown" id="bm-collection-dropdown">
                    <div className="bm-collection-option" data-value="Biology Notes">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Graduatecap2.png" style={{filter:"url(#bm-coll-filter-0)"}} /></span>
                      Biology Notes
                    </div>
                    <div className="bm-collection-option" data-value="Recipes">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Popcorn.png" style={{filter:"url(#bm-coll-filter-1)"}} /></span>
                      Recipes
                    </div>
                    <div className="bm-collection-option" data-value="Travel">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Airplane.png" style={{filter:"url(#bm-coll-filter-2)"}} /></span>
                      Travel
                    </div>
                    <div className="bm-collection-option" data-value="Writing Projects">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Pencil2.png" style={{filter:"url(#bm-coll-filter-3)"}} /></span>
                      Writing Projects
                    </div>
                    <div className="bm-collection-option" data-value="Entertainment">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Popsicle1.png" style={{filter:"url(#bm-coll-filter-4)"}} /></span>
                      Entertainment
                    </div>
                    <div className="bm-collection-option" data-value="Design & UX">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/ColorPalette.png" style={{filter:"url(#bm-coll-filter-5)"}} /></span>
                      Design &amp; UX
                    </div>
                    <div className="bm-collection-option" data-value="AI Research">
                      <span className="bm-coll-icon"><img src="/icons/bookmark-icons/Brain1.png" style={{filter:"url(#bm-coll-filter-6)"}} /></span>
                      AI Research
                    </div>
                    <svg style={{display:"none",position:"absolute",width:0,height:0}}>
                      <defs>
                        <filter id="bm-coll-filter-0" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.01 0 0 0 0 0.53 0 0 0 0 0.29 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-1" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.57 0 0 0 0 0.07 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-2" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.52 0 0 0 0 0.9 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-3" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.58 0 0 0 0 0.18 0 0 0 0 0.85 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-4" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.92 0 0 0 0 0.16 0 0 0 0 0.33 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-5" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.95 0 0 0 0 0.38 0 0 0 0 0.12 0 0 0 1 0"/></filter>
                        <filter id="bm-coll-filter-6" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.04 0 0 0 0 0.44 0 0 0 0 0.78 0 0 0 1 0"/></filter>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* tip */}
              <div className="bm-tip">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: "0"}}>
                  <path d="M2.07514 10.9082L1.28259 11.1657M18.7186 5.50038L17.926 5.75789M2.07514 5.75752L1.28259 5.5M18.7186 11.1653L17.926 10.9078" stroke="#5D5D5D" strokeWidth="1.66667" strokeLinecap="round"/>
                  <path d="M9.99996 2.5C6.7783 2.5 4.16663 5.11168 4.16663 8.33333C4.16663 10.4552 5.29961 12.3126 6.99363 13.3333C7.29443 13.5146 7.49996 13.8291 7.49996 14.1802V15.8333C7.49996 17.2141 8.61921 18.3333 9.99996 18.3333C11.3807 18.3333 12.5 17.2141 12.5 15.8333V14.1802C12.5 13.8291 12.7055 13.5146 13.0063 13.3333C14.7003 12.3126 15.8333 10.4552 15.8333 8.33333C15.8333 5.11168 13.2216 2.5 9.99996 2.5Z" stroke="#5D5D5D" strokeWidth="1.66667" strokeLinejoin="round"/>
                  <path d="M12.5 15H7.5" stroke="#5D5D5D" strokeWidth="1.66667" strokeLinecap="square" strokeLinejoin="round"/>
                </svg>
                <div className="bm-tip-text">Your bookmark saves the exact message, even if the conversation gets long, you can jump straight back to it.</div>
              </div>
            </div>

          </div>

          {/* ── PREVIEW VIEW ───────────────────────────────────────────────── */}
          <div id="bm-preview-view" style={{display: "none", flexDirection: "column", gap: "20px"}}>
            {/* header */}
            <div className="bm-header" style={{gap: "6px"}}>
              <div style={{display: "flex", flex: "1", alignItems: "center", gap: "10px", minWidth: "0"}}>
                <button className="bm-icon-btn" id="bm-back-btn" title="Back">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.167 10H15.833" stroke="#181818" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.167 10L8.333 14.167" stroke="#181818" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.167 10L8.333 5.833" stroke="#181818" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="bm-title">Preview Bookmark</div>
              </div>
              <button className="bm-icon-btn" id="bm-preview-close-btn" title="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16675 4.16699L15.8334 15.8337M15.8334 4.16699L4.16675 15.8337" stroke="#181818" strokeWidth="1.66667" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* content card */}
            <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
              {/* text area — full content, no blur */}
              <div className="bm-full-content" id="bm-full-content"></div>
              {/* action icons strip */}
              <div className="bm-content-actions">
                <button className="bm-action-icon-btn" title="Copy">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.668 10.667C12.668 9.957 12.668 9.463 12.637 9.079C12.626 8.87 12.588 8.663 12.524 8.464L12.469 8.334C12.315 8.033 12.081 7.78 11.793 7.603L11.666 7.531C11.508 7.451 11.296 7.394 10.921 7.363C10.537 7.332 10.044 7.332 9.333 7.332H6.5C5.789 7.332 5.296 7.332 4.912 7.363C4.703 7.374 4.496 7.412 4.297 7.476L4.167 7.531C3.866 7.685 3.613 7.919 3.436 8.207L3.366 8.334C3.285 8.492 3.228 8.704 3.197 9.079C3.166 9.463 3.165 9.956 3.165 10.667V13.5C3.165 14.211 3.165 14.704 3.197 15.088C3.228 15.464 3.285 15.675 3.365 15.833L3.435 15.959C3.612 16.247 3.865 16.481 4.167 16.635L4.297 16.691C4.441 16.743 4.63 16.78 4.912 16.803C5.296 16.834 5.789 16.835 6.5 16.835H9.333C10.043 16.835 10.537 16.835 10.921 16.803C11.297 16.772 11.508 16.715 11.666 16.635L11.793 16.565C12.08 16.388 12.315 16.135 12.469 15.833L12.524 15.703C12.576 15.559 12.614 15.37 12.637 15.088C12.668 14.704 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.453 12.663 14.801 12.66 15.088 12.637C15.464 12.606 15.675 12.549 15.833 12.469L15.959 12.398C16.247 12.221 16.481 11.968 16.635 11.666L16.691 11.536C16.755 11.337 16.793 11.13 16.803 10.921C16.834 10.537 16.835 10.044 16.835 9.333V6.5C16.835 5.789 16.835 5.296 16.803 4.912C16.793 4.703 16.755 4.496 16.691 4.297L16.635 4.167C16.481 3.866 16.247 3.613 15.959 3.436L15.833 3.366C15.675 3.285 15.463 3.228 15.088 3.197C14.704 3.166 14.211 3.165 13.5 3.165H10.667C9.957 3.165 9.463 3.166 9.079 3.197C8.797 3.22 8.608 3.257 8.464 3.309L8.334 3.365C8.033 3.519 7.78 3.753 7.603 4.041L7.531 4.167C7.451 4.325 7.394 4.537 7.363 4.912C7.34 5.199 7.336 5.547 7.334 6.002H9.333C10.022 6.002 10.579 6.002 11.029 6.038C11.487 6.076 11.894 6.155 12.271 6.347L12.488 6.469C12.984 6.773 13.388 7.209 13.653 7.729L13.72 7.872C13.864 8.209 13.93 8.57 13.962 8.971C13.999 9.421 13.998 9.978 13.998 10.667V12.665ZM18.165 9.333C18.165 10.022 18.165 10.579 18.129 11.029C18.096 11.43 18.031 11.791 17.887 12.128L17.82 12.271C17.555 12.791 17.15 13.227 16.655 13.531L16.436 13.653C16.06 13.845 15.654 13.924 15.196 13.962C14.859 13.989 14.462 13.993 13.996 13.995C13.993 14.462 13.989 14.859 13.962 15.196C13.929 15.597 13.864 15.958 13.72 16.294L13.653 16.436C13.388 16.958 12.984 17.394 12.488 17.698L12.271 17.82C11.894 18.012 11.487 18.091 11.029 18.129C10.579 18.166 10.022 18.165 9.333 18.165H6.5C5.81 18.165 5.254 18.165 4.804 18.129C4.404 18.096 4.042 18.031 3.706 17.887L3.563 17.82C3.043 17.555 2.607 17.152 2.302 16.655L2.18 16.436C1.988 16.06 1.909 15.654 1.871 15.196C1.834 14.746 1.835 14.189 1.835 13.5V10.667C1.835 9.978 1.835 9.421 1.871 8.971C1.909 8.513 1.988 8.106 2.18 7.729L2.302 7.512C2.606 7.016 3.042 6.612 3.563 6.347L3.706 6.28C4.042 6.136 4.403 6.07 4.804 6.038C5.141 6.011 5.537 6.006 6.004 6.004C6.006 5.537 6.011 5.141 6.038 4.804C6.075 4.346 6.155 3.94 6.347 3.564L6.469 3.344C6.773 2.849 7.209 2.445 7.729 2.18L7.872 2.113C8.209 1.969 8.57 1.903 8.971 1.871C9.421 1.834 9.978 1.835 10.667 1.835H13.5C14.19 1.835 14.746 1.835 15.196 1.871C15.654 1.909 16.06 1.988 16.436 2.18L16.656 2.302C17.151 2.606 17.555 3.042 17.82 3.563L17.887 3.706C18.031 4.042 18.097 4.403 18.129 4.804C18.166 5.254 18.165 5.811 18.165 6.5V9.333Z" fill="#5D5D5D"/></svg>
                </button>
                <button className="bm-action-icon-btn" title="Share">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.668 12.666V12.5C2.668 12.324 2.738 12.155 2.863 12.03C2.987 11.905 3.157 11.835 3.333 11.835C3.509 11.835 3.678 11.905 3.803 12.03C3.928 12.155 3.998 12.324 3.998 12.5V12.666C3.998 13.377 3.999 13.871 4.031 14.254C4.061 14.63 4.118 14.841 4.198 14.999L4.268 15.126C4.445 15.414 4.698 15.648 5 15.802L5.13 15.858C5.274 15.909 5.463 15.947 5.745 15.97C6.129 16.001 6.622 16.001 7.333 16.001H12.666C13.377 16.001 13.871 16.001 14.254 15.97C14.63 15.94 14.841 15.882 14.999 15.802L15.126 15.731C15.414 15.555 15.648 15.301 15.802 14.999L15.858 14.869C15.909 14.726 15.947 14.536 15.97 14.254C16.001 13.871 16.001 13.377 16.001 12.666V12.5C16.001 12.324 16.071 12.155 16.196 12.03C16.321 11.905 16.49 11.835 16.666 11.835C16.842 11.835 17.012 11.905 17.136 12.03C17.261 12.155 17.331 12.324 17.331 12.5V12.666C17.331 13.356 17.331 13.912 17.295 14.363C17.262 14.763 17.197 15.125 17.053 15.461L16.987 15.604C16.721 16.124 16.317 16.561 15.822 16.864L15.604 16.987C15.227 17.179 14.821 17.257 14.363 17.295C13.913 17.332 13.355 17.331 12.666 17.331H7.333C6.644 17.331 6.087 17.332 5.637 17.295C5.237 17.262 4.876 17.198 4.539 17.054L4.397 16.987C3.877 16.722 3.44 16.319 3.135 15.822L3.013 15.604C2.821 15.227 2.742 14.821 2.704 14.363C2.668 13.913 2.668 13.355 2.668 12.666ZM9.335 12.5V4.94L7.137 7.137C7.011 7.255 6.844 7.32 6.671 7.317C6.498 7.315 6.334 7.245 6.211 7.123C6.089 7.001 6.019 6.836 6.017 6.663C6.014 6.49 6.079 6.323 6.197 6.197L9.53 2.863L9.631 2.78C9.759 2.695 9.912 2.657 10.065 2.672C10.218 2.687 10.361 2.755 10.47 2.863L13.804 6.197C13.918 6.324 13.979 6.49 13.974 6.66C13.969 6.83 13.899 6.992 13.779 7.113C13.658 7.233 13.496 7.303 13.326 7.308C13.155 7.312 12.99 7.251 12.863 7.137L10.665 4.94V12.5C10.656 12.67 10.582 12.83 10.458 12.947C10.334 13.064 10.17 13.13 10 13.13C9.83 13.13 9.666 13.064 9.542 12.947C9.418 12.83 9.344 12.67 9.335 12.5Z" fill="#5D5D5D"/></svg>
                </button>
              </div>
            </div>

            {/* metadata */}
            <div style={{display: "flex", flexDirection: "column", gap: "5px", width: "100%"}}>
              {/* title row */}
              <div style={{display: "flex", alignItems: "center", gap: "10px", width: "100%"}}>
                <div className="bm-pv-title" id="bm-pv-title">Photosynthesis Takeaway</div>
                <div id="bm-pv-collection-wrap" style={{display: "flex", alignItems: "center", gap: "4px", flexShrink: "0"}}>
                  <span id="bm-pv-collection-icon" style={{display: "flex", alignItems: "center", flexShrink: "0"}}></span>
                  <span className="bm-pv-collection" id="bm-pv-collection"></span>
                </div>
              </div>
              {/* date + conversation row */}
              <div style={{display: "flex", alignItems: "center", gap: "5px", width: "100%"}}>
                <span className="bm-pv-meta" id="bm-pv-date">June 15, 2026 ·</span>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2.5C5.858 2.5 2.5 5.858 2.5 10C2.5 11.406 2.883 12.72 3.549 13.846L2.5 17.5L6.154 16.451C7.28 17.117 8.594 17.5 10 17.5C14.142 17.5 17.5 14.142 17.5 10C17.5 5.858 14.142 2.5 10 2.5Z" stroke="#5D5D5D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="bm-pv-meta" id="bm-pv-conv-title">Photosynthesis Study Guide</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── SHARED FOOTER (always present — Create Bookmark never moves) ── */}
          <div id="bm-shared-footer" className="bm-footer">
            <button className="bm-btn-preview" id="bm-preview-btn">Preview</button>
            <button className="bm-btn-create" id="bm-create-btn">Create Bookmark</button>
          </div>

        </div>
      </div>

      {/* text selection popup — must be in DOM before the script below references it */}
      <div id="text-hover-popup">
        <div className="popup-cap popup-cap-left">Ask ChatGPT</div>
        <div className="popup-cap popup-cap-right">Bookmark</div>
      </div>

      {/* Bookmark tooltip */}
      <div id="bm-tt">
        {/* Top nav bar */}
        <div id="bm-tt-nav">
          <div id="bm-tt-nav-left">
            <button id="bm-tt-prev" title="Previous">
              <img src="/icons/ArrowLeft.png" width="18" height="18" style={{display:'block'}} />
            </button>
            <button id="bm-tt-next" title="Next">
              <img src="/icons/ArrowRight.png" width="18" height="18" style={{display:'block'}} />
            </button>
          </div>
          <div id="bm-tt-nav-right">
            <button id="bm-tt-dots" title="More options"></button>
            <div id="bm-tt-badge-stack"></div>
            <span id="bm-tt-counter"></span>
          </div>
        </div>
        {/* Body */}
        <div id="bm-tt-body">
          <span id="bm-tt-title"></span>
          <div id="bm-tt-row2">
            <span id="bm-tt-time"></span>
            <span id="bm-tt-bullet">·</span>
            <span id="bm-tt-book-icon"></span>
            <span id="bm-tt-coll"></span>
          </div>
        </div>
      </div>
      {/* Three-dots dropdown */}
      <div id="bm-tt-menu">
        <div className="bm-tt-menu-header">Bookmark</div>
        <div className="bm-tt-menu-item" id="bm-ttm-share">
          <img src="/icons/bookmark-menu/ShareOs.svg" width="20" height="20" alt="" />
          <span className="bm-tt-menu-item-label">Share</span>
        </div>
        <div className="bm-tt-menu-item" id="bm-ttm-edit">
          <img src="/icons/bookmark-menu/Pencil2.svg" width="20" height="20" alt="" />
          <span className="bm-tt-menu-item-label">Edit</span>
        </div>
        <div className="bm-tt-menu-item" id="bm-ttm-ask">
          <img src="/icons/bookmark-menu/Chatbubble7.svg" width="20" height="20" alt="" />
          <span className="bm-tt-menu-item-label">Ask ChatGPT</span>
        </div>
        <div className="bm-tt-menu-sep"></div>
        <div className="bm-tt-menu-item danger" id="bm-ttm-delete">
          <img src="/icons/bookmark-menu/TrashCan.svg" width="20" height="20" alt="" />
          <span className="bm-tt-menu-item-label">Delete</span>
        </div>
      </div>
      {/* Floating dots button for right-panel rows */}
      <button id="bm-rp-dots-float" style={{display:"none"}}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="1.5" fill="#8f8f8f"/><circle cx="10" cy="10" r="1.5" fill="#8f8f8f"/><circle cx="16" cy="10" r="1.5" fill="#8f8f8f"/></svg>
      </button>
      {/* Attached bookmarks multi-popup */}
      <div id="chat-bm-multi-popup"></div>

      {/* Collection submenu */}
      <div id="bm-tt-submenu">
        <div id="bm-tt-sub-top">
          <div className="bm-tt-sub-search">
            <span id="bm-tt-sub-search-icon"></span>
            <input type="text" id="bm-tt-sub-search-input" placeholder="Search..." style={{border: "none", outline: "none", flex: "1", background: "transparent"}}/>
          </div>
          <div className="bm-tt-sub-new" id="bm-tt-sub-new">
            <span id="bm-tt-sub-plus-icon"></span>
            <span id="bm-tt-sub-new-label">New collection</span>
          </div>
        </div>
        <hr className="bm-tt-sub-sep"/>
        <div id="bm-tt-sub-list"></div>
      </div>

      {/* ── Response more-menu popup ────────────────────────────────────── */}
      <div id="response-more-popup">
        <div id="response-more-timestamp"></div>
        <button className="rmp-item" id="rmp-view-sources">
          <img src="/icons/FolderOpen.png" width="18" height="18" alt="" />
          <span>View sources</span>
        </button>
        <button className="rmp-item" id="rmp-add-bookmark">
          <img src="/icons/BookmarkPlus.png" width="18" height="18" alt="" />
          <span>Add Bookmark</span>
        </button>
        <button className="rmp-item" id="rmp-branch">
          <img src="/icons/ArrowSplitRight.png" width="18" height="18" alt="" />
          <span>Branch into new chat</span>
        </button>
        <button className="rmp-item" id="rmp-read-aloud">
          <img src="/icons/VolumeFull.png" width="18" height="18" alt="" />
          <span>Read aloud</span>
        </button>
      </div>

      {/* ── Color/icon picker popup (root-level to avoid transform trapping) ── */}
      <div className="bm-color-popup" id="bm-color-popup">
        {/* Preview card */}
        <div className="bm-cs-preview">
          <div className="bm-cs-pv-card">
            <div className="bm-cs-pv-icon">
              <img id="bm-cs-pv-custom-icon" width="22" height="22" style={{display: "none"}} alt="" />
              <svg id="bm-cs-preview-svg" width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path id="bm-cs-preview-path" d="M3.33337 15H11.6667M3.33337 11.6667H16.6667M3.33337 8.33333H11.6667M3.33337 5H16.6667" stroke="#181818" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg id="bm-cs-preview-code-svg" width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: "none"}}>
                <path id="bm-cs-preview-code-path" d="M9.632 4.73643C9.71028 4.7756 9.78008 4.82981 9.8374 4.89597C9.89472 4.96212 9.93845 5.03892 9.96609 5.12197C9.99372 5.20503 10.0047 5.29272 9.99847 5.38003C9.99221 5.46734 9.96881 5.55256 9.9296 5.63083L7.2632 10.9644C7.22407 11.0427 7.16989 11.1126 7.10376 11.17C7.03764 11.2274 6.96086 11.2712 6.8778 11.2989C6.79475 11.3266 6.70705 11.3377 6.61972 11.3315C6.53238 11.3253 6.44712 11.302 6.3688 11.2628C6.29048 11.2237 6.22064 11.1695 6.16325 11.1034C6.10587 11.0373 6.06207 10.9605 6.03437 10.8774C6.00666 10.7944 5.99558 10.7067 6.00176 10.6193C6.00794 10.532 6.03127 10.4467 6.0704 10.3684L8.7368 5.03483C8.7759 4.95648 8.83007 4.8866 8.89619 4.8292C8.96231 4.77179 9.0391 4.72798 9.12216 4.70027C9.20522 4.67256 9.29294 4.66149 9.38028 4.66769C9.46762 4.67389 9.55289 4.69725 9.6312 4.73643M4.4 4.79963C4.47013 4.85212 4.52922 4.91791 4.57389 4.99326C4.61856 5.0686 4.64794 5.15202 4.66035 5.23873C4.67276 5.32544 4.66795 5.41374 4.6462 5.4986C4.62446 5.58345 4.58619 5.66318 4.5336 5.73323L2.8336 7.99963L4.5336 10.266C4.63969 10.4075 4.68521 10.5854 4.66016 10.7605C4.6351 10.9356 4.54152 11.0935 4.4 11.1996C4.25848 11.3057 4.08062 11.3512 3.90553 11.3262C3.73045 11.3011 3.57249 11.2075 3.4664 11.066L1.4664 8.39963C1.37944 8.2844 1.3324 8.14398 1.3324 7.99963C1.3324 7.85527 1.37944 7.71485 1.4664 7.59963L3.4664 4.93323C3.51889 4.8631 3.58469 4.80401 3.66003 4.75934C3.73538 4.71466 3.81879 4.68528 3.9055 4.67287C3.99221 4.66047 4.08052 4.66527 4.16537 4.68702C4.25022 4.70877 4.32995 4.74704 4.4 4.79963ZM11.6 4.79963C11.6701 4.74704 11.7498 4.70877 11.8346 4.68702C11.9195 4.66527 12.0078 4.66047 12.0945 4.67287C12.1812 4.68528 12.2646 4.71466 12.34 4.75934C12.4153 4.80401 12.4811 4.8631 12.5336 4.93323L14.5336 7.59963C14.6206 7.71485 14.6676 7.85527 14.6676 7.99963C14.6676 8.14398 14.6206 8.2844 14.5336 8.39963L12.5336 11.066C12.4811 11.1361 12.4153 11.1951 12.3399 11.2398C12.2646 11.2844 12.1812 11.3138 12.0945 11.3262C12.0078 11.3386 11.9195 11.3338 11.8347 11.3121C11.7498 11.2904 11.6701 11.2522 11.6 11.1996C11.5299 11.1471 11.4709 11.0813 11.4263 11.0059C11.3816 10.9306 11.3523 10.8472 11.3398 10.7605C11.3274 10.6738 11.3322 10.5855 11.3539 10.5007C11.3757 10.4158 11.4139 10.3361 11.4664 10.266L13.1664 7.99963L11.4664 5.73323C11.4138 5.66318 11.3755 5.58345 11.3538 5.4986C11.3321 5.41374 11.3272 5.32544 11.3397 5.23873C11.3521 5.15202 11.3814 5.0686 11.4261 4.99326C11.4708 4.91791 11.5299 4.85212 11.6 4.79963Z" fill="#181818"/>
              </svg>
            </div>
            <div className="bm-cs-pv-content">
              <div className="bm-cs-pv-title" id="bm-cs-pv-title">Untitled Bookmark</div>
              <div className="bm-cs-pv-meta">
                <span id="bm-cs-pv-coll-name" style={{display: "none"}}></span>
                <span className="bm-cs-pv-coll-icon" id="bm-cs-pv-coll-icon" style={{display: "none"}}></span>
                <span id="bm-cs-pv-sep" style={{display: "none"}}>·</span>
                <span id="bm-cs-pv-date"></span>
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="bm-cs-divider"></div>
        {/* Color swatches */}
        <div className="bm-cs-colors">
          <div className="bm-cs-row">
            <button className="bm-cs-dot selected" data-color="#181818" style={{"--dot-color": "#181818"}}></button>
            <button className="bm-cs-dot" data-color="#FF3B30" style={{"--dot-color": "#FF3B30"}}></button>
            <button className="bm-cs-dot" data-color="#FF9100" style={{"--dot-color": "#FF9100"}}></button>
            <button className="bm-cs-dot" data-color="#FFCC00" style={{"--dot-color": "#FFCC00"}}></button>
            <button className="bm-cs-dot" data-color="#34C759" style={{"--dot-color": "#34C759"}}></button>
            <button className="bm-cs-dot" data-color="#007AFF" style={{"--dot-color": "#007AFF"}}></button>
          </div>
          <div className="bm-cs-row">
            <button className="bm-cs-dot" data-color="#AF52DE" style={{"--dot-color": "#AF52DE"}}></button>
            <button className="bm-cs-dot" data-color="#FF2D55" style={{"--dot-color": "#FF2D55"}}></button>
          </div>
        </div>
        {/* Icon picker */}
        <div className="bm-cs-divider"></div>
        <div className="bm-cs-icon-section">
          <div className="bm-cs-icon-label">Icon</div>
          <div className="bm-cs-icon-grid">
            {["Airplane","Audio","Basketball","Book","Brackets2","Brain1","Chart6","Code","ColorPalette","Dollar","Dumbell","Globe3","Graduatecap2","Growth","Hammer2","HandBell","Heart2","JudgeGavel","Moneybag","Notebook","PaintBucket","Peace","Pencil","Pencil2","Popcorn","Popsicle1","Quickai","Stethoscope","SuitcaseWork","TestTube"].map(name => (
              <button key={name} className="bm-cs-icon-btn" data-icon={`/icons/bookmark-icons/${name}.png`} title={name}>
                <img src={`/icons/bookmark-icons/${name}.png`} width="20" height="20" alt={name} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
