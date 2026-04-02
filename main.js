const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.roulette, .ladder, .slot');

let currentPage = 1;

function showPage(num) {
  pages.forEach(p => p.classList.add('hidden'));
  navBtns.forEach(b => b.classList.remove('active'));

  const pageIds = { 1: 'roulette', 2: 'ladder', 3: 'slot' };
  const target = document.getElementById(pageIds[num]);
  const btn = document.querySelector(`.nav-btn[data-page="${num}"]`);

  target.classList.remove('hidden');
  btn.classList.add('active');

  gsap.fromTo(target,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  currentPage = num;

  // 코드 뷰어 갱신 (loadCode가 정의된 이후 실행)
  if (typeof loadCode === 'function') loadCode(currentTab);
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const num = Number(btn.dataset.page);
    if (num !== currentPage) showPage(num);
  });
});

// ── Code Viewer ──
const codeTabs = document.querySelectorAll('.code-tab');
const codeDisplay = document.getElementById('code-display');

const codeMap = {
  1: { html: 'page1-html', css: 'roulette.css', js: 'roulette.js' },
  2: { html: 'page2-html', css: 'ladder.css',   js: 'ladder.js'   },
  3: { html: 'page3-html', css: 'slot.css',     js: 'slot.js'     },
};

let _indexHTMLCache = null;
async function getIndexHTML() {
  if (_indexHTMLCache) return _indexHTMLCache;
  const res = await fetch('index.html');
  _indexHTMLCache = await res.text();
  return _indexHTMLCache;
}

const pageSectionMap = {
  1: async () => {
    const html = await getIndexHTML();
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    return doc.getElementById('roulette').outerHTML;
  },
  2: async () => {
    const html = await getIndexHTML();
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    return doc.getElementById('ladder').outerHTML;
  },
  3: async () => {
    const html = await getIndexHTML();
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    return doc.getElementById('slot').outerHTML;
  },
};

const cssFileMap = {
  1: 'roulette.css',
  2: 'ladder.css',
  3: 'slot.css',
};

const jsFileMap = {
  1: 'roulette.js',
  2: 'ladder.js',
  3: 'slot.js',
};

let currentTab = 'html';

function formatHTML(html) {
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const INLINE = new Set(['a','abbr','b','bdi','bdo','cite','code','data','dfn','em','i','kbd','mark','q','rp','rt','ruby','s','samp','small','span','strong','sub','sup','time','u','var','wbr']);

  let indent = 0;
  const pad = () => '  '.repeat(indent);

  // 태그/텍스트 토큰으로 분리
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];
  const lines = [];

  tokens.forEach(token => {
    const trimmed = token.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('<!--')) {
      lines.push(pad() + trimmed);
      return;
    }

    if (trimmed.startsWith('</')) {
      const tag = trimmed.match(/<\/(\w+)/)?.[1]?.toLowerCase();
      if (tag && !INLINE.has(tag)) indent = Math.max(0, indent - 1);
      lines.push(pad() + trimmed);
      return;
    }

    if (trimmed.startsWith('<')) {
      const tag = trimmed.match(/<(\w+)/)?.[1]?.toLowerCase();
      lines.push(pad() + trimmed);
      if (tag && !VOID.has(tag) && !INLINE.has(tag) && !trimmed.endsWith('/>') && !trimmed.includes(`</${tag}`)) {
        indent++;
      }
      return;
    }

    // 텍스트 노드
    lines.push(pad() + trimmed);
  });

  return lines.join('\n');
}

async function loadCode(tab) {
  currentTab = tab;
  codeTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

  let code = '';
  let lang = tab;

  if (tab === 'html') {
    code = formatHTML(await pageSectionMap[currentPage]());
    lang = 'html';
  } else {
    let file;
    if (tab === 'css')         file = cssFileMap[currentPage];
    else if (tab === 'common') file = 'style.css';
    else                       file = jsFileMap[currentPage];

    if (tab === 'common') lang = 'css';

    try {
      const res = await fetch(file);
      code = res.ok ? await res.text() : `/* ${file} 파일 없음 */`;
    } catch {
      code = `/* ${file} 파일 없음 */`;
    }
  }

  // highlight 재처리를 위해 data-highlighted 제거
  delete codeDisplay.dataset.highlighted;
  codeDisplay.className = `language-${lang}`;
  codeDisplay.textContent = code;
  hljs.highlightElement(codeDisplay);

  gsap.fromTo(codeDisplay,
    { opacity: 0 },
    { opacity: 1, duration: 0.25, ease: 'power2.out' }
  );
}

codeTabs.forEach(tab => {
  tab.addEventListener('click', () => loadCode(tab.dataset.tab));
});

// 초기 로드
loadCode('html');

// ── 공용 모달 ──
function openModal(modalId, text) {
  const modal = document.getElementById(modalId);
  const modalText = modal.querySelector('.modal-text');
  const modalClose = modal.querySelector('.modal-close');

  modalText.textContent = text;
  modal.style.display = 'flex';
  gsap.fromTo(modal,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
  gsap.fromTo(modal.querySelector('.modal-box'),
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
  );

  modalClose.onclick = () => {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => { modal.style.display = 'none'; }
    });
  };
}