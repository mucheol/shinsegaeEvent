const rouletteBtn = document.getElementById('roulette-btn');
const wheelImg = document.getElementById('wheel-img');
const ROULETTE_RESULTS = ['2000원', '10%쿠폰', '7000원', '5000원', '10000원', '5%쿠폰'];
let spinAnim = null;
let isSpinning = false;

/*   실제 서비스에서는 이 함수를 아래처럼 교체
     const res  = await fetch('/api/roulette/result');
     const data = await res.json();
     return data.sectorIndex;  // 예: 2

   섹터 결정을 서버에서 처리해야 조작을 방지가능함
   현재는 Mock 데이터를 반환. */
async function fetchRouletteResult() {
  const mockIndex = Math.floor(Math.random() * ROULETTE_RESULTS.length);

  // 실제 API 호출 시 아래 주석을 해제 후 mockIndex 줄 제거
  // const res  = await fetch('/api/roulette/result');
  // const data = await res.json();
  // return data.sectorIndex;

  return mockIndex;
}

const idleAnim = gsap.to(wheelImg, {
  rotation: 360,
  duration: 20,
  ease: 'linear',
  repeat: -1
});

rouletteBtn.addEventListener('click', async () => {
  rouletteBtn.disabled = true;
  isSpinning = true;
  idleAnim.pause();

  const sectorIndex = await fetchRouletteResult();

  const currentRotation = gsap.getProperty(wheelImg, 'rotation');
  const sectorCenter = (360 / 6) * sectorIndex + 30;
  const remainRotation = (currentRotation % 360 + 360) % 360;
  const targetRotation = 360 - sectorCenter;

  let addedRotation = targetRotation - remainRotation;
  if (addedRotation < 0) addedRotation += 360;

  const totalRotation = currentRotation + addedRotation + (360 * 5);

  spinAnim = gsap.to(wheelImg, {
    rotation: totalRotation,
    duration: 4,
    ease: 'power4.out',
    onComplete: () => {
      isSpinning = false;
      resetBtn.disabled = false;
      openModal('roulette-modal', `${ROULETTE_RESULTS[sectorIndex]} 당첨!`);
    }
  });
});


const resetBtn = document.getElementById('roulette-reset-btn');
resetBtn.disabled = true;
resetBtn.addEventListener('click', () => {
  if (isSpinning) return;
  rouletteBtn.disabled = false;
  resetBtn.disabled = true;
  if (spinAnim) spinAnim.kill();
  gsap.set(wheelImg, { rotation: 0 });
  idleAnim.restart();
});
