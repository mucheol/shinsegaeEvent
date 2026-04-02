const ladderBtn = document.getElementById('ladder-btn');
const ladderResetBtn = document.getElementById('ladder-reset-btn');
const ladderMystery = document.querySelector('.ladder-mystery');
let isRunning = false;

// 백엔드 연동 시 API 응답값으로 교체하고 사용
async function fetchLadderResult(_playerValue) {
  // return await api.get(`/ladder/result?player=${_playerValue}`);
  return '1000원 쿠폰 당첨!';
}

// path id → radio value 매핑
const pathMap = {
  '1': document.getElementById('path-1'),
  '2': document.getElementById('path-2'),
  '3': document.getElementById('path-3'),
  '4': document.getElementById('path-4'),
  '5': document.getElementById('path-5'),
  '6': document.getElementById('path-6'),
};

// 모든 path 시작 전 숨김처리
Object.values(pathMap).forEach(path => {
  if (!path) return;
  const len = path.getTotalLength();
  path.dataset.length = len;
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
});

// 리셋
function resetLadder() {
  ladderBtn.disabled = false;
  Object.values(pathMap).forEach(p => {
    if (!p) return;
    gsap.killTweensOf(p);
    p.style.strokeDashoffset = p.dataset.length;
  });
  document.querySelectorAll('input[name="ladder-player"]').forEach(r => r.checked = false);
  ladderMystery.style.display = 'flex';
  gsap.fromTo(ladderMystery, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
}

ladderResetBtn.disabled = true;
ladderResetBtn.addEventListener('click', resetLadder);

// start버튼 클릭 시
ladderBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="ladder-player"]:checked');
  if (!selected) return;

  const path = pathMap[selected.value];
  if (!path) return;

  ladderBtn.disabled = true;
  ladderResetBtn.disabled = true;
  isRunning = true;

  // 모든 path 리셋
  Object.values(pathMap).forEach(p => {
    if (!p) return;
    gsap.killTweensOf(p);
    p.style.strokeDashoffset = p.dataset.length;
  });

  // 물음표 페이드아웃 후 path 애니메이션
  gsap.to(ladderMystery, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out',
    onComplete: () => {
      ladderMystery.style.display = 'none';
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'none',
        onComplete: async () => {
          const result = await fetchLadderResult(selected.value);
          ladderResetBtn.disabled = false;
          isRunning = false;
          openModal('ladder-modal', result);
        }
      });
    }
  });
});
