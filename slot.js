// 슬롯머신은 AI를 사용하여 구현하였어서 아예 새롭게 작성하였습니다.
const ITEM_HEIGHT = 100;   // slot.css .slot-window / .slot-item height와 동일
const NUMBERS     = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const slotWindows  = document.querySelectorAll('.slot-window');
const slotBtn      = document.getElementById('slot-btn');
const slotResetBtn = document.getElementById('slot-reset-btn');

/* ════════════════════════════════════════════
   [백엔드 연동 포인트]

   실제 서비스에서는 이 함수를 아래처럼 교체합니다.
     const res  = await fetch('/api/slot/result');
     const data = await res.json();
     return data.numbers;  // 예: [3, 7, 1]

   현재는 Mock 데이터를 반환합니다.
   numbers 배열 값을 바꾸면 멈출 숫자를 직접 지정할 수 있습니다.
   ════════════════════════════════════════════ */
async function fetchSlotResult() {
  // ↓ 여기 숫자를 바꿔서 테스트하세요 (0~9 사이 정수 3개)
  const mockData = { numbers: [3, 7, 1] };

  // 실제 API 호출 시 아래 주석을 해제, mockData 줄 제거
  // const res  = await fetch('/api/slot/result');
  // const data = await res.json();
  // return data.numbers;

  return mockData.numbers;
}

function initReels() {
  slotWindows.forEach(win => {
    const reel = win.querySelector('.slot-reel');
    gsap.killTweensOf(reel);
    reel.innerHTML = '';

    // 숫자를 3벌 이어붙임: [0~9][0~9][0~9]
    // 가운데 벌(인덱스 1)이 실제 화면에 보이는 구간
    // y가 -1000 근처에 오면 gsap.set(y:0)으로 snap → 시각적으로 끊김 없는 루프
    for (let copy = 0; copy < 3; copy++) {
      NUMBERS.forEach(num => {
        const item = document.createElement('div');
        item.classList.add('slot-item');
        item.textContent = num;
        reel.appendChild(item);
      });
    }

    // 시작 위치: 가운데 벌 첫 번째 아이템(0)이 보이도록
    gsap.set(reel, { y: -ITEM_HEIGHT * NUMBERS.length });
  });
}

initReels();

/* ── 슬롯 1개 스핀 ───────────────────────────────
   modifiers 플러그인으로 무한 루프를 만드는 원리:

   GSAP은 y 값을 계속 감소시킵니다 (예: 0 → -5000)
   그런데 modifiers가 매 프레임마다 y값을 가로채서
     y % REEL_HEIGHT  로 변환합니다.

   예) REEL_HEIGHT = 1000 (아이템 10개 * 100px)
     y = -1100  →  -1100 % 1000  =  -100  (1번 아이템)
     y = -2300  →  -2300 % 1000  =  -300  (3번 아이템)

   실제 y는 -5000까지 가지만 화면에는 0~-900 범위만 반복되어
   릴이 무한히 도는 것처럼 보입니다.
   ─────────────────────────────────────────────── */
function spinReel(reel) {
  const REEL_HEIGHT = ITEM_HEIGHT * NUMBERS.length;  // 1000px

  // gsap ticker로 매 프레임마다 y를 직접 감소시키고
  // -2000(3벌 중 마지막 벌 진입) 이하가 되면 -1000으로 snap
  // → GSAP 내부 y는 항상 -1000 ~ -2000 범위
  // → stopReel이 언제 호출돼도 gsap.getProperty 값이 신뢰 가능
  const SPEED = 8;  // 픽셀/프레임 (60fps 기준 초당 ~480px)
  let running = true;

  function frame() {
    if (!running) return;
    let y = gsap.getProperty(reel, 'y');
    y -= SPEED;
    if (y <= -(REEL_HEIGHT * 2)) y += REEL_HEIGHT;
    gsap.set(reel, { y });
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  // running 플래그를 끄는 함수를 reel에 붙여둠
  reel._stopSpin = () => { running = false; };
}

/* ── 슬롯 1개 정지 ───────────────────────────────
   spinReel()이 돌고 있는 reel을 부드럽게 멈춥니다.

   핵심 계산:
     목표 y = -(targetNum * ITEM_HEIGHT)
     예) targetNum = 3  →  y = -300

   그런데 릴은 modifiers로 루프 중이라 현재 y가
   -2300 같은 큰 값일 수 있습니다.
   그래서 현재 루프 사이클을 보존하면서 목표 위치로 이동해야 합니다.

     현재 y     = -2300
     현재 사이클 = Math.floor(2300 / 1000) = 2  →  오프셋 = -2000
     목표 y      = -2000 + (-300) = -2300  (이미 지나쳤다면 한 사이클 추가)

   이렇게 하면 릴이 뒤로 튀지 않고 앞으로 계속 돌다가 멈춥니다.
   ─────────────────────────────────────────────── */
function stopReel(reel, targetNum, duration) {
  const REEL_HEIGHT = ITEM_HEIGHT * NUMBERS.length;  // 1000px

  // rAF 루프 중단
  if (reel._stopSpin) reel._stopSpin();

  // 현재 y는 -1000 ~ -2000 범위
  // 가운데 벌(offset -1000) 기준으로 목표 위치 계산
  const currentY  = gsap.getProperty(reel, 'y');
  const BASE      = -REEL_HEIGHT;                          // 가운데 벌 시작 = -1000
  const targetY   = BASE - (targetNum * ITEM_HEIGHT);      // 예: 3 → -1000 + (-300) = -1300

  // y는 음수로 점점 커짐(아래로 이동) → currentY < targetY 면 이미 지나친 것
  // 지나쳤으면 다음 벌(targetY - REEL_HEIGHT)까지 한 바퀴 더 돌고 멈춤
  const finalY = currentY > targetY ? targetY : targetY - REEL_HEIGHT;

  return new Promise(resolve => {
    gsap.to(reel, {
      y:        finalY,
      duration: duration,
      ease:     'power4.out',
      onComplete: resolve
    });
  });
}

/* ── START 버튼 ─────────────────────────────── */
slotBtn.addEventListener('click', async () => {
  slotBtn.disabled = true;

  // 백엔드에서 결과 받아오기 (지금은 Mock)
  const results = await fetchSlotResult();
  console.log('받아온 결과:', results);  // [3, 7, 1]

  const reels = document.querySelectorAll('.slot-reel');

  // 1단계: 3개 동시에 스핀 시작 (무한 루프 — 명시적으로 stop 전까지 계속 돔)
  reels.forEach(reel => spinReel(reel));

  // 2단계: 충분히 돌도록 대기 후 순서대로 멈춤
  await new Promise(r => setTimeout(r, 1500));
  await stopReel(reels[0], results[0], 1.5);

  await new Promise(r => setTimeout(r, 400));
  await stopReel(reels[1], results[1], 1.5);

  await new Promise(r => setTimeout(r, 400));
  await stopReel(reels[2], results[2], 1.5);

  // 3단계: 결과 표시
  const isWin     = results.some(n => n === 1 || n === 5);
  const modalText = isWin ? '당첨되셨습니다!' : '다음 기회에!';
  openModal('slot-modal', modalText);

  slotBtn.disabled = false;
});

slotResetBtn.addEventListener('click', () => {
  // 혹시 spin 중이면 모두 중단
  document.querySelectorAll('.slot-reel').forEach(reel => {
    if (reel._stopSpin) reel._stopSpin();
    gsap.killTweensOf(reel);
  });
  initReels();
});
