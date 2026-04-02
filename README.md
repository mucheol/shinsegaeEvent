# Shinsegae DFS Event

신세계면세점 이벤트 페이지 포트폴리오 프로젝트입니다.
룰렛, 사다리타기, 슬롯머신 3가지 이벤트를 바닐라 JS로 구현했습니다.

🔗 **Live Demo:** https://shinsegae-event.vercel.app

---

## Features

- **룰렛** — 이미지 기반 휠을 GSAP으로 회전 애니메이션 구현, 결과 모달 표시
- **사다리타기** — SVG 경로를 따라 선이 그려지는 애니메이션 구현
- **슬롯머신** — `requestAnimationFrame`으로 릴 회전 구현, 1 또는 5 당첨 시 쿠폰 증정
- **코드 뷰어** — 각 이벤트의 HTML/CSS/JS 코드를 `highlight.js`로 실시간 표시

---

## Tech Stack

| 구분 | 사용 기술 |
|------|----------|
| 마크업 | HTML5 |
| 스타일 | CSS3 |
| 인터랙션 | Vanilla JavaScript |
| 애니메이션 | GSAP 3, requestAnimationFrame |
| 코드 하이라이팅 | highlight.js |
| 배포 | Vercel |

---

## Structure

```
shinsegaeEvent/
├── index.html
├── style.css         # 공통 스타일
├── main.js           # 공통 로직 (페이지 전환, 코드 뷰어)
├── roulette.js / .css
├── ladder.js / .css
├── slot.js / .css
└── images/
```
